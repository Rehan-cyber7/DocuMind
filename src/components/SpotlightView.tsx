/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, BookOpen, AlertTriangle, Eye, ArrowLeft, ArrowRight, HelpCircle, Sparkles } from "lucide-react";
import { VivaQuestion, AnswerFeedback } from "../types";
import SpeechRecorder from "./SpeechRecorder";

interface SpotlightViewProps {
  question: VivaQuestion;
  index: number;
  totalQuestions: number;
  studentAnswer: string;
  onAnswerChange: (text: string) => void;
  onSubmitAnswer: () => void;
  isEvaluating: boolean;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  feedback: AnswerFeedback | null;
}

export default function SpotlightView({
  question,
  index,
  totalQuestions,
  studentAnswer,
  onAnswerChange,
  onSubmitAnswer,
  isEvaluating,
  onNext,
  onPrev,
  onClose,
  feedback,
}: SpotlightViewProps) {
  const [isListening, setIsListening] = useState(false);
  const [forceRevealContext, setForceRevealContext] = useState(false);

  // Determine if context should be unblurred
  // Rules say: "You have to speak your answer before you see the highlighted text."
  // So, if studentAnswer exists and has significant words (e.g. > 10 characters) OR forceRevealContext is true OR feedback has been generated, we show it clearly.
  const hasAnsweredSomething = studentAnswer.trim().length > 15;
  const isContextRevealed = hasAnsweredSomething || forceRevealContext || feedback !== null;

  return (
    <div className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-sm overflow-y-auto flex justify-center items-start p-4 py-8 md:p-12 font-sans" id="spotlight-focus-screen">
      <div className="w-full max-w-3xl bg-card-bg border border-border rounded-none shadow-2xl relative overflow-hidden flex flex-col my-auto">
        
        {/* Spotlight Beam Header */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-accent"></div>

        {/* Modal Controls */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-bg text-accent border border-border px-2.5 py-0.5 rounded-none uppercase font-bold tracking-widest">
              Spotlight Examination
            </span>
            <span className="text-xs font-mono text-muted">
              Card {index + 1} of {totalQuestions}
            </span>
          </div>
          <button
            type="button"
            id="close-spotlight-btn"
            onClick={onClose}
            className="p-1 rounded-none text-muted hover:text-ink hover:bg-bg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-8">
          
          {/* Socratic Question Banner */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-mono text-accent font-semibold flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> QUESTION TARGET
            </div>
            <h2 className="text-lg md:text-xl font-serif italic text-ink tracking-tight leading-relaxed">
              {question.text}
            </h2>
            <p className="text-xs text-muted font-mono italic mt-1 bg-bg/50 p-3 rounded-none border-l-2 border-accent">
              <strong>Rationale:</strong> {question.rationale}
            </p>
          </div>

          {/* THE "SPOTLIGHT" BLURRED REFERENCE CONTEXT (Recall-Force) */}
          <div className="bg-bg/50 p-5 rounded-none border border-border relative overflow-hidden" id="spotlight-recall-box">
            <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
              <span className="text-xs font-mono text-muted flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Source Document Excerpt
              </span>
              
              {!isContextRevealed && (
                <button
                  type="button"
                  id="reveal-context-btn"
                  onClick={() => setForceRevealContext(true)}
                  className="text-[9px] font-mono text-accent hover:text-accent/80 flex items-center gap-1 border border-accent/40 px-2 py-0.5 rounded-none cursor-pointer transition-colors"
                >
                  <Eye className="w-3 h-3" /> Peak Excerpt
                </button>
              )}
            </div>

            {/* Blurred area */}
            <div className="relative">
              <p
                className={`text-sm text-ink font-sans leading-relaxed select-none transition-all duration-700 ${
                  isContextRevealed ? "blur-none opacity-100" : "blur-md opacity-25 pointer-events-none select-none"
                }`}
              >
                {question.referenceText}
              </p>

              {!isContextRevealed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-bg/10 rounded-none">
                  <div className="p-2 bg-accent/5 border border-accent/20 rounded-none mb-1">
                    <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                  </div>
                  <h4 className="text-xs font-bold text-accent font-mono uppercase tracking-widest">
                    Recall Active
                  </h4>
                  <p className="text-[10px] text-muted max-w-sm mt-1">
                    Document context is locked to force active mental recall. Speak or type your answer draft to dissolve the fog.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Speech Recorder & Input area */}
          <div className="border-t border-stone-800/40 pt-6">
            <SpeechRecorder
              value={studentAnswer}
              onChange={onAnswerChange}
              isListening={isListening}
              setIsListening={setIsListening}
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2 border-t border-border pt-6">
            <div className="flex gap-2 w-full md:w-auto">
              <button
                type="button"
                id="prev-btn"
                onClick={onPrev}
                className="flex-1 md:flex-none cursor-pointer border border-border text-muted p-2.5 rounded-none font-mono text-xs uppercase tracking-wider hover:text-ink hover:bg-bg transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
              <button
                type="button"
                id="next-btn"
                onClick={onNext}
                className="flex-1 md:flex-none cursor-pointer border border-border text-muted p-2.5 rounded-none font-mono text-xs uppercase tracking-wider hover:text-ink hover:bg-bg transition-colors flex items-center justify-center gap-1.5"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              id="submit-defense-btn"
              onClick={onSubmitAnswer}
              disabled={isEvaluating || studentAnswer.trim().length === 0}
              className={`w-full md:w-auto px-6 py-3 rounded-none text-xs font-mono font-bold tracking-widest uppercase cursor-pointer transition-all duration-300 border ${
                isEvaluating
                  ? "bg-bg text-muted border-border cursor-not-allowed animate-pulse"
                  : studentAnswer.trim().length === 0
                  ? "bg-bg/45 text-muted/50 border-border cursor-not-allowed"
                  : "bg-accent text-bg border-accent hover:bg-accent/90"
              }`}
            >
              {isEvaluating ? "Evaluating Defense Quality..." : "Submit Answer to Viva Board"}
            </button>
          </div>

          {/* Socratic Critique display area */}
          {feedback && (
            <div className="mt-4 p-6 bg-bg border border-border rounded-none flex flex-col gap-4" id="spotlight-feedback-panel">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-[10px] font-mono text-accent font-extrabold tracking-widest uppercase">
                  Board Examination Critique
                </span>
                <span className="text-xl font-bold text-accent font-mono">
                  Score: {feedback.overallScore}%
                </span>
              </div>

              {/* Individual Metric scores */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-card-bg/60 p-2.5 rounded-none border border-border">
                  <span className="text-[10px] text-muted font-mono uppercase block">Relevance</span>
                  <span className={`text-sm font-bold font-mono ${feedback.relevanceScore >= 80 ? "text-success" : feedback.relevanceScore >= 60 ? "text-accent" : "text-danger"}`}>
                    {feedback.relevanceScore}%
                  </span>
                </div>
                <div className="bg-card-bg/60 p-2.5 rounded-none border border-border">
                  <span className="text-[10px] text-muted font-mono uppercase block">Specificity</span>
                  <span className={`text-sm font-bold font-mono ${feedback.specificityScore >= 80 ? "text-success" : feedback.specificityScore >= 60 ? "text-accent" : "text-danger"}`}>
                    {feedback.specificityScore}%
                  </span>
                </div>
                <div className="bg-card-bg/60 p-2.5 rounded-none border border-border">
                  <span className="text-[10px] text-muted font-mono uppercase block">Clarity</span>
                  <span className={`text-sm font-bold font-mono ${feedback.clarityScore >= 80 ? "text-success" : feedback.clarityScore >= 60 ? "text-accent" : "text-danger"}`}>
                    {feedback.clarityScore}%
                  </span>
                </div>
              </div>

              {/* Socratic Text */}
              <div className="text-sm text-ink leading-relaxed font-sans">
                <p>{feedback.critique}</p>
              </div>

              {/* Strengths & Weaknesses lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="bg-card-bg/50 p-4 rounded-none border border-border">
                  <span className="font-mono text-success font-bold uppercase tracking-widest text-[10px] block mb-2">
                    ✓ Strong Arguments
                  </span>
                  <ul className="list-disc list-inside space-y-1.5 text-ink leading-relaxed">
                    {feedback.strongPoints.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card-bg/50 p-4 rounded-none border border-border">
                  <span className="font-mono text-danger font-bold uppercase tracking-widest text-[10px] block mb-2">
                    ⚠ Gaps / Omissions
                  </span>
                  <ul className="list-disc list-inside space-y-1.5 text-ink leading-relaxed">
                    {feedback.weakPoints.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable suggestions */}
              <div className="p-4 bg-card-bg/50 rounded-none border border-border text-xs">
                <span className="font-mono text-accent font-bold uppercase tracking-widest block mb-2">
                  ⚔ Strategic Revision Plan
                </span>
                <ul className="list-decimal list-inside space-y-1.5 text-ink leading-relaxed font-mono text-[11px]">
                  {feedback.suggestions.map((sug, idx) => (
                    <li key={idx}>{sug}</li>
                  ))}
                </ul>
              </div>

              {/* Recommended reading */}
              <div className="p-4 bg-bg border border-border text-ink text-xs font-sans leading-relaxed flex items-start gap-2 rounded-none">
                <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong className="text-ink font-mono text-[11px] uppercase tracking-wider block mb-1">Recommended Study Reference:</strong> {feedback.recommendedReading}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
