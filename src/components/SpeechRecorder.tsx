/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, AlertCircle, Edit3, Keyboard } from "lucide-react";

interface SpeechRecorderProps {
  value: string;
  onChange: (text: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

export default function SpeechRecorder({
  value,
  onChange,
  isListening,
  setIsListening,
}: SpeechRecorderProps) {
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for SpeechRecognition support in various browsers
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecognitionSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => {
      setError(null);
    };

    rec.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }
      
      if (finalTranscript) {
        onChange(value ? value + finalTranscript : finalTranscript);
      }
    };

    rec.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error === "not-allowed") {
        setError("Microphone permission denied. Using manual text entry.");
        setIsListening(false);
      } else if (event.error === "no-speech") {
        // Just silent error, continue listening
      } else {
        setError(`Speech error: ${event.error}. Entering text mode.`);
        setIsListening(false);
      }
    };

    rec.onend = () => {
      // Auto-restart if we are supposed to be listening
      if (isListening) {
        try {
          rec.start();
        } catch (e) {
          // ignore double starts
        }
      }
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, [isListening, value, onChange, setIsListening]);

  const toggleListening = () => {
    if (!recognitionSupported) {
      setError("Web Speech is not supported in this browser. Please type your response.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      setIsListening(true);
      setError(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.error("Failed to start speech recognition", err);
        }
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-4" id="speech-recorder-container">
      <div className="flex flex-col md:flex-row items-center gap-4 justify-between bg-card-bg/40 p-4 border border-border rounded-none">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              id="mic-toggle-btn"
              onClick={toggleListening}
              className={`p-4 rounded-none transition-all duration-300 relative z-10 cursor-pointer ${
                isListening
                  ? "bg-danger text-ink border border-danger animate-pulse"
                  : "bg-bg text-accent border border-border hover:bg-card-bg"
              }`}
              title={isListening ? "Stop listening" : "Start speaking"}
            >
              {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            {isListening && (
              <span className="absolute inset-0 rounded-none bg-danger/10 animate-ping z-0 pointer-events-none scale-125"></span>
            )}
          </div>

          <div>
            <h4 className="text-ink font-mono uppercase text-xs tracking-wider font-bold">
              {isListening ? "Listening to your answer..." : "Vocal Defense Mode"}
            </h4>
            <p className="text-xs text-muted">
              {recognitionSupported
                ? isListening
                  ? "Speak clearly. Click the mic to stop."
                  : "Click to speak or type directly below."
                : "Microphone transcription unavailable. Please use the text board."}
            </p>
          </div>
        </div>

        {isListening && (
          <div className="flex items-center gap-1.5 h-6">
            <span className="w-1 h-3 bg-accent rounded-none animate-bounce delay-75"></span>
            <span className="w-1 h-5 bg-accent/70 rounded-none animate-bounce delay-150"></span>
            <span className="w-1 h-2 bg-accent rounded-none animate-bounce delay-300"></span>
            <span className="w-1 h-6 bg-accent/70 rounded-none animate-bounce delay-75"></span>
            <span className="w-1 h-4 bg-accent rounded-none animate-bounce delay-150"></span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-danger/5 border border-danger/40 rounded-none text-danger text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="answer-input" className="text-[10px] font-mono text-accent font-bold flex items-center gap-1.5 uppercase tracking-widest">
          <Edit3 className="w-3.5 h-3.5 text-accent/80" />
          Transcription / Draft Board
        </label>
        <textarea
          id="answer-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your verbal defense will stream here, or you can type/edit your response directly onto this draft board..."
          className="w-full h-36 bg-bg text-ink p-4 border border-border rounded-none font-mono text-xs focus:outline-none focus:border-accent/65 leading-relaxed placeholder:text-muted/60 resize-none"
        />
        <div className="flex justify-between items-center text-[10px] font-mono text-muted px-1">
          <span>{value.length} characters | approx. {value.split(/\s+/).filter(Boolean).length} words</span>
          <span className="flex items-center gap-1">
            <Keyboard className="w-3 h-3 text-muted/60" /> Fully Editable Board
          </span>
        </div>
      </div>
    </div>
  );
}
