import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UserAchievement } from './types';
import styles from './AchievementNotification.module.css';

interface AchievementNotificationProps {
  /**
   * Array of achievements to display
   */
  achievements: UserAchievement[];
  
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
const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievements,
  autoDismissTime = 5000,
  position = 'bottom-right',
  playSounds = true,
}) => {
  const [visibleAchievements, setVisibleAchievements] = useState<(UserAchievement & { key: string })[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create unique identifiers for achievements
  useEffect(() => {
    if (achievements.length > 0) {
      const newAchievements = achievements.map(achievement => ({
        ...achievement,
        key: `${achievement.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      }));
      
      setVisibleAchievements(prev => [...prev, ...newAchievements]);
      
      // Play sound if enabled
      if (playSounds && achievements.length > 0 && achievements[0]?.soundEffect && typeof window !== 'undefined') {
        try {
          // Create and play audio element
          const soundUrl = achievements[0].soundEffect;
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
  }, [achievements, playSounds]);

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

  if (!isMounted || visibleAchievements.length === 0) {
    return null;
  }

  const toastContent = (
    <div className={`toast ${getPositionClasses()} z-50`}>
      {visibleAchievements.map((achievement) => (
        <div
          key={achievement.key}
          className={`alert shadow-lg bg-base-100 border-2 border-primary w-80 md:w-96 ${styles.animateSlideUp}`}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="avatar">
              <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img 
                  src={achievement.icon} 
                  alt={`${achievement.name} achievement icon`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{achievement.name}</h3>
              <div className="text-sm opacity-80">{achievement.description}</div>
              {achievement.earnedAt && (
                <div className="text-xs opacity-60 mt-1">
                  Conquistado em {achievement.earnedAt.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(toastContent, document.body) : null;
};

export default AchievementNotification; 