
import { useState, useCallback, useRef, useEffect } from "react";
import { RecordingState } from "../types";
import { useToast } from "@/components/ui/use-toast";

interface VoiceRecorderOptions {
  maxDuration?: number; // in milliseconds
  onTranscriptionComplete?: (transcript: string) => void;
}

interface VoiceRecorderReturn {
  recordingState: RecordingState;
  audioUrl: string | null;
  transcript: string;
  isTranscribing: boolean;
  transcriptionProgress: number;
  recordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
  audioBlob: Blob | null;
}

export const useVoiceRecorder = (options?: VoiceRecorderOptions): VoiceRecorderReturn => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState<number>(0);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const maxDuration = options?.maxDuration || 120000; // 2 minutes by default

  // Cleanup function
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioUrl]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const startTime = Date.now() - recordingTime;
    timerRef.current = window.setInterval(() => {
      setRecordingTime(Date.now() - startTime);
      
      // Stop recording if max duration is reached
      if (Date.now() - startTime > maxDuration) {
        stopRecording();
      }
    }, 100);
  }, [recordingTime, maxDuration]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetRecording = useCallback(() => {
    stopTimer();
    setRecordingState("idle");
    setAudioBlob(null);
    setAudioUrl(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setTranscript("");
    setIsTranscribing(false);
    setTranscriptionProgress(0);
    setRecordingTime(0);
    audioChunksRef.current = [];
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, [stopTimer]);

  const startRecording = useCallback(async () => {
    resetRecording();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioChunks = audioChunksRef.current;
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Begin transcription process
        try {
          setIsTranscribing(true);
          await simulateTranscription();
        } catch (error) {
          console.error("Transcription error:", error);
          toast({
            title: "Transcription Failed",
            description: "Could not transcribe your audio. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsTranscribing(false);
        }
      };

      startTimer();
      mediaRecorder.start();
      setRecordingState("recording");
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to record your journal entry.",
        variant: "destructive",
      });
      resetRecording();
    }
  }, [resetRecording, startTimer, toast]);

  const stopRecording = useCallback(async () => {
    stopTimer();
    setRecordingState("stopped");
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  }, [stopTimer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setRecordingState("paused");
      stopTimer();
    }
  }, [stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setRecordingState("recording");
      startTimer();
    }
  }, [startTimer]);

  const simulateTranscription = async () => {
    // Mock transcription process with progress
    const mockTranscripts = [
      "Today I'm feeling really good about my progress on the project.",
      "I'm a bit stressed about the upcoming deadline, but I think I'll manage.",
      "I had a great conversation with my friend today that lifted my mood.",
      "I'm feeling tired after a long day, but accomplished a lot.",
      "I'm excited about the weekend plans with my family.",
    ];
    
    const selectedTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
    
    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      setTranscriptionProgress(i);
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    setTranscript(selectedTranscript);
    
    if (options?.onTranscriptionComplete) {
      options.onTranscriptionComplete(selectedTranscript);
    }
  };

  return {
    recordingState,
    audioUrl,
    transcript,
    isTranscribing,
    transcriptionProgress,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    audioBlob,
  };
};
