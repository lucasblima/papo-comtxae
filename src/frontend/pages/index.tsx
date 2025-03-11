import React from 'react';
import { useState } from 'react';
import Head from 'next/head';
import VoiceInput from '../src/components/VoiceInput';
import axios from 'axios';
import { ThemeToggle } from '../components/ui';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { VoiceVisualization } from '../components/VoiceInput/VoiceVisualization';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  const [voiceText, setVoiceText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("voice"); // New state for tabs

  // Processar resultado do reconhecimento de voz
  const handleVoiceResult = async (text: string) => {
    setVoiceText(text);
    
    if (text.trim().length > 5) {
      try {
        setLoading(true);
        const result = await axios.post(`${API_URL}/voice-command/`, { text });
        setResponse(result.data);
        
        // Processar ações baseadas na resposta
        if (result.data.action === 'list_residents') {
          fetchResidents();
        }
      } catch (error) {
        console.error('Erro ao processar comando de voz:', error);
        setResponse({ error: 'Falha ao processar comando' });
      } finally {
        setLoading(false);
      }
    }
  };

  // Buscar lista de moradores
  const fetchResidents = async () => {
    try {
      const result = await axios.get(`${API_URL}/residents/`);
      setResidents(result.data);
    } catch (error) {
      console.error('Erro ao buscar moradores:', error);
    }
  };

  return (
    <div className="min-h-screen bg-base-200" data-theme="dim">
      <Head>
        <title>Papo Social - Conectando comunidades através da voz</title>
        <meta name="description" content="Papo Social: uma plataforma para conectar comunidades através de interações por voz e contribuições coletivas." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navbar with DaisyUI components */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="navbar-start">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><a>Início</a></li>
              <li><a>Moradores</a></li>
              <li><a>Solicitações</a></li>
            </ul>
          </div>
          <a className="btn btn-ghost text-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" />
            </svg>
            Papo Social
          </a>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li><a className="btn btn-ghost btn-sm">Início</a></li>
            <li><a className="btn btn-ghost btn-sm">Moradores</a></li>
            <li><a className="btn btn-ghost btn-sm">Solicitações</a></li>
          </ul>
        </div>
        <div className="navbar-end">
          <div className="dropdown dropdown-end mr-2">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-10">
                <span>U</span>
              </div>
            </div>
            <ul tabIndex={0} className="menu dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><a>Perfil</a></li>
              <li><a>Configurações</a></li>
              <li><a>Sair</a></li>
            </ul>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-base-200 to-base-100">
          <div className="max-w-3xl w-full text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Papo Social
              </h1>
              <p className="text-xl md:text-2xl mb-8">
                Conectando comunidades através da voz
              </p>
            </motion.div>
            
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <VoiceVisualization isListening={true} amplitude={0.5} size="lg" color="#6366F1" />
            </motion.div>
            
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="max-w-2xl mx-auto">
                <p className="text-lg mb-8">
                  Uma plataforma inovadora que usa interação por voz para facilitar a comunicação e colaboração em comunidades, desde associações de moradores até projetos sociais.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/onboarding" className="btn btn-primary btn-lg">
                    Começar agora
                  </Link>
                  <Link href="/about" className="btn btn-outline btn-lg">
                    Saiba mais
                  </Link>
                </div>
              </div>
              
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  className="card bg-base-200 shadow-lg"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="card-body">
                    <h3 className="card-title text-primary">Interação por Voz</h3>
                    <p>Comunicação natural e acessível através de comandos de voz em português brasileiro.</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="card bg-base-200 shadow-lg"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="card-body">
                    <h3 className="card-title text-secondary">Engajamento Comunitário</h3>
                    <p>Conecte-se com sua comunidade, participe de discussões e contribua para melhorias coletivas.</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="card bg-base-200 shadow-lg"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="card-body">
                    <h3 className="card-title text-accent">Experiência Gamificada</h3>
                    <p>Conquiste níveis, desbloqueie conquistas e receba reconhecimento por suas contribuições.</p>
                  </div>
                </motion.div>
              </div>
              
              <div className="mt-12 text-center">
                <p className="text-base-content/70">
                  Parceiros: Cruz Vermelha RJ, Miss Brasil 2024, Comunidades Indígenas da Amazônia
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-100 text-base-content rounded">
        <div>
          <p className="font-bold">
            Papo Social <br/>Gestão de Associação de Moradores
          </p> 
          <p>Copyright © 2024 - Todos os direitos reservados</p>
        </div> 
        <div className="grid grid-flow-col gap-4">
          <a className="link link-hover">Sobre</a> 
          <a className="link link-hover">Contato</a> 
          <a className="link link-hover">Ajuda</a>
        </div>
        <div>
          <div className="grid grid-flow-col gap-4">
            <a className="btn btn-ghost btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
              </svg>
            </a> 
            <a className="btn btn-ghost btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
              </svg>
            </a> 
            <a className="btn btn-ghost btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
