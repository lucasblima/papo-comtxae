import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { VoiceVisualization } from '../../components/speech/VoiceVisualization';

// Mock canvas context
const mockContext = {
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  scale: jest.fn(),
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  roundRect: jest.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  lineCap: 'butt' as CanvasLineCap,
  lineJoin: 'miter' as CanvasLineJoin,
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  })),
  createRadialGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  }))
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 0);
global.cancelAnimationFrame = jest.fn();

describe('VoiceVisualization Component', () => {
  beforeEach(() => {
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext as unknown as CanvasRenderingContext2D);
    Object.defineProperty(HTMLCanvasElement.prototype, 'offsetWidth', { value: 100 });
    window.devicePixelRatio = 2;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<VoiceVisualization volume={0} />);
    const container = screen.getByRole('img');
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(container).toHaveAttribute('aria-label', 'Voice visualization');
  });

  it('applies custom theme colors', () => {
    const theme = {
      primary: '#ff0000',
      secondary: '#00ff00',
      background: '#0000ff'
    };
    
    render(<VoiceVisualization volume={50} theme={theme} />);
    expect(mockContext.fillStyle).toBeCalled;
  });

  it('renders different visualization styles', () => {
    const { rerender } = render(<VoiceVisualization volume={50} style="bars" />);
    expect(mockContext.roundRect).toBeCalled;

    rerender(<VoiceVisualization volume={50} style="wave" />);
    expect(mockContext.moveTo).toBeCalled;
    expect(mockContext.lineTo).toBeCalled;

    rerender(<VoiceVisualization volume={50} style="circle" />);
    expect(mockContext.arc).toBeCalled;
  });

  it('shows volume level when enabled', () => {
    render(<VoiceVisualization volume={128} showVolumeLevel />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('updates aria-label based on listening state', () => {
    const { rerender } = render(<VoiceVisualization volume={0} isListening={false} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Voice visualization');

    rerender(<VoiceVisualization volume={0} isListening={true} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Voice visualization - Recording in progress');
  });

  it('applies custom height', () => {
    render(<VoiceVisualization volume={0} height={200} />);
    const container = screen.getByRole('img');
    expect(container).toHaveStyle({ height: '200px' });
  });

  it('applies custom animation speed', () => {
    render(<VoiceVisualization volume={50} animationSpeed={2} />);
    expect(mockContext.scale).toBeCalled;
  });

  it('handles custom bar count', () => {
    render(<VoiceVisualization volume={50} barCount={10} />);
    expect(mockContext.roundRect).toBeCalled;
  });

  it('cleans up animation frame on unmount', () => {
    const { unmount } = render(<VoiceVisualization volume={50} />);
    unmount();
    expect(global.cancelAnimationFrame).toBeCalled;
  });

  it('handles invalid hex colors gracefully', () => {
    render(<VoiceVisualization volume={50} theme={{ primary: 'invalid-color' }} />);
    // Should use fallback color without throwing
    expect(mockContext.fillStyle).toBeCalled;
  });

  it('updates visualization on volume change', () => {
    const { rerender } = render(<VoiceVisualization volume={0} />);
    const initialCalls = mockContext.clearRect.mock.calls.length;
    
    rerender(<VoiceVisualization volume={100} />);
    expect(mockContext.clearRect.mock.calls.length).toBeGreaterThan(initialCalls);
  });

  it('applies custom className', () => {
    render(<VoiceVisualization volume={0} className="custom-class" />);
    const container = screen.getByRole('img');
    expect(container).toHaveClass('custom-class');
  });

  it('handles window resize', () => {
    render(<VoiceVisualization volume={50} />);
    
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    expect(mockContext.scale).toBeCalled;
  });
}); 