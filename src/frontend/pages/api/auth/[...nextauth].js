import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import clientPromise from '../../../lib/mongodb';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    // Social login providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    
    // Custom voice registration provider
    CredentialsProvider({
      id: "voice-credentials",
      name: "Voice Recognition",
      credentials: {
        name: { label: "Nome", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.name) return null;
        
        try {
          // Create or find a user in your backend
          const response = await axios.post(`${API_URL}/users/`, {
            name: credentials.name,
            // Add any other user data you want to store
          });
          
          const user = response.data;
          
          if (user) {
            // Return user object that will be saved in the JWT token
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.profile_image,
              badges: user.achievements || [],
            };
          }
          
          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    }),
    
    // Optional: Phone number authentication
    CredentialsProvider({
      id: "phone",
      name: "Phone Number",
      credentials: {
        phone: { label: "Telefone", type: "tel" },
        code: { label: "Código", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) return null;
        
        try {
          // In a real implementation, you would verify the code with a service like Twilio
          // For now, we'll just check if the code is "123456" (demo purpose only)
          if (credentials.code !== "123456") {
            return null;
          }
          
          // Create or find a user in your backend
          const response = await axios.post(`${API_URL}/users/verify-phone`, {
            phone: credentials.phone
          });
          
          const user = response.data;
          
          if (user) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              image: user.profile_image,
              badges: user.achievements || [],
            };
          }
          
          return null;
        } catch (error) {
          console.error('Phone authentication error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.badges = user.badges || [];
        token.phone = user.phone;
      }
      
      // Update the session when it changes
      if (trigger === "update" && session) {
        if (session.badges) token.badges = session.badges;
        if (session.name) token.name = session.name;
      }
      
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token.id) session.user.id = token.id;
      if (token.badges) session.user.badges = token.badges;
      if (token.phone) session.user.phone = token.phone;
      
      return session;
    }
  },
  pages: {
    signIn: '/onboarding',
    signOut: '/',
    error: '/error',
  },
  debug: process.env.NODE_ENV === 'development',
}); 