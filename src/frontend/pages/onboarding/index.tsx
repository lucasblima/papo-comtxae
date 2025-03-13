import React from 'react';
import Head from 'next/head';
import { SignupFlow } from '../../components/onboarding';

/**
 * Onboarding page for new users
 * 
 * This page guides users through the registration process using voice identification
 */
export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 py-8">
      <Head>
        <title>Cadastro - Papo Social</title>
        <meta name="description" content="Crie sua conta no Papo Social" />
      </Head>
      
      <SignupFlow />
    </div>
  );
} 