/**
 * Interface representing a user achievement in the system
 */
export interface UserAchievement {
  /**
   * Unique identifier for the achievement
   */
  id: string;
  
  /**
   * Name of the achievement displayed to the user
   */
  name: string;
  
  /**
   * Description of the achievement, explaining how it was earned
   */
  description: string;
  
  /**
   * URL to the achievement icon image
   */
  icon: string;
  
  /**
   * Optional timestamp when the achievement was earned
   */
  earnedAt?: Date;
  
  /**
   * Optional URL to the sound effect played when the achievement is shown
   */
  soundEffect?: string;
} 