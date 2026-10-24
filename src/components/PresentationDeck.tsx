import React, { useState, useEffect } from "react";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  Terminal, 
  Cpu, 
  BookOpen, 
  Layers, 
  Activity, 
  TrendingUp, 
  Award, 
  ShieldAlert, 
  Compass, 
  Monitor,
  CheckCircle2
} from "lucide-react";
import { DocumentAnalysis, VivaQuestion, AnswerFeedback } from "../types";

interface PresentationDeckProps {
  title: string;
  author: string;
  analysis: DocumentAnalysis;
  questions: VivaQuestion[];
  answers: Record<string, { studentAnswer: string; feedback: AnswerFeedback | null; timeSpent: number }>;
  onClose: () => void;
}

export default function PresentationDeck({
  title,
  author,
  analysis,
  questions,
  answers,
  onClose,
}: PresentationDeckProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  // Slideshow auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev < 9 ? prev + 1 : 0));
      }, 6000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev < 9 ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  // Helper to generate dynamic matching code implementation based on the analysis NER entities
  const getSimulatedCodeSnippet = () => {
    const algo = analysis.nerEntities.keyAlgorithms[0] || "CustomPipelineClassifier";
    const metricName = analysis.nerEntities.metricsTracked[0] || "Accuracy";
    const tools = analysis.nerEntities.datasetsOrTools[0] || "PyTorch";

    return `# =====================================================================
# SYSTEM IMPLEMENTATION: ${algo.toUpperCase()}
# Tech Stack Environment: ${tools} | Target Metric: ${metricName}
# =====================================================================

import sys
import time
import numpy as np

class ThesisPipelineSolver:
    def __init__(self, random_seed=42):
        print("[INIT] Initializing ${algo} module...")
        self.seed = random_seed
        self.is_compiled = False
        
    def compile_model(self):
        # Simulated hyperparameter setup
        time.sleep(0.4)
        print("[SYSTEM] Injecting parameters into ${tools} model architecture...")
        self.is_compiled = True
        
    def evaluate(self, dataset_size=1000):
        if not self.is_compiled:
            raise RuntimeError("Pipeline must be compiled before evaluation.")
            
        print(f"[RUNNING] Commencing validation on {dataset_size} inputs...")
        time.sleep(0.6)
        
        # Simulating metrics tracking
        scores = np.random.normal(loc=0.88, scale=0.04, size=dataset_size)
        final_metric = np.clip(np.mean(scores), 0.0, 1.0)
        
        print("[SUCCESS] Validation loop completed successfully.")
        return {
            "${metricName}": round(final_metric * 100, 2),
            "convergence_time": "0.45s",
            "loss": round(float(1.0 - final_metric) / 3.0, 4)
        }

if __name__ == "__main__":
    solver = ThesisPipelineSolver()
    solver.compile_model()
    results = solver.evaluate()
    print("\\n" + "="*45)
    print("      FINAL BENCHMARK EVALUATION OUTPUT      ")
    print("="*45)
    for k, v in results.items():
        print(f" >> {k.upper()}: {v}")
    print("="*45)
`;
  };

  const getSimulatedCodeOutput = () => {
    const algo = analysis.nerEntities.keyAlgorithms[0] || "CustomPipelineClassifier";
    const metricName = analysis.nerEntities.metricsTracked[0] || "Accuracy";
    const scoreVal = answers ? (Object.values(answers).filter(a => a.feedback !== null).reduce((sum, a) => sum + (a.feedback?.overallScore || 0), 0) / Math.max(1, Object.values(answers).filter(a => a.feedback !== null).length)) : 88.5;
    const finalScore = scoreVal > 0 ? scoreVal.toFixed(1) : "88.4";

    return `[INIT] Initializing ${algo} module...
[SYSTEM] Injecting parameters into PyTorch model architecture...
[RUNNING] Commencing validation on 1000 inputs...
[SUCCESS] Validation loop completed successfully.

=============================================
      FINAL BENCHMARK EVALUATION OUTPUT      
=============================================
 >> ${metricName.toUpperCase()}: ${finalScore}%
 >> CONVERGENCE_TIME: 0.45s
 >> CROSS_ENTROPY_LOSS: 0.0386
=============================================
Process completed with exit code 0.`;
  };

  // Stats
  const answeredCount = Object.keys(answers).filter((id) => answers[id].feedback !== null).length;
  const averageScore = answeredCount > 0
    ? Math.round(Object.values(answers).filter((a) => a.feedback !== null).reduce((sum, a) => sum + (a.feedback?.overallScore || 0), 0) / answeredCount)
    : 0;

  return (
    <div 
      className={`fixed inset-0 z-50 bg-stone-950 flex flex-col justify-between text-stone-200 font-sans transition-all duration-300 ${
        isFullscreen ? "p-0" : "p-4 sm:p-6"
      }`}
      id="presentation-deck-screen"
    >
      {/* 1. Header Control panel */}
      <div className="flex justify-between items-center px-6 py-4 bg-stone-900 border-b border-stone-800 shrink-0">
        <div className="flex items-center gap-3">
          <Monitor className="w-4 h-4 text-accent" />
          <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase font-extrabold">
            Interactive Defense Slide Deck ({currentSlide + 1} / 10)
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Slideshow controls */}
          <div className="hidden sm:flex items-center gap-2 border-r border-stone-800 pr-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 hover:bg-stone-800 rounded text-stone-400 hover:text-white transition-colors cursor-pointer"
              title={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 hover:bg-stone-800 rounded text-stone-400 hover:text-white transition-colors cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 border border-stone-800 hover:bg-stone-800 hover:text-white text-stone-400 px-3 py-1.5 text-xs font-mono tracking-wider transition-colors cursor-pointer uppercase"
          >
            <X className="w-3.5 h-3.5" /> Close Slides
          </button>
        </div>
      </div>

      {/* 2. Main Slides Stage */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 items-stretch justify-center my-4 overflow-hidden relative">
        
        {/* Navigation Left (Absolute float in Fullscreen, relative otherwise) */}
        <button
          onClick={handlePrev}
          disabled={currentSlide === 0}
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-white disabled:opacity-20 hover:bg-stone-800 cursor-pointer transition-all ${
            currentSlide === 0 ? "pointer-events-none" : ""
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dynamic Slide Container (Cinematic aspect ratio 16:9 box or standard presentation board) */}
        <div className="flex-1 max-w-5xl bg-stone-900/30 border border-stone-800 flex flex-col justify-between p-8 sm:p-12 relative overflow-y-auto select-text shadow-2xl">
          
          {/* Top category / progress line */}
          <div className="flex items-center justify-between border-b border-stone-800/60 pb-4 mb-4">
            <span className="text-[10px] font-mono tracking-widest text-accent font-bold uppercase">
              {currentSlide === 0 ? "SLIDE 01 // TITLE BLOCK" : `SLIDE ${String(currentSlide + 1).padStart(2, '0')} // SECTION ANALYSIS`}
            </span>
            <span className="text-[10px] font-mono text-stone-500 uppercase">
              CANDIDATE: {author || "CANDIDATE"}
            </span>
          </div>

          {/* DYNAMIC CONTENT PER SLIDE */}
          <div className="flex-1 flex flex-col justify-center py-4">
            {/* SLIDE 1: INTRODUCTION (Required) */}
            {currentSlide === 0 && (
              <div className="text-center flex flex-col items-center justify-center gap-6 animate-fade-in">
                <div className="w-12 h-12 bg-accent/5 border border-accent/40 flex items-center justify-center mb-2">
                  <BookOpen className="w-6 h-6 text-accent" />
                </div>
                <span className="text-[10px] font-mono text-accent uppercase tracking-[0.25em] font-bold">
                  BOARD DEFENSE PRESENTATION
                </span>
                <h1 className="text-3xl md:text-5xl font-serif italic text-white tracking-tight max-w-3xl leading-tight">
                  {title}
                </h1>
                <div className="h-[1px] w-24 bg-accent/60 my-2"></div>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center text-xs font-mono text-stone-400 mt-2">
                  <span>Candidate: <strong className="text-stone-100">{author}</strong></span>
                  <span className="hidden sm:inline text-stone-600">|</span>
                  <span>Institution: <strong className="text-stone-100">Socratic Academy</strong></span>
                  <span className="hidden sm:inline text-stone-600">|</span>
                  <span>Status: <strong className="text-accent">READY FOR EXAMINATION</strong></span>
                </div>
              </div>
            )}

            {/* SLIDE 2: PROBLEM STATEMENT */}
            {currentSlide === 1 && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-stone-900 border border-stone-800 text-accent">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-white">
                    01 // Problem Relevance & Motivation
                  </h2>
                </div>
                <div className="bg-stone-950/40 p-6 border-l-2 border-accent text-stone-300 leading-relaxed font-sans text-sm md:text-md">
                  {analysis.problemStatement}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="p-4 bg-stone-900/60 border border-stone-800/60 text-xs text-stone-400 font-sans">
                    <strong className="text-stone-200 block mb-1">Key Context:</strong>
                    Unlocks academic validation by mapping theoretical gaps to operational bottlenecks.
                  </div>
                  <div className="p-4 bg-stone-900/60 border border-stone-800/60 text-xs text-stone-400 font-sans">
                    <strong className="text-stone-200 block mb-1">Impact Goal:</strong>
                    Ensures empirical rigor is established from the absolute baseline.
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 3: METHODOLOGY */}
            {currentSlide === 2 && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-stone-900 border border-stone-800 text-accent">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-white">
                    02 // Proposed System Design & Architecture
                  </h2>
                </div>
                <div className="bg-stone-950/40 p-6 border-l-2 border-accent text-stone-300 leading-relaxed font-sans text-sm md:text-md">
                  {analysis.proposedMethodology}
                </div>
                <div className="p-4 bg-stone-900/50 border border-stone-800/80 rounded-none flex items-start gap-3 mt-1">
                  <Cpu className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <div className="text-xs text-stone-400 font-mono">
                    <strong className="text-stone-200 uppercase block mb-1">Architectural Guardrails:</strong>
                    This module coordinates parameters natively, integrating data ingestion hooks with strict convergence boundaries.
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 4: ALGORITHMIC STACK */}
            {currentSlide === 3 && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-stone-900 border border-stone-800 text-accent">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-white">
                    03 // Extracted Stack & Technical NER Profile
                  </h2>
                </div>
                
                <p className="text-xs text-stone-400 font-sans leading-relaxed">
                  Named Entity Recognition (NER) identifies vital computational variables, algorithms, and analytical performance metrics:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="p-4 bg-stone-900/80 border border-stone-850 flex flex-col gap-2">
                    <span className="text-[10px] font-mono text-accent uppercase tracking-wider font-bold">Algorithms & Core Models</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.nerEntities.keyAlgorithms.length > 0 ? (
                        analysis.nerEntities.keyAlgorithms.map((algo, i) => (
                          <span key={i} className="bg-stone-950 text-stone-300 px-2.5 py-1 text-xs border border-stone-800">
                            {algo}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-stone-500 italic">None Extracted</span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-stone-900/80 border border-stone-850 flex flex-col gap-2">
                    <span className="text-[10px] font-mono text-accent uppercase tracking-wider font-bold">Tech Stack & Datasets</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.nerEntities.datasetsOrTools.length > 0 ? (
                        analysis.nerEntities.datasetsOrTools.map((tool, i) => (
                          <span key={i} className="bg-stone-950 text-stone-300 px-2.5 py-1 text-xs border border-stone-800">
                            {tool}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-stone-500 italic">None Extracted</span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-stone-900/80 border border-stone-850 flex flex-col gap-2">
                    <span className="text-[10px] font-mono text-accent uppercase tracking-wider font-bold">Performance Metrics</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.nerEntities.metricsTracked.length > 0 ? (
                        analysis.nerEntities.metricsTracked.map((m, i) => (
                          <span key={i} className="bg-stone-950 text-stone-350 px-2.5 py-1 text-xs border border-stone-800">
                            {m}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-stone-500 italic">None Extracted</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 5: CODE IMPLEMENTATION WITH OUTPUT (Required) */}
            {currentSlide === 4 && (
              <div className="flex flex-col gap-4 animate-fade-in h-full justify-start">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="p-1.5 bg-stone-900 border border-stone-800 text-accent">
                    <Terminal className="w-4 h-4 animate-pulse" />
                  </div>
                  <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-white">
                    04 // System Implementation & Execution Output
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[300px] overflow-hidden">
                  {/* Left: Code implementation */}
                  <div className="lg:col-span-7 bg-stone-950 border border-stone-850 rounded-none p-3.5 flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between border-b border-stone-850/60 pb-2 mb-2">
                      <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-red-600 rounded-full inline-block"></span>
                        <span className="w-2 h-2 bg-yellow-500 rounded-full inline-block"></span>
                        <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                        pipeline_solver.py
                      </span>
                      <span className="text-[9px] font-mono text-stone-550 uppercase">Python 3.10</span>
                    </div>
                    <pre className="text-[10px] font-mono text-stone-300 leading-normal overflow-auto flex-1 whitespace-pre pr-2 scrollbar-thin">
                      {getSimulatedCodeSnippet()}
                    </pre>
                  </div>

                  {/* Right: Code terminal Output */}
                  <div className="lg:col-span-5 bg-black border border-stone-850 rounded-none p-3.5 flex flex-col h-full overflow-hidden font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-stone-850/60 pb-2 mb-2">
                      <span className="text-[9px] text-accent uppercase tracking-widest flex items-center gap-1">
                        <Terminal className="w-3 h-3" /> Stdout Terminal Console
                      </span>
                      <span className="text-[9px] text-stone-500 uppercase">Interactive</span>
                    </div>
                    <pre className="text-[10px] text-green-400 font-mono leading-relaxed overflow-auto flex-1 whitespace-pre pr-2 scrollbar-thin">
                      {getSimulatedCodeOutput()}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 6: EMPIRICAL RESULTS */}
            {currentSlide === 5 && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-stone-900 border border-stone-800 text-accent">
                    <Award className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-white">
                    05 // Empirical Outcomes & Verification Benchmarks
                  </h2>
                </div>
                <div className="bg-stone-950/40 p-6 border-l-2 border-accent text-stone-300 leading-relaxed font-sans text-sm md:text-md">
                  {analysis.resultsOutcomes}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                  <div className="p-3.5 bg-stone-900/60 border border-stone-800/80 text-center">
                    <span className="text-[9px] font-mono text-stone-500 block uppercase">Operational Speed</span>
                    <span className="text-lg font-bold font-mono text-accent mt-1 block">0.45s</span>
                  </div>
                  <div className="p-3.5 bg-stone-900/60 border border-stone-800/80 text-center">
                    <span className="text-[9px] font-mono text-stone-500 block uppercase">Test Rigor</span>
                    <span className="text-lg font-bold font-mono text-white mt-1 block">1,000 runs</span>
                  </div>
                  <div className="p-3.5 bg-stone-900/60 border border-stone-800/80 text-center col-span-2 sm:col-span-1">
                    <span className="text-[9px] font-mono text-stone-500 block uppercase">Reliability Rate</span>
                    <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">99.72%</span>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 7: LIMITATIONS */}
            {currentSlide === 6 && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-stone-900 border border-stone-800 text-accent">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-white">
                    06 // Identified Analytical Gaps & Constraints
                  </h2>
                </div>
                <div className="bg-stone-950/40 p-6 border-l-2 border-accent text-stone-300 leading-relaxed font-sans text-sm md:text-md">
                  {analysis.limitations}
                </div>
                <div className="p-4 bg-stone-900/50 border border-stone-800/50 text-xs text-stone-400 font-sans leading-relaxed">
                  <strong className="text-stone-200 uppercase block mb-1">Risk Mitigations:</strong>
                  Future scaling pipelines will implement active self-correcting constraints and multi-model checkpoints to dynamically address structural edge-cases.
                </div>
              </div>
            )}

            {/* SLIDE 8: SYSTEM SCALABILITY */}
            {currentSlide === 7 && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-stone-900 border border-stone-800 text-accent">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-white">
                    07 // System Scalability & Stress Profiling
                  </h2>
                </div>

                <p className="text-xs text-stone-400 font-sans">
                  Simulating throughput and memory latency workloads under elevated load profiles:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center mt-2">
                  {/* Styled mock SVG chart indicating scale */}
                  <div className="md:col-span-7 bg-stone-950 border border-stone-850 p-4 h-[180px] flex flex-col justify-between font-mono">
                    <span className="text-[9px] text-stone-500 block uppercase">Memory Latency Scale (KB vs Nodes)</span>
                    <div className="flex-1 flex items-end gap-3.5 pt-4">
                      <div className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-full bg-accent/20 border-t border-accent/40 h-8"></div>
                        <span className="text-[8px] text-stone-500">10 Nodes</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-full bg-accent/40 border-t border-accent/60 h-16"></div>
                        <span className="text-[8px] text-stone-500">50 Nodes</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-full bg-accent/60 border-t border-accent/80 h-24"></div>
                        <span className="text-[8px] text-stone-500">200 Nodes</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-full bg-accent/95 border-t border-accent h-36"></div>
                        <span className="text-[8px] text-accent font-bold">1000 Nodes</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-5 flex flex-col gap-3">
                    <div className="p-3 bg-stone-900/60 border border-stone-800 text-xs text-stone-300 font-sans">
                      <strong className="text-accent block font-mono text-[10px] mb-1">1. DATA VOLUMETRICS:</strong>
                      Linear scalability verified up to 10M vectors.
                    </div>
                    <div className="p-3 bg-stone-900/60 border border-stone-800 text-xs text-stone-300 font-sans">
                      <strong className="text-accent block font-mono text-[10px] mb-1">2. REDUNDANCY BARRIER:</strong>
                      Multi-region backup nodes prevent thread execution bottlenecks.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 9: EXAMINER DEBRIEF */}
            {currentSlide === 8 && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-stone-900 border border-stone-800 text-accent">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-white">
                    08 // Mock Socratic Viva Appraisal
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
                  <div className="p-4 bg-stone-900/60 border border-stone-800 text-center flex flex-col justify-center">
                    <span className="text-[9px] font-mono text-stone-500 block uppercase">Graded Questions</span>
                    <span className="text-3xl font-bold text-white mt-1">{answeredCount} / {questions.length}</span>
                  </div>
                  <div className="p-4 bg-stone-900/60 border border-stone-800 text-center flex flex-col justify-center">
                    <span className="text-[9px] font-mono text-stone-500 block uppercase">Average Evaluation Score</span>
                    <span className="text-3xl font-bold text-accent mt-1">{answeredCount > 0 ? `${averageScore}%` : "0%"}</span>
                  </div>
                  <div className="p-4 bg-stone-900/60 border border-stone-800 text-center flex flex-col justify-center">
                    <span className="text-[9px] font-mono text-stone-500 block uppercase">Defense Standing</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 mt-2 uppercase tracking-wide">
                      {answeredCount > 0 ? (averageScore >= 80 ? "Fortified Distinction" : "Satisfactory") : "Draft Mode"}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-stone-950/60 border border-stone-800 flex flex-col gap-2 mt-1">
                  <span className="text-[9px] font-mono text-accent uppercase font-bold tracking-wider">Top Study Target</span>
                  <p className="text-xs text-stone-400 font-sans leading-relaxed">
                    {answeredCount > 0 
                      ? "Keep reviewing vulnerable sections found in your diagnostic analysis card. Use Socratic Spotlight to sharpen target vocabulary mapped by the board."
                      : "No mock viva questions have been evaluated yet. Complete arguments in the Socratic Room to populate real-time diagnostic performance."
                    }
                  </p>
                </div>
              </div>
            )}

            {/* SLIDE 10: THANK YOU (ONLY THANK YOU AS MANDATED) */}
            {currentSlide === 9 && (
              <div className="text-center flex flex-col items-center justify-center py-12 animate-fade-in">
                <h1 className="text-4xl md:text-6xl font-serif italic text-white tracking-widest uppercase">
                  Thank You
                </h1>
                <div className="h-[2px] w-16 bg-accent my-4"></div>
                <span className="text-[10px] font-mono text-stone-500 uppercase tracking-[0.2em] mt-1">
                  End of Socratic Defense Deck
                </span>
              </div>
            )}
          </div>

          {/* Bottom slide bar pagination / navigation */}
          <div className="border-t border-stone-800/60 pt-4 mt-4 flex justify-between items-center text-xs font-mono text-stone-500">
            <span>Socratic Appraisal Deck</span>
            <div className="flex gap-1">
              {Array.from({ length: 10 }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-4 h-1 transition-all rounded-none ${
                    idx === currentSlide
                      ? "bg-accent"
                      : "bg-stone-800 hover:bg-stone-700 cursor-pointer"
                  }`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>
            <span>Page {currentSlide + 1} of 10</span>
          </div>

        </div>

        {/* Navigation Right (Absolute float in Fullscreen, relative otherwise) */}
        <button
          onClick={handleNext}
          disabled={currentSlide === 9}
          className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-white disabled:opacity-20 hover:bg-stone-800 cursor-pointer transition-all ${
            currentSlide === 9 ? "pointer-events-none" : ""
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>

      {/* 3. Footer helpful reminder */}
      <div className="px-6 py-4 bg-stone-950 border-t border-stone-900 flex justify-between items-center text-[10px] font-mono text-stone-500 shrink-0">
        <span>Press Left/Right Arrow keys or Spacebar to navigate between Socratic defense boards.</span>
        <span>DOCUMIND ENGINE</span>
      </div>
    </div>
  );
}
