import { signIn } from 'next-auth/react';

interface AuthData {
  name: string;
  phone: string;
  voiceData?: {
    timestamp: number;
    userId: string;
  };
}

export class AuthService {
  static async signInWithVoice(data: AuthData): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await signIn('voice', {
        redirect: false,
        name: data.name,
        phone: data.phone,
        voiceData: JSON.stringify({
          timestamp: Date.now(),
          userId: data.voiceData?.userId || data.name
        })
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return { success: true };
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Houve um erro ao criar sua conta. Por favor, tente novamente.'
      };
    }
  }
} 