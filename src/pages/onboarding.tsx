import React from 'react';
import Head from 'next/head';
import { VoiceOnboarding } from '../frontend/components/onboarding/VoiceOnboarding';

export default function OnboardingPage() {
  return (
    <>
      <Head>
        <title>Onboarding - Papo Social</title>
        <meta name="description" content="Complete seu cadastro no Papo Social" />
      </Head>
      <VoiceOnboarding />
    </>
  );
} 