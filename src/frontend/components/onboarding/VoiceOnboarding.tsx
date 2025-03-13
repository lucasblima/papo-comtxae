import React from 'react';
import { useRouter } from 'next/router';
import { useOnboardingStep } from '../../hooks/onboarding/useOnboardingStep';
import { useTextToSpeech } from '../../hooks/speech/useTextToSpeech';
import { AuthService } from '../../services/authService';
import { AchievementService } from '../../services/achievementService';
import { useToast } from '../ui/Toast';
import { WelcomeStep } from './steps/WelcomeStep';
import { PhoneInputStep } from './steps/PhoneInputStep';
import { ConfirmationStep } from './steps/ConfirmationStep';
import { SuccessStep } from './steps/SuccessStep';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedVoiceVisualizer } from '../speech/EnhancedVoiceVisualizer';

interface UserData {
  name: string;
  phone: string;
  _id?: string;
  level?: {
    level: number;
    xp: number;
    next_level_xp: number;
  };
}

export interface VoiceOnboardingProps {
  onComplete?: (userData: UserData) => void;
  className?: string;
}

export function VoiceOnboarding({ onComplete, className = '' }: VoiceOnboardingProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { speak, cancel } = useTextToSpeech();
  const {
    currentStep,
    getCurrentStep,
    goToNextStep,
    goToPreviousStep,
    isLastStep,
  } = useOnboardingStep();

  const [userData, setUserData] = React.useState<UserData>({
    name: '',
    phone: '',
  });

  // Handle step completion
  const handleNameComplete = (name: string) => {
    setUserData(prev => ({ ...prev, name }));
    goToNextStep();
  };

  const handlePhoneComplete = (phone: string) => {
    setUserData(prev => ({ ...prev, phone }));
    goToNextStep();
  };

  const handleConfirmationComplete = async () => {
    try {
      // Update user XP
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

      // Authenticate user
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
      console.error('Error during confirmation:', error);
      showToast({
        title: 'Erro',
        description: 'Ocorreu um erro ao processar sua confirmação.',
        type: 'error',
      });
    }
  };

  const handleSuccessComplete = () => {
    if (onComplete) {
      onComplete(userData);
    } else {
      router.push('/dashboard');
    }
  };

  // Handle voice prompts
  React.useEffect(() => {
    const step = getCurrentStep();
    if (step?.voicePrompt) {
      let prompt = step.voicePrompt;
      if (step.id === 'confirmation') {
        prompt = prompt
          .replace('{name}', userData.name)
          .replace('{phone}', userData.phone);
      }
      speak(prompt);
    }

    return () => cancel();
  }, [currentStep, userData.name, userData.phone]);

  // Render current step
  const step = getCurrentStep();
  if (!step) return null;

  const renderStep = () => {
    switch (step.id) {
      case 'welcome':
        return (
          <WelcomeStep
            step={step}
            onComplete={handleNameComplete}
          />
        );
      case 'phone':
        return (
          <PhoneInputStep
            step={step}
            onComplete={handlePhoneComplete}
            onBack={goToPreviousStep}
          />
        );
      case 'confirmation':
        return (
          <ConfirmationStep
            step={step}
            userData={userData}
            onComplete={handleConfirmationComplete}
            onBack={goToPreviousStep}
          />
        );
      case 'success':
        return (
          <SuccessStep
            step={step}
            userData={userData}
            onComplete={handleSuccessComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      role="main"
      aria-live="polite"
      className={`min-h-[70vh] flex flex-col items-center justify-center px-4 ${className}`}
    >
      <div className="w-full max-w-3xl bg-base-100 shadow-xl rounded-xl p-8 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <motion.div 
            className="absolute w-64 h-64 rounded-full bg-primary"
            style={{ top: '-10%', left: '-10%' }}
            animate={{ 
              x: [0, 20, 0], 
              y: [0, 10, 0],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 15,
              ease: 'easeInOut' 
            }}
          />
          <motion.div 
            className="absolute w-64 h-64 rounded-full bg-secondary"
            style={{ bottom: '-10%', right: '-10%' }}
            animate={{ 
              x: [0, -20, 0], 
              y: [0, -10, 0],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 20,
              ease: 'easeInOut' 
            }}
          />
        </div>
        
        {/* Step content */}
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
} 