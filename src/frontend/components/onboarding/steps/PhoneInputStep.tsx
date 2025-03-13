import React, { useState } from 'react';
import { Step } from '../../../hooks/onboarding/useOnboardingStep';
import PhoneInput from 'react-phone-number-input/input';
import { isPossiblePhoneNumber } from 'react-phone-number-input';
import { FaArrowLeft } from 'react-icons/fa';
import { BaseStepProps } from './StepProps';

/**
 * Props específicas para o componente PhoneInputStep
 */
export interface PhoneInputStepProps extends BaseStepProps {
  /** Callback chamado quando o telefone é coletado com sucesso */
  onComplete: (phone: string) => void;
  /** Callback para voltar à etapa anterior */
  onBack: () => void;
}

/**
 * Componente para a etapa de coleta de telefone
 * 
 * Permite ao usuário inserir seu número de telefone para autenticação.
 */
export function PhoneInputStep({ 
  step, 
  onComplete, 
  onBack,
  context = 'landing',
  themeVariant = 'default' 
}: PhoneInputStepProps) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar número de telefone
    if (!phone) {
      setError('Por favor, informe seu telefone.');
      return;
    }
    
    if (!isPossiblePhoneNumber(phone)) {
      setError('Número de telefone inválido. Por favor, verifique.');
      return;
    }
    
    // Limpar erro se tudo estiver ok
    setError('');
    onComplete(phone);
  };
  
  // Ajusta estilos com base no contexto e tema
  const getContainerClasses = () => {
    let classes = "flex flex-col items-center w-full";
    
    if (context === 'dedicated-page') {
      classes += ' min-h-[200px]';
    }
    
    if (themeVariant === 'expanded') {
      classes += ' max-w-2xl mx-auto';
    } else if (themeVariant === 'minimal') {
      classes += ' p-2';
    } else {
      classes += ' p-4';
    }
    
    return classes;
  };
  
  // Ajusta estilos do formulário
  const getFormClasses = () => {
    let classes = "w-full mt-6";
    
    if (themeVariant === 'expanded') {
      classes += ' max-w-lg mx-auto';
    }
    
    return classes;
  };
  
  return (
    <div className={getContainerClasses()}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">{step.title}</h2>
        <p className="text-gray-600 mt-2">{step.instruction}</p>
      </div>
      
      <form onSubmit={handleSubmit} className={getFormClasses()}>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Número de telefone</span>
          </label>
          
          <div className="flex">
            <PhoneInput
              country="BR"
              value={phone}
              onChange={setPhone as any}
              placeholder="(11) 98765-4321"
              className="input input-bordered w-full"
            />
          </div>
          
          {error && (
            <label className="label">
              <span className="label-text-alt text-error">{error}</span>
            </label>
          )}
        </div>
        
        <div className="flex justify-between mt-6">
          <button 
            type="button" 
            onClick={onBack}
            className="btn btn-outline gap-2"
          >
            <FaArrowLeft /> Voltar
          </button>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!phone}
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
} 