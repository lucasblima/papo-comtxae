import React from 'react';
import { usePhoneValidation } from '../../../hooks/form/usePhoneValidation';
import { Step } from '../../../hooks/onboarding/useOnboardingStep';

interface PhoneInputStepProps {
  step: Step;
  onComplete: (phone: string) => void;
  onBack: () => void;
}

export function PhoneInputStep({ step, onComplete, onBack }: PhoneInputStepProps) {
  const {
    phoneNumber,
    errorMessage,
    handlePhoneChange,
    validatePhoneNumber,
  } = usePhoneValidation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePhoneNumber()) {
      onComplete(phoneNumber);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-800">{step.title}</h2>
      <p className="text-gray-600 text-center">{step.instruction}</p>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div className="flex flex-col space-y-2">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="(99) 99999-9999"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errorMessage
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:ring-blue-200'
            }`}
          />
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </div>

        <div className="flex justify-between space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Voltar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
} 