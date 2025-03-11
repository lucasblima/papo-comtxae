import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

type AuthCheckProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

/**
 * Component that checks if the user is authenticated.
 * If not, it redirects to the specified page (default: '/onboarding').
 */
export const AuthCheck: React.FC<AuthCheckProps> = ({ 
  children, 
  redirectTo = '/onboarding' 
}) => {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !session) {
      router.push(redirectTo);
    }
  }, [loading, router, session, redirectTo]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return null;
  }
  
  return <>{children}</>;
};

export default AuthCheck; 