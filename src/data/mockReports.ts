/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SampleReport {
  title: string;
  author: string;
  domain: string;
  text: string;
}

export const SAMPLE_REPORTS: SampleReport[] = [
  {
    title: "Predictive Maintenance of Offshore Wind Turbines using Deep LSTM Networks",
    author: "Rehan Sheikh",
    domain: "IoT, Deep Learning & Renewable Energy",
    text: `TITLE: Predictive Maintenance of Offshore Wind Turbines using Deep LSTM Networks
AUTHOR: Rehan Sheikh
AFFILIATION: Department of Engineering, Technology & Automation

ABSTRACT:
Offshore wind turbines operate in highly adverse environmental conditions, rendering physical inspections extremely costly and risky. This project proposes an automated predictive maintenance system that leverages internet-of-things (IoT) SCADA sensor streams and multi-layered Long Short-Term Memory (LSTM) recurrent neural networks to forecast bearing failure up to 72 hours in advance.

1. PROBLEM STATEMENT:
Main shaft bearing failure is one of the most critical structural issues in offshore wind turbines, resulting in average downtime of 14 days and repair costs exceeding $150,000 per event. Traditional maintenance strategies are either reactive (run-to-failure) or scheduled (preventative), both of which are highly suboptimal. Preventative maintenance often replaces perfectly functioning bearings prematurely, while reactive maintenance incurs catastrophic secondary damage to surrounding gearboxes. The research objective is to develop a data-driven system to detect micro-vibration and temperature anomalies, predicting failure signatures prior to structural fracture.

2. PROPOSED METHODOLOGY:
This project uses a 3-layer bidirectional Long Short-Term Memory (LSTM) network integrated with attention mechanisms to model sequential dependencies in historical SCADA sensor data. 
The input feature space consists of 12 distinct IoT streams collected at 10 Hz, including:
- Active power output (kW)
- Generator bearing temperature (°C)
- Nacelle vibration amplitude (mm/s^2)
- Gearbox oil temperature (°C)
- Ambient wind speed (m/s)

Data preprocessing implements a rolling window extraction of 60-second intervals (600 time-steps). A min-max normalization scales all inputs between -1 and 1. The architecture incorporates:
- Input layer: 12 units
- Bidirectional LSTM Layer 1: 128 hidden units, recurrent dropout of 0.2
- Bidirectional LSTM Layer 2: 64 hidden units, recurrent dropout of 0.2
- Attention Layer: Softmax-based attention weighting to pinpoint anomalous temporal spikes
- Dense fully connected output layer: 1 unit with sigmoid activation representing Probability of Failure (PoF) within the 72-hour window.

3. RESULTS AND OUTCOMES:
The system was trained on 4.2 GB of raw SCADA logs spanning 18 months from 4 turbines in the North Sea.
The model achieved:
- Failure Prediction Accuracy (AUC-ROC): 94.2%
- Precision: 89.5%
- Recall (Sensitivity): 91.8%
- False Positive Rate: 2.1%
The average lead-time for bearing degradation alerts was 68.4 hours, giving maintenance teams a reliable window to dispatch logistics vessel crews.

4. LIMITATIONS & FUTURE SCOPE:
The model exhibits performance degradation during severe extreme weather events (e.g., storms exceeding wind speeds of 25 m/s) where sensor noise spikes dramatically, leading to a temporary increase in false alerts. Furthermore, the current LSTM architecture is computationally heavy, demanding dedicated server-side GPU resources, which limits its execution on standard edge gateways installed inside the turbine nacelles. Future work will investigate model compression using quantization and knowledge distillation to run lightweight models directly at the edge.`
  },
  {
    title: "DocuMind: Socratic AI-Powered Mock Viva Examiner & NLP Feedback Engine",
    author: "AI Studio Innovator",
    domain: "Natural Language Processing, Socratic RAG, Speech-to-Text",
    text: `TITLE: DocuMind: Socratic AI-Powered Mock Viva Examiner & NLP Feedback Engine
AUTHOR: AI Studio Developer Team
AFFILIATION: School of Computing & Artificial Intelligence

ABSTRACT:
Standard PDF Q&A bots are passive, providing direct answers that discourage active recall. DocuMind shifts this paradigm by acting as a Socratic Interviewer. It analyzes uploaded academic and project reports, performs Named Entity Recognition (NER) to isolate key components, generates 10 tough cross-examination questions, and evaluates spoken responses for relevance, specificity, and clarity using LLM-based feedback.

1. PROBLEM STATEMENT:
Students and researchers face significant anxiety and lack of high-fidelity practice resources when preparing for their thesis defenses, project vivas, or board reviews. While there are plenty of generative AI search engines, they operate in "answering" mode, which triggers confirmation bias and passive scanning. There is a lack of Socratic systems that actively interrogate students, pressure-test their design choices, evaluate spoken feedback in real-time, and point out conceptual vulnerabilities in their documentation.

2. PROPOSED METHODOLOGY:
DocuMind implements a full-stack, stateful Socratic feedback architecture.
- Document Loading: Receives multi-format text or raw base64 PDF uploads.
- NLP Extraction and NER: Uses Gemini to identify the Problem Statement, Proposed Methodology, Results, and Limitations, isolating entities like Key Algorithms, Datasets, and Validation Metrics.
- Socratic Generation: Synthesizes 10 highly targeted, non-generic cross-examination questions, map-linking each question to its source text in the report (the Spotlight Context).
- Vocal Transcription: Utilizes the browser's native Web Speech API (SpeechRecognition) to capture continuous verbal answers from the user, displaying live visual waveforms and timers.
- Multi-Dimensional Evaluation: Executes a server-side Gemini NLP evaluation loop that grades answers on a 0-100 scale based on:
  a) Relevance (answering the question asked directly)
  b) Specificity (referencing key algorithms, parameters, page details)
  c) Clarity (professional structuring vs. rambling)
  It produces an overall Defense Score, Socratic critiques, list of weaknesses, and actionable reading advice.

3. RESULTS AND OUTCOMES:
In pilot evaluations involving 45 graduating engineering students:
- User preparedness confidence increased by 42% on pre-post self-assessments.
- Spoken response specificity score increased by 28% after three training sessions.
- Users praised the 'Case File' dashboard theme for simulating realistic viva board pressure, and the Spotlight View for successfully forcing recall rather than reading.
- API response latency averages under 2.4 seconds for Socratic question generation and under 1.8 seconds for answer evaluation.

4. LIMITATIONS & FUTURE SCOPE:
The system relies on client-side Web Speech API, which requires active microphone permissions, a quiet environment, and depends on browser-level language support. Heavy accents or bad hardware can lead to transcription typos, though the server-side Gemini model is highly resilient to phoneme transcription errors. Future work will include multi-user group panel simulation and multi-lingual voice synthesizers.`
  }
];
