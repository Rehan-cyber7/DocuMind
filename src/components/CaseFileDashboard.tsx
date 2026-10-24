/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FolderOpen, FileText, ClipboardList, Target, Award, ShieldAlert, ArrowRight, CheckCircle2, ChevronRight, Bookmark, Presentation } from "lucide-react";
import { DocumentAnalysis, VivaQuestion, AnswerFeedback } from "../types";

interface CaseFileDashboardProps {
  title: string;
  author: string;
  analysis: DocumentAnalysis;
  questions: VivaQuestion[];
  answers: Record<string, { studentAnswer: string; feedback: AnswerFeedback | null; timeSpent: number }>;
  onSelectQuestion: (index: number) => void;
  onEnterVivaRoom: () => void;
  onResetSession: () => void;
  onViewSlides: () => void;
}

export default function CaseFileDashboard({
  title,
  author,
  analysis,
  questions,
  answers,
  onSelectQuestion,
  onEnterVivaRoom,
  onResetSession,
  onViewSlides,
}: CaseFileDashboardProps) {
  // Calculate aggregate stats
  const answeredCount = Object.keys(answers).filter((id) => answers[id].feedback !== null).length;
  const totalQuestions = questions.length;
  const averageScore = answeredCount > 0
    ? Math.round(
        Object.values(answers)
          .filter((a) => a.feedback !== null)
          .reduce((sum, a) => sum + (a.feedback?.overallScore || 0), 0) / answeredCount
      )
    : 0;

  // Categorize questions
  const categoriesMap: Record<string, string> = {
    problem: "Problem Relevance & Motivation",
    methodology: "Architectural & Algorithmic Design",
    results: "Validation & Empirical Findings",
    limitations: "Identified Gaps & Constraints",
    scaling: "System Scalability & Stress",
    general: "Broad Industry Context",
  };

  return (
    <div className="w-full flex flex-col gap-8 max-w-6xl mx-auto px-4 py-8" id="case-file-dashboard">
      {/* Upper Case Header Badge / Control Panel */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-card-bg border border-border p-6 rounded-none shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-accent/10 text-[9px] font-mono uppercase tracking-widest text-accent px-3 py-1 font-bold border-l border-b border-border">
          Stateful Socratic Docket
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-bg border border-border rounded-none">
            <FolderOpen className="w-8 h-8 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent bg-bg px-2 py-0.5 rounded-none border border-border">
                Active Dossier
              </span>
              <span className="text-xs font-mono text-muted">By {author || "Unknown Scholar"}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-serif italic text-ink tracking-tight mt-1">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            id="enter-viva-room-btn"
            onClick={onEnterVivaRoom}
            className="flex-1 md:flex-none cursor-pointer bg-accent text-bg px-5 py-2.5 rounded-none text-xs font-mono font-bold hover:bg-accent/95 transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wider animate-pulse"
          >
            Enter Viva Room
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            id="view-slides-btn"
            onClick={onViewSlides}
            className="flex-1 md:flex-none cursor-pointer border border-accent/40 bg-accent/5 text-accent px-5 py-2.5 rounded-none text-xs font-mono font-bold hover:bg-accent hover:text-bg transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Presentation className="w-4 h-4" />
            View Slide Deck
          </button>
          <button
            type="button"
            id="reset-session-btn"
            onClick={onResetSession}
            className="flex-1 md:flex-none cursor-pointer border border-border text-muted px-4 py-2.5 rounded-none text-xs font-mono uppercase tracking-wider hover:text-ink hover:bg-bg transition-colors"
          >
            New Document
          </button>
        </div>
      </div>

      {/* Aggregate Score & Session Tracker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="stat-badges">
        <div className="bg-card-bg/50 border border-border p-4 rounded-none flex flex-col justify-between">
          <span className="text-xs font-mono text-muted uppercase">Docket Progress</span>
          <span className="text-2xl font-bold text-ink mt-2">
            {answeredCount} <span className="text-xs text-muted">/ {totalQuestions} Questions</span>
          </span>
          <div className="w-full bg-bg h-1 rounded-none mt-3 overflow-hidden">
            <div
              className="bg-accent h-full rounded-none transition-all duration-300"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-card-bg/50 border border-border p-4 rounded-none flex flex-col justify-between">
          <span className="text-xs font-mono text-muted uppercase">Defense Level</span>
          <span className="text-2xl font-bold text-accent mt-2 font-mono">
            {answeredCount > 0 ? `${averageScore}%` : "—"}
          </span>
          <span className="text-[10px] text-muted font-mono mt-3">
            {answeredCount > 0
              ? averageScore >= 80
                ? "🏆 DISTINCTION LEVEL"
                : averageScore >= 60
                ? "👍 CONFIDENT DEFENSE"
                : "⚠️ GAPS IN ARGUMENTS"
              : "Awaiting cross-examination"}
          </span>
        </div>

        <div className="bg-card-bg/50 border border-border p-4 rounded-none flex flex-col justify-between col-span-2 md:col-span-2">
          <span className="text-xs font-mono text-accent uppercase font-bold tracking-widest">Socratic Focus</span>
          <p className="text-xs text-muted mt-2 leading-relaxed">
            DocuMind has pinpointed key technical frameworks and potential bottlenecks in your document. Select a card below or start sequential mock viva mode.
          </p>
        </div>
      </div>

      {/* Main Layout: Left: NER Analysis Dossier Paper, Right: Question Interrogation Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: THE DOSSIER REPORT PROFILE (40%) */}
        <div className="lg:col-span-5 flex flex-col gap-6" id="dossier-report-profile">
          <div className="bg-card-bg border border-border rounded-none p-6 relative overflow-hidden shadow-2xl">
            {/* Folder tab design */}
            <div className="absolute top-0 left-0 h-[2px] w-full bg-accent"></div>

            <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
              <ClipboardList className="w-5 h-5 text-accent" />
              <h2 className="font-mono font-bold text-ink text-xs uppercase tracking-wider">
                Extracted Report Profile
              </h2>
            </div>

            {/* Document Profile Papers */}
            <div className="flex flex-col gap-5 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-accent flex items-center gap-1 uppercase tracking-wider">
                  <Bookmark className="w-3 h-3 text-accent" /> Problem Statement
                </span>
                <p className="text-ink leading-relaxed font-sans bg-bg/30 p-3.5 rounded-none border border-border">
                  {analysis.problemStatement}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-accent flex items-center gap-1 uppercase tracking-wider">
                  <Target className="w-3 h-3 text-accent" /> Methodology & System Design
                </span>
                <p className="text-ink leading-relaxed font-sans bg-bg/30 p-3.5 rounded-none border border-border">
                  {analysis.proposedMethodology}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-accent flex items-center gap-1 uppercase tracking-wider">
                  <Award className="w-3 h-3 text-accent" /> Results & Empirical Outcomes
                </span>
                <p className="text-ink leading-relaxed font-sans bg-bg/30 p-3.5 rounded-none border border-border">
                  {analysis.resultsOutcomes}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-accent flex items-center gap-1 uppercase tracking-wider">
                  <ShieldAlert className="w-3 h-3 text-accent" /> Gaps & Limitations
                </span>
                <p className="text-ink leading-relaxed font-sans bg-bg/30 p-3.5 rounded-none border border-border">
                  {analysis.limitations}
                </p>
              </div>
            </div>
          </div>

          {/* NER ENTITIES DRAWER */}
          <div className="bg-card-bg border border-border rounded-none p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-[2px] w-full bg-border"></div>

            <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
              <FileText className="w-5 h-5 text-accent" />
              <h2 className="font-mono font-bold text-ink text-xs uppercase tracking-wider">
                Named Entities (NER) Found
              </h2>
            </div>

            <div className="flex flex-col gap-4 text-xs font-mono">
              <div>
                <span className="text-muted block mb-1.5 uppercase tracking-wider text-[10px]">Key Algorithms & Models</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.nerEntities.keyAlgorithms.length > 0 ? (
                    analysis.nerEntities.keyAlgorithms.map((algo, i) => (
                      <span key={i} className="bg-accent/5 text-accent px-2 py-0.5 rounded-none border border-accent/35">
                        {algo}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted">None extracted</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-muted block mb-1.5 uppercase tracking-wider text-[10px]">Data & Tech Stack Tools</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.nerEntities.datasetsOrTools.length > 0 ? (
                    analysis.nerEntities.datasetsOrTools.map((tool, i) => (
                      <span key={i} className="bg-bg text-ink px-2 py-0.5 rounded-none border border-border">
                        {tool}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted">None extracted</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-muted block mb-1.5 uppercase tracking-wider text-[10px]">Performance Metrics</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.nerEntities.metricsTracked.length > 0 ? (
                    analysis.nerEntities.metricsTracked.map((metric, i) => (
                      <span key={i} className="bg-accent/10 text-accent/90 px-2 py-0.5 rounded-none border border-accent/20">
                        {metric}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted">None extracted</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERROGATION CARD BOARD (60%) */}
        <div className="lg:col-span-7 flex flex-col gap-6" id="interrogation-card-board">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs uppercase text-accent font-bold tracking-widest">
              Socratic Cross-Examination Cards
            </h3>
            <span className="text-[10px] font-mono text-muted">
              Select any card to launch the Spotlight Examiner
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((question, index) => {
              const answerState = answers[question.id];
              const isAnswered = answerState && answerState.feedback !== null;
              const feedback = answerState?.feedback;

              return (
                <div
                  key={question.id}
                  onClick={() => onSelectQuestion(index)}
                  className={`group relative bg-card-bg p-5 rounded-none border transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[170px] ${
                    isAnswered
                      ? "border-success/40 bg-success/3 hover:border-success/70"
                      : "border-border hover:border-accent/40 hover:bg-card-bg"
                  }`}
                  id={`question-card-${question.id}`}
                >
                  {/* Wax Seal / Grade Overlay Stamp if answered */}
                  {isAnswered && feedback && (
                    <div className="absolute top-3 right-3 flex items-center justify-center">
                      <div className={`w-8 h-8 rounded-none border-2 border-dashed flex items-center justify-center font-mono text-xs font-bold ${
                        feedback.overallScore >= 85
                          ? "border-success text-success bg-success/5"
                          : feedback.overallScore >= 65
                          ? "border-accent text-accent bg-accent/5"
                          : "border-danger text-danger bg-danger/5"
                      }`} title={`Overall score: ${feedback.overallScore}%`}>
                        {feedback.overallScore}
                      </div>
                    </div>
                  )}

                  <div>
                    {/* Category Label */}
                    <span className="text-[9px] font-mono uppercase tracking-widest text-accent block mb-2 font-bold">
                      {categoriesMap[question.category] || question.category}
                    </span>

                    {/* Question Text */}
                    <h4 className="font-sans font-medium text-ink text-sm group-hover:text-accent transition-colors line-clamp-3 leading-relaxed">
                      {question.text}
                    </h4>
                  </div>

                  {/* Card Bottom status footer */}
                  <div className="flex items-center justify-between border-t border-border pt-3 mt-4 text-[10px] font-mono">
                    <span className="text-muted">Question {index + 1}</span>
                    <span className="flex items-center gap-1 text-accent group-hover:translate-x-1 transition-transform">
                      {isAnswered ? (
                        <span className="flex items-center gap-1 text-success font-bold">
                          <CheckCircle2 className="w-3 h-3 text-success" /> DEFENDED
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5">
                          CONFRONT <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
