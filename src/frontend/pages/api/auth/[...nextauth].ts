import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { UserAchievement } from '../../../components/ui/AchievementNotification/types';

/**
 * Options for NextAuth.js
 * This configuration sets up authentication with credentials and voice recognition
 */
export const authOptions: NextAuthOptions = {
  providers: [
    // Username/password authentication
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This is where you would usually verify against a database
        // For the MVP, we're using a simple check
        if (credentials?.username === 'demo' && credentials?.password === 'demo') {
          return {
            id: '1',
            name: 'Demo User',
            email: 'demo@example.com',
            xp: 150,
            level: 3,
            badges: [
              { id: '1', name: 'Primeiro Login', icon: '🎖️', description: 'Login inicial bem-sucedido' },
              { id: '2', name: 'Explorador', icon: '🔍', description: 'Visitou todas as seções' }
            ]
          };
        }
        return null;
      }
    }),
    
    // Voice authentication provider
    CredentialsProvider({
      id: 'voice',
      name: 'Voice Authentication',
      credentials: {
        name: { label: "Nome", type: "text" },
        voiceData: { label: "Voice Data", type: "text" }
      },
      async authorize(credentials) {
        // In a real app, you would analyze the voice data
        // For the MVP, we're just checking that a name was provided
        if (credentials?.name) {
          // Create a unique ID based on the name (for demo purposes)
          const id = Buffer.from(credentials.name.toLowerCase()).toString('hex');
          
          // Generate some badges based on the user's first time using voice auth
          const badges: UserAchievement[] = [
            { 
              id: 'voice-auth-1', 
              name: 'Voz Verificada', 
              icon: '🎤', 
              description: 'Usou autenticação por voz pela primeira vez' 
            }
          ];
          
          // Return a user object
          return {
            id,
            name: credentials.name,
            email: null,
            xp: 100,
            level: 1,
            badges,
            voiceProfile: credentials.voiceData || null
          };
        }
        return null;
      }
    })
  ],
  
  // Configure session handling
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Custom pages
  pages: {
    signIn: '/login',
    error: '/auth/error',
    newUser: '/onboarding'
  },
  
  // JWT configuration
  callbacks: {
    // Add custom user data to the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.xp = user.xp;
        token.level = user.level;
        token.badges = user.badges;
        token.voiceProfile = user.voiceProfile;
      }
      return token;
    },
    
    // Add custom user data to the session
    async session({ session, token }) {
      if (token && session.user) {
        // Set default values for when token properties might be undefined
        session.user.id = token.id as string || '';
        session.user.xp = (token.xp as number) || 0;
        session.user.level = (token.level as number) || 1;
        session.user.badges = (token.badges as UserAchievement[]) || [];
        session.user.voiceProfile = token.voiceProfile || null;
      }
      return session;
    }
  },
  
  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // A random string used to hash tokens and sign cookies (for production)
  secret: process.env.NEXTAUTH_SECRET || 'a-default-insecure-secret-for-development',
};

export default NextAuth(authOptions);

 