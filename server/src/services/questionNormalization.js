export const EXTRACTION_PROMPT = `You are extracting exam questions from a question paper.

Below is the raw text extracted from the PDF, followed by an image of each page. Plain text extraction loses table structure, diagrams, and formatting like superscripts/subscripts/exponents (e.g. powers, scientific notation) — use the page images as the source of truth for anything like that, and use the raw text to confirm exact wording elsewhere.

Return ONLY a JSON array (no markdown, no explanation). Each item is EITHER a multiple-choice/multiple-select question:
{
  "type": "mcq" or "msq",
  "text": "the question text, exactly as written (reconstruct tables/diagrams as clear plain text if the question depends on one)",
  "options": [{ "text": "option text" }, ...],
  "correctOptionIndexes": [0-based index of each correct option, if determinable]
}

OR a numerical/fill-in-the-blank question — one with NO answer options, expecting a typed answer instead (common in technical/competitive exams, e.g. "The value of X is ____"). Despite the field name, the expected answer does NOT have to be a plain number — it can be a formula, a unit, a word, or any short expression (e.g. "O(n log n)", "True", "5 kg"):
{
  "type": "numerical",
  "text": "the question text, exactly as written",
  "correctNumericalAnswer": the correct answer exactly as it should be typed, as a string, or null if it truly cannot be determined
}

Rules:
- Only include real gradable questions — either one with options (mcq/msq) or a numerical one expecting a typed value. Do NOT skip a question just because it has no options; classify it as "numerical" instead.
- Skip passages, instructions, "Direction:" text, headers, footers, page numbers, and anything that isn't itself a gradable question.
- Read any table or diagram in the page images carefully — do not guess values from partial text; if a question references a table/diagram, transcribe the relevant values accurately from the image into the question text.
- For tree/graph diagrams specifically: never flatten them into an ambiguous single-line list of numbers. Represent the parent-child structure explicitly, one relationship per line, e.g.:
  "Root: 8\\n  Left child of 8: 4\\n  Right child of 8: 12\\n  Left child of 4: 2\\n  Right child of 4: 6\\n  Left child of 12: 10\\n  Right child of 12: 14"
  Use \\n for line breaks within the "text" field so the structure stays readable. If the question has both an input and output tree, clearly label each one and repeat this structure for both.
- Pay close attention to exponents, powers, and superscript/subscript notation in the images — these are easy to misread as plain digits from text alone.
- If the paper states the correct answer (inline "Answer :", a separate answer key, bold/marked options, etc.), use it to fill correctOptionIndexes (mcq/msq) or correctNumericalAnswer (numerical). A question can have more than one correct index (MSQ).
- If the correct answer truly cannot be determined, return an empty array for correctOptionIndexes, or null for correctNumericalAnswer — do not guess.
- Preserve option and question text as written; do not paraphrase or fix wording.

Raw extracted text:
---
`;

export function normalizeQuestions(rawQuestions) {
  if (!Array.isArray(rawQuestions)) {
    throw new Error("AI response was not an array of questions");
  }

  return rawQuestions
    .filter((q) => q && typeof q.text === "string")
    .map(normalizeOneQuestion)
    .filter((q) => q.type === "numerical" || q.options.length > 0);
}

function normalizeOneQuestion(q) {
  if (q.type === "numerical") {
    let correctAnswer = null;
    if (
      typeof q.correctNumericalAnswer === "string" &&
      q.correctNumericalAnswer.trim()
    ) {
      correctAnswer = q.correctNumericalAnswer.trim();
    } else if (typeof q.correctNumericalAnswer === "number") {
      correctAnswer = String(q.correctNumericalAnswer);
    }
    return {
      type: "numerical",
      text: q.text.trim(),
      options: [],
      correctOptionIndexes: [],
      correctNumericalAnswer: correctAnswer,
    };
  }

  return {
    type: q.type === "msq" ? "msq" : "mcq",
    text: q.text.trim(),
    options: Array.isArray(q.options)
      ? q.options
          .filter((opt) => opt && typeof opt.text === "string")
          .map((opt) => ({ text: opt.text.trim() }))
      : [],
    correctOptionIndexes: Array.isArray(q.correctOptionIndexes)
      ? q.correctOptionIndexes.filter((i) => Number.isInteger(i))
      : [],
    correctNumericalAnswer: null,
  };
}

export function parseJsonResponse(text) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/```$/, "")
    .trim();
  return JSON.parse(cleaned);
}
