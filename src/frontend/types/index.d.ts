/**
 * Application Type Definitions
 * 
 * This file centralizes references to all type definitions used in the application.
 * Import types from this file instead of directly from their source files.
 */

// Re-export type definitions for Next Auth
export * from './next-auth';

// Re-export other type definitions
export * from '../components/ui/AchievementNotification/types';

// Define application-specific types
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  badge: {
    title: string;
    description: string;
    icon: string;
  };
}

export interface VoiceAnalysis {
  pitch: number;
  cadence: number;
  volume: number;
  confidence: number;
}

// Types for speech recognition (re-exported for convenience)
export type { 
  SpeechRecognition, 
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionAlternative,
  SpeechRecognitionResult,
  SpeechRecognitionResultList
} from './speech-recognition'; 