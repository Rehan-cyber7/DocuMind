/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DocumentAnalysis {
  problemStatement: string;
  proposedMethodology: string;
  resultsOutcomes: string;
  limitations: string;
  nerEntities: {
    keyAlgorithms: string[];
    datasetsOrTools: string[];
    metricsTracked: string[];
  };
}

export interface VivaQuestion {
  id: string;
  text: string;
  category: "problem" | "methodology" | "results" | "limitations" | "scaling" | "general";
  rationale: string;
  referenceText: string;
  pageNumber?: number;
}

export interface AnswerFeedback {
  relevanceScore: number; // 0-100
  specificityScore: number; // 0-100
  clarityScore: number; // 0-100
  overallScore: number; // 0-100
  critique: string;
  suggestions: string[];
  weakPoints: string[];
  strongPoints: string[];
  recommendedReading: string;
}

export interface SavedSession {
  id: string;
  date: string;
  documentTitle: string;
  documentText: string;
  analysis: DocumentAnalysis;
  questions: VivaQuestion[];
  answers: Record<string, { studentAnswer: string; feedback: AnswerFeedback | null; timeSpent: number }>;
  overallRating: number;
}
