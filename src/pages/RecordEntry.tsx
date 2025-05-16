import React, { useEffect, useState } from "react";
import { useVoiceRecorder } from "../hooks/use-voice-recorder";
import { useJournal } from "../contexts/JournalContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Mic, Pause, Play, StopCircle, ArrowLeft, Save, Trash } from "lucide-react";
import { formatTime } from "@/lib/utils";

const RecordEntry = () => {
  const navigate = useNavigate();
  const { addEntry } = useJournal();
  const [editedTranscript, setEditedTranscript] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  const {
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
  } = useVoiceRecorder();

  // Update edited transcript when original transcript changes
  useEffect(() => {
    if (transcript) {
      setEditedTranscript(transcript);
      // Automatically switch to editing mode when transcription is complete
      setIsEditing(true);
    }
  }, [transcript]);

  const handleSave = async () => {
    if (editedTranscript.trim()) {
      await addEntry(editedTranscript, audioBlob);
      navigate("/dashboard");
    }
  };

  const handleCancel = () => {
    resetRecording();
    navigate("/dashboard");
  };

  const handleTranscriptEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto animate-fade-in">
        <header className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 pl-0 hover:bg-transparent hover:text-mood-blue"
            onClick={handleCancel}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-mood-blue">Record Journal Entry</h1>
        </header>

        <Card className="bg-white/90 backdrop-blur shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8">
              {recordingState === "idle" && !audioUrl && (
                <div className="text-center">
                  <div 
                    className="w-24 h-24 bg-mood-blue rounded-full flex items-center justify-center mb-6 mx-auto cursor-pointer hover:bg-mood-blue/90 transition-colors"
                    onClick={startRecording}
                  >
                    <Mic className="h-10 w-10 text-white" />
                  </div>
                  <p className="text-gray-600">Tap the microphone to start recording</p>
                </div>
              )}

              {recordingState === "recording" && (
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 bg-red-500 recording-pulse rounded-full flex items-center justify-center mx-auto">
                      <Mic className="h-10 w-10 text-white animate-pulse" />
                    </div>
                  </div>
                  <p className="text-xl font-medium mb-2">{formatTime(recordingTime)}</p>
                  <p className="text-gray-600 mb-6">Recording...</p>
                  
                  <div className="flex space-x-4">
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={pauseRecording}
                    >
                      <Pause className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={stopRecording}
                    >
                      <StopCircle className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              )}

              {recordingState === "paused" && (
                <div className="text-center">
                  <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Pause className="h-10 w-10 text-white" />
                  </div>
                  <p className="text-xl font-medium mb-2">{formatTime(recordingTime)}</p>
                  <p className="text-gray-600 mb-6">Paused</p>
                  
                  <div className="flex space-x-4">
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={resumeRecording}
                    >
                      <Play className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={stopRecording}
                    >
                      <StopCircle className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              )}

              {recordingState === "stopped" && (
                <>
                  {isTranscribing ? (
                    <div className="text-center w-full">
                      <div className="mb-6">
                        <p className="text-lg font-medium mb-4">Transcribing audio...</p>
                        <Progress value={transcriptionProgress} className="h-2 mb-2" />
                        <p className="text-sm text-gray-500">{transcriptionProgress}%</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="mb-6">
                        {audioUrl && (
                          <audio 
                            controls 
                            src={audioUrl} 
                            className="w-full mb-4"
                          />
                        )}
                      </div>
                      
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-md font-medium">Transcript</h3>
                          {!isEditing && transcript && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={handleTranscriptEdit}
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                        
                        {isEditing ? (
                          <Textarea
                            value={editedTranscript}
                            onChange={(e) => setEditedTranscript(e.target.value)}
                            className="h-32 mb-4"
                            placeholder="Edit your transcript here..."
                            autoFocus
                          />
                        ) : (
                          <div className="bg-gray-50 p-3 rounded-md min-h-[80px] mb-4">
                            {transcript || "No transcript available."}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button 
                          variant="default" 
                          className="flex-1 bg-mood-blue hover:bg-mood-blue/90"
                          onClick={handleSave}
                          disabled={!editedTranscript.trim()}
                        >
                          <Save className="mr-2 h-4 w-4" /> Save Entry
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={resetRecording}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Discard
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecordEntry;
