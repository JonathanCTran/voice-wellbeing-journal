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
  const recognitionRef = useRef<any>(null);

  // Check if the browser supports the Web Speech API
  const isSpeechRecognitionSupported = () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
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
        await transcribeAudio(audioBlob);
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

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setTranscriptionProgress(0);
    
    try {
      // If Web Speech API is supported, we'll use that
      if (isSpeechRecognitionSupported()) {
        // Create progressive updates to transcription progress
        const progressInterval = setInterval(() => {
          setTranscriptionProgress(prev => {
            const newProgress = prev + 10;
            return newProgress <= 90 ? newProgress : prev;
          });
        }, 300);
        
        // Get transcript from recorded audio
        const transcript = await processAudioWithSpeechRecognition(audioBlob);
        
        clearInterval(progressInterval);
        setTranscriptionProgress(100);
        setTranscript(transcript);
        
        if (options?.onTranscriptionComplete) {
          options.onTranscriptionComplete(transcript);
        }
      } else {
        // Fallback for browsers that don't support Web Speech API
        await simulateTranscription();
      }
    } catch (error) {
      console.error("Transcription error:", error);
      toast({
        title: "Transcription Failed",
        description: "Could not transcribe your audio. Please try again or enter text manually.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };
  
  // Process the audio using Web Speech API
  const processAudioWithSpeechRecognition = (audioBlob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      // Create an audio element to play the recorded audio
      const audio = new Audio(URL.createObjectURL(audioBlob));
      
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;
      
      let finalTranscript = '';
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update the transcription as it progresses
        setTranscript(finalTranscript || interimTranscript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        recognition.stop();
        resolve(finalTranscript || "Could not transcribe audio.");
      };
      
      recognition.onend = () => {
        resolve(finalTranscript || "No speech detected.");
      };
      
      // Start recognition when audio starts playing
      audio.onplay = () => {
        recognition.start();
      };
      
      // Stop recognition when audio ends
      audio.onended = () => {
        setTimeout(() => recognition.stop(), 1000); // Give a little extra time for processing
      };
      
      // Play the audio to start the process
      audio.play().catch(error => {
        console.error("Error playing audio for transcription:", error);
        resolve("Could not process audio for transcription.");
      });
    });
  };

  const simulateTranscription = async () => {
    // Fallback for browsers without speech recognition
    // Mock transcription process with progress
    for (let i = 0; i <= 100; i += 10) {
      setTranscriptionProgress(i);
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    setTranscript("Your browser doesn't support automatic transcription. Please edit this text manually.");
    
    if (options?.onTranscriptionComplete) {
      options.onTranscriptionComplete("Your browser doesn't support automatic transcription. Please edit this text manually.");
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
