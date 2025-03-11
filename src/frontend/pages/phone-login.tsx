import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

enum LoginStep {
  ENTER_PHONE = 'enter_phone',
  ENTER_CODE = 'enter_code',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error'
}

export default function PhoneLoginPage() {
  const [currentStep, setCurrentStep] = useState<LoginStep>(LoginStep.ENTER_PHONE);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { data: session } = useSession();
  
  // If already logged in, redirect to home
  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);
  
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number (basic validation)
    if (!phoneNumber.match(/^\+?[0-9]{10,15}$/)) {
      setErrorMessage('Por favor, insira um número de telefone válido');
      return;
    }
    
    setCurrentStep(LoginStep.PROCESSING);
    
    try {
      // In a real implementation, you would send this to your API to trigger an SMS
      // For this demo, we'll just move to the code verification step
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCurrentStep(LoginStep.ENTER_CODE);
      setErrorMessage('');
    } catch (error) {
      console.error('Error sending verification code:', error);
      setErrorMessage('Erro ao enviar código de verificação. Por favor, tente novamente.');
      setCurrentStep(LoginStep.ENTER_PHONE);
    }
  };
  
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate verification code
    if (!verificationCode.match(/^[0-9]{6}$/)) {
      setErrorMessage('O código de verificação deve ter 6 dígitos');
      return;
    }
    
    setCurrentStep(LoginStep.PROCESSING);
    
    try {
      // Sign in with phone credentials
      const result = await signIn('phone', {
        phone: phoneNumber,
        code: verificationCode,
        redirect: false,
      });
      
      if (result?.error) {
        setErrorMessage('Código inválido. Por favor, tente novamente.');
        setCurrentStep(LoginStep.ENTER_CODE);
        return;
      }
      
      // Success
      setCurrentStep(LoginStep.SUCCESS);
      
      // Redirect to home after a delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Error during authentication:', error);
      setErrorMessage('Erro durante a autenticação. Por favor, tente novamente.');
      setCurrentStep(LoginStep.ENTER_CODE);
    }
  };
  
  const retry = () => {
    setCurrentStep(LoginStep.ENTER_PHONE);
    setErrorMessage('');
  };
  
  return (
    <>
      <Head>
        <title>Login com Telefone | Papo Social</title>
        <meta name="description" content="Entre no Papo Social usando seu número de telefone" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <main className="min-h-screen bg-gradient-to-b from-base-200 to-base-100 flex flex-col items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full bg-base-100 shadow-lg rounded-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {currentStep === LoginStep.ENTER_PHONE && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold">Entrar com Telefone</h1>
                <p className="text-base-content/70 mt-2">
                  Você receberá um código de verificação por SMS
                </p>
              </div>
              
              <form onSubmit={handlePhoneSubmit}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Número de telefone</span>
                  </label>
                  <input
                    type="tel"
                    className="input input-bordered w-full"
                    placeholder="+55 11 98765-4321"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                  <label className="label">
                    <span className="label-text-alt text-error">{errorMessage}</span>
                  </label>
                </div>
                
                <button type="submit" className="btn btn-primary w-full mt-4">
                  Receber código por SMS
                </button>
              </form>
              
              <div className="text-center mt-6">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => router.push('/onboarding')}
                >
                  Voltar para cadastro por voz
                </button>
              </div>
            </>
          )}
          
          {currentStep === LoginStep.ENTER_CODE && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold">Verifique seu celular</h1>
                <p className="text-base-content/70 mt-2">
                  Enviamos um código para o número {phoneNumber}
                </p>
              </div>
              
              <form onSubmit={handleCodeSubmit}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Código de verificação</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full text-center text-2xl tracking-widest"
                    placeholder="123456"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                  />
                  <label className="label">
                    <span className="label-text-alt text-error">{errorMessage}</span>
                  </label>
                </div>
                
                <button type="submit" className="btn btn-primary w-full mt-4">
                  Verificar
                </button>
              </form>
              
              <div className="text-center mt-6">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={retry}
                >
                  Usar outro número
                </button>
              </div>
            </>
          )}
          
          {currentStep === LoginStep.PROCESSING && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6">Processando...</h2>
              <div className="flex justify-center mb-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            </div>
          )}
          
          {currentStep === LoginStep.SUCCESS && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6">Login realizado!</h2>
              <div className="text-center text-green-600 text-6xl mb-8">
                <span>✅</span>
              </div>
              <p>Redirecionando para a página inicial...</p>
            </div>
          )}
          
          {currentStep === LoginStep.ERROR && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6">Erro ao fazer login</h2>
              <div className="text-center text-red-600 text-6xl mb-8">
                <span>❌</span>
              </div>
              <p className="mb-6">{errorMessage}</p>
              <button className="btn btn-primary" onClick={retry}>
                Tentar novamente
              </button>
            </div>
          )}
        </motion.div>
      </main>
    </>
  );
} 