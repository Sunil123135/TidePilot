'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Trash2, CheckCircle, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  minDuration?: number; // seconds
  maxDuration?: number; // seconds
}

export function VoiceRecorder({
  onRecordingComplete,
  minDuration = 30,
  maxDuration = 90,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setPermissionError(null);

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);

        setAudioBlob(audioBlob);
        setAudioUrl(url);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorder.start(100); // Capture in 100ms chunks
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;

          // Auto-stop at max duration
          if (newTime >= maxDuration) {
            stopRecording();
          }

          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setPermissionError(
        error instanceof Error && error.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access.'
          : 'Could not access microphone. Please check your settings.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playAudio = () => {
    if (audioUrl && audioElementRef.current) {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const handleAccept = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canAccept = audioBlob && recordingTime >= minDuration;
  const progress = Math.min((recordingTime / maxDuration) * 100, 100);

  return (
    <div className="space-y-4">
      {permissionError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {permissionError}
        </div>
      )}

      {/* Recording UI */}
      <div className="rounded-lg border border-border p-6 bg-background">
        {/* Waveform visualization placeholder */}
        <div className="mb-4 h-24 rounded bg-muted/50 flex items-center justify-center">
          {isRecording ? (
            <div className="flex gap-1 items-end h-16">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 60 + 20}%`,
                    animationDelay: `${i * 50}ms`,
                    animationDuration: '800ms',
                  }}
                />
              ))}
            </div>
          ) : audioUrl ? (
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Recording complete</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Click the microphone to start recording
            </p>
          )}
        </div>

        {/* Timer and progress */}
        <div className="mb-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className={isRecording ? 'text-destructive font-medium' : 'text-muted-foreground'}>
              {formatTime(recordingTime)} / {formatTime(maxDuration)}
            </span>
            {recordingTime > 0 && recordingTime < minDuration && (
              <span className="text-amber-600 text-xs">
                Minimum {minDuration}s required
              </span>
            )}
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                recordingTime >= minDuration ? 'bg-emerald-600' : 'bg-amber-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          {!isRecording && !audioUrl && (
            <Button
              onClick={startRecording}
              size="lg"
              className="gap-2"
            >
              <Mic className="h-4 w-4" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <Button
              onClick={stopRecording}
              size="lg"
              variant="destructive"
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Recording
            </Button>
          )}

          {audioUrl && !isRecording && (
            <>
              <Button
                onClick={playAudio}
                variant="outline"
                size="lg"
                disabled={isPlaying}
              >
                <Play className="h-4 w-4 mr-2" />
                Play
              </Button>
              <Button
                onClick={resetRecording}
                variant="outline"
                size="lg"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Re-record
              </Button>
              <Button
                onClick={handleAccept}
                size="lg"
                disabled={!canAccept}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Hidden audio element for playback */}
      {audioUrl && (
        <audio
          ref={audioElementRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Record for {minDuration}–{maxDuration} seconds</p>
        <p>• Include the liveness phrase: "Today is [date], TidePilot voice check"</p>
        <p>• Speak clearly in a quiet environment</p>
      </div>
    </div>
  );
}
