import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import { ThemeToggle } from '../components/ui';
import { UserAchievement } from '../components/ui/AchievementNotification/types';

// Type guard to check if the user has badges
const userHasBadges = (user: Session['user']): user is Session['user'] & { badges: UserAchievement[] } => {
  return !!user && Array.isArray(user.badges) && user.badges.length > 0;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      setLoading(false);
    }
  }, [status, router]);
  
  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p>Carregando seu painel...</p>
        </div>
      </div>
    );
  }

  // Safe access to user data with defaults
  const userName = session?.user?.name || 'Amigo';
  const userXp = session?.user?.xp || 50;
  const userLevel = session?.user?.level || 1;
  const userBadges = session?.user?.badges || [];
  const hasBadges = userHasBadges(session?.user as Session['user']);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100" data-theme="dim">
      <Head>
        <title>Painel - Papo Social</title>
        <meta name="description" content="Seu painel personalizado no Papo Social" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header with user info */}
      <header className="p-4 flex justify-between items-center bg-base-100 shadow-md">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" />
            </svg>
            <span className="text-xl font-bold">Papo Social</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                <span className="text-xl font-bold">
                  {userName.charAt(0) || '?'}
                </span>
              </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li className="p-2 text-center font-bold border-b border-base-300">
                {userName}
              </li>
              <li><a>Perfil</a></li>
              <li><a>Configurações</a></li>
              <li><a onClick={handleSignOut}>Sair</a></li>
            </ul>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
            <h1 className="text-3xl font-bold mb-4">
              Bem-vindo, {userName}!
            </h1>
            <p className="mb-4">
              Este é seu painel personalizado no Papo Social. Aqui você pode acompanhar suas conquistas, 
              participar de comunidades e muito mais.
            </p>
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="stat-title">XP Total</div>
                <div className="stat-value text-primary">{userXp}</div>
                <div className="stat-desc">Nível {userLevel}</div>
              </div>
              
              <div className="stat">
                <div className="stat-figure text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="stat-title">Distintivos</div>
                <div className="stat-value text-secondary">{userBadges.length}</div>
                <div className="stat-desc">Conquistas desbloqueadas</div>
              </div>
            </div>
          </div>
          
          {/* Badges Section */}
          <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Seus Distintivos</h2>
            
            {hasBadges ? (
              <div className="flex flex-wrap gap-3">
                {userBadges.map((badge, index) => (
                  <div key={index} className="badge badge-lg gap-2 p-4 bg-base-300">
                    <span className="text-xl">{badge.icon || '🏆'}</span>
                    {badge.name || 'Distintivo'}
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Você ainda não conquistou nenhum distintivo. Participe de atividades para ganhar!</span>
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link href="/quiz" className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h2 className="card-title">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Quiz de Comunidade
                </h2>
                <p>Teste seus conhecimentos sobre engajamento comunitário e ganhe distintivos!</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">Iniciar Quiz</button>
                </div>
              </div>
            </Link>
            
            <Link href="/communities" className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <h2 className="card-title">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Comunidades
                </h2>
                <p>Encontre e participe de comunidades locais que compartilham seus interesses.</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">Explorar</button>
                </div>
              </div>
            </Link>
          </div>
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