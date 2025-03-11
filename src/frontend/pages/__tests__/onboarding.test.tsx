import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import OnboardingPage from '../onboarding';
import { useRouter } from 'next/router';

// Mock dependencies
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../components/VoiceOnboarding', () => ({
  VoiceOnboarding: ({ onComplete }: { onComplete: (user: any) => void }) => (
    <div data-testid="mock-voice-onboarding">
      <button 
        data-testid="complete-voice-onboarding" 
        onClick={() => onComplete({ _id: 'test-user-id', name: 'Test User' })}
      >
        Complete Voice Onboarding
      </button>
    </div>
  ),
}));

jest.mock('../../components/AssociationSelection', () => ({
  AssociationSelection: ({ userId, onComplete }: { userId: string, onComplete: () => void }) => (
    <div data-testid="mock-association-selection" data-user-id={userId}>
      <button 
        data-testid="complete-association-selection" 
        onClick={onComplete}
      >
        Complete Association Selection
      </button>
    </div>
  ),
}));

jest.mock('../../components/ui/Toast', () => ({
  ToastProvider: ({ children }: React.PropsWithChildren<{}>) => (
    <div data-testid="mock-toast-provider">{children}</div>
  ),
}));

describe('OnboardingPage', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });
  
  test('renders the voice onboarding step initially', () => {
    render(<OnboardingPage />);
    
    expect(screen.getByTestId('mock-voice-onboarding')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-association-selection')).not.toBeInTheDocument();
  });
  
  test('progresses to association selection after voice onboarding', async () => {
    render(<OnboardingPage />);
    
    // Complete voice onboarding
    await act(async () => {
      const completeVoiceButton = screen.getByTestId('complete-voice-onboarding');
      completeVoiceButton.click();
    });
    
    // Should now show association selection
    expect(screen.getByTestId('mock-association-selection')).toBeInTheDocument();
    
    // Should pass the user ID to association selection
    const associationSelection = screen.getByTestId('mock-association-selection');
    expect(associationSelection).toHaveAttribute('data-user-id', 'test-user-id');
  });
  
  test('shows error UI if user data is missing', async () => {
    // Create a customized mock for this test
    const VoiceOnboardingMock = jest.requireMock('../../components/VoiceOnboarding');
    const originalImplementation = VoiceOnboardingMock.VoiceOnboarding;
    
    // Replace with incomplete user data implementation
    VoiceOnboardingMock.VoiceOnboarding = ({ onComplete }: { onComplete: (user: any) => void }) => (
      <div data-testid="mock-voice-onboarding">
        <button 
          data-testid="complete-voice-onboarding" 
          onClick={() => onComplete({ name: 'Test User' })} // Missing _id
        >
          Complete Voice Onboarding
        </button>
      </div>
    );
    
    render(<OnboardingPage />);
    
    // Complete voice onboarding with incomplete data
    await act(async () => {
      const completeVoiceButton = screen.getByTestId('complete-voice-onboarding');
      completeVoiceButton.click();
    });
    
    // Restore original mock after test
    VoiceOnboardingMock.VoiceOnboarding = originalImplementation;
    
    // Should show error message
    expect(screen.getByText(/Erro ao processar usuário/i)).toBeInTheDocument();
    
    // Should have a button to go back
    expect(screen.getByText(/Voltar ao início/i)).toBeInTheDocument();
  });
  
  test('progresses to completion after association selection', async () => {
    jest.useFakeTimers();
    
    render(<OnboardingPage />);
    
    // Complete voice onboarding
    await act(async () => {
      const completeVoiceButton = screen.getByTestId('complete-voice-onboarding');
      completeVoiceButton.click();
    });
    
    // Complete association selection
    await act(async () => {
      const completeAssociationButton = screen.getByTestId('complete-association-selection');
      completeAssociationButton.click();
    });
    
    // Should now show completion message
    expect(screen.getByText(/Configuração concluída!/i)).toBeInTheDocument();
    
    // Should redirect after timeout
    await act(async () => {
      jest.advanceTimersByTime(1500); // A bit longer to ensure timeout completes
    });
    
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
    
    jest.useRealTimers();
  });
  
  test('displays progress bar with correct progress', async () => {
    render(<OnboardingPage />);
    
    // Initial step (33%)
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar.style.width).toBe('33%');
    
    // Complete voice onboarding
    await act(async () => {
      const completeVoiceButton = screen.getByTestId('complete-voice-onboarding');
      completeVoiceButton.click();
    });
    
    // Second step (66%)
    expect(progressBar.style.width).toBe('66%');
    
    // Complete association selection
    await act(async () => {
      const completeAssociationButton = screen.getByTestId('complete-association-selection');
      completeAssociationButton.click();
    });
    
    // Final step (100%)
    expect(progressBar.style.width).toBe('100%');
  });
}); 