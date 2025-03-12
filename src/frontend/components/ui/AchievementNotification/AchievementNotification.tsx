import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UserAchievement } from './types';
import styles from './AchievementNotification.module.css';

interface AchievementNotificationProps {
  /**
   * Array of achievements to display
   */
  achievements?: UserAchievement[];
  
  /**
   * Title of a single achievement to display (alternative to achievements array)
   */
  title?: string;
  
  /**
   * Description of a single achievement to display
   */
  description?: string;
  
  /**
   * Icon for a single achievement to display
   */
  icon?: string;
  
  /**
   * Callback function when notification is closed
   */
  onClose?: () => void;
  
  /**
   * Time in milliseconds after which the notification is auto-dismissed
   * @default 5000
   */
  autoDismissTime?: number;
  
  /**
   * Position of the notification on the screen
   * @default 'bottom-right'
   */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  
  /**
   * Whether to play sound effects when showing achievements
   * @default true
   */
  playSounds?: boolean;
}

/**
 * Component that displays toast-style notifications for user achievements
 */
export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievements = [],
  title,
  description,
  icon,
  onClose,
  autoDismissTime = 5000,
  position = 'bottom-right',
  playSounds = true,
}) => {
  const [visibleAchievements, setVisibleAchievements] = useState<(UserAchievement & { key: string })[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create a merged achievements array that includes both the array and individual props
  const allAchievements = [...achievements];
  
  // If individual achievement props are provided, add them to the array
  if (title && description) {
    allAchievements.push({
      id: title, // Use title as ID for simplicity
      name: title,
      description,
      icon: icon || '🏆', // Default icon if none provided
      earnedAt: new Date()
    });
  }

  // Create unique identifiers for achievements
  useEffect(() => {
    if (allAchievements.length > 0) {
      const newAchievements = allAchievements.map(achievement => ({
        ...achievement,
        key: `${achievement.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      }));
      
      setVisibleAchievements(prev => [...prev, ...newAchievements]);
      
      // Play sound if enabled
      if (playSounds && allAchievements.length > 0 && allAchievements[0]?.soundEffect && typeof window !== 'undefined') {
        try {
          // Create and play audio element
          const soundUrl = allAchievements[0].soundEffect;
          if (soundUrl) {
            const audio = new Audio(soundUrl);
            audioRef.current = audio;
            audio.play().catch(err => {
              console.warn('Failed to play achievement sound effect:', err);
            });
          }
        } catch (error) {
          console.warn('Error playing achievement sound:', error);
        }
      }
    }
  }, [allAchievements, playSounds]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (visibleAchievements.length === 0) return;
    
    const timer = setTimeout(() => {
      setVisibleAchievements(prev => {
        const [, ...remaining] = prev;
        return remaining;
      });
    }, autoDismissTime);
    
    return () => clearTimeout(timer);
  }, [autoDismissTime, visibleAchievements]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Only run on client side
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Get position classes for toast
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'toast-top toast-end';
      case 'top-left':
        return 'toast-top toast-start';
      case 'bottom-left':
        return 'toast-bottom toast-start';
      case 'bottom-right':
      default:
        return 'toast-bottom toast-end';
    }
  };

  // Call onClose callback when notification is closed if provided
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    
    // Remove all achievements from view
    setVisibleAchievements([]);
  };

  // Dismiss a specific achievement
  const dismissAchievement = (key: string) => {
    setVisibleAchievements(prev => prev.filter(a => a.key !== key));
    
    // If this was the last achievement, call handleClose
    if (visibleAchievements.length <= 1) {
      if (onClose) {
        onClose();
      }
    }
  };

  if (!isMounted || visibleAchievements.length === 0) {
    return null;
  }

  return createPortal(
    <div className={`${styles.notificationContainer} ${getPositionClasses()}`}>
      {visibleAchievements.map(achievement => (
        <div 
          key={achievement.key} 
          className={styles.notification}
        >
          <div className={styles.icon}>
            {typeof achievement.icon === 'string' && achievement.icon.length <= 2 
              ? achievement.icon // Treat as emoji or simple text
              : <img src={achievement.icon} alt="" />
            }
          </div>
          <div className={styles.content}>
            <h3 className={styles.title}>{achievement.name}</h3>
            <p className={styles.description}>{achievement.description}</p>
          </div>
          <button 
            className={styles.closeButton} 
            onClick={() => dismissAchievement(achievement.key || '')}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
};

// Export default for convenience
export default AchievementNotification; 