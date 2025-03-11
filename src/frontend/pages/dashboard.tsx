import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import { ThemeToggle } from '../components/ThemeToggle';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useToast } from '../components/ui/Toast';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  dateUnlocked: string;
  points: number;
}

interface UserData {
  _id: string;
  name: string;
  associations: string[];
  level: number;
  xp: number;
  achievements: Achievement[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Dashboard() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // In a real app, you would get the user ID from context/auth
        // For now, we'll just assume we have it or use a mock
        const userId = localStorage.getItem('userId') || 'mock-user-id';
        
        const response = await axios.get(`${API_URL}/users/${userId}`);
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        showToast({
          title: 'Erro',
          description: 'Não foi possível carregar seus dados. Tente novamente mais tarde.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [showToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Head>
        <title>Dashboard | Papo Social</title>
        <meta name="description" content="Seu painel no Papo Social" />
      </Head>

      <main className="min-h-screen bg-base-200">
        <header className="bg-base-100 shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Papo Social</h1>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button className="btn btn-ghost btn-circle avatar">
                <div className="rounded-full">
                  <span className="text-xl">👤</span>
                </div>
              </button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <section className="welcome-section mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="card bg-base-100 shadow-xl"
            >
              <div className="card-body">
                <h2 className="card-title text-2xl">Bem-vindo, {userData?.name || 'Usuário'}!</h2>
                <p>Seu progresso atual:</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="badge badge-primary badge-lg">Nível {userData?.level || 1}</div>
                  <div className="flex-grow">
                    <div className="w-full bg-base-300 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(userData?.xp || 0) % 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm">{userData?.xp || 0} XP</div>
                </div>
              </div>
            </motion.div>
          </section>

          <section className="achievements-section mb-8">
            <h2 className="text-xl font-bold mb-4">Suas Conquistas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(userData?.achievements || []).length > 0 ? (
                userData?.achievements.map((achievement) => (
                  <motion.div 
                    key={achievement.id}
                    whileHover={{ scale: 1.03 }}
                    className="card bg-base-100 shadow-md"
                  >
                    <div className="card-body">
                      <div className="flex items-center gap-3">
                        <div className="achievement-icon text-2xl">{achievement.icon}</div>
                        <div>
                          <h3 className="card-title text-lg">{achievement.name}</h3>
                          <p className="text-sm">{achievement.description}</p>
                          <div className="text-xs text-base-content/70 mt-1">
                            Desbloqueado em: {new Date(achievement.dateUnlocked).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="card-actions justify-end mt-2">
                        <div className="badge badge-outline">+{achievement.points} XP</div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center p-8 bg-base-100 rounded-box shadow-sm">
                  <p>Você ainda não tem conquistas. Continue usando o Papo Social para desbloquear!</p>
                </div>
              )}
            </div>
          </section>

          <section className="actions-section">
            <h2 className="text-xl font-bold mb-4">Ações</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <h3 className="card-title">Enviar Mensagem</h3>
                  <p>Comunique-se com outros membros da plataforma</p>
                  <div className="card-actions justify-end mt-2">
                    <button className="btn btn-primary">Iniciar</button>
                  </div>
                </div>
              </div>
              <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <h3 className="card-title">Entrar em Comunidade</h3>
                  <p>Participe de novas comunidades de interesse</p>
                  <div className="card-actions justify-end mt-2">
                    <button className="btn btn-primary">Explorar</button>
                  </div>
                </div>
              </div>
              <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <h3 className="card-title">Acessar Ajuda</h3>
                  <p>Saiba como usar todos os recursos do Papo Social</p>
                  <div className="card-actions justify-end mt-2">
                    <button className="btn btn-primary">Ajuda</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </ErrorBoundary>
  );
} 