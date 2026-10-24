/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { FolderUp, HelpCircle, FileText, Upload, AlertCircle, Loader2, Sparkles, BookOpen, Clock, BrainCircuit, History } from "lucide-react";
import { DocumentAnalysis, VivaQuestion, AnswerFeedback, SavedSession } from "./types";
import { SAMPLE_REPORTS, SampleReport } from "./data/mockReports";
import CaseFileDashboard from "./components/CaseFileDashboard";
import SpotlightView from "./components/SpotlightView";
import VivaRoom from "./components/VivaRoom";
import WeaknessHeatmap from "./components/WeaknessHeatmap";
import PresentationDeck from "./components/PresentationDeck";

export default function App() {
  // Navigation & Screens
  const [activeScreen, setActiveScreen] = useState<"upload" | "dashboard" | "viva" | "results">("upload");
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number | null>(null);
  const [showPresentation, setShowPresentation] = useState(false);

  // Document & Processing States
  const [documentTitle, setDocumentTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [questions, setQuestions] = useState<VivaQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, { studentAnswer: string; feedback: AnswerFeedback | null; timeSpent: number }>>({});

  // Loading, Errors & Logs
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);

  // Saved History sessions
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  // Load history on mount
  useEffect(() => {
    const cached = localStorage.getItem("documind_sessions");
    if (cached) {
      try {
        setSavedSessions(JSON.parse(cached));
      } catch (err) {
        console.error("Failed to load cached sessions", err);
      }
    }
  }, []);

  // Save sessions to history helper
  const saveSessionToHistory = (newSession: SavedSession) => {
    const updated = [newSession, ...savedSessions.filter((s) => s.id !== newSession.id)].slice(0, 5);
    setSavedSessions(updated);
    localStorage.setItem("documind_sessions", JSON.stringify(updated));
  };

  // Progress Loading Steps Animation
  useEffect(() => {
    if (!isAnalyzing) return;
    const steps = [
      "De-chunking text structure...",
      "Isolating problem statement parameters...",
      "Running Named Entity Recognition (NER)...",
      "Identifying algorithmic variables and tools...",
      "Mapping outcomes and empirical datasets...",
      "Structuring 10 custom Socratic interrogation prompts...",
      "Completing thesis profile construction..."
    ];
    setAnalysisStep(0);
    const interval = setInterval(() => {
      setAnalysisStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Handle Sample Report selection
  const handleLoadSample = (sample: SampleReport) => {
    setDocumentTitle(sample.title);
    setAuthorName(sample.author);
    setDocumentText(sample.text);
    setPdfBase64(null);
    setError(null);
  };

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processFile = (file: File) => {
    if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPdfBase64(base64);
        setDocumentTitle(file.name.replace(/\.pdf$/i, ""));
        setAuthorName("Candidate");
        setDocumentText(""); // Rely on multi-modal PDF processing
        setError(null);
      };
      reader.readAsDataURL(file);
    } else if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = () => {
        setDocumentText(reader.result as string);
        setDocumentTitle(file.name.replace(/\.txt$/i, ""));
        setAuthorName("Candidate");
        setPdfBase64(null);
        setError(null);
      };
      reader.readAsText(file);
    } else {
      setError("Supported formats: .pdf or .txt file only. Use 'Thesis Defender' text block below for other formats.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Trigger DocuMind Auto-Analysis (NER + Socratic synthesis)
  const handleAnalyzeDocument = async () => {
    if (!pdfBase64 && !documentText.trim()) {
      setError("Please paste your thesis report text, upload a PDF file, or select a pre-loaded sample above.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfBase64,
          documentText: documentText || undefined,
          fileName: documentTitle,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.analysis || !data.questions) {
        throw new Error("Invalid response format from server.");
      }

      setAnalysis(data.analysis);
      setQuestions(data.questions);
      
      // Initialize empty answers map
      const initialAnswers: Record<string, { studentAnswer: string; feedback: AnswerFeedback | null; timeSpent: number }> = {};
      data.questions.forEach((q: VivaQuestion) => {
        initialAnswers[q.id] = { studentAnswer: "", feedback: null, timeSpent: 0 };
      });
      setAnswers(initialAnswers);
      
      setActiveScreen("dashboard");
    } catch (err: any) {
      console.error("Analysis failure", err);
      setError(err.message || "A pipeline error occurred while analyzing the report. Please try again or use the text board.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger Socratic Appraisal Evaluation on Student Answer
  const handleEvaluateAnswer = async (questionId: string, studentAnswer: string, timeSpent: number) => {
    if (!studentAnswer.trim()) return;

    setIsEvaluating(true);
    setError(null);

    const activeQuestion = questions.find((q) => q.id === questionId);
    if (!activeQuestion) return;

    try {
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: activeQuestion,
          studentAnswer,
          documentAnalysisSummary: analysis,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      const feedbackData: AnswerFeedback = await response.json();

      // Update state
      const updatedAnswers = {
        ...answers,
        [questionId]: {
          studentAnswer,
          feedback: feedbackData,
          timeSpent,
        },
      };

      setAnswers(updatedAnswers);

      // Persist session state in history if at least one is graded
      const answeredList = Object.values(updatedAnswers).filter((a: any) => a.feedback !== null) as any[];
      const sessionRating = answeredList.length > 0
        ? Math.round(answeredList.reduce((sum, a) => sum + (a.feedback?.overallScore || 0), 0) / answeredList.length)
        : 0;

      const saved: SavedSession = {
        id: documentTitle + "-" + Date.now(),
        date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        documentTitle,
        documentText,
        analysis: analysis!,
        questions,
        answers: updatedAnswers,
        overallRating: sessionRating,
      };

      saveSessionToHistory(saved);

    } catch (err: any) {
      console.error("Evaluation failure", err);
      setError(err.message || "An error occurred while evaluating your answer. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Load old historical session
  const handleLoadSavedSession = (sess: SavedSession) => {
    setDocumentTitle(sess.documentTitle);
    setAuthorName("Re-loaded Scholar");
    setDocumentText(sess.documentText);
    setAnalysis(sess.analysis);
    setQuestions(sess.questions);
    setAnswers(sess.answers);
    setActiveScreen("dashboard");
    setError(null);
  };

  // Clean-up and reload
  const handleResetSession = () => {
    setAnalysis(null);
    setQuestions([]);
    setAnswers({});
    setPdfBase64(null);
    setDocumentText("");
    setDocumentTitle("");
    setAuthorName("");
    setActiveQuestionIdx(null);
    setActiveScreen("upload");
    setError(null);
  };

  const activeQuestion = activeQuestionIdx !== null ? questions[activeQuestionIdx] : null;

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between font-sans relative">
      {/* GEOMETRIC SUBTLE ORNAMENTS */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-accent/3 rounded-full blur-[150px] pointer-events-none -z-10"></div>

      {/* HEADER SECTION */}
      <header className="px-6 py-4 bg-card-bg/60 border-b border-border sticky top-0 backdrop-blur-md z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-none bg-bg flex items-center justify-center border border-accent/40">
              <BrainCircuit className="w-4.5 h-4.5 text-accent" />
            </div>
            <div>
              <h1 className="text-sm md:text-md font-mono tracking-widest text-accent uppercase flex items-center gap-2">
                DOCUMIND // <span className="text-xs text-muted font-sans">SOCRATIC_VIVA</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] font-mono text-success">
            <span className="w-2 h-2 rounded-none bg-success"></span>
            <span>SYSTEM ACTIVE</span>
          </div>
        </div>
      </header>

      {/* ERROR BANNER */}
      {error && activeScreen !== "upload" && (
        <div className="max-w-4xl mx-auto w-full px-6 mt-4">
          <div className="flex items-start gap-2.5 p-4 bg-rose-950/30 border border-rose-900/50 rounded-lg text-rose-200 text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <strong>Examiner Pipeline Fault:</strong> {error}
            </div>
          </div>
        </div>
      )}

      {/* SCREEN ROUTING */}
      <main className="flex-1 w-full relative">
        {activeScreen === "upload" && (
          <div className="max-w-4xl mx-auto px-6 py-10 md:py-16 flex flex-col gap-12 animate-fade-in" id="landing-page">
            
            {/* INTRO HERO BANNER */}
            <div className="text-center flex flex-col items-center gap-4">
              <h2 className="text-3xl md:text-5xl font-serif italic text-ink max-w-2xl leading-tight">
                Stop passively reading. <span className="text-accent underline decoration-border decoration-wavy underline-offset-8">Confront your thesis.</span>
              </h2>
              <p className="text-muted font-sans text-xs md:text-sm max-w-xl leading-relaxed mt-1">
                Standard bots just retrieve facts. DocuMind acts as an adversarial Socratic Interviewer, identifying core problem statements, methodology variables, and empirical outcome claims to stress-test your master thesis before the actual board.
              </p>
            </div>

            {/* PRE-LOADED SAMPLES COMPONENT */}
            <div className="bg-card-bg border border-border p-6 rounded-none flex flex-col gap-4 relative">
              <div className="absolute top-0 left-8 right-8 h-[1px] bg-accent"></div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-accent font-extrabold uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-accent animate-pulse" /> Try Instantly With Preloaded Reports
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SAMPLE_REPORTS.map((rep, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleLoadSample(rep)}
                    className={`p-4 rounded-none border transition-all duration-300 cursor-pointer text-left flex flex-col justify-between ${
                      documentTitle === rep.title
                        ? "bg-accent/5 border-accent shadow-xl"
                        : "bg-bg border-border hover:border-accent/40"
                    }`}
                  >
                    <div>
                      <span className="text-[9px] font-mono uppercase bg-card-bg px-2 py-0.5 rounded-none text-accent border border-border">
                        {rep.domain}
                      </span>
                      <h4 className="font-sans font-semibold text-ink text-sm mt-2 line-clamp-2 leading-snug">
                        {rep.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-muted block mt-4 uppercase">
                      AUTHOR: {rep.author}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* UPLOAD & TEXT BOX SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* DRAG AND DROP ZONE (Left side) */}
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-mono uppercase text-muted tracking-widest">
                  Dossier Document Upload
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-none p-8 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[220px] relative cursor-pointer ${
                    isDragOver
                      ? "border-accent bg-accent/5"
                      : pdfBase64
                      ? "border-accent/60 bg-accent/3"
                      : "border-border bg-card-bg/30 hover:border-accent/40"
                  }`}
                >
                  <input
                    type="file"
                    id="file-uploader"
                    accept=".pdf,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {pdfBase64 ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-accent/10 rounded-none border border-accent/30 text-accent">
                        <FileText className="w-8 h-8" />
                      </div>
                      <h4 className="text-ink font-medium font-sans text-sm max-w-[220px] truncate">
                        {documentTitle}
                      </h4>
                      <span className="text-[10px] font-mono text-success uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-success rounded-none animate-ping"></span>
                        PDF Queued Natively
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-card-bg/60 rounded-none text-muted border border-border">
                        <FolderUp className="w-8 h-8" />
                      </div>
                      <h4 className="text-ink font-medium font-sans text-sm">
                        Drop PDF or TXT here
                      </h4>
                      <p className="text-[11px] text-muted font-sans max-w-[200px] leading-relaxed">
                        Drag & drop your research report, or click to browse files
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* MANUAL THESIS DEFENDER COPY BOX (Right side) */}
              <div className="flex flex-col gap-3">
                <label htmlFor="thesis-paste-box" className="text-[10px] font-mono uppercase text-muted tracking-widest flex items-center justify-between">
                  <span>Thesis Text Manual Board</span>
                  {documentText && (
                    <span className="text-[9px] text-success font-bold font-mono">TEXT_LOADED</span>
                  )}
                </label>
                <textarea
                  id="thesis-paste-box"
                  value={documentText}
                  onChange={(e) => {
                    setDocumentText(e.target.value);
                    if (e.target.value) {
                      setPdfBase64(null);
                      setDocumentTitle(e.target.value.substring(0, 45) + "...");
                      setAuthorName("Pasted Candidate");
                    }
                  }}
                  placeholder="Alternatively, copy and paste the main sections of your report here (Problem Statement, Methodology, Results, etc.) to load the pure-text Thesis Defender framework..."
                  className="w-full h-[220px] bg-card-bg/30 text-ink border border-border rounded-none p-4 font-mono text-xs focus:outline-none focus:border-accent/60 leading-relaxed placeholder:text-muted/65 resize-none"
                />
              </div>

            </div>

            {/* ERROR BANNER IN LANDING */}
            {error && (
              <div className="flex items-start gap-2.5 p-4 bg-rose-950/30 border border-rose-900/50 rounded-lg text-rose-200 text-xs font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <strong>Upload Fault:</strong> {error}
                </div>
              </div>
            )}

            {/* SUMMIT BUTTON */}
            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                id="analyze-report-btn"
                onClick={handleAnalyzeDocument}
                disabled={isAnalyzing || (!pdfBase64 && !documentText.trim())}
                className={`w-full max-w-sm py-4 rounded-none font-mono font-bold text-xs tracking-widest uppercase cursor-pointer transition-all duration-300 border ${
                  isAnalyzing
                    ? "bg-card-bg text-muted border-border cursor-not-allowed animate-pulse"
                    : (!pdfBase64 && !documentText.trim())
                    ? "bg-card-bg/40 text-muted/50 border-border cursor-not-allowed"
                    : "bg-accent text-bg border-accent hover:bg-accent/90 hover:shadow-[0_0_15px_rgba(226,255,50,0.3)] active:scale-[0.98]"
                }`}
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted" />
                    CONSTRUCTING COMPILATION...
                  </span>
                ) : (
                  "Initiate Socratic Analysis"
                )}
              </button>

              {isAnalyzing && (
                <div className="flex flex-col items-center gap-1.5 animate-fade-in text-center">
                  <span className="text-xs text-accent font-mono font-bold uppercase animate-pulse">
                    DocuMind Engine Busy
                  </span>
                  <p className="text-[10px] text-muted font-mono italic max-w-xs leading-relaxed">
                    "{ [
                      "De-chunking text structure...",
                      "Isolating problem statement parameters...",
                      "Running Named Entity Recognition (NER)...",
                      "Identifying algorithmic variables and tools...",
                      "Mapping outcomes and empirical datasets...",
                      "Structuring 10 custom Socratic interrogation prompts...",
                      "Completing thesis profile construction..."
                    ][analysisStep] }"
                  </p>
                </div>
              )}
            </div>

            {/* HISTORICAL SESSIONS CARD LOOP */}
            {savedSessions.length > 0 && (
              <div className="border-t border-border pt-8 flex flex-col gap-4">
                <h4 className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest flex items-center gap-1.5">
                  <History className="w-4 h-4 text-accent/80" /> RECENT EXAMS RE-DEFENDER HISTORY
                </h4>
                
                <div className="flex flex-col gap-2.5">
                  {savedSessions.map((sess, i) => (
                    <div
                      key={sess.id}
                      onClick={() => handleLoadSavedSession(sess)}
                      className="p-3.5 bg-card-bg/20 rounded-none border border-border hover:border-accent/45 hover:bg-card-bg/40 transition-all duration-200 cursor-pointer flex justify-between items-center text-xs animate-fade-in"
                    >
                      <div className="flex-1 truncate pr-4">
                        <h5 className="font-sans font-semibold text-ink truncate">{sess.documentTitle}</h5>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-muted">
                          <span>EXAM_DATE: {sess.date}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <span className="text-[9px] text-muted block uppercase tracking-wider">LAST_APPRAISAL</span>
                        <span className={`text-xs font-bold ${
                          sess.overallRating >= 80 ? "text-success" : sess.overallRating >= 60 ? "text-accent" : "text-danger"
                        }`}>
                          {sess.overallRating > 0 ? `${sess.overallRating}%` : "UNATTEMPTED"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {activeScreen === "dashboard" && analysis && (
          <CaseFileDashboard
            title={documentTitle}
            author={authorName}
            analysis={analysis}
            questions={questions}
            answers={answers}
            onSelectQuestion={(idx) => {
              setActiveQuestionIdx(idx);
            }}
            onEnterVivaRoom={() => {
              setActiveScreen("viva");
            }}
            onResetSession={handleResetSession}
            onViewSlides={() => setShowPresentation(true)}
          />
        )}

        {/* SPOTLIGHT SCREEN IF OPEN */}
        {activeQuestionIdx !== null && activeQuestion && (
          <SpotlightView
            question={activeQuestion}
            index={activeQuestionIdx}
            totalQuestions={questions.length}
            studentAnswer={answers[activeQuestion.id]?.studentAnswer || ""}
            onAnswerChange={(text) => {
              setAnswers({
                ...answers,
                [activeQuestion.id]: {
                  ...answers[activeQuestion.id],
                  studentAnswer: text,
                },
              });
            }}
            onSubmitAnswer={() => {
              handleEvaluateAnswer(
                activeQuestion.id,
                answers[activeQuestion.id]?.studentAnswer || "",
                answers[activeQuestion.id]?.timeSpent || 0
              );
            }}
            isEvaluating={isEvaluating}
            onNext={() => {
              if (activeQuestionIdx < questions.length - 1) {
                setActiveQuestionIdx(activeQuestionIdx + 1);
              }
            }}
            onPrev={() => {
              if (activeQuestionIdx > 0) {
                setActiveQuestionIdx(activeQuestionIdx - 1);
              }
            }}
            onClose={() => {
              setActiveQuestionIdx(null);
              // Check if all answered to enter heatmap results
              const allAnswered = (Object.values(answers) as any[]).every((a) => a.feedback !== null);
              if (allAnswered && questions.length > 0) {
                setActiveScreen("results");
              }
            }}
            feedback={answers[activeQuestion.id]?.feedback || null}
          />
        )}

        {/* Sequential VIVA ROOM MODE */}
        {activeScreen === "viva" && questions.length > 0 && (
          <VivaRoom
            questions={questions}
            answers={answers}
            onAnswerSubmit={async (qId, ans, time) => {
              await handleEvaluateAnswer(qId, ans, time);
            }}
            isEvaluating={isEvaluating}
            onExit={() => {
              setActiveScreen("results");
            }}
          />
        )}

        {/* COMPREHENSIVE RECONSTRUCTION HEATMAP SCREEN */}
        {activeScreen === "results" && analysis && (
          <WeaknessHeatmap
            analysis={analysis}
            questions={questions}
            answers={answers}
            onRestart={() => {
              // Reset answers but keep report analysis and questions to let them try again!
              const resetAnswers: Record<string, { studentAnswer: string; feedback: AnswerFeedback | null; timeSpent: number }> = {};
              questions.forEach((q) => {
                resetAnswers[q.id] = { studentAnswer: "", feedback: null, timeSpent: 0 };
              });
              setAnswers(resetAnswers);
              setActiveScreen("dashboard");
            }}
            onReturnToDashboard={() => {
              setActiveScreen("dashboard");
            }}
          />
        )}

        {showPresentation && analysis && (
          <PresentationDeck
            title={documentTitle}
            author={authorName}
            analysis={analysis}
            questions={questions}
            answers={answers}
            onClose={() => setShowPresentation(false)}
          />
        )}
      </main>

      {/* FOOTER ACCENTS */}
      <footer className="px-8 py-6 bg-card-bg border-t border-border text-center font-mono text-[9px] text-muted relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <span>DOCUMIND THESIS DEFENSE SIMULATOR // ORCHESTRATED VIA GEMINI API & WEB AUDIO</span>
          <span>© 2026 SOCRATIC ACADEMIC FOUNDATION // GPL V3</span>
        </div>
      </footer>
    </div>
  );
}
