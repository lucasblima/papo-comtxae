import React from 'react';
import { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { VoiceVisualization } from '../components/speech/VoiceVisualization';
import { VoiceOnboarding } from '../components/speech/VoiceOnboarding';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FaMicrophone, FaInfoCircle, FaUser, FaTachometerAlt, FaSignOutAlt } from 'react-icons/fa';

export default function Home() {
  const { data: session } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100">
      <Head>
        <title>Papo Social - Uma experiência por voz</title>
        <meta name="description" content="Papo Social: uma plataforma para conectar comunidades através de interações por voz e contribuições coletivas." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header com navegação e tema */}
      <div className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><Link href="/about" className="flex items-center gap-2"><FaInfoCircle /> Sobre o Projeto</Link></li>
            </ul>
          </div>
          <Link href="/" className="btn btn-ghost text-xl gap-2">
            <img 
              src="/Papo_Social_Pos.png" 
              alt="Papo Social Logo" 
              className="h-8 w-auto" 
            />
            <span className="hidden sm:inline">Papo Social</span>
          </Link>
        </div>
        
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li><Link href="/about" className="flex items-center gap-2"><FaInfoCircle /> Sobre</Link></li>
          </ul>
        </div>
        
        <div className="navbar-end gap-2">
          {session ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-10">
                  <span>{session.user?.name?.charAt(0) || '?'}</span>
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <Link href="/profile" className="flex items-center gap-2">
                    <FaUser /> Perfil
                    <span className="badge badge-sm">Novo</span>
                  </Link>
                </li>
                <li><Link href="/dashboard" className="flex items-center gap-2"><FaTachometerAlt /> Dashboard</Link></li>
                <li>
                  <button onClick={() => signOut()} className="flex items-center gap-2 text-error">
                    <FaSignOutAlt /> Sair
                  </button>
                </li>
              </ul>
            </div>
          ) : null}
          <ThemeToggle />
        </div>
      </div>

      <main className="container mx-auto px-4 flex flex-col items-center justify-center py-12">
        <div className="max-w-xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="card bg-base-100 shadow-xl"
          >
            <div className="card-body">
              <h1 className="card-title text-4xl md:text-5xl font-bold mb-4 text-center justify-center">
                Papo Social
              </h1>
              <p className="text-xl md:text-2xl mb-8">
                Uma experiência por voz
              </p>
          
              {!showOnboarding && !session && (
                <motion.div 
                  className="mb-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <VoiceVisualization volume={30} className="h-24" />
                </motion.div>
              )}
          
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <div className="max-w-md mx-auto">
                  {session ? (
                    <div>
                      <div className="alert alert-success mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>Olá, {session.user?.name}! Bem-vindo(a) de volta.</span>
                      </div>
                      
                      <div className="card-actions justify-center gap-4">
                        <Link href="/dashboard" className="btn btn-primary">
                          <FaTachometerAlt className="mr-2" /> Meu Dashboard
                        </Link>
                        <Link href="/about" className="btn btn-outline">
                          <FaInfoCircle className="mr-2" /> Sobre
                        </Link>
                      </div>
                    </div>
                  ) : showOnboarding ? (
                    <VoiceOnboarding 
                      onComplete={(userData) => {
                        setShowOnboarding(false);
                        router.push('/dashboard');
                      }}
                      className="mt-8"
                    />
                  ) : (
                    <div>
                      <div className="chat chat-start mb-8">
                        <div className="chat-image avatar">
                          <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                            <FaMicrophone />
                          </div>
                        </div>
                        <div className="chat-bubble">
                          Converse comigo, diga seu nome e ganhe seu primeiro distintivo no Papo Social.
                        </div>
                      </div>
                      
                      <div className="card-actions justify-center">
                        <button 
                          onClick={() => setShowOnboarding(true)} 
                          className="btn btn-primary btn-lg gap-2"
                        >
                          <FaMicrophone /> Começar agora
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer footer-center p-6 bg-base-200 text-base-content">
        <div>
          <div className="grid grid-flow-col gap-4">
            <a href="#" className="link link-hover">Sobre nós</a>
            <a href="#" className="link link-hover">Contato</a>
            <a href="#" className="link link-hover">Termos de uso</a>
            <a href="#" className="link link-hover">Privacidade</a>
          </div>
          <p className="mt-4">© 2024 Papo Social - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
