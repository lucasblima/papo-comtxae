import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ToastProvider, useToast, ToastType, ToastProps } from '../../components/ui/Toast';

// Mock timer functions
jest.useFakeTimers();

// Test component that uses the useToast hook
function TestComponent({ 
  type = 'info', 
  title = 'Test Toast', 
  description = '', 
  duration = 3000,
  icon 
}: { 
  type?: ToastType;
  title?: string;
  description?: string;
  duration?: number;
  icon?: string | React.ReactNode;
}) {
  const { showToast } = useToast();
  
  React.useEffect(() => {
    const toastProps: ToastProps = {
      type,
      title,
      description,
      duration,
      icon
    };
    showToast(toastProps);
  }, [type, title, description, duration, icon]);
  
  return null;
}

describe('Toast Component', () => {
  beforeEach(() => {
    // Create a div to serve as the portal container
    const portalRoot = document.createElement('div');
    portalRoot.setAttribute('id', 'portal-root');
    document.body.appendChild(portalRoot);
  });

  afterEach(() => {
    // Clean up the portal container
    const portalRoot = document.getElementById('portal-root');
    if (portalRoot) {
      document.body.removeChild(portalRoot);
    }
    jest.clearAllMocks();
  });

  it('throws error when useToast is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');
    
    consoleSpy.mockRestore();
  });

  it('renders success toast with default duration', async () => {
    render(
      <ToastProvider>
        <TestComponent type="success" title="Success!" description="Operation completed" />
      </ToastProvider>
    );

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('alert-success');

    // Fast-forward time to trigger toast removal
    act(() => {
      jest.advanceTimersByTime(3000); // Default duration
    });

    await waitFor(() => {
      expect(screen.queryByText('Success!')).not.toBeInTheDocument();
    });
  });

  it('renders error toast with custom duration', async () => {
    render(
      <ToastProvider>
        <TestComponent 
          type="error" 
          title="Error!" 
          description="Something went wrong" 
          duration={5000}
        />
      </ToastProvider>
    );

    expect(screen.getByText('Error!')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('alert-error');

    // Toast should still be visible after 3s
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText('Error!')).toBeInTheDocument();

    // Toast should be removed after 5s
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    await waitFor(() => {
      expect(screen.queryByText('Error!')).not.toBeInTheDocument();
    });
  });

  it('renders warning toast with custom icon', () => {
    const customIcon = '⚠️';
    render(
      <ToastProvider>
        <TestComponent 
          type="warning" 
          title="Warning!" 
          icon={customIcon}
        />
      </ToastProvider>
    );

    expect(screen.getByText('Warning!')).toBeInTheDocument();
    expect(screen.getByText(customIcon)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('alert-warning');
  });

  it('renders info toast with React node icon', () => {
    const CustomIcon = () => <span data-testid="custom-icon">ℹ️</span>;
    render(
      <ToastProvider>
        <TestComponent 
          type="info" 
          title="Info" 
          icon={<CustomIcon />}
        />
      </ToastProvider>
    );

    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('alert-info');
  });

  it('renders multiple toasts in order', () => {
    const { rerender } = render(
      <ToastProvider>
        <TestComponent type="info" title="First Toast" />
      </ToastProvider>
    );

    expect(screen.getByText('First Toast')).toBeInTheDocument();

    rerender(
      <ToastProvider>
        <TestComponent type="success" title="Second Toast" />
      </ToastProvider>
    );

    const toasts = screen.getAllByRole('alert');
    expect(toasts).toHaveLength(2);
    expect(toasts[0]).toHaveTextContent('First Toast');
    expect(toasts[1]).toHaveTextContent('Second Toast');
  });

  it('removes toasts in correct order', async () => {
    render(
      <ToastProvider>
        <>
          <TestComponent type="info" title="Short Toast" duration={1000} />
          <TestComponent type="success" title="Long Toast" duration={2000} />
        </>
      </ToastProvider>
    );

    expect(screen.getByText('Short Toast')).toBeInTheDocument();
    expect(screen.getByText('Long Toast')).toBeInTheDocument();

    // First toast should be removed after 1s
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(screen.queryByText('Short Toast')).not.toBeInTheDocument();
      expect(screen.getByText('Long Toast')).toBeInTheDocument();
    });

    // Second toast should be removed after another 1s
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(screen.queryByText('Long Toast')).not.toBeInTheDocument();
    });
  });

  it('handles component unmount correctly', () => {
    const { unmount } = render(
      <ToastProvider>
        <TestComponent type="info" title="Test Toast" />
      </ToastProvider>
    );

    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    
    unmount();
    
    expect(screen.queryByText('Test Toast')).not.toBeInTheDocument();
  });
}); 