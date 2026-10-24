/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Mic, Timer, Trophy, ShieldAlert, CheckSquare, Sparkles, BookOpen, ChevronRight, X, AlertOctagon } from "lucide-react";
import { VivaQuestion, AnswerFeedback } from "../types";
import SpeechRecorder from "./SpeechRecorder";

interface VivaRoomProps {
  questions: VivaQuestion[];
  answers: Record<string, { studentAnswer: string; feedback: AnswerFeedback | null; timeSpent: number }>;
  onAnswerSubmit: (questionId: string, answer: string, timeSpent: number) => void;
  isEvaluating: boolean;
  onExit: () => void;
}

export default function VivaRoom({
  questions,
  answers,
  onAnswerSubmit,
  isEvaluating,
  onExit,
}: VivaRoomProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const activeQuestion = questions[currentIdx];
  const activeAnswerState = answers[activeQuestion?.id];
  const activeFeedback = activeAnswerState?.feedback || null;

  // Track timer using a standard interval
  useEffect(() => {
    // Reset timer on question change
    setElapsedSeconds(0);
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIdx]);

  // Load draft if already answered
  useEffect(() => {
    if (activeAnswerState) {
      setCurrentAnswer(activeAnswerState.studentAnswer);
    } else {
      setCurrentAnswer("");
    }
  }, [currentIdx, activeAnswerState]);

  // Status Bulb color
  let statusLampColor = "bg-muted shadow-muted/50";
  let statusLabel = "AWAITING VERBAL ARGUMENTS";
  let statusBorder = "border-border";

  if (isEvaluating) {
    statusLampColor = "bg-accent shadow-accent/50 animate-pulse";
    statusLabel = "BOARD CHAIR EVALUATING...";
    statusBorder = "border-accent/30";
  } else if (activeFeedback) {
    const score = activeFeedback.overallScore;
    if (score >= 80) {
      statusLampColor = "bg-success shadow-success/50 animate-pulse";
      statusLabel = "STRONG DEFENSE CONFIRMED";
      statusBorder = "border-success/30";
    } else if (score >= 60) {
      statusLampColor = "bg-accent shadow-accent/50";
      statusLabel = "MODERATE DEFENSE - RETROSPECT RECOMMENDED";
      statusBorder = "border-accent/30";
    } else {
      statusLampColor = "bg-danger shadow-danger/50 animate-pulse";
      statusLabel = "CRITICAL ARGUMENT GAP IDENTIFIED";
      statusBorder = "border-danger/30";
    }
  }

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleDefend = () => {
    if (currentAnswer.trim().length === 0) return;
    onAnswerSubmit(activeQuestion.id, currentAnswer, elapsedSeconds);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col justify-between text-ink overflow-y-auto font-sans" id="viva-room-full-screen">
      {/* 1. Header Toolbar */}
      <div className="flex justify-between items-center px-6 py-4 bg-card-bg/60 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-none bg-danger animate-pulse"></div>
          <span className="text-[10px] font-mono tracking-widest text-muted font-extrabold uppercase">
            VIVA SIMULATOR ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-6">
          {/* Live timer */}
          <div className="flex items-center gap-1.5 font-mono text-sm bg-bg px-3.5 py-1.5 rounded-none border border-border text-ink">
            <Timer className="w-4 h-4 text-accent" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <button
            type="button"
            id="exit-viva-room-btn"
            onClick={onExit}
            className="flex items-center gap-1.5 border border-border hover:bg-card-bg hover:text-ink text-muted px-3.5 py-1.5 rounded-none text-xs transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Terminate Session
          </button>
        </div>
      </div>

      {/* 2. Main Examiner Arena */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col justify-center gap-8">
        
        {/* Viva Status Bulb indicator box */}
        <div className={`p-4 rounded-none bg-card-bg/30 border ${statusBorder} flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-3.5 h-3.5 rounded-none ${statusLampColor} transition-all duration-500 shadow-lg`}></div>
              {statusLampColor.includes("animate-pulse") && (
                <div className="absolute inset-0 rounded-none bg-current opacity-20 animate-ping scale-125"></div>
              )}
            </div>
            <span className="text-xs font-mono font-bold tracking-wider text-ink">
              BOARD STATUS: <span className="text-accent">{statusLabel}</span>
            </span>
          </div>
          <span className="text-xs font-mono text-muted">
            Examiner Question {currentIdx + 1} of {questions.length}
          </span>
        </div>

        {/* The Question Text and Prompt Banner */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-mono text-accent font-bold uppercase tracking-widest flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> Core Socratic Interrogation
          </div>
          <h2 className="text-xl md:text-2xl font-serif italic text-ink tracking-tight leading-relaxed">
            {activeQuestion?.text}
          </h2>
          <div className="text-xs font-mono text-muted italic bg-bg/40 p-3 rounded-none border-l border-border">
            <strong>Target rationale:</strong> {activeQuestion?.rationale}
          </div>
        </div>

        {/* Input speech recorder and draft block */}
        <div className="border-t border-border pt-6">
          <SpeechRecorder
            value={currentAnswer}
            onChange={setCurrentAnswer}
            isListening={isListening}
            setIsListening={setIsListening}
          />
        </div>

        {/* Submission Actions */}
        <div className="flex justify-between items-center gap-4 mt-2">
          <div className="flex gap-2">
            <button
              type="button"
              id="viva-prev-btn"
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className={`p-2.5 rounded-none border text-xs font-mono flex items-center gap-1 transition-colors ${
                currentIdx === 0
                  ? "border-bg text-muted/30 cursor-not-allowed"
                  : "border-border text-muted hover:text-ink hover:bg-bg cursor-pointer"
              }`}
            >
              PREV EXAMINER
            </button>
            <button
              type="button"
              id="viva-next-btn"
              onClick={handleNext}
              disabled={currentIdx === questions.length - 1}
              className={`p-2.5 rounded-none border text-xs font-mono flex items-center gap-1 transition-colors ${
                currentIdx === questions.length - 1
                  ? "border-bg text-muted/30 cursor-not-allowed"
                  : "border-border text-muted hover:text-ink hover:bg-bg cursor-pointer"
              }`}
            >
              NEXT EXAMINER
            </button>
          </div>

          <button
            type="button"
            id="viva-defend-btn"
            onClick={handleDefend}
            disabled={isEvaluating || currentAnswer.trim().length === 0}
            className={`px-6 py-3 rounded-none text-xs font-mono font-bold uppercase tracking-widest transition-all duration-300 border ${
              isEvaluating
                ? "bg-bg text-muted border-border cursor-not-allowed animate-pulse"
                : currentAnswer.trim().length === 0
                ? "bg-bg/45 text-muted/50 border-border cursor-not-allowed"
                : "bg-accent text-bg border-accent hover:bg-accent/90 cursor-pointer"
            }`}
          >
            {isEvaluating ? "Evaluating defense..." : "Deliver Defense Arguments"}
          </button>
        </div>

        {/* FEEDBACK BOARD CRITIQUE */}
        {activeFeedback && (
          <div className="p-5 bg-card-bg border border-border rounded-none flex flex-col gap-4 mt-4 animate-fade-in" id="viva-feedback-panel">
            <div className="flex justify-between items-center border-b border-border pb-2.5">
              <span className="text-[10px] font-mono text-accent font-extrabold uppercase tracking-widest">
                EVALUATION SUMMARY
              </span>
              <span className={`text-sm font-mono font-bold uppercase ${
                activeFeedback.overallScore >= 80 ? "text-success" : activeFeedback.overallScore >= 60 ? "text-accent" : "text-danger"
              }`}>
                Verdict: {activeFeedback.overallScore}% ({activeFeedback.overallScore >= 80 ? "EXCELLENT" : activeFeedback.overallScore >= 60 ? "SATISFACTORY" : "RECONSTRUCTION REQUIRED"})
              </span>
            </div>

            <div className="text-sm text-ink font-sans leading-relaxed">
              <p>{activeFeedback.critique}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="bg-bg/40 p-4 rounded-none border border-border/50">
                <span className="font-mono text-success font-bold uppercase tracking-widest text-[10px] block mb-2">
                  ✓ Strong Claims
                </span>
                <ul className="list-disc list-inside space-y-1 text-ink leading-relaxed">
                  {activeFeedback.strongPoints.map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-bg/40 p-4 rounded-none border border-border/50">
                <span className="font-mono text-danger font-bold uppercase tracking-widest text-[10px] block mb-2">
                  ⚠ Unresolved Gaps
                </span>
                <ul className="list-disc list-inside space-y-1 text-ink leading-relaxed">
                  {activeFeedback.weakPoints.map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-bg text-ink text-xs font-mono rounded-none border border-border/50 flex items-start gap-2">
              <AlertOctagon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <strong className="text-ink font-mono text-[11px] uppercase tracking-wider block mb-1">Re-Study Instruction:</strong> {activeFeedback.recommendedReading}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 3. Footer Bar / Progress Info */}
      <div className="px-6 py-4 bg-bg border-t border-border flex justify-between items-center text-xs font-mono text-muted">
        <span>Continuous Interrogation Loop</span>
        <div className="flex gap-1">
          {questions.map((q, idx) => {
            const hasAnswer = answers[q.id]?.feedback !== null;
            return (
              <div
                key={q.id}
                className={`w-4 h-1 rounded-none ${
                  idx === currentIdx
                    ? "bg-accent"
                    : hasAnswer
                    ? "bg-success"
                    : "bg-border/60"
                }`}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
