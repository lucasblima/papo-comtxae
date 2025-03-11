import { 
  Achievement, 
  UserAchievement, 
  AchievementState, 
  AchievementTriggerEvent,
  AchievementApiResponse
} from '../types/achievements';
import { get, post, ApiResponse, ApiErrorType } from '../utils/api';

// Define available achievements
export const ACHIEVEMENTS: Record<string, Achievement> = {
  'first-message': {
    id: 'first-message',
    name: 'Primeira Mensagem',
    description: 'Você enviou sua primeira mensagem no Papo Social!',
    icon: '💬',
    points: 50,
    soundEffect: '/sounds/achievement.mp3',
    triggerEvent: 'send-message'
  },
  'profile-complete': {
    id: 'profile-complete',
    name: 'Perfil Completo',
    description: 'Você completou seu perfil!',
    icon: '👤',
    points: 100,
    triggerEvent: 'complete-profile'
  },
  'join-community': {
    id: 'join-community',
    name: 'Novo Membro',
    description: 'Você se juntou a uma comunidade!',
    icon: '👥',
    points: 150,
    triggerEvent: 'join-association'
  },
  'first-voice-message': {
    id: 'first-voice-message',
    name: 'Voz do Povo',
    description: 'Você enviou sua primeira mensagem de voz!',
    icon: '🎤',
    points: 75,
    triggerEvent: 'send-voice'
  },
  'daily-login': {
    id: 'daily-login',
    name: 'Presença Diária',
    description: 'Você acessou o Papo Social por 5 dias consecutivos!',
    icon: '📅',
    points: 200,
    triggerEvent: 'daily-login',
    targetValue: 5
  }
};

// Map of triggers to achievement IDs
const TRIGGER_MAP: Record<AchievementTriggerEvent, string> = {
  'send-message': 'first-message',
  'complete-profile': 'profile-complete',
  'join-association': 'join-community',
  'send-voice': 'first-voice-message',
  'daily-login': 'daily-login'
};

/**
 * Check if user has a specific achievement
 * @param userId - User ID to check
 * @param achievementId - Achievement ID to check
 * @returns Promise resolving to a boolean indicating if user has the achievement
 */
export const hasAchievement = async (userId: string, achievementId: string): Promise<boolean> => {
  if (!userId || !achievementId) {
    return false;
  }

  const response = await get<UserAchievement[]>(`/users/${userId}/achievements`);
  
  if (!response.success || !response.data) {
    return false;
  }
  
  return response.data.some(achievement => achievement.id === achievementId);
};

/**
 * Get all achievements for a user
 * @param userId - User ID to get achievements for
 * @returns Promise resolving to array of user achievements
 */
export const getUserAchievements = async (userId: string): Promise<ApiResponse<UserAchievement[]>> => {
  if (!userId) {
    return {
      success: false,
      error: {
        type: ApiErrorType.VALIDATION,
        message: 'User ID is required'
      }
    };
  }

  return get<UserAchievement[]>(`/users/${userId}/achievements`);
};

/**
 * Update user XP
 * @param userId - User ID to update XP for
 * @param points - Points to add
 * @returns Promise resolving to success status
 */
export const updateUserXP = async (userId: string, points: number): Promise<ApiResponse<{ updatedXp: number }>> => {
  if (!userId) {
    return {
      success: false,
      error: {
        type: ApiErrorType.VALIDATION,
        message: 'User ID is required'
      }
    };
  }

  return post<{ updatedXp: number }>(`/users/${userId}/xp`, { points });
};

/**
 * Add an achievement to a user
 * @param userId - User ID to add achievement to
 * @param achievementId - Achievement ID to add
 * @returns Promise resolving to the added achievement
 */
export const addUserAchievement = async (
  userId: string, 
  achievementId: string
): Promise<ApiResponse<UserAchievement>> => {
  if (!userId || !achievementId) {
    return {
      success: false,
      error: {
        type: ApiErrorType.VALIDATION,
        message: 'User ID and Achievement ID are required'
      }
    };
  }

  const achievement = ACHIEVEMENTS[achievementId];
  if (!achievement) {
    return {
      success: false,
      error: {
        type: ApiErrorType.VALIDATION,
        message: `Achievement with ID ${achievementId} does not exist`
      }
    };
  }
  
  const response = await post<any>(`/users/${userId}/achievements`, {
    achievementId,
    dateUnlocked: new Date().toISOString()
  });
  
  if (!response.success) {
    return response;
  }
  
  // Also add XP to the user
  await updateUserXP(userId, achievement.points);
  
  // Convert to UserAchievement
  const userAchievement: UserAchievement = {
    ...achievement,
    earnedAt: new Date(),
    state: AchievementState.UNLOCKED
  };
  
  return {
    success: true,
    data: userAchievement
  };
};

/**
 * Update achievement progress
 * @param userId - User ID to update progress for
 * @param achievementId - Achievement ID to update
 * @param currentValue - Current progress value
 */
export const updateAchievementProgress = async (
  userId: string,
  achievementId: string,
  currentValue: number
): Promise<ApiResponse<UserAchievement>> => {
  if (!userId || !achievementId) {
    return {
      success: false,
      error: {
        type: ApiErrorType.VALIDATION,
        message: 'User ID and Achievement ID are required'
      }
    };
  }

  const achievement = ACHIEVEMENTS[achievementId];
  if (!achievement) {
    return {
      success: false,
      error: {
        type: ApiErrorType.VALIDATION,
        message: `Achievement with ID ${achievementId} does not exist`
      }
    };
  }
  
  const response = await post<any>(`/users/${userId}/achievements/${achievementId}/progress`, {
    currentValue
  });
  
  if (!response.success) {
    return response;
  }
  
  // Check if achievement is completed based on target value
  if (achievement.targetValue && currentValue >= achievement.targetValue) {
    // Add the completed achievement
    return addUserAchievement(userId, achievementId);
  }
  
  // Return the in-progress achievement
  const userAchievement: UserAchievement = {
    ...achievement,
    earnedAt: new Date(),
    state: AchievementState.IN_PROGRESS,
    currentValue
  };
  
  return {
    success: true,
    data: userAchievement
  };
};

/**
 * Trigger achievement check based on a specific action
 * @param trigger - Action trigger
 * @param userData - User data
 * @param onAchievement - Callback for when achievement is unlocked
 */
export const triggerAchievementCheck = async (
  trigger: AchievementTriggerEvent,
  userData: { id: string },
  onAchievement?: (achievement: UserAchievement) => void
): Promise<ApiResponse<UserAchievement | null>> => {
  // Skip check if no user ID is available
  if (!userData || !userData.id) {
    return {
      success: false,
      error: {
        type: ApiErrorType.VALIDATION,
        message: 'User ID is required'
      }
    };
  }
  
  const achievementId = TRIGGER_MAP[trigger];
  if (!achievementId) {
    return {
      success: false,
      error: {
        type: ApiErrorType.VALIDATION,
        message: `No achievement mapped for trigger: ${trigger}`
      }
    };
  }
  
  // Special case for daily login which requires progress tracking
  if (trigger === 'daily-login') {
    // Get current progress
    const userAchievements = await getUserAchievements(userData.id);
    if (!userAchievements.success || !userAchievements.data) {
      return {
        success: false,
        error: userAchievements.error || {
          type: ApiErrorType.UNKNOWN,
          message: 'Failed to retrieve user achievements'
        }
      };
    }
    
    const existingAchievement = userAchievements.data.find(a => a.id === achievementId);
    
    // If already completed, do nothing
    if (existingAchievement && existingAchievement.state === AchievementState.UNLOCKED) {
      return {
        success: true,
        data: null
      };
    }
    
    // Update progress
    const currentValue = (existingAchievement?.currentValue || 0) + 1;
    const result = await updateAchievementProgress(userData.id, achievementId, currentValue);
    
    // Notify if achievement completed
    if (result.success && result.data && result.data.state === AchievementState.UNLOCKED && onAchievement) {
      onAchievement(result.data);
    }
    
    return result;
  }
  
  // For one-time achievements
  // Check if user already has this achievement
  const hasAchievementAlready = await hasAchievement(userData.id, achievementId);
  if (hasAchievementAlready) {
    return {
      success: true,
      data: null
    };
  }
  
  // If not, add the achievement
  const result = await addUserAchievement(userData.id, achievementId);
  
  // Call the callback if achievement was added
  if (result.success && result.data && onAchievement) {
    onAchievement(result.data);
  }
  
  return result;
};

// Default export
export default {
  triggerAchievementCheck,
  getUserAchievements,
  hasAchievement,
  addUserAchievement,
  updateAchievementProgress,
  updateUserXP,
  ACHIEVEMENTS,
  TRIGGER_MAP
}; 