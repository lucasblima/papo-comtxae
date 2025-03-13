import React, { useEffect } from 'react';
import { Step } from '../../../hooks/onboarding/useOnboardingStep';
import { UserData } from '../../../types/onboarding';
import { FaCheckCircle } from 'react-icons/fa';
import { BaseStepProps } from './StepProps';
import confetti from 'canvas-confetti';

/**
 * Props específicas para o componente SuccessStep
 */
export interface SuccessStepProps extends BaseStepProps {
  /** Dados do usuário coletados nas etapas anteriores */
  userData: UserData;
  /** Callback chamado quando a etapa de sucesso é concluída */
  onComplete: () => void;
}

/**
 * Componente para a etapa de sucesso
 * 
 * Exibe uma mensagem de sucesso e opcionalmente dispara efeitos visuais.
 */
export function SuccessStep({ 
  step, 
  userData, 
  onComplete,
  context = 'landing',
  themeVariant = 'default'
}: SuccessStepProps) {
  // Efeito para disparar confetti quando o componente é montado
  useEffect(() => {
    // Dispara confetti apenas se não estiver na variante minimal
    if (themeVariant !== 'minimal') {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#4CAF50', '#2196F3', '#FF9800']
        });
        
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#4CAF50', '#2196F3', '#FF9800']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }

    // Redirecionar após 5 segundos
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Ajusta estilos com base no contexto e tema
  const getContainerClasses = () => {
    let classes = "flex flex-col items-center justify-center w-full text-center";
    
    if (context === 'dedicated-page') {
      classes += ' min-h-[250px]';
    }
    
    if (themeVariant === 'expanded') {
      classes += ' max-w-2xl mx-auto py-8';
    } else if (themeVariant === 'minimal') {
      classes += ' p-2';
    } else {
      classes += ' p-4';
    }
    
    return classes;
  };

  return (
    <div className={getContainerClasses()}>
      <FaCheckCircle className="text-success text-6xl mb-6" />
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{step.title}</h2>
      <p className="text-gray-600 mb-6">{step.instruction}</p>
      
      <div className="bg-base-200 rounded-lg p-6 w-full max-w-md">
        <p className="text-lg font-medium mb-2">
          Bem-vindo(a), {userData.name}!
        </p>
        <p className="text-gray-600">
          Sua conta foi criada com sucesso. Você será redirecionado em alguns segundos...
        </p>
      </div>
    </div>
  );
} 