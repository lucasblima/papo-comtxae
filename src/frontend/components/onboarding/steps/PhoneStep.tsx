import React, { useState } from 'react';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { StepProps } from './StepProps';

/**
 * Phone Step Component
 * 
 * Collects and validates the user's phone number during the onboarding process.
 */
export function PhoneStep({ onNext, onBack }: StepProps): React.ReactElement {
  const { userData, updateUserData } = useOnboarding();
  const [phone, setPhone] = useState(userData.phone || '');
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    
    // Basic validation - check if it has at least 10 digits
    // This would be replaced with proper phone validation in production
    const digitsOnly = value.replace(/\D/g, '');
    setIsValid(digitsOnly.length >= 10);
    
    if (error && digitsOnly.length >= 10) {
      setError('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      setError('Por favor, insira um número de telefone válido');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Store the phone number in user data
      updateUserData({ phone });
      
      // For MVP, we'll just proceed to the next step
      // In production, this would include verification via SMS
      onNext();
    } catch (err) {
      console.error('Error saving phone:', err);
      setError('Ocorreu um erro ao salvar seu número. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Seu número de telefone</h2>
      
      <p className="mb-6">
        Precisamos do seu número para enviar notificações importantes
        e garantir a segurança da sua conta.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Número de telefone</span>
          </label>
          <input 
            type="tel" 
            placeholder="(00) 00000-0000" 
            className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
            value={phone}
            onChange={handlePhoneChange}
            pattern="[0-9()-\s]+"
            required
          />
          {error && (
            <label className="label">
              <span className="label-text-alt text-error">{error}</span>
            </label>
          )}
        </div>
        
        <div className="flex justify-between mt-6">
          <button 
            type="button"
            className="btn btn-outline"
            onClick={onBack}
          >
            Voltar
          </button>
          
          <button 
            type="submit"
            className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
            disabled={!isValid || isSubmitting}
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
} 