import { useState, useEffect } from 'react';
import Head from 'next/head';
import VoiceInput from '../components/VoiceInput';
import axios from 'axios';

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
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Papo Social - Associação de Moradores</title>
        <meta name="description" content="Sistema para gestão de associação de moradores" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Papo Social - Associação de Moradores
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Assistente por Voz</h2>
          <p className="text-gray-600 mb-4">
            Fale comandos como "listar moradores", "nova solicitação" ou "agendar reunião".
          </p>
          
          <VoiceInput 
            onResult={handleVoiceResult}
            onProcessing={setIsProcessing}
          />
          
          {voiceText && (
            <div className="mt-4 p-3 bg-gray-50 rounded border">
              <strong>Você disse:</strong> {voiceText}
            </div>
          )}
          
          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Processando...</p>
            </div>
          )}
          
          {residents.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Moradores:</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Nome</th>
                      <th className="py-2 px-4 border-b">Unidade</th>
                      <th className="py-2 px-4 border-b">Contato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {residents.map((resident: any) => (
                      <tr key={resident._id}>
                        <td className="py-2 px-4 border-b">{resident.name}</td>
                        <td className="py-2 px-4 border-b">{resident.unit_number}</td>
                        <td className="py-2 px-4 border-b">{resident.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
