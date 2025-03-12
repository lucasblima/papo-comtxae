import React from 'react';
import { useRouter } from 'next/router';
import { useOnboardingStep, Step } from '../../hooks/onboarding/useOnboardingStep';
import { WelcomeStep } from './steps/WelcomeStep';
import { PhoneInputStep } from './steps/PhoneInputStep';
import { ConfirmationStep } from './steps/ConfirmationStep';
import { SuccessStep } from './steps/SuccessStep';

interface UserData {
  name: string;
  phone: string;
}

export function VoiceOnboarding() {
  const router = useRouter();
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

  const handleNameComplete = (name: string) => {
    setUserData((prev) => ({ ...prev, name }));
    goToNextStep();
  };

  const handlePhoneComplete = (phone: string) => {
    setUserData((prev) => ({ ...prev, phone }));
    goToNextStep();
  };

  const handleConfirmationComplete = () => {
    goToNextStep();
  };

  const handleSuccessComplete = () => {
    router.push('/dashboard');
  };

  const step = getCurrentStep();
  
  if (!step) {
    return null;
  }

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg">
        {renderStep()}
      </div>
    </div>
  );
} 