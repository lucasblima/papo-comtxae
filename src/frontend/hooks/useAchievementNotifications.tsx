import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AchievementNotification } from '../components/ui/AchievementNotification/AchievementNotification';
import { UserAchievement, AchievementTriggerEvent } from '../types/achievements';
import achievementsService from '../services/achievements';

/**
 * Hook options for configuring achievement notifications
 */
interface UseAchievementNotificationsOptions {
  /**
   * Time in milliseconds after which notifications auto-dismiss
   */
  autoDismissTime?: number;
  
  /**
   * Position of notifications on the screen
   */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  
  /**
   * Whether to play sounds when showing achievements
   */
  playSounds?: boolean;
}

/**
 * Hook for managing achievement notifications in React components
 * 
 * @param options Configuration options for achievement notifications
 * @returns Object with functions to manage achievement notifications
 */
export const useAchievementNotifications = (options: UseAchievementNotificationsOptions = {}) => {
  const {
    autoDismissTime = 5000,
    position = 'bottom-right',
    playSounds = true,
  } = options;
  
  const [pendingAchievements, setPendingAchievements] = useState<UserAchievement[]>([]);
  const achievementQueue = useRef<UserAchievement[]>([]);
  
  /**
   * Function to show an achievement notification
   */
  const showAchievement = useCallback((achievement: UserAchievement | null) => {
    if (!achievement) return;
    
    // Add to queue
    achievementQueue.current = [...achievementQueue.current, achievement];
    
    // If it's the first item, show immediately
    if (achievementQueue.current.length === 1) {
      setPendingAchievements([achievement]);
    }
  }, []);
  
  /**
   * Function to show multiple achievement notifications
   */
  const showAchievements = useCallback((newAchievements: UserAchievement[]) => {
    if (!newAchievements || newAchievements.length === 0) return;
    
    // Add all to queue
    achievementQueue.current = [...achievementQueue.current, ...newAchievements];
    
    // If queue was empty, show the first one immediately
    if (achievementQueue.current.length === newAchievements.length) {
      setPendingAchievements([achievementQueue.current[0]]);
    }
  }, []);
  
  /**
   * Function to trigger achievement checks based on an event
   */
  const checkAchievementsForEvent = useCallback(async (
    trigger: AchievementTriggerEvent,
    userData: { id: string }
  ) => {
    const result = await achievementsService.triggerAchievementCheck(
      trigger,
      userData,
      (newAchievement) => {
        showAchievement(newAchievement);
      }
    );
    
    // Return if we got a new achievement
    return result.success && result.data !== null;
  }, [showAchievement]);
  
  /**
   * Effect to handle dismissing achievements and showing the next in queue
   */
  useEffect(() => {
    if (pendingAchievements.length === 0 || !autoDismissTime) return;
    
    const timeoutId = setTimeout(() => {
      // Remove the first achievement from the queue
      achievementQueue.current.shift();
      
      // If there are more achievements in the queue, show the next one
      if (achievementQueue.current.length > 0) {
        const nextAchievement = achievementQueue.current[0];
        if (nextAchievement) {
          setPendingAchievements([nextAchievement]);
        } else {
          setPendingAchievements([]);
        }
      } else {
        setPendingAchievements([]);
      }
    }, autoDismissTime);
    
    return () => clearTimeout(timeoutId);
  }, [pendingAchievements, autoDismissTime]);
  
  /**
   * Render the achievement notification component
   */
  const AchievementNotificationComponent = useCallback(() => {
    if (pendingAchievements.length === 0) return null;
    
    return (
      <AchievementNotification
        achievements={pendingAchievements}
        autoDismissTime={autoDismissTime}
        position={position}
        playSounds={playSounds}
      />
    );
  }, [pendingAchievements, autoDismissTime, position, playSounds]);
  
  return {
    showAchievement,
    showAchievements,
    checkAchievementsForEvent,
    AchievementNotificationComponent,
    pendingAchievements
  };
};

export default useAchievementNotifications; 