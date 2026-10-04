
<img src="client/public/logo.png" alt="EXORA logo" width="120" />

# EXORA

### Smarter. Safer. Assessments.

**Turn a question-paper PDF or Word file into a secure, timed, auto-graded online exam, with post-exam analytics included.**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_4-339933?logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-47A248?logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/AI-Gemini_%C2%B7?logo=googlegemini&logoColor=white)
![Auth](https://img.shields.io/badge/Auth-JWT_%2B_bcrypt-black?logo=jsonwebtokens)

[Features](#-features) · [How it works](#-how-it-works) · [Architecture](#-architecture) · [Quick start](#-quick-start) · [API](#-api-reference) · [Security model](#-security-model) · [Roadmap](#-known-limitations--roadmap)

</div>

---

## Why EXORA?

Preparing an online mock test usually means retyping hundreds of questions into a form builder. EXORA removes that step. Upload the paper you already have and an AI pipeline reads **every page as both text and an image**, so tables, diagrams, trees and exponents survive extraction. You review and edit the draft, configure timing and marking, and publish. Students then sit the exam in a fullscreen, integrity-monitored environment, and the server grades them against an answer key they never see.

> Built with competitive-exam workflows in mind (GATE, SSC, Banking and similar): negative marking, MCQ + MSQ + typed-answer questions, sectional timers, question palettes and mark-for-review.

---

## ✨ Features

### 🧠 AI-powered exam creation
- **Upload PDF or Word** question papers (up to 10 MB).
- **Multimodal extraction.** Each PDF page is rendered to a 2× PNG *and* its text is extracted, then both are sent to the model. The images are the source of truth for tables, diagrams and superscripts, and the text confirms exact wording.
- **AI:** Gemini. The provider has its own model-candidate list and moves to the next model on `429 / 503 / 404`. 
- **Regex fallback parser** if AI tier fails, so an upload never dead-ends. The UI shows a warning banner when this happens.
- **Batched, concurrent processing.** Large PDFs (up to 300 pages) are split into 8-page batches and processed 3 at a time, which avoids silent truncation and keeps wall-clock time reasonable.
- **Answer detection.** If the paper contains inline answers, bold or marked options, or an answer key, the correct options are pre-filled. If the answer can't be determined, the field is left empty rather than guessed.
- **Tree/graph aware.** The extraction prompt forces explicit parent→child lines, so a tree diagram never becomes an ambiguous list of numbers.

### ✍️ Review and edit studio
- Edit any parsed question, option, correct answer or marks before saving.
- Three question types: **MCQ**, **MSQ** (multi-select) and **Numerical / typed answer**. The typed-answer type accepts formulas and words as well as numbers, e.g. `O(n log n)` or `True`.
- Attach **diagram images** to questions. Images are compressed client-side (max 800 px, JPEG 70%) before being stored.
- **Sections:** create them, then bulk-assign a range of questions (e.g. Q1–Q25 → *Aptitude*) with the Section Assign tool.
- **Categories** (GATE, SSC, …) with autocomplete from your existing ones. The dashboard groups exams by category.
- Edit saved exams later. **Original IDs are preserved**, so existing attempts and results never break.

### ⏱️ Flexible exam engine
| Setting | Options |
|---|---|
| **Navigation** | `free` (move back and forth) or `one-way` (forward only) |
| **Section model** | **Shared timer**: one overall clock and free jumping between sections. **Restricted**: strictly sequential sections, each with its own mandatory timer |
| **Marking** | Positive and negative marks per question. Typed-answer questions default to 0 negative |
| **Randomisation** | Questions (within sections) and options are shuffled **per attempt**. The order is saved, so a refresh shows the same order |
| **Resume** | Refreshing or reconnecting resumes the same attempt. The timer is anchored to the server-recorded start time and never restarts |

### 🛡️ Integrity monitoring
- **Fullscreen gate.** Nothing is shown or tracked until the student clicks *Enter fullscreen & start*.
- **Detects** tab switches, window focus loss, fullscreen exit and blocked shortcuts. Every event is **logged server-side with a timestamp**.
- **3-strike policy.** Strikes from any combination of the above count together. The 3rd auto-submits the exam, after a must-acknowledge warning modal on each strike.
- **10-second fullscreen-exit countdown**, driven by a wall-clock deadline so it can't drift or fire early.
- **Flicker-proof detection.** A 600 ms "return dwell" stops one real action, such as a PrintScreen overlay, from being counted as multiple strikes.
- **Lockdown deterrents:** copy, cut, paste and right-click are disabled, and DevTools and view-source shortcuts (F12, Ctrl/Cmd+Shift+I/J/C, Ctrl/Cmd+U) are blocked.
- **Desktop-only** attempts (≥ 1024 px viewport).
- Exam owners see a **violation count per student** on the results overview.

### 📊 Results and insights
- Instant server-side grading with a scorecard (score, correct / wrong / skipped) and **per-section breakdown**.
- **Question-by-question review** showing your answer against the correct one. Correct answers are revealed only *after* submission.
- **Rule-based insights:**
  - strongest and weakest section by accuracy
  - sections where you spent more than **1.5×** your fair share of time
  - accuracy by question type (MCQ / MSQ / Numerical)
- **Download your analysis** as a self-contained HTML file (images included) that can be printed to PDF.
- **Owner view:** every attempt on your exam, with student, score, submit time, auto-submit flag and integrity flags. Owners can open any student's full result.

### 🎨 Polish
- Light and dark themes (follows the OS preference, then remembers your choice).
- Question palette with Not-visited / Attempted / Not-attempted / Marked-for-review states.
- Submit-confirmation summary, loading-state messaging for long parses, and two-step "armed" delete for exams.

---



## 🏗️ Architecture

```
┌──────────────────────────┐        REST/JSON + JWT         ┌────────────────────────────┐
│  Client  (React + Vite)  │ ─────────────────────────────▶ │  Server  (Node + Express)  │
│  Zustand · Tailwind v4   │                                │  Controllers → Services    │
│  Integrity hooks         │ ◀───────────────────────────── │  Mongoose models           │
└──────────────────────────┘                                └─────────┬──────────────────┘
                                                                      │
                          ┌───────────────────────────────────────────┼─────────────────────┐
                          ▼                                           ▼                     ▼
                  ┌──────────────┐                         ┌────────────────────┐   ┌──────────────┐
                  │   MongoDB    │                         │ MuPDF · pdf-parse  │   │ Gemini       │
                  │ User · Exam  │                         │ mammoth (parsing)  │   │              │
                  │ Attempt·Result│                        └────────────────────┘   └──────────────┘
                  └──────────────┘
```

### Tech stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router 6, Zustand, Axios, Tailwind CSS 4 (`@tailwindcss/vite`), Vite 5 |
| **Backend** | Node.js (ES modules), Express 4, Mongoose 8, Multer (memory storage), CORS |
| **Auth** | JSON Web Tokens (7-day expiry), bcryptjs (10 rounds) |
| **Document parsing** | MuPDF (page rendering + structured text), `pdf-parse`, `mammoth` (Word) |
| **AI** | Google Gemini (primary). Use free tiers |
| **Database** | MongoDB (Atlas-ready) |

### Project structure

```
secure-exam-platform/
├── client/                          # React SPA
│   ├── public/logo.png
│   └── src/
│       ├── pages/                   # Login, Signup, Dashboard, CreateExam, ReviewParsedExam,
│       │                            # ExamAttempt, Result, ExamResultsOverview
│       ├── components/
│       │   ├── examCreation/        # Dropzone, config form, section tools, question editor
│       │   ├── examAttempt/         # Timer, palette, question card, fullscreen gate,
│       │   │                        # strike / countdown / submit modals, navigation
│       │   ├── result/              # Score summary, answer review, insights card
│       │   └── layout/              # Brand, footer, theme toggle, protected route
│       ├── hooks/
│       │   ├── useIntegrityMonitor.js   # tab / blur / fullscreen detection + strike logging
│       │   ├── useExamLockdown.js       # copy/paste/right-click/devtools deterrents
│       │   └── useCountdownTimer.js
│       ├── store/                   # Zustand: auth, exam session, theme
│       ├── api/                     # Axios client + per-resource API modules
│       └── utils/                   # image compression, HTML analysis export, formatting
│
└── server/
    └── src/
        ├── controllers/             # auth, exam, attempt, result
        ├── routes/                  # /auth  /exams  /attempts  /results
        ├── models/                  # User, Exam, Attempt, Result
        ├── middleware/              # JWT auth, multer upload, JSON error handler
        ├── services/
        │   ├── aiQuestionExtractorService.js   # Gemini 
        │   ├── pdfToImagesService.js           # MuPDF: page PNG + text, paired per page
        │   ├── pdfBatchExtractionService.js    # batching + bounded concurrency
        │   ├── questionNormalization.js        # extraction prompt + schema normalizer
        │   ├── questionExtractorService.js     # regex fallback parser
        │   ├── sanitizeExamService.js          # strips the answer key for attempts
        │   ├── shuffleService.js               # Fisher–Yates per-attempt shuffle
        │   ├── gradingService.js               # scoring engine
        │   ├── answerMatching.js               # shared matcher (grading == review)
        │   └── insightService.js               # weak/strong section, time & type insights
        └── utils/generateToken.js
```

---

## 🚀 Quick start

### Prerequisites
- **Node.js 18+** (uses the built-in `fetch`)
- A **MongoDB** connection string ([MongoDB Atlas](https://www.mongodb.com/atlas) free tier works)
- A free **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey) 

### 1. Backend

```bash
cd server
npm install
cp .env.example .env     # then fill in the values below
npm run dev              # http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
npm run dev              # http://localhost:5173
```

### 3. Try it

1. Sign up and log in.
2. On the dashboard click **+ Create exam** and upload a question paper (PDF or Word).
3. Review the parsed questions, set the title, category, timing, sections and marking, then **Save**.
4. Click **Take exam**, enter fullscreen, and attempt it.
5. Submit, then explore the scorecard, insights and the owner results overview.




---



## 🧮 Grading rules

| Question type | Correct | Wrong | Blank |
|---|---|---|---|
| **MCQ / MSQ** | `+positiveMarks` if the selected set **exactly equals** the correct set | `−negativeMarks` | `0` |
| **Numerical / typed** | `+positiveMarks` on a case-insensitive, trimmed match | `−negativeMarks` (default `0`) | `0` |

There is no partial credit for MSQ. The *same* matching function powers both grading and the review page, so the review can never disagree with the score.

---

## 🔐 Security model

**Enforced on the server**
- **The answer key never reaches the client during an attempt.** `sanitizeExamService` is the single choke point that strips `correctOptionIds` and correct answers. Keys are revealed only on a *submitted* attempt's result.
- **Grading happens only on the server**, at submit time.
- **Ownership checks:** only owners can edit, delete or list results for their exams. A result is readable only by its student or the exam owner, and anyone else gets a `404`.
- **Passwords** are hashed with bcrypt, and sessions use signed, expiring JWTs.
- Uploads are limited to PDF/Word and 10 MB, JSON bodies to 25 MB, and PDF rendering to 300 pages.
- Writes to an attempt are scoped to in-progress attempts of the authenticated user.
- All errors return clean JSON, never HTML stack pages.

**Client-side deterrents (honest about their limits)**
Fullscreen, focus tracking and shortcut blocking are **detection and deterrence, not a guarantee**. A determined user can always use a second device or an OS-level tool, and no browser JavaScript can prevent that. EXORA is designed to make cheating inconvenient and visible: every event is timestamped, persisted and shown to the exam owner, and three strikes ends the attempt. The student-facing copy says this plainly.

---


Questions are embedded in sections inside the `Exam` document: `type` (`mcq | msq | numerical`), `text`, optional base64 `imageData`, `options[]`, `correctOptionIds[]`, `correctNumericalAnswer`, and `positiveMarks` / `negativeMarks`.

---

## 🧩 Notable engineering decisions

- **Page-image + text pairing.** MuPDF produces both from the same page, so boundaries line up exactly and batching is clean.
- **Bounded-concurrency worker pool** rather than sequential (too slow) or `Promise.all` over everything (rate-limit pain).
- **Provider failover on retryable errors only.** `429/503/404` move to the next model, while auth failures stop early.
- **Order-stable edits.** `updateExam` keeps real `_id`s for existing sections, questions and options, so historical results stay valid after an edit.
- **Wall-clock deadlines** for countdowns instead of decrementing counters, so they can't drift or fire early.
- **React overlay instead of `window.alert()`** for strike warnings, because a native alert steals focus and would itself trigger a fake violation.
- **Keyed route remounting** (`key={examId}`) so integrity state can't leak between two attempts.
- **Presentation order stored on the attempt**, so a refresh doesn't reshuffle and a retake gets a fresh shuffle. Grading compares option IDs, never positions.

---



<div align="center">

**EXORA** · *Smarter. Safer. Assessments.*

</div>
