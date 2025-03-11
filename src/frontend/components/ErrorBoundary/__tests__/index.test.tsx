import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../index';

// Mock console.error to prevent error outputs during test
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Component that throws an error for testing purposes
const ErrorThrowingComponent = (): React.ReactElement => {
  throw new Error('Test error');
};

describe('ErrorBoundary Component', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="test-child">Test Content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  
  it('displays fallback UI when error occurs', () => {
    // We need to mock console.error as React will log the error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    // Fallback UI should be displayed
    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
    expect(screen.getByText('Algo deu errado.')).toBeInTheDocument();
    
    // Reset the spy
    consoleErrorSpy.mockRestore();
  });
  
  it('allows user to retry by clicking the button', () => {
    // Mock window.location.reload
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });
    
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    // Click the retry button
    fireEvent.click(screen.getByText('Tentar novamente'));
    
    // Check if reload was called
    expect(mockReload).toHaveBeenCalledTimes(1);
  });
}); 