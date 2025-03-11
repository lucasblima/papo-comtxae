import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { VoiceVisualization } from '../VoiceVisualization';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  return {
    motion: {
      div: ({ children, ...props }: React.PropsWithChildren<any>) => (
        <div data-testid="motion-div" {...props}>{children}</div>
      ),
    },
  };
});

describe('VoiceVisualization', () => {
  // Mock timers for useEffect interval
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Test case: Should render with correct container size based on size prop
  test('renders with correct container size based on size prop', () => {
    const { rerender } = render(
      <VoiceVisualization isListening={false} size="sm" />
    );
    
    let container = screen.getByTestId('voice-visualization');
    expect(container.style.width).toBe('40px');
    expect(container.style.height).toBe('40px');
    
    rerender(<VoiceVisualization isListening={false} size="md" />);
    container = screen.getByTestId('voice-visualization');
    expect(container.style.width).toBe('60px');
    expect(container.style.height).toBe('60px');
    
    rerender(<VoiceVisualization isListening={false} size="lg" />);
    container = screen.getByTestId('voice-visualization');
    expect(container.style.width).toBe('80px');
    expect(container.style.height).toBe('80px');
  });

  // Test case: Should render correct number of bars based on size
  test('renders correct number of bars based on size', () => {
    const { rerender } = render(
      <VoiceVisualization isListening={false} size="sm" />
    );
    
    // Small size should have 3 bars
    let bars = screen.getAllByTestId('motion-div');
    expect(bars.length).toBe(3);
    
    rerender(<VoiceVisualization isListening={false} size="md" />);
    // Medium size should have 5 bars
    bars = screen.getAllByTestId('motion-div');
    expect(bars.length).toBe(5);
    
    rerender(<VoiceVisualization isListening={false} size="lg" />);
    // Large size should have 7 bars
    bars = screen.getAllByTestId('motion-div');
    expect(bars.length).toBe(7);
  });

  // Test case: Should update bars when isListening is true
  test('updates bars when isListening is true', () => {
    // Mock Math.random to return predictable values
    const originalRandom = Math.random;
    Math.random = jest.fn().mockReturnValue(0.5);
    
    render(<VoiceVisualization isListening={true} amplitude={0.8} />);
    
    // Advance timers to trigger the interval
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    const bars = screen.getAllByTestId('motion-div');
    expect(bars.length).toBe(5); // Default md size has 5 bars
    
    // Restore original Math.random
    Math.random = originalRandom;
  });

  // Test case: Should apply the correct color to bars
  test('applies correct color to bars', () => {
    render(<VoiceVisualization isListening={false} color="#FF0000" />);
    
    const bars = screen.getAllByTestId('motion-div');
    bars.forEach(bar => {
      // Accept either hex or rgb format
      expect(bar.style.backgroundColor).toMatch(/(#FF0000|rgb\(255,\s*0,\s*0\))/i);
    });
  });

  // Test case: Should clean up interval on unmount
  test('cleans up interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    
    const { unmount } = render(
      <VoiceVisualization isListening={true} />
    );
    
    // Advance timers to create the interval
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    
    clearIntervalSpy.mockRestore();
  });
}); 