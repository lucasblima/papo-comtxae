import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SimplifiedAchievementProps {
  /** Title of the achievement */
  title: string;
  
  /** Description of the achievement */
  description: string;
  
  /** Icon (emoji or URL) to display */
  icon: string;
  
  /** Callback when notification is closed */
  onClose?: () => void;
  
  /** Auto-dismiss time in ms */
  autoDismissTime?: number;
  
  /** Position on screen */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * Simplified Achievement Notification Component
 * Displays a notification for a single achievement
 */
export const AchievementNotification: React.FC<SimplifiedAchievementProps> = ({
  title,
  description,
  icon,
  onClose,
  autoDismissTime = 5000,
  position = 'bottom-right',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': { top: 20, right: 20 },
    'top-left': { top: 20, left: 20 },
    'bottom-right': { bottom: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
  };
  
  // Auto dismiss the notification
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Call onClose after exit animation
      }
    }, autoDismissTime);
    
    return () => clearTimeout(timeoutId);
  }, [autoDismissTime, onClose]);
  
  // Play achievement sound
  useEffect(() => {
    try {
      const sound = new Audio('/sounds/achievement.mp3');
      sound.play().catch(err => console.log('Sound play error:', err));
    } catch (error) {
      console.log('Could not play achievement sound');
    }
  }, []);
  
  return (
    <div
      className="fixed z-50 flex flex-col gap-4"
      style={positionStyles[position]}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className="bg-base-100 rounded-lg shadow-lg p-4 max-w-sm w-full border border-base-300"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                {icon.startsWith('/') ? (
                  <img 
                    src={icon} 
                    alt={`${title} achievement icon`} 
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center text-3xl">
                    {icon}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">
                    {title}
                  </h3>
                  <button 
                    onClick={() => {
                      setIsVisible(false);
                      if (onClose) setTimeout(onClose, 300);
                    }}
                    className="text-base-content/60 hover:text-base-content"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-base-content/80">
                  {description}
                </p>
                <div className="mt-2">
                  <span className="text-xs font-semibold inline-block px-2 py-1 rounded-full bg-primary/20 text-primary">
                    +50 XP
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementNotification; 