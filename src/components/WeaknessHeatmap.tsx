/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Award, AlertTriangle, BookOpen, RefreshCw, CheckCircle, Flame, ShieldAlert, Zap } from "lucide-react";
import { DocumentAnalysis, VivaQuestion, AnswerFeedback } from "../types";

interface WeaknessHeatmapProps {
  analysis: DocumentAnalysis;
  questions: VivaQuestion[];
  answers: Record<string, { studentAnswer: string; feedback: AnswerFeedback | null; timeSpent: number }>;
  onRestart: () => void;
  onReturnToDashboard: () => void;
}

export default function WeaknessHeatmap({
  analysis,
  questions,
  answers,
  onRestart,
  onReturnToDashboard,
}: WeaknessHeatmapProps) {
  const [heatmapType, setHeatmapType] = React.useState<"pages" | "thematic">("pages");
  const [selectedPageNum, setSelectedPageNum] = React.useState<number | null>(null);

  // Fallback function to map category to physical page if no pageNumber is supplied by the server yet
  const getFallbackPageNumber = (q: VivaQuestion, allQuestions: VivaQuestion[]) => {
    if (q.pageNumber) return q.pageNumber;
    // Find all questions in this category to distribute them
    const categoryQs = allQuestions.filter((x) => x.category === q.category);
    const indexInCat = categoryQs.findIndex((x) => x.id === q.id);
    
    switch (q.category) {
      case "problem":
        return indexInCat % 2 === 0 ? 1 : 2;
      case "methodology":
        return indexInCat % 2 === 0 ? 3 : 4;
      case "results":
        return indexInCat % 2 === 0 ? 5 : 6;
      case "limitations":
        return 7;
      case "scaling":
        return 8;
      case "general":
      default:
        return 8;
    }
  };

  const pageDetails = Array.from({ length: 8 }, (_, i) => {
    const pageNum = i + 1;
    // Get all questions belonging to this page
    const pageQuestions = questions.filter((q) => getFallbackPageNumber(q, questions) === pageNum);
    
    // Check which of these are completed (answered)
    const completedPageAnswers = pageQuestions
      .map((q) => answers[q.id])
      .filter((a) => a && a.feedback !== null);
      
    const score = completedPageAnswers.length > 0
      ? Math.round(
          completedPageAnswers.reduce((sum, a) => sum + (a.feedback?.overallScore || 0), 0) / completedPageAnswers.length
        )
      : null; // null means unattempted
      
    // What is the primary category/topic of this page based on questions or fallbacks?
    let primaryTopic = "General Overview";
    if (pageNum === 1 || pageNum === 2) primaryTopic = "Problem Motivation & Context";
    else if (pageNum === 3 || pageNum === 4) primaryTopic = "Proposed Methodology & Design";
    else if (pageNum === 5 || pageNum === 6) primaryTopic = "Results & Empirical Outcomes";
    else if (pageNum === 7) primaryTopic = "Limitations, Constraints & Gaps";
    else if (pageNum === 8) primaryTopic = "Scaling, Stress & Industry Relevance";

    return {
      pageNum,
      questionsOnPage: pageQuestions,
      completedAnswersCount: completedPageAnswers.length,
      score,
      topic: primaryTopic,
    };
  });

  // Aggregate data for heatmap domains
  const categoriesList = [
    {
      key: "problem",
      title: "Problem Motivation & Context",
      desc: "Problem statement relevance, research questions, and background validations.",
    },
    {
      key: "methodology",
      title: "Proposed Methodology & Design",
      desc: "Algorithms, models, system architectures, pipelines, and technical design justifications.",
    },
    {
      key: "results",
      title: "Empirical Results & Validation",
      desc: "Metrics, statistics, comparisons, dataset integrity, and outcome claims.",
    },
    {
      key: "limitations",
      title: "Gaps, Constraints & Assumptions",
      desc: "Documented bottlenecks, constraints, error rates, and boundaries.",
    },
    {
      key: "scaling",
      title: "System Scaling & Stress",
      desc: "Scaling architectures under 10x data volumes or load stresses.",
    },
  ];

  // Map answers to categories to calculate scores
  const domainScores = categoriesList.map((category) => {
    // Find all questions of this category
    const categoryQuestions = questions.filter((q) => q.category === category.key);
    const completedAnswers = categoryQuestions
      .map((q) => answers[q.id])
      .filter((a) => a && a.feedback !== null);

    const score = completedAnswers.length > 0
      ? Math.round(
          completedAnswers.reduce((sum, a) => sum + (a.feedback?.overallScore || 0), 0) / completedAnswers.length
        )
      : null; // null represents unattempted

    return {
      ...category,
      score,
      count: categoryQuestions.length,
      attempted: completedAnswers.length,
    };
  });

  // Calculate overall stats
  const attemptedQuestionsCount = Object.values(answers).filter((a) => a.feedback !== null).length;
  const overallAvgScore = attemptedQuestionsCount > 0
    ? Math.round(
        Object.values(answers)
          .filter((a) => a.feedback !== null)
          .reduce((sum, a) => sum + (a.feedback?.overallScore || 0), 0) / attemptedQuestionsCount
      )
    : 0;

  // Grade thresholds
  let gradeBadgeColor = "text-danger border-danger/30 bg-danger/5";
  let gradeText = "REVISION REQUISITE";
  let gradeDesc = "Critical weaknesses found in core segments. The Socratic examiner recommends thorough re-reading of recommended passages before scheduling your physical viva.";

  if (attemptedQuestionsCount === 0) {
    gradeBadgeColor = "text-muted border-border bg-bg";
    gradeText = "NO DEFENSE SUBMITTED";
    gradeDesc = "No responses have been evaluated by the board yet. Enter the Viva Room or Spotlight Mode to begin your defense training.";
  } else if (overallAvgScore >= 80) {
    gradeBadgeColor = "text-success border-success/30 bg-success/5";
    gradeText = "EXAMINER DISTINCTION";
    gradeDesc = "Outstanding performance! You defended your project's methodology, metrics, and limitations with exceptional specificity and relevance. Highly confident.";
  } else if (overallAvgScore >= 60) {
    gradeBadgeColor = "text-accent border-accent/30 bg-accent/5";
    gradeText = "CONFIDENT PASS";
    gradeDesc = "A solid, passing defense. However, there are localized blindspots in your arguments—particularly regarding scaling parameters or validation edge cases. Review marked sections.";
  }

  // Help color grading based on score
  const getHeatmapColor = (score: number | null) => {
    if (score === null) return "bg-bg/40 border-border text-muted";
    if (score >= 80) return "bg-success/5 border-success/30 text-success";
    if (score >= 60) return "bg-accent/5 border-accent/30 text-accent";
    return "bg-danger/5 border-danger/30 text-danger";
  };

  return (
    <div className="w-full flex flex-col gap-8 max-w-5xl mx-auto px-4 py-8" id="viva-results-page">
      
      {/* Upper Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-5 gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-accent font-bold uppercase">
            Defense Appraisal Report
          </span>
          <h1 className="text-xl md:text-2xl font-serif italic text-ink tracking-tight mt-1">
            Socratic Board Review Card
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            id="results-dashboard-btn"
            onClick={onReturnToDashboard}
            className="px-4 py-2 bg-bg hover:bg-card-bg text-muted text-xs font-mono rounded-none border border-border transition-colors cursor-pointer"
          >
            Go back to Dossier
          </button>
          <button
            type="button"
            id="results-restart-btn"
            onClick={onRestart}
            className="px-4 py-2 bg-accent hover:bg-accent/95 text-bg text-xs font-mono font-bold rounded-none transition-colors cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Restart Viva
          </button>
        </div>
      </div>

      {/* Grid: Left column scores & appraisal badge, Right column Heatmap board */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* APPRAISAL CARD (40%) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="bg-card-bg border border-border p-6 rounded-none text-center flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-accent"></div>

            <Award className="w-12 h-12 text-accent mb-2" />
            <span className="text-[10px] font-mono text-muted uppercase tracking-widest">
              Overall Viva Defense Score
            </span>
            <span className="text-5xl font-sans font-black text-accent my-2">
              {attemptedQuestionsCount > 0 ? `${overallAvgScore}%` : "—"}
            </span>

            {/* Verdict Badge */}
            <div className={`px-4 py-1.5 border rounded-none text-xs font-mono font-bold uppercase ${gradeBadgeColor} mt-2 mb-4`}>
              {gradeText}
            </div>

            <p className="text-xs text-muted font-sans leading-relaxed text-center px-2">
              {gradeDesc}
            </p>
          </div>

          {/* Defense metrics list */}
          <div className="bg-card-bg p-4 rounded-none border border-border flex flex-col gap-3 font-mono text-xs">
            <span className="text-muted uppercase tracking-wider font-bold">Performance Ledger</span>
            <div className="flex justify-between items-center py-1.5 border-b border-border">
              <span className="text-muted">Total Socratic Cards</span>
              <span className="text-ink">{questions.length}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-border">
              <span className="text-muted">Questions Confronted</span>
              <span className="text-ink">{attemptedQuestionsCount}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-muted">Preparation Coverage</span>
              <span className="text-ink">
                {Math.round((attemptedQuestionsCount / questions.length) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* WEAKNESS HEATMAP BOARD (60%) */}
        <div className="md:col-span-7 bg-card-bg border border-border p-6 rounded-none flex flex-col gap-5 shadow-2xl">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-accent font-bold uppercase tracking-widest">
              <Flame className="w-4 h-4 text-accent animate-pulse" /> Thesis Defense Diagnostics
            </div>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Track your conceptual vulnerabilities and study suggestions across document sections and pages.
            </p>
          </div>

          {/* Diagnostic View Switcher */}
          <div className="flex border-b border-border text-center">
            <button
              type="button"
              onClick={() => setHeatmapType("pages")}
              className={`flex-1 pb-2.5 text-[10px] font-mono font-bold tracking-wider uppercase transition-colors border-b-2 cursor-pointer ${
                heatmapType === "pages"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              Document Page Heatmap
            </button>
            <button
              type="button"
              onClick={() => setHeatmapType("thematic")}
              className={`flex-1 pb-2.5 text-[10px] font-mono font-bold tracking-wider uppercase transition-colors border-b-2 cursor-pointer ${
                heatmapType === "thematic"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              Thematic Domains
            </button>
          </div>

          {heatmapType === "thematic" ? (
            <div className="flex flex-col gap-4 animate-fade-in">
              {domainScores.map((domain, idx) => {
                const borderCol = getHeatmapColor(domain.score);
                const scoreVal = domain.score;

                return (
                  <div
                    key={idx}
                    className={`border rounded-none p-4 transition-all duration-300 flex items-center justify-between gap-4 ${borderCol}`}
                    id={`heatmap-domain-${domain.key}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold tracking-widest text-ink uppercase">
                          {domain.title}
                        </span>
                        <span className="text-[10px] font-mono text-muted">
                          ({domain.attempted}/{domain.count} answered)
                        </span>
                      </div>
                      <p className="text-xs text-muted font-sans mt-1 leading-relaxed">
                        {domain.desc}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-muted block uppercase">Rating</span>
                      <span className="text-xl font-bold font-mono">
                        {scoreVal !== null ? `${scoreVal}%` : "UNATTEMPTED"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-5 animate-fade-in">
              {/* Grid of Pages */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {pageDetails.map((page) => {
                  let bgCol = "bg-bg/40 border-border text-muted hover:border-muted/50";
                  let statusText = "UNATTEMPTED";
                  let indicatorCol = "bg-border";
                  
                  if (page.score !== null) {
                    if (page.score >= 80) {
                      bgCol = "bg-success/5 border-success/30 hover:border-success text-success";
                      statusText = "FORTIFIED";
                      indicatorCol = "bg-success";
                    } else if (page.score >= 60) {
                      bgCol = "bg-accent/5 border-accent/30 hover:border-accent text-accent";
                      statusText = "NEEDS STUDY";
                      indicatorCol = "bg-accent";
                    } else {
                      bgCol = "bg-danger/5 border-danger/30 hover:border-danger text-danger";
                      statusText = "WEAK ANSWER";
                      indicatorCol = "bg-danger";
                    }
                  }
                  
                  const isSelected = selectedPageNum === page.pageNum;
                  
                  return (
                    <button
                      key={page.pageNum}
                      type="button"
                      onClick={() => setSelectedPageNum(page.pageNum)}
                      className={`aspect-[3/4.2] border p-2.5 flex flex-col justify-between text-left transition-all relative overflow-hidden select-none cursor-pointer group rounded-none ${bgCol} ${
                        isSelected ? "ring-2 ring-accent border-accent" : ""
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between font-mono text-[9px] tracking-wider opacity-80">
                        <span>PAGE {page.pageNum.toString().padStart(2, '0')}</span>
                        <span className={`w-1.5 h-1.5 rounded-none ${indicatorCol}`} />
                      </div>
                      
                      {/* Paper text lines visualization */}
                      <div className="my-2 flex-1 flex flex-col gap-1.5 opacity-30 group-hover:opacity-50 transition-opacity">
                        <div className="h-1 bg-current w-11/12" />
                        <div className="h-1 bg-current w-5/6" />
                        <div className="h-1 bg-current w-3/4" />
                        <div className="h-1 bg-current w-10/12" />
                        <div className="h-1 bg-current w-2/3" />
                      </div>
                      
                      {/* Footer */}
                      <div className="mt-auto pt-2 border-t border-current/10">
                        <p className="text-[8px] font-mono leading-tight truncate uppercase tracking-wider opacity-70">
                          {page.topic.split(" ")[0]}..
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[8px] font-mono opacity-50">
                            {page.completedAnswersCount}/{page.questionsOnPage.length} Qs
                          </span>
                          <span className="text-[10px] font-mono font-bold">
                            {page.score !== null ? `${page.score}%` : "—"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Page Drilldown Panel */}
              <div className="border border-border bg-bg/25 p-4 rounded-none flex flex-col gap-3 font-sans">
                {selectedPageNum === null ? (
                  <div className="text-center py-6 text-muted font-mono text-xs">
                    <BookOpen className="w-5 h-5 mx-auto mb-2 text-muted/50" />
                    Click on any page above to inspect conceptual weaknesses, critiques, and patch study advice.
                  </div>
                ) : (() => {
                  const page = pageDetails.find((p) => p.pageNum === selectedPageNum)!;
                  let statusColor = "text-muted";
                  let statusLabel = "UNATTEMPTED SECTION";
                  let advice = "No questions linked to this page have been evaluated yet. Enter the Viva Room or Socratic Spotlight mode to start defending these topics.";
                  
                  if (page.score !== null) {
                    if (page.score >= 80) {
                      statusColor = "text-success";
                      statusLabel = "FORTIFIED MASTER (EXCELLENT)";
                      advice = "Your defense of this page is outstanding. You answered with high specificity and precise reference mapping. Maintain this level of defense.";
                    } else if (page.score >= 60) {
                      statusColor = "text-accent";
                      statusLabel = "VULNERABLE AREA (RE-READ SUGGESTED)";
                      advice = "You have defended this section with moderate success, but you are still generalizing key parameters or metrics. Review the reading references below to reinforce your answers.";
                    } else {
                      statusColor = "text-danger";
                      statusLabel = "CRITICAL FAILURE RISK (RE-STUDY REQUIRED)";
                      advice = "Highly vulnerable page! Your answers were vague or off-target. Study the recommended literature and specific report sections in detail to rebuild this defense.";
                    }
                  }
                  
                  return (
                    <div className="flex flex-col gap-3 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-mono text-muted uppercase tracking-widest">
                            Page-Level Analysis
                          </span>
                          <h4 className="text-xs font-mono font-bold text-ink uppercase tracking-wider mt-0.5">
                            PAGE {page.pageNum.toString().padStart(2, '0')}: {page.topic}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-mono font-bold tracking-widest ${statusColor}`}>
                            {statusLabel}
                          </span>
                          <span className="block text-lg font-bold font-mono text-ink mt-0.5">
                            {page.score !== null ? `${page.score}%` : "—"}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted leading-relaxed">
                        <strong className="text-ink">Strategic Advice:</strong> {advice}
                      </p>
                      
                      <div className="flex flex-col gap-2 mt-1">
                        <span className="text-[9px] font-mono text-muted uppercase tracking-wider font-bold">
                          Associated Socratic Prompts:
                        </span>
                        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                          {page.questionsOnPage.length === 0 ? (
                            <p className="text-xs text-muted font-mono italic">No questions mapped to this page.</p>
                          ) : (
                            page.questionsOnPage.map((q) => {
                              const ans = answers[q.id];
                              const score = ans?.feedback?.overallScore ?? null;
                              let badgeCol = "bg-bg text-muted border-border";
                              if (score !== null) {
                                if (score >= 80) badgeCol = "bg-success/5 text-success border-success/30";
                                else if (score >= 60) badgeCol = "bg-accent/5 text-accent border-accent/30";
                                else badgeCol = "bg-danger/5 text-danger border-danger/30";
                              }
                              
                              return (
                                <div key={q.id} className="p-3 bg-bg border border-border flex flex-col gap-2">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <span className="text-[9px] font-mono text-accent uppercase tracking-wider block mb-0.5">
                                        {q.category} • {q.id.toUpperCase()}
                                      </span>
                                      <p className="text-xs text-ink font-serif italic font-medium leading-relaxed">
                                        {q.text}
                                      </p>
                                    </div>
                                    <div className={`px-2 py-0.5 border font-mono text-[9px] font-bold ${badgeCol} shrink-0`}>
                                      {score !== null ? `${score}%` : "UNANSWERED"}
                                    </div>
                                  </div>
                                  
                                  {ans?.feedback && (
                                    <div className="text-[11px] bg-card-bg/40 p-2 border border-border/60 font-sans leading-relaxed text-muted mt-1">
                                      <span className="text-[9px] font-mono text-accent uppercase font-bold tracking-wider block mb-0.5">Recommended Passage:</span>
                                      <span className="italic">"{ans.feedback.recommendedReading}"</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Itemized Question & Answer Ledger display if answered */}
      {attemptedQuestionsCount > 0 && (
        <div className="flex flex-col gap-4 mt-4" id="viva-questions-breakdown">
          <h3 className="font-mono text-[10px] uppercase text-muted font-extrabold tracking-widest">
            Detailed Defense Record Ledger
          </h3>

          <div className="flex flex-col gap-6">
            {questions.map((question, index) => {
              const ansState = answers[question.id];
              if (!ansState || ansState.feedback === null) return null;

              const fb = ansState.feedback;

              return (
                <div
                  key={question.id}
                  className="bg-card-bg p-6 rounded-none border border-border flex flex-col gap-4 font-sans text-sm"
                >
                  <div className="flex justify-between items-start gap-4 border-b border-border pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-accent uppercase tracking-widest block mb-1">
                        Question {index + 1} ({question.category})
                      </span>
                      <h4 className="font-serif italic text-ink text-base">
                        {question.text}
                      </h4>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <span className="text-[10px] text-muted block uppercase">SCORE</span>
                      <span className={`text-xl font-black ${
                        fb.overallScore >= 80 ? "text-success" : fb.overallScore >= 60 ? "text-accent" : "text-danger"
                      }`}>
                        {fb.overallScore}%
                      </span>
                    </div>
                  </div>

                  {/* Student Answer */}
                  <div className="bg-bg p-4 rounded-none border border-border font-mono text-xs text-ink leading-relaxed">
                    <span className="text-muted block mb-1.5 uppercase font-bold tracking-widest">
                      Your Defense Statement:
                    </span>
                    <p>{ansState.studentAnswer}</p>
                  </div>

                  {/* Critique & Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
                    <div className="md:col-span-8 flex flex-col gap-2">
                      <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-widest block">
                        Socratic Critique
                      </span>
                      <p className="text-ink leading-relaxed text-sm">
                        {fb.critique}
                      </p>
                    </div>

                    <div className="md:col-span-4 p-4 bg-bg rounded-none border border-border text-xs">
                      <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-widest block mb-1.5">
                        Passage to Re-Study
                      </span>
                      <p className="text-muted leading-relaxed">
                        {fb.recommendedReading}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
