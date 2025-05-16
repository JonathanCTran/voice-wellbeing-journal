import React, { createContext, useContext, useEffect, useState } from "react";
import { JournalEntry, Sentiment } from "../types";
import { useAuth } from "./AuthContext";
import { useToast } from "@/components/ui/use-toast";

// Generate mock entries
const generateMockEntries = (userId: string): JournalEntry[] => {
  const sentiments: Sentiment[] = [
    { score: 0.8, magnitude: 0.9, label: "positive" },
    { score: -0.6, magnitude: 0.7, label: "negative" },
    { score: 0.2, magnitude: 0.3, label: "neutral" },
    { score: 0.7, magnitude: 0.8, label: "positive" },
    { score: -0.5, magnitude: 0.6, label: "negative" },
  ];

  const transcripts = [
    "Today was a really great day. I accomplished a lot and felt very productive.",
    "I'm feeling stressed about the upcoming deadline. I don't think I'll finish in time.",
    "Just an average day today. Nothing special happened.",
    "I'm excited about the weekend plans with friends. It's going to be amazing!",
    "Had an argument with a colleague today. It made me feel quite frustrated.",
  ];

  return Array.from({ length: 5 }, (_, i) => ({
    id: `entry-${i + 1}`,
    userId,
    transcript: transcripts[i],
    sentiment: sentiments[i],
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
  }));
};

interface JournalContextProps {
  entries: JournalEntry[];
  addEntry: (transcript: string, audioBlob?: Blob) => Promise<void>;
  deleteEntry: (id: string) => void;
  analyzeSentiment: (text: string) => Promise<Sentiment>;
}

const JournalContext = createContext<JournalContextProps | undefined>(undefined);

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    if (authState.user) {
      // Load entries from local storage if they exist
      const storedEntries = localStorage.getItem(`moodJournal_${authState.user.id}_entries`);
      
      if (storedEntries) {
        try {
          setEntries(JSON.parse(storedEntries));
        } catch (error) {
          console.error("Failed to parse stored entries:", error);
          // Set to empty array for new user
          setEntries([]);
          localStorage.setItem(
            `moodJournal_${authState.user.id}_entries`, 
            JSON.stringify([])
          );
        }
      } else {
        // Initialize with empty array for new user
        setEntries([]);
        localStorage.setItem(
          `moodJournal_${authState.user.id}_entries`, 
          JSON.stringify([])
        );
      }
    } else {
      setEntries([]);
    }
  }, [authState.user]);

  const analyzeSentiment = async (text: string): Promise<Sentiment> => {
    // Simulate sentiment analysis API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simple mock sentiment analysis based on counting positive and negative words
    const positiveWords = ['great', 'good', 'happy', 'excited', 'wonderful', 'amazing', 'love', 'joy', 'positive', 'productive'];
    const negativeWords = ['bad', 'sad', 'angry', 'frustrated', 'disappointed', 'stress', 'worried', 'anxious', 'negative', 'upset'];
    
    const words = text.toLowerCase().split(/\W+/);
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    const totalEmotionalWords = positiveCount + negativeCount;
    const score = totalEmotionalWords === 0 ? 0 : (positiveCount - negativeCount) / totalEmotionalWords;
    const magnitude = totalEmotionalWords / words.length;
    
    let label: 'positive' | 'negative' | 'neutral';
    if (score > 0.2) label = 'positive';
    else if (score < -0.2) label = 'negative';
    else label = 'neutral';
    
    return {
      score,
      magnitude: magnitude * 2, // Scale up a bit
      label
    };
  };

  const addEntry = async (transcript: string, audioBlob?: Blob) => {
    if (!authState.user) return;

    try {
      const sentiment = await analyzeSentiment(transcript);
      
      let audioUrl;
      if (audioBlob) {
        // In a real app, we would upload to a server and get a URL
        // For now, we'll create a temporary object URL
        audioUrl = URL.createObjectURL(audioBlob);
      }

      const newEntry: JournalEntry = {
        id: `entry-${Date.now()}`,
        userId: authState.user.id,
        transcript,
        sentiment,
        audioUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      localStorage.setItem(
        `moodJournal_${authState.user.id}_entries`,
        JSON.stringify(updatedEntries)
      );

      toast({
        title: "Entry added",
        description: "Your journal entry has been saved",
      });
    } catch (error) {
      console.error("Error adding entry:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add journal entry",
      });
    }
  };

  const deleteEntry = (id: string) => {
    if (!authState.user) return;
    
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem(
      `moodJournal_${authState.user.id}_entries`,
      JSON.stringify(updatedEntries)
    );

    toast({
      title: "Entry deleted",
      description: "Your journal entry has been removed",
    });
  };

  return (
    <JournalContext.Provider value={{ entries, addEntry, deleteEntry, analyzeSentiment }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error("useJournal must be used within a JournalProvider");
  }
  return context;
};
