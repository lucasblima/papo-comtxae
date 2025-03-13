interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

interface UserLevel {
  level: number;
  xp: number;
  next_level_xp: number;
}

interface UpdateXPResponse {
  success: boolean;
  level?: UserLevel;
  achievements?: Achievement[];
  error?: string;
}

export class AchievementService {
  private static API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  static async updateUserXP(userId: string, xp: number, phone: string): Promise<UpdateXPResponse> {
    try {
      const response = await fetch(`${this.API_URL}/users/${userId}/xp`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xp, phone }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user XP');
      }

      const data = await response.json();
      return {
        success: true,
        level: data.level,
        achievements: data.achievements,
      };
    } catch (error) {
      console.error('Error updating user XP:', error);
      return {
        success: false,
        error: 'Erro ao atualizar sua pontuação. Por favor, tente novamente.',
      };
    }
  }

  static hasLevelUpAchievement(achievements: Achievement[]): Achievement | undefined {
    return achievements?.find(a => a.id.startsWith('level_'));
  }
} 