import { useEffect, RefObject } from 'react';

interface UseKeyboardControlOptions {
  onEnterOrSpace?: () => void;
  onEscape?: () => void;
  disabled?: boolean;
}

export function useKeyboardControl(
  elementRef: RefObject<HTMLElement>,
  {
    onEnterOrSpace,
    onEscape,
    disabled = false
  }: UseKeyboardControlOptions
) {
  useEffect(() => {
    const element = elementRef.current;
    if (!element || disabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.key === 'Enter' || event.key === ' ') && onEnterOrSpace) {
        event.preventDefault();
        onEnterOrSpace();
      } else if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
      }
    };

    element.addEventListener('keypress', handleKeyPress);
    return () => {
      element.removeEventListener('keypress', handleKeyPress);
    };
  }, [elementRef, onEnterOrSpace, onEscape, disabled]);
} 