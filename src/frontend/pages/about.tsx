import React, { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ThemeToggle } from '../components/ui';
import { FaHome, FaInfoCircle, FaLightbulb, FaCogs, FaEye } from 'react-icons/fa';

export default function AboutPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100">
      <Head>
        <title>Sobre o Papo Social</title>
        <meta name="description" content="Conheça mais sobre a plataforma Papo Social e sua missão" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navbar with theme toggle */}
      <div className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
          <Link href="/" className="btn btn-ghost normal-case text-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" />
            </svg>
            <span className="hidden sm:inline font-bold">Papo Social</span>
          </Link>
        </div>
        <div className="navbar-center">
          <ul className="menu menu-horizontal px-1 hidden md:flex">
            <li><Link href="/">Início</Link></li>
            <li><Link href="/about" className="active">Sobre</Link></li>
            <li><Link href="/quiz">Quiz</Link></li>
          </ul>
        </div>
        <div className="navbar-end">
          <ThemeToggle />
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="card bg-base-100 shadow-xl mb-8">
              <div className="card-body">
                <h1 className="card-title text-3xl md:text-4xl font-bold text-center mx-auto mb-4">
                  <FaInfoCircle className="text-primary mr-2" /> Sobre o Papo Social
                </h1>
                
                <div className="divider"></div>
                
                <div className="mb-6">
                  <p className="text-lg mb-4">
                    O Papo Social é uma plataforma inovadora que utiliza tecnologia de voz para conectar comunidades e facilitar a organização social. Estamos comprometidos em tornar a participação comunitária mais acessível e engajadora.
                  </p>
                  <p className="text-lg">
                    Nossa missão é democratizar o acesso à tecnologia para que todas as vozes possam ser ouvidas, independentemente de limitações físicas ou digitais.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Accordion sections */}
            <div className="space-y-4 mb-8">
              <motion.div 
                className="collapse collapse-arrow bg-base-100 shadow-md"
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
                <div className="collapse-title text-xl font-medium flex items-center">
                  <FaLightbulb className="text-primary mr-2" /> Principais Recursos
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
                className="collapse collapse-arrow bg-base-100 shadow-md"
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
                <div className="collapse-title text-xl font-medium flex items-center">
                  <FaCogs className="text-primary mr-2" /> Como Funciona
                </div>
                <div className="collapse-content">
                  <ol className="steps steps-vertical">
                    <li className="step step-primary">Cadastre-se usando apenas sua voz - sem formulários complexos</li>
                    <li className="step step-primary">Responda perguntas e ganhe distintivos por sua participação</li>
                    <li className="step step-primary">Compartilhe sua experiência e ajude a construir uma comunidade mais forte</li>
                    <li className="step step-primary">Acesse informações importantes de forma simples e direta</li>
                  </ol>
                </div>
              </motion.div>
              
              <motion.div 
                className="collapse collapse-arrow bg-base-100 shadow-md"
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
                <div className="collapse-title text-xl font-medium flex items-center">
                  <FaEye className="text-primary mr-2" /> Nossa Visão
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
            
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">Pronto para começar?</h2>
                <p>Experimente o Papo Social agora e descubra como a interação por voz pode transformar sua experiência comunitária.</p>
                <div className="card-actions justify-center mt-4">
                  <Link href="/quiz" className="btn btn-primary">
                    Começar Experiência Gamificada
                  </Link>
                  <Link href="/" className="btn btn-outline">
                    <FaHome className="mr-2" /> Voltar ao Início
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      {/* Improved Footer */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded">
        <div className="grid grid-flow-col gap-4">
          <Link href="/about" className="link link-hover">Sobre nós</Link>
          <Link href="/contact" className="link link-hover">Contato</Link>
          <Link href="/terms" className="link link-hover">Termos de uso</Link>
          <Link href="/privacy" className="link link-hover">Privacidade</Link>
        </div> 
        <div>
          <div className="grid grid-flow-col gap-4">
            <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg></a> 
            <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg></a> 
            <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg></a>
          </div>
        </div>
        <div>
          <p>© 2024 Papo Social - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
} 