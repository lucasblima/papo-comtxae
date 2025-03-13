import React from 'react';
import Head from 'next/head';
import { ConversationalSignupFlow } from '../../components/onboarding';

/**
 * Onboarding page for new users
 * 
 * This page guides users through the registration process using a conversational interface
 */
export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-300 to-base-200 py-8">
      <Head>
        <title>Cadastro - Papo Social</title>
        <meta name="description" content="Crie sua conta no Papo Social usando sua voz" />
      </Head>
      
      <ConversationalSignupFlow />
    </div>
  );
} 