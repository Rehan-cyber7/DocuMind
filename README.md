[README.md](https://github.com/user-attachments/files/33902402/README.md)
# DocuMind — Project Report Analyzer & Viva Coach

**Turn your project report into a focused viva-preparation session.** DocuMind analyzes a project report, extracts its key technical ideas, generates challenging report-specific viva questions, and gives structured feedback on your answers so you can identify what to revise before your defense.

## Overview

Preparing for a project viva can be difficult when it is unclear which parts of a report an examiner may challenge. DocuMind helps students review their work more deliberately by connecting questions and answer feedback to the report's problem statement, methodology, results, tools, and limitations.

## Features

- **Upload a report:** Work with PDF or plain-text (`.txt`) files, or paste report text into the app.
- **Automated report analysis:** Review a structured summary of the problem statement, proposed methodology, results and outcomes, and limitations.
- **Technical detail extraction:** Identify key algorithms or models, tools or datasets, and reported evaluation metrics.
- **Report-specific viva questions:** Generate 10 challenging questions across problem relevance, methodology, results, limitations, scalability, and general technical trade-offs.
- **Context for each question:** See the question's rationale and related report excerpt to understand what it is testing.
- **Answer evaluation:** Receive scores for relevance, specificity, and clarity, along with an overall defense score.
- **Actionable feedback:** Review strengths, weak points, improvement suggestions, and report sections or concepts to revisit.
- **Viva practice interface:** Practice answering questions in the dedicated viva room. Where supported, speech input uses the browser's Web Speech API.
- **Progress and review views:** Explore the analysis dashboard, weakness heatmap, and presentation-style report view.
- **Recent session history:** Keep up to five recent sessions in the browser's local storage.
- **Responsive interface:** A React and Tailwind CSS-based interface with Lucide icons and motion effects.

## How It Works

1. **Provide a report** by uploading a PDF or TXT file, pasting its text, or choosing an included sample report.
2. **Analyze the report.** DocuMind sends the document content to the backend, which requests a structured analysis and 10 tailored viva questions.
3. **Review the dashboard.** Explore the extracted summary, technical entities, questions, and report context.
4. **Practice your answers.** Respond to questions in writing or use speech input if your browser supports it.
5. **Evaluate and improve.** Receive a scored assessment and concrete revision recommendations.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling and UI | Tailwind CSS 4, Lucide React, Motion |
| Backend | Node.js, Express |
| Generative analysis | Google GenAI SDK, Gemini 2.5 Flash |
| Speech input | Browser Web Speech API, when available |
| Session history | Browser `localStorage` |
| Build tools | TypeScript, `tsx`, esbuild |

## Requirements

- Node.js (a current LTS release is recommended)
- npm
- A valid Gemini API key with access to the model used by the backend
- A modern browser; speech input depends on browser support and permissions

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd documind
```

If you already have the project files, open a terminal in the project directory instead.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure your environment

Create a file named `.env` in the project root and add your API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Replace the placeholder with your own key. Keep `.env` private and never commit API keys to a public repository. If a key has already been exposed, revoke it and generate a replacement.

### 4. Start the development server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser. The Express server hosts the API and integrates Vite for frontend development.

## Available Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the frontend and bundle the server for production |
| `npm start` | Start the built server (run `npm run build` first) |
| `npm run lint` | Run the TypeScript compiler checks (`tsc --noEmit`) |
| `npm run clean` | Remove generated build output |

## Production Build

Build the application:

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

The server serves the generated frontend from the `dist` directory in production mode. Configure `GEMINI_API_KEY` in the deployment environment before starting the application. The server currently listens on port **3000**; update the server configuration if your hosting platform requires a different port.

## API Endpoints

### `POST /api/analyze-document`

Analyzes the supplied report and returns a structured analysis plus viva questions.

The request body accepts:

```json
{
  "pdfBase64": "optional base64-encoded PDF data or data URL",
  "documentText": "optional plain-text report content",
  "fileName": "optional report title or file name"
}
```

Provide either `pdfBase64` or `documentText`. The response includes an `analysis` object and a `questions` array.

### `POST /api/evaluate-answer`

Evaluates a student's answer to a generated question.

The request body accepts:

```json
{
  "question": {
    "text": "The viva question",
    "category": "methodology",
    "rationale": "Why this question matters",
    "referenceText": "Related report detail"
  },
  "studentAnswer": "Your answer",
  "documentAnalysisSummary": {}
}
```

The response includes relevance, specificity, clarity, and overall scores, plus critique, strengths, weak points, improvement suggestions, and recommended reading. Use the question object generated by the analysis endpoint for the most complete context.

## Project Structure

```text
documind/
├── src/
│   ├── components/
│   │   ├── CaseFileDashboard.tsx
│   │   ├── PresentationDeck.tsx
│   │   ├── SpeechRecorder.tsx
│   │   ├── SpotlightView.tsx
│   │   ├── VivaRoom.tsx
│   │   └── WeaknessHeatmap.tsx
│   ├── data/
│   │   └── mockReports.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── server.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Privacy and Usage Notes

- Document content and answers submitted for analysis are sent to the configured generative AI service through the backend. Do not upload confidential, personal, or restricted material unless you are authorized to share it with that service.
- Recent sessions are stored in the browser's `localStorage` on the device and browser where you use the app. Clearing site data can remove this history.
- The application currently keeps up to five recent sessions in local storage; it does not provide server-side account-based history in the included implementation.
- AI-generated summaries, questions, and evaluations can be incomplete or incorrect. Verify technical claims against your original report and use the feedback as a study aid, not as an official assessment.
- Keep `.env`, API keys, and other credentials out of version control. Do not distribute a ZIP that contains real secrets.

## Troubleshooting

**The server reports that `GEMINI_API_KEY` is missing**

- Confirm that `.env` is in the project root, beside `package.json` and `server.ts`.
- Check that the variable is named exactly `GEMINI_API_KEY`.
- Restart the development server after changing the environment file.

**Document analysis or answer evaluation fails**

- Confirm your API key is valid and has access to the configured model.
- Check your internet connection and the terminal output for the backend error.
- Try a smaller PDF or a shorter text report to rule out request-size or content issues.

**Speech input is unavailable**

- Use a browser that supports the Web Speech API and grant microphone permission when prompted.
- You can still practice by typing your answer.

**The frontend does not load**

- Run `npm install` from the project root.
- Stop any previous process using port `3000`, then run `npm run dev` again.

## Contributing

Contributions and suggestions are welcome. For a change, create a branch, keep credentials out of commits, test the relevant workflow, and open a pull request with a clear description of the change.

## License

The source includes Apache-2.0 license notices in some files. Before redistributing the full project, confirm and add the appropriate repository-level `LICENSE` file and attribution requirements.

---

**DocuMind — Understand your report. Practice your defense. Improve with every answer.**
