import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a página principal em src/frontend/pages
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Head>
        <title>Redirecionando...</title>
      </Head>
      <p>Redirecionando para a página principal...</p>
    </div>
  );
} 