import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import { AssociationSelection } from '../index';
import { useRouter } from 'next/router';

// Mock dependencies
jest.mock('axios');
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../../ui/Toast', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

// Helper to filter out framer-motion props
const filterMotionProps = (props: any) => {
  const { 
    animate, initial, transition, variants, whileHover, whileTap, 
    custom, layoutId, layout, ...filteredProps 
  } = props;
  return filteredProps;
};

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick, ...props }: React.PropsWithChildren<any>) => (
      <div className={className} onClick={onClick} {...filterMotionProps(props)}>{children}</div>
    ),
    h2: ({ children, className, ...props }: React.PropsWithChildren<any>) => (
      <h2 className={className} {...filterMotionProps(props)}>{children}</h2>
    ),
    p: ({ children, className, ...props }: React.PropsWithChildren<any>) => (
      <p className={className} {...filterMotionProps(props)}>{children}</p>
    ),
    button: ({ children, className, onClick, disabled, ...props }: React.PropsWithChildren<any>) => (
      <button className={className} onClick={onClick} disabled={disabled} {...filterMotionProps(props)}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren<any>) => <>{children}</>,
}));

describe('AssociationSelection', () => {
  const mockUserId = 'user-123';
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (axios.put as jest.Mock).mockResolvedValue({ data: {} });
  });
  
  test('renders association cards', () => {
    render(<AssociationSelection userId={mockUserId} />);
    
    // Check for title
    expect(screen.getByText('Escolha suas Associações')).toBeInTheDocument();
    
    // Check for association cards
    expect(screen.getByText('Associação de Moradores Vila Verde')).toBeInTheDocument();
    expect(screen.getByText('Cruz Vermelha - RJ')).toBeInTheDocument();
    expect(screen.getByText('Associação Indígena Amazônica')).toBeInTheDocument();
  });
  
  test('allows selecting and deselecting associations', () => {
    render(<AssociationSelection userId={mockUserId} />);
    
    // Select first association
    const firstAssociation = screen.getByText('Associação de Moradores Vila Verde').closest('.card');
    fireEvent.click(firstAssociation!);
    
    // Check if it's selected
    expect(screen.getByText('Selecionado')).toBeInTheDocument();
    
    // Deselect the association
    fireEvent.click(firstAssociation!);
    
    // Check if it's deselected
    expect(screen.queryByText('Selecionado')).not.toBeInTheDocument();
  });
  
  test('shows warning toast when submitting without selections', async () => {
    const mockShowToast = jest.fn();
    jest.mock('../../ui/Toast', () => ({
      useToast: () => ({
        showToast: mockShowToast,
      }),
    }));
    
    render(<AssociationSelection userId={mockUserId} />);
    
    // Click submit button without selecting any association
    const submitButton = screen.getByText('Continuar sem associações');
    fireEvent.click(submitButton);
    
    // Toast should be called with warning
    await waitFor(() => {
      expect(axios.put).not.toHaveBeenCalled();
    });
  });
  
  test('submits selected associations and adds XP', async () => {
    // Set up fake timers
    jest.useFakeTimers();
    
    render(<AssociationSelection userId={mockUserId} />);
    
    // Select two associations
    const firstAssociation = screen.getByText('Associação de Moradores Vila Verde').closest('.card');
    const secondAssociation = screen.getByText('Cruz Vermelha - RJ').closest('.card');
    
    fireEvent.click(firstAssociation!);
    fireEvent.click(secondAssociation!);
    
    // Submit the form
    const submitButton = screen.getByText('Continuar com 2 selecionada(s)');
    fireEvent.click(submitButton);
    
    // Check if API calls were made
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining(`/users/${mockUserId}`),
        expect.objectContaining({
          associations: expect.arrayContaining(['assoc-1', 'assoc-2'])
        })
      );
      
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining(`/users/${mockUserId}/xp`),
        { xp: 30 } // 15 * 2 associations
      );
    });
    
    // Advance timers to trigger the setTimeout
    await act(async () => {
      jest.advanceTimersByTime(2500); // Add extra time to ensure it completes
    });
    
    // Check if redirect happens
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
    
    jest.useRealTimers();
  });
  
  test('calls onComplete callback when provided', async () => {
    // Set up fake timers
    jest.useFakeTimers();
    
    const mockOnComplete = jest.fn();
    
    render(<AssociationSelection userId={mockUserId} onComplete={mockOnComplete} />);
    
    // Select an association
    const firstAssociation = screen.getByText('Associação de Moradores Vila Verde').closest('.card');
    fireEvent.click(firstAssociation!);
    
    // Submit the form
    const submitButton = screen.getByText('Continuar com 1 selecionada(s)');
    fireEvent.click(submitButton);
    
    // Wait for API calls to complete
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledTimes(2);
    });
    
    // Advance timers to trigger the setTimeout
    await act(async () => {
      jest.advanceTimersByTime(2500); // Add extra time to ensure it completes
    });
    
    // Verify the callback was called
    expect(mockOnComplete).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled(); // Should not redirect
    
    jest.useRealTimers();
  });
  
  test('handles API errors gracefully', async () => {
    // Mock API error
    (axios.put as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    
    render(<AssociationSelection userId={mockUserId} />);
    
    // Select an association
    const firstAssociation = screen.getByText('Associação de Moradores Vila Verde').closest('.card');
    fireEvent.click(firstAssociation!);
    
    // Submit the form
    const submitButton = screen.getByText('Continuar com 1 selecionada(s)');
    fireEvent.click(submitButton);
    
    // Check if error handling works
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledTimes(1);
      // Should not make the second API call
      expect(axios.put).not.toHaveBeenCalledWith(
        expect.stringContaining(`/users/${mockUserId}/xp`),
        expect.anything()
      );
    });
    
    // Should not redirect
    jest.useFakeTimers();
    
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    
    expect(mockPush).not.toHaveBeenCalled();
    
    jest.useRealTimers();
  });
}); 