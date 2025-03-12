import { DefaultSession } from "next-auth";
import { UserAchievement } from "../components/ui/AchievementNotification/types";

/**
 * Extended types for NextAuth.js
 */

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      /** Basic user fields */
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      
      /** Custom fields for our application */
      xp?: number;
      level?: number;
      badges?: UserAchievement[];
      voiceProfile?: any;
    } & DefaultSession["user"];
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    /** Basic user ID */
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    
    /** Custom fields for our application */
    xp?: number;
    level?: number;
    badges?: UserAchievement[];
    voiceProfile?: any;
  }
}

declare module "next-auth/jwt" {
  /** Extend the JWT payload */
  interface JWT {
    id?: string;
    xp?: number;
    level?: number;
    badges?: UserAchievement[];
    voiceProfile?: any;
  }
} 