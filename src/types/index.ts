
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  audioUrl?: string;
  transcript: string;
  sentiment: Sentiment;
  createdAt: string;
  updatedAt: string;
}

export interface Sentiment {
  score: number; // -1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive
  magnitude: number; // 0 to infinity, indicates the strength of emotion
  label: 'positive' | 'negative' | 'neutral';
}

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

export interface UserCredentials {
  email: string;
  password: string;
}

// Add Web Speech API TypeScript definitions
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
