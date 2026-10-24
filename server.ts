/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON body limits to handle uploaded PDF base64 payloads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Google GenAI client
// User-Agent must be set to 'aistudio-build' for AI Studio telemetry tracking.
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not defined");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API: Analyze Document and Generate Socratic Questions
app.post("/api/analyze-document", async (req, res) => {
  try {
    const { pdfBase64, documentText, fileName } = req.body;

    if (!pdfBase64 && !documentText) {
      return res.status(400).json({ error: "Missing document data (pdfBase64 or documentText is required)." });
    }

    const ai = getGenAIClient();

    let contentParts: any[] = [];

    // Prompt instructing Gemini to analyze the report and generate tough questions
    const promptText = `
You are a highly demanding, brilliant, and constructive Socratic Examiner (DocuMind). 
Analyze the provided student project report (${fileName || "Project Report"}). 

1. AUTO-ANALYSIS & NER:
   Extract or summarize:
   - What is the Problem Statement? (Highlight exactly what issue they are solving)
   - What is the Proposed Methodology? (Technical architectures, systems, designs, algorithms, formulas, or approaches)
   - What are the Results and Outcomes? (Metrics, statistics, evaluations, outcomes achieved)
   - What are the Limitations or Future Scope? (Assumptions, boundaries, bottlenecks)
   - Extract Named Entities (NER): key algorithms/models used, datasets/tools used, and performance metrics tracked.

2. TOUGH SOCRATIC CROSS-EXAMINATION QUESTIONS:
   Generate exactly 10 highly-targeted, challenging cross-examination questions designed to stress-test the student's mastery.
   Do NOT ask generic questions (e.g. "What did you do?"). Ask deep, adversarial, yet fair, technical questions based directly on the content or gaps of the report.
   Distribute the questions across these categories:
   - 'problem' (stress testing problem relevance, motivations, state-of-the-art comparisons)
   - 'methodology' (architectural choices, scalability, trade-offs, algorithms, security)
   - 'results' (validation validity, edge cases, metric scaling, dataset size impact)
   - 'limitations' (addressing gaps, failure modes, design bottlenecks)
   - 'scaling' (architectural scalability if users or data scale 10x or 100x)
   - 'general' (industry relevance, compliance, design trade-offs)

   For each question:
   - Write a short, highly-specific question (e.g., "You chose Random Forest over XGBoost. What was your technical justification given the dataset size?").
   - Provide a "rationale" explaining what technical aspect or potential gap in the report prompted this question.
   - Provide a "referenceText" which contains a direct excerpt, key term, or specific detail from their report that serves as the visual context/basis for answering this question.
`;

    if (pdfBase64) {
      // Clean base64 data if it contains data URI scheme prefix
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
      contentParts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: cleanBase64,
        },
      });
    }

    // Always include any textual representation or fallback instruction
    const fullPrompt = documentText 
      ? `${promptText}\n\nHere is the full document text for reference:\n${documentText}`
      : promptText;

    contentParts.push({ text: fullPrompt });

    // Define the strict schema to prevent parsing errors
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        analysis: {
          type: Type.OBJECT,
          properties: {
            problemStatement: {
              type: Type.STRING,
              description: "Clear extraction or summary of the document's core problem statement or research question."
            },
            proposedMethodology: {
              type: Type.STRING,
              description: "The core methodology, architectures, systems, designs, algorithms, or approaches proposed."
            },
            resultsOutcomes: {
              type: Type.STRING,
              description: "Summary of the results, findings, metrics, and outcomes achieved by the project."
            },
            limitations: {
              type: Type.STRING,
              description: "Any limitations, constraints, assumptions, or future work points noted in the report."
            },
            nerEntities: {
              type: Type.OBJECT,
              properties: {
                keyAlgorithms: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Key algorithms, frameworks, models, or formulas used."
                },
                datasetsOrTools: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Datasets, libraries, platforms, or hardware tools used."
                },
                metricsTracked: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Performance metrics, criteria, or statistical measures tracked."
                }
              },
              required: ["keyAlgorithms", "datasetsOrTools", "metricsTracked"]
            }
          },
          required: ["problemStatement", "proposedMethodology", "resultsOutcomes", "limitations", "nerEntities"]
        },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "A unique identifier for the question, e.g., q1, q2, etc." },
              text: { type: Type.STRING, description: "The challenging Socratic cross-examination question." },
              category: {
                type: Type.STRING,
                description: "The thematic category of the question: 'problem', 'methodology', 'results', 'limitations', 'scaling', or 'general'."
              },
              rationale: { type: Type.STRING, description: "A brief reason why this question is being asked based on details (or gaps) in their report." },
              referenceText: { type: Type.STRING, description: "A relevant quote, paragraph, or detail from their report that serves as the basis/context for this question." },
              pageNumber: {
                type: Type.INTEGER,
                description: "The page number in the report where this question's reference text is found. Assign realistic page numbers from 1 to 8 based on logical sections (e.g., problem is on pages 1-2, methodology on pages 3-4, results on pages 5-6, limitations on page 7, scaling/general on page 8)."
              }
            },
            required: ["id", "text", "category", "rationale", "referenceText", "pageNumber"]
          },
          description: "Generate exactly 10 highly-targeted, tough, non-generic Socratic viva questions."
        }
      },
      required: ["analysis", "questions"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contentParts,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Keep it precise
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Error in /api/analyze-document:", error);
    res.status(500).json({ error: error.message || "Internal server error during document analysis." });
  }
});

// API: Socratic Evaluation of Student Answer
app.post("/api/evaluate-answer", async (req, res) => {
  try {
    const { question, studentAnswer, documentAnalysisSummary } = req.body;

    if (!question || !studentAnswer) {
      return res.status(400).json({ error: "Missing required fields (question and studentAnswer are required)." });
    }

    const ai = getGenAIClient();

    const evaluationPrompt = `
You are the Socratic Examiner (DocuMind). 
Review the student's oral or written response to the viva question.
Be honest, challenging, and constructive. Give the student tough love so they pass their final viva with flying colors.

Question asked: "${question.text}"
Question category: "${question.category}"
Technical rationale: "${question.rationale}"
Report reference point: "${question.referenceText}"

Student's Answer: "${studentAnswer}"

Document Summary Context:
${JSON.stringify(documentAnalysisSummary || {})}

Evaluate the response on three parameters (0 to 100):
1. Relevance: Did they directly address the core of the question, or did they dodge it / engage in hand-waving?
2. Specificity: Did they mention concrete technologies, metrics, formulas, or parameters from their report? Or was it purely vague, theoretical textbook definitions?
3. Clarity: Is it a crisp, professional, structured answer or a rambling, nervous monologue?

Determine the overall defense quality score (0-100%).
Provide a Socratic critique (2-3 sentences), 2-3 actionable suggestions for revision, and highlight specific weak points and strong points.
Recommend exactly what parts of their report/literature they must re-read to patch this vulnerability.
`;

    const evaluateSchema = {
      type: Type.OBJECT,
      properties: {
        relevanceScore: { type: Type.INTEGER, description: "Relevance score from 0 to 100. Did the student directly answer what was asked?" },
        specificityScore: { type: Type.INTEGER, description: "Specificity score from 0 to 100. Did they reference specific parameters, formulas, or project outcomes?" },
        clarityScore: { type: Type.INTEGER, description: "Clarity score from 0 to 100. Was the response clean, confident, and professional?" },
        overallScore: { type: Type.INTEGER, description: "Overall combined score from 0 to 100 representing their viva response defense quality." },
        critique: { type: Type.STRING, description: "Constructive Socratic critique of the answer. Point out logical loops, generic padding, or hand-waving." },
        suggestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of 2-3 specific actions the student can take to strengthen this exact answer."
        },
        weakPoints: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Specific key points, statistics, metrics, or validation methods they missed or failed to elaborate on."
        },
        strongPoints: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Positive aspects of their response, such as mentioning correct terms or acknowledging limitations."
        },
        recommendedReading: { type: Type.STRING, description: "Specific guidance on what sections or concepts of their report they must review to master this topic." }
      },
      required: [
        "relevanceScore",
        "specificityScore",
        "clarityScore",
        "overallScore",
        "critique",
        "suggestions",
        "weakPoints",
        "strongPoints",
        "recommendedReading"
      ]
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: evaluationPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: evaluateSchema,
        temperature: 0.2,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Error in /api/evaluate-answer:", error);
    res.status(500).json({ error: error.message || "Internal server error during answer evaluation." });
  }
});

// Vite Integration & Static Assets Serving
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DocuMind] Fullstack Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
