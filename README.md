# SecureExam — Phase 2, Chunk 1 (Upload & Parse, AI-powered)

Upload a PDF/Word question paper and see the parsed draft output. Extraction
is AI-based (Gemini free tier) with a regex-based fallback if the AI call
fails for any reason. For PDFs, each page is also rendered to an image and
sent to Gemini alongside the raw text, so tables, diagrams, and formatting
like exponents/superscripts are read correctly instead of being lost to
plain text extraction. Nothing is saved to the database yet — this chunk
exists to sanity-check extraction quality before building the editable
review screen.

## Setup

**1. Get a free Gemini API key**
Go to https://aistudio.google.com/apikey, create a key (no payment info
needed for the free tier), and paste it into `server/.env` as `GEMINI_API_KEY`.

**Backend:**
```
cd server
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY
npm run dev
```

**Frontend** (second terminal):
```
cd client
npm install
npm run dev
```

## What success looks like

1. Log in, go to Dashboard, click "+ Create exam"
2. Upload a PDF or Word file containing a question paper
3. See parsed questions with correct answer(s) highlighted where detectable,
   including tables/diagrams/exponents read correctly via page images

If you ever see the yellow "AI extraction wasn't available" banner, that
means the Gemini call failed and the app fell back to the older regex
parser — check your server terminal for the specific error logged there.
That fallback is text-only and can't read tables/diagrams/exponents at all.

PDF page rendering uses `unpdf` + `@napi-rs/canvas` (prebuilt binaries, no
native build tools required, works on Windows without extra setup).
