import React, { useState } from 'react';
import { OnboardingProvider } from '../../contexts/OnboardingContext';
import { WelcomeStep, VoiceInputStep, PhoneStep, ConfirmationStep, SuccessStep } from './steps';

/**
 * Step type for tracking current step
 */
type SignupStep = 'welcome' | 'voice-input' | 'phone' | 'confirmation' | 'success';

/**
 * SignupFlow Component
 * 
 * Manages the entire signup flow for new users, including 
 * welcome, voice input, phone input, confirmation, and success steps.
 * 
 * @example
 * <SignupFlow />
 */
export function SignupFlow(): React.ReactElement {
  const [currentStep, setCurrentStep] = useState<SignupStep>('welcome');
  
  // Navigate to next step
  const goToNextStep = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('voice-input');
        break;
      case 'voice-input':
        setCurrentStep('phone');
        break;
      case 'phone':
        setCurrentStep('confirmation');
        break;
      case 'confirmation':
        setCurrentStep('success');
        break;
      default:
        // Do nothing on success step
        break;
    }
  };
  
  // Navigate to previous step
  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'voice-input':
        setCurrentStep('welcome');
        break;
      case 'phone':
        setCurrentStep('voice-input');
        break;
      case 'confirmation':
        setCurrentStep('phone');
        break;
      default:
        // Can't go back from welcome or success
        break;
    }
  };
  
  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep onNext={goToNextStep} onBack={() => {}} />;
      case 'voice-input':
        return <VoiceInputStep onNext={goToNextStep} onBack={goToPreviousStep} />;
      case 'phone':
        return <PhoneStep onNext={goToNextStep} onBack={goToPreviousStep} />;
      case 'confirmation':
        return <ConfirmationStep onNext={goToNextStep} onBack={goToPreviousStep} />;
      case 'success':
        return <SuccessStep onNext={() => {}} onBack={() => {}} />;
      default:
        return <WelcomeStep onNext={goToNextStep} onBack={() => {}} />;
    }
  };
  
  // Calculate progress percentage
  const getProgressPercentage = () => {
    const steps = ['welcome', 'voice-input', 'phone', 'confirmation', 'success'];
    const currentIndex = steps.indexOf(currentStep);
    return (currentIndex / (steps.length - 1)) * 100;
  };
  
  return (
    <OnboardingProvider>
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-3xl font-bold text-center mb-2">
            <span className="text-primary">Papo</span> Social
          </h1>
          
          {/* Progress bar */}
          <div className="w-full bg-base-200 rounded-full h-2 mb-6">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          
          {/* Steps content */}
          <div className="min-h-[350px] flex items-center justify-center">
            {renderStep()}
          </div>
        </div>
      </div>
    </OnboardingProvider>
  );
} 