/**
 * Achievement Types
 * Central type definitions for achievements in the Papo Social platform
 */

/**
 * Achievement state enum representing the current state of an achievement
 */
export enum AchievementState {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
  IN_PROGRESS = 'in-progress',
}

/**
 * Achievement trigger events that can unlock achievements
 */
export type AchievementTriggerEvent = 
  | 'send-message' 
  | 'complete-profile' 
  | 'join-association' 
  | 'send-voice' 
  | 'daily-login';

/**
 * Core achievement interface for base achievement definitions
 */
export interface Achievement {
  /** Unique identifier for the achievement */
  id: string;
  
  /** Display name of the achievement */
  name: string;
  
  /** Description explaining how the achievement is earned */
  description: string;
  
  /** Icon representing the achievement (URL or emoji) */
  icon: string;
  
  /** Points awarded when achievement is unlocked */
  points: number;
  
  /** Optional sound effect to play when unlocked */
  soundEffect?: string;
  
  /** Achievement trigger event type */
  triggerEvent?: AchievementTriggerEvent;
  
  /** For achievements with progress, the target value (e.g., 5 days for daily login) */
  targetValue?: number;
}

/**
 * User achievement extending base achievement with user-specific properties
 */
export interface UserAchievement extends Achievement {
  /** Date when the achievement was earned */
  earnedAt: Date;
  
  /** Current state of the achievement for the user */
  state: AchievementState;
  
  /** For in-progress achievements, the current progress value */
  currentValue?: number;
}

/**
 * Achievement notification props interface
 */
export interface AchievementNotificationProps {
  /** Achievements to display in the notification */
  achievements: UserAchievement[];
  
  /** Time in ms after which notifications auto-dismiss */
  autoDismissTime?: number;
  
  /** Position on screen to display notifications */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  
  /** Whether to play sounds when showing achievements */
  playSounds?: boolean;
}

/**
 * API response for achievement operations
 */
export interface AchievementApiResponse<T> {
  /** Success indicator */
  success: boolean;
  
  /** Response data */
  data?: T;
  
  /** Error message if any */
  error?: string;
  
  /** HTTP status code */
  statusCode?: number;
} 