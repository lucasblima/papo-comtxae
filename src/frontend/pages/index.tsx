import { useState } from 'react';
import Head from 'next/head';
import VoiceInput from '../src/components/VoiceInput';
import axios from 'axios';
import { ThemeToggle } from '../components/ui/theme-toggle';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  const [voiceText, setVoiceText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-base-200">
      <Head>
        <title>Papo Social</title>
        <meta name="description" content="Sistema para gestão de associação de moradores" />
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
          <a className="btn btn-ghost text-xl">Papo Social</a>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li><a>Início</a></li>
            <li><a>Moradores</a></li>
            <li><a>Solicitações</a></li>
          </ul>
        </div>
        <div className="navbar-end">
          <ThemeToggle />
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="hero bg-base-100 rounded-lg shadow-xl mb-8 p-6">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold">Bem-vindo ao Papo Social</h1>
              <p className="py-6">Seu assistente virtual para gestão da associação de moradores. Use comandos de voz para interagir com o sistema.</p>
            </div>
          </div>
        </div>

        {/* Voice Assistant Card */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Assistente por Voz
            </h2>
            
            <div className="divider"></div>
            
            <div className="bg-base-200 p-4 rounded-lg">
              <p className="text-base-content">
                Experimente usar comandos como:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="badge badge-primary">"listar moradores"</span>
                <span className="badge badge-secondary">"nova solicitação"</span>
                <span className="badge badge-accent">"agendar reunião"</span>
              </div>
            </div>
            
            <VoiceInput 
              onResult={handleVoiceResult}
              onProcessing={setIsProcessing}
            />
            
            {voiceText && (
              <div className="alert alert-info shadow-lg mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h3 className="font-bold">Comando Recebido</h3>
                  <div className="text-xs">{voiceText}</div>
                </div>
              </div>
            )}
            
            {loading && (
              <div className="flex flex-col items-center justify-center mt-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="mt-2">Processando sua solicitação...</p>
              </div>
            )}
          </div>
        </div>

        {/* Residents Table Card */}
        {residents.length > 0 && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-2xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Lista de Moradores
              </h3>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Unidade</th>
                      <th>Contato</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {residents.map((resident: any) => (
                      <tr key={resident._id}>
                        <td>{resident.name}</td>
                        <td>
                          <div className="badge badge-ghost">{resident.unit_number}</div>
                        </td>
                        <td>{resident.phone}</td>
                        <td>
                          <div className="flex gap-2">
                            <button className="btn btn-xs btn-info">Ver</button>
                            <button className="btn btn-xs btn-warning">Editar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-100 text-base-content rounded">
        <div>
          <p className="font-bold">
            Papo Social <br/>Gestão de Associação de Moradores
          </p> 
          <p>Copyright © 2024 - Todos os direitos reservados</p>
        </div> 
        <div>
          <div className="grid grid-flow-col gap-4">
            <a className="link link-hover">Sobre</a> 
            <a className="link link-hover">Contato</a> 
            <a className="link link-hover">Ajuda</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
