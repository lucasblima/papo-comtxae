import React, { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ThemeToggle } from '../components/ui';

export default function AboutPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100" data-theme="dim">
      <Head>
        <title>Sobre o Papo Social</title>
        <meta name="description" content="Conheça mais sobre a plataforma Papo Social e sua missão" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Simple header with theme toggle */}
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" />
            </svg>
            <span className="text-xl font-bold">Papo Social</span>
          </Link>
        </div>
        <ThemeToggle />
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              Sobre o Papo Social
            </h1>
            
            <div className="mb-10">
              <p className="text-lg mb-6">
                O Papo Social é uma plataforma inovadora que utiliza tecnologia de voz para conectar comunidades e facilitar a organização social. Estamos comprometidos em tornar a participação comunitária mais acessível e engajadora.
              </p>
              <p className="text-lg">
                Nossa missão é democratizar o acesso à tecnologia para que todas as vozes possam ser ouvidas, independentemente de limitações físicas ou digitais.
              </p>
            </div>
            
            {/* Accordion sections */}
            <div className="space-y-4 mb-12">
              <motion.div 
                className="collapse collapse-arrow bg-base-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <input 
                  type="checkbox" 
                  checked={expandedSection === 'features'}
                  onChange={() => toggleSection('features')}
                  className="peer"
                />
                <div className="collapse-title text-xl font-medium">
                  Principais Recursos
                </div>
                <div className="collapse-content">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Interação completa por voz para maior acessibilidade</li>
                    <li>Sistema de conquistas que torna a participação mais engajadora</li>
                    <li>Interface simples e intuitiva para todos os níveis de habilidade digital</li>
                    <li>Suporte para português brasileiro e reconhecimento de sotaques regionais</li>
                  </ul>
                </div>
              </motion.div>
              
              <motion.div 
                className="collapse collapse-arrow bg-base-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <input 
                  type="checkbox"
                  checked={expandedSection === 'usage'}
                  onChange={() => toggleSection('usage')}
                  className="peer"
                />
                <div className="collapse-title text-xl font-medium">
                  Como Funciona
                </div>
                <div className="collapse-content">
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Cadastre-se usando apenas sua voz - sem formulários complexos</li>
                    <li>Responda perguntas e ganhe distintivos por sua participação</li>
                    <li>Compartilhe sua experiência e ajude a construir uma comunidade mais forte</li>
                    <li>Acesse informações importantes de forma simples e direta</li>
                  </ol>
                </div>
              </motion.div>
              
              <motion.div 
                className="collapse collapse-arrow bg-base-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <input 
                  type="checkbox"
                  checked={expandedSection === 'mission'}
                  onChange={() => toggleSection('mission')}
                  className="peer"
                />
                <div className="collapse-title text-xl font-medium">
                  Nossa Visão
                </div>
                <div className="collapse-content">
                  <p>
                    Acreditamos que a tecnologia deve ser uma ferramenta de inclusão, não de exclusão. O Papo Social nasceu da percepção de que muitas pessoas ainda enfrentam barreiras para participar digitalmente de suas comunidades.
                  </p>
                  <p className="mt-2">
                    Estamos construindo um futuro onde a voz de cada pessoa pode ser amplificada, independentemente de sua familiaridade com tecnologia.
                  </p>
                </div>
              </motion.div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link href="/quiz" className="btn btn-primary">
                Começar Experiência Gamificada
              </Link>
              <Link href="/" className="btn btn-outline">
                Voltar ao Início
              </Link>
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