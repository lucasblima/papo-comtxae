import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { VoiceAuthentication } from '../components/speech/VoiceAuthentication';

/**
 * Login page with support for both traditional and voice-based authentication
 */
export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState<'credentials' | 'voice'>('credentials');

  // Redirect URL from query string or default to dashboard
  const callbackUrl = 
    typeof router.query.callbackUrl === 'string' 
      ? router.query.callbackUrl 
      : '/dashboard';

  // Handle traditional login
  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        username,
        password,
      });
      
      if (result?.error) {
        setError('Credenciais inválidas. Tente novamente.');
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login. Tente novamente.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle voice authentication success
  const handleVoiceSuccess = async (name: string) => {
    setLoading(true);
    setError('');
    
    try {
      // For the MVP, we're just using the name and not actual voice data
      const result = await signIn('voice', {
        redirect: false,
        name,
        // In a real app, you would pass voice biometric data here
        voiceData: JSON.stringify({ timestamp: Date.now() })
      });
      
      if (result?.error) {
        setError('Ocorreu um erro na autenticação por voz. Tente novamente.');
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login. Tente novamente.');
      console.error('Voice login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <Head>
        <title>Login - Papo Social</title>
        <meta name="description" content="Faça login no Papo Social" />
      </Head>
      
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center mb-6">
            <span className="text-primary">Papo</span> Social
          </h1>
          
          {/* Authentication mode tabs */}
          <div className="tabs tabs-boxed mb-6">
            <a 
              className={`tab ${authMode === 'credentials' ? 'tab-active' : ''}`}
              onClick={() => setAuthMode('credentials')}
            >
              Senha
            </a>
            <a 
              className={`tab ${authMode === 'voice' ? 'tab-active' : ''}`}
              onClick={() => setAuthMode('voice')}
            >
              Voz
            </a>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {/* Traditional login form */}
          {authMode === 'credentials' ? (
            <form onSubmit={handleCredentialsLogin}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Usuário</span>
                </label>
                <input 
                  type="text" 
                  placeholder="nome de usuário" 
                  className="input input-bordered" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Senha</span>
                </label>
                <input 
                  type="password" 
                  placeholder="senha" 
                  className="input input-bordered" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label className="label">
                  <a href="#" className="label-text-alt link link-hover">
                    Esqueceu a senha?
                  </a>
                </label>
              </div>
              
              <div className="form-control mt-6">
                <button 
                  type="submit" 
                  className={`btn btn-primary ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Login'}
                </button>
              </div>
            </form>
          ) : (
            // Voice authentication component
            <div className="p-4 flex flex-col items-center">
              <VoiceAuthentication 
                onSuccess={handleVoiceSuccess}
                onError={(msg) => setError(msg)}
                onCancel={() => setError('')}
                prompt="Diga seu nome para entrar"
                className="w-full"
              />
            </div>
          )}
          
          <div className="divider">OU</div>
          
          <p className="text-center">
            Não tem uma conta?{' '}
            <Link href="/onboarding" className="link link-primary">
              Cadastre-se
            </Link>
          </p>
          
          {/* Demo credentials hint */}
          <div className="mt-4 text-xs text-center opacity-75">
            <p>Para testes, use:</p>
            <p>Usuário: <code>demo</code>, Senha: <code>demo</code></p>
          </div>
        </div>
      </div>
    </div>
  );
} 