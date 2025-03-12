import { toast } from 'react-toastify';

interface OnboardingData {
  name: string;
  phone: string;
}

interface ProcessTranscriptResponse {
  name?: string;
  success: boolean;
  message?: string;
}

export class OnboardingService {
  private static API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  static async processTranscript(transcript: string): Promise<ProcessTranscriptResponse> {
    try {
      const response = await fetch(`${this.API_URL}/process-transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        throw new Error('Failed to process transcript');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error processing transcript:', error);
      toast.error('Erro ao processar sua fala. Por favor, tente novamente.');
      return { success: false };
    }
  }

  static async createUser(data: OnboardingData): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Erro ao criar sua conta. Por favor, tente novamente.');
      return false;
    }
  }

  static async updateUserXP(userId: string, xp: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/users/${userId}/xp`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xp }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user XP');
      }

      return true;
    } catch (error) {
      console.error('Error updating user XP:', error);
      toast.error('Erro ao atualizar sua pontuação. Por favor, tente novamente.');
      return false;
    }
  }
} 