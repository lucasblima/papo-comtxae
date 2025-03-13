import React from 'react';
import { FaMicrophone } from 'react-icons/fa';
import Link from 'next/link';
import { StepProps } from './StepProps';

/**
 * Welcome Step Component
 * 
 * The first step in the onboarding process that introduces users to Papo Social.
 */
export function WelcomeStep({ onNext }: StepProps): React.ReactElement {
  return (
    <div className="w-full text-center">
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-primary/20 p-4">
          <FaMicrophone className="text-primary w-10 h-10" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Bem-vindo ao Papo Social!</h2>
      
      <p className="mb-6">
        O Papo Social é uma plataforma de comunicação que usa sua voz como identidade.
        Sem senhas complicadas, apenas você sendo você.
      </p>
      
      <p className="mb-8">
        Vamos começar criando seu perfil? Leva menos de um minuto.
      </p>
      
      <div className="flex flex-col gap-4">
        <button 
          className="btn btn-primary btn-lg"
          onClick={onNext}
        >
          Começar
        </button>
        
        <p className="text-sm">
          Já tem uma conta?{' '}
          <Link href="/login" className="link link-primary">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
} 