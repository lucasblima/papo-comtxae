import React from 'react';
import { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { VoiceVisualization } from '../components/VoiceVisualization';
import { ThemeToggle } from '../components/ui';
import { useSession, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100" data-theme="dim">
      <Head>
        <title>Papo Social - Uma experiência por voz</title>
        <meta name="description" content="Papo Social: uma plataforma para conectar comunidades através de interações por voz e contribuições coletivas." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Simple header with theme toggle */}
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" />
          </svg>
          <span className="text-xl font-bold">Papo Social</span>
        </div>
        <div className="flex items-center gap-4">
          {session && (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                  <span className="text-lg font-bold">{session.user?.name?.charAt(0) || '?'}</span>
                </div>
              </label>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                <li>
                  <Link href="/profile" className="justify-between">
                    Perfil
                    <span className="badge">Novo</span>
                  </Link>
                </li>
                <li><Link href="/dashboard">Dashboard</Link></li>
                <li><button onClick={() => signOut()}>Sair</button></li>
              </ul>
            </div>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 flex flex-col items-center justify-center" style={{ minHeight: "calc(100vh - 140px)" }}>
        <div className="max-w-xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Papo Social
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Uma experiência por voz
            </p>
          </motion.div>
          
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <VoiceVisualization volume={30} className="h-24" />
          </motion.div>
          
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="max-w-md mx-auto">
              {session ? (
                <div>
                  <p className="text-lg mb-8">
                    Olá, {session.user?.name}! Bem-vindo(a) de volta ao Papo Social.
                  </p>
                  
                  <div className="flex justify-center gap-4">
                    <Link href="/dashboard" className="btn btn-primary">
                      Meu Dashboard
                    </Link>
                    <Link href="/about" className="btn btn-outline">
                      Sobre o Papo Social
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-lg mb-8">
                    Converse comigo, diga seu nome e ganhe seu primeiro distintivo no Papo Social.
                  </p>
                  
                  <div className="flex justify-center">
                    <Link href="/onboarding" className="btn btn-primary btn-lg">
                      Começar agora
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Simplified Footer */}
      <footer className="footer footer-center p-6 bg-base-100 text-base-content">
        <div>
          <p>© 2024 Papo Social - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
