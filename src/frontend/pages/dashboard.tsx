import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import { ThemeToggle } from '../components/ui';
import { UserAchievement } from '../components/ui/AchievementNotification/types';
import { FaTrophy, FaUserAlt, FaCog, FaSignOutAlt, FaComment, FaQuestion, FaUsers } from 'react-icons/fa';

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
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100">
      <Head>
        <title>Painel - Papo Social</title>
        <meta name="description" content="Seu painel personalizado no Papo Social" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header with user info */}
      <header className="navbar bg-base-100 shadow-md">
        <div className="navbar-start">
          <Link href="/" className="btn btn-ghost normal-case text-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" />
            </svg>
            <span className="hidden sm:inline font-bold">Papo Social</span>
          </Link>
        </div>
        
        <div className="navbar-end">
          <div className="indicator mr-2">
            <span className="indicator-item badge badge-primary badge-sm">{userLevel}</span>
            <span className="badge badge-outline">XP: {userXp}</span>
          </div>
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
              <li>
                <a className="justify-between">
                  <span className="flex items-center">
                    <FaUserAlt className="mr-2" /> Perfil
                  </span>
                </a>
              </li>
              <li>
                <a className="justify-between">
                  <span className="flex items-center">
                    <FaCog className="mr-2" /> Configurações
                  </span>
                </a>
              </li>
              <li>
                <a onClick={handleSignOut} className="justify-between">
                  <span className="flex items-center">
                    <FaSignOutAlt className="mr-2" /> Sair
                  </span>
                </a>
              </li>
            </ul>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="card bg-base-100 shadow-lg mb-8">
            <div className="card-body">
              <h1 className="card-title text-3xl">
                Bem-vindo, {userName}!
              </h1>
              <p className="py-4">
                Este é seu painel personalizado no Papo Social. Aqui você pode acompanhar suas conquistas, 
                participar de comunidades e muito mais.
              </p>
              <div className="stats stats-vertical md:stats-horizontal shadow w-full">
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
                    <FaTrophy className="inline-block w-6 h-6" />
                  </div>
                  <div className="stat-title">Distintivos</div>
                  <div className="stat-value text-secondary">{userBadges.length}</div>
                  <div className="stat-desc">Conquistas desbloqueadas</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Badges Section */}
          <div className="card bg-base-100 shadow-lg mb-8">
            <div className="card-body">
              <h2 className="card-title text-2xl">
                <FaTrophy className="text-primary mr-2" /> Seus Distintivos
              </h2>
              
              {hasBadges ? (
                <div className="flex flex-wrap gap-3 mt-4">
                  {userBadges.map((badge, index) => (
                    <div key={index} className="badge badge-lg gap-2 p-4 bg-base-300 badge-outline">
                      <span className="text-xl">{badge.icon || '🏆'}</span>
                      {badge.name || 'Distintivo'}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Você ainda não conquistou nenhum distintivo. Participe de atividades para ganhar!</span>
                  <div>
                    <Link href="/quiz" className="btn btn-sm btn-primary">Começar Quiz</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <h2 className="text-2xl font-bold mb-4">Atividades Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link href="/quiz" className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow border border-base-300 hover:border-primary">
              <div className="card-body">
                <h2 className="card-title">
                  <FaQuestion className="text-primary" />
                  Quiz de Comunidade
                </h2>
                <p>Teste seus conhecimentos sobre engajamento comunitário e ganhe distintivos!</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">Iniciar Quiz</button>
                </div>
              </div>
            </Link>
            
            <Link href="/communities" className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow border border-base-300 hover:border-primary">
              <div className="card-body">
                <h2 className="card-title">
                  <FaUsers className="text-primary" />
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