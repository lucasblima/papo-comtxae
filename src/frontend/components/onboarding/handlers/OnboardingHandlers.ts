import { UserData } from '../../../types/onboarding';
import { AuthService } from '../../../services/authService';
import { AchievementService } from '../../../services/achievementService';
import { ToastProps } from '../../ui/Toast';

interface HandleConfirmationCompleteOptions {
  userData: UserData;
  showToast: (options: ToastProps) => void;
  goToNextStep: () => void;
}

/**
 * Manipulador para a conclusão da etapa de confirmação
 * 
 * Realiza a autenticação do usuário e atualiza experiência.
 * 
 * @returns Promise que resolve quando a operação é concluída
 */
export async function handleConfirmationComplete({
  userData,
  showToast,
  goToNextStep
}: HandleConfirmationCompleteOptions): Promise<void> {
  try {
    // Atualizar XP do usuário
    if (userData._id) {
      const xpResult = await AchievementService.updateUserXP(userData._id, 10, userData.phone);
      if (xpResult.success && xpResult.achievements) {
        const levelAchievement = AchievementService.hasLevelUpAchievement(xpResult.achievements);
        if (levelAchievement) {
          showToast({
            title: 'Nível Aumentado!',
            description: levelAchievement.description,
            type: 'success',
            icon: '⭐',
            duration: 5000,
          });
        }
      }
    }

    // Autenticar usuário
    const authResult = await AuthService.signInWithVoice({
      name: userData.name,
      phone: userData.phone,
      voiceData: {
        timestamp: Date.now(),
        userId: userData._id || userData.name
      }
    });

    if (authResult.success) {
      goToNextStep();
    } else {
      showToast({
        title: 'Erro de Autenticação',
        description: authResult.error || 'Erro desconhecido ao autenticar.',
        type: 'error',
      });
    }
  } catch (error) {
    console.error('Erro durante a confirmação:', error);
    showToast({
      title: 'Erro',
      description: 'Ocorreu um erro ao processar sua confirmação.',
      type: 'error',
    });
  }
}

interface CreateSuccessHandlerOptions {
  userData: UserData;
  onComplete?: (userData: UserData) => void;
  redirectUrl: string;
}

/**
 * Cria uma função para lidar com a conclusão da etapa de sucesso
 * 
 * @returns Função que executa o callback de conclusão ou redireciona
 */
export function createSuccessHandler({
  userData,
  onComplete,
  redirectUrl
}: CreateSuccessHandlerOptions) {
  return () => {
    if (onComplete) {
      onComplete(userData);
    } else {
      window.location.href = redirectUrl;
    }
  };
} 