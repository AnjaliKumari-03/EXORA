const HAS_QUESTION_NO_MARKER = /Question\s*No\.?\s*\d+/i;
const QUESTION_NO_MARKER = /Question\s*No\.?\s*\d+\s*/gi;
const OPTIONS_MARKER = /Options\s*:/i;
const ANSWER_MARKER = /Answer\s*:/i;
const NUMERIC_OPTION_LINE = /(?:^|\n)\s*(?:\d+|[a-dA-D])[.)]\s+/g;
const PAGE_FOOTER = /--\s*\d+\s*of\s*\d+\s*--/g;

const ANSWER_KEY_HEADING = /Answer\s*Key/i;
const TAG_LINE = /(?:^|\n)[ \t]*\[\s*(?:MCQ|MSQ)s?\s*\][ \t]*(?=\n|$)/gi;
const QUESTION_NUMBER_START = /(?:^|\n)\s*(\d+)[.)]\s+/g;
const PARENTHESIZED_OPTION = /(?:^|\n)\s*\(([a-dA-D])\)\s*/g;
const BARE_LETTER_OPTION = /(?:^|\n)\s*([a-dA-D])[.)]\s+/g;
const ANSWER_KEY_ENTRY =
  /(\d+)[.)]\s*\(?\s*([a-dA-D](?:\s*,\s*[a-dA-D])*)\s*\)?/g;

export function extractQuestions(rawText) {
  const text = stripBoilerplate(
    decodeHtmlEntities(rawText.replace(/\r\n/g, "\n")),
  );

  const draftQuestions = HAS_QUESTION_NO_MARKER.test(text)
    ? parseInlineAnswerFormat(text)
    : parseAnswerKeyFormat(text);

  return draftQuestions
    .filter((q) => q.options.length > 0)
    .map((q) => ({
      type: q.correctOptionIndexes.length > 1 ? "msq" : "mcq",
      text: q.text,
      options: q.options,
      correctOptionIndexes: q.correctOptionIndexes,
      correctNumericalAnswer: null,
    }));
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripBoilerplate(text) {
  const lines = text.replace(PAGE_FOOTER, "").split("\n");
  const counts = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 15) continue;
    counts[trimmed] = (counts[trimmed] || 0) + 1;
  }

  const boilerplateLines = new Set(
    Object.keys(counts).filter((line) => counts[line] >= 3),
  );
  return lines.filter((line) => !boilerplateLines.has(line.trim())).join("\n");
}

function parseInlineAnswerFormat(text) {
  QUESTION_NO_MARKER.lastIndex = 0;
  return text
    .split(QUESTION_NO_MARKER)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(parseInlineQuestionBlock);
}

function parseInlineQuestionBlock(block) {
  const optionsMatch = block.match(OPTIONS_MARKER);
  if (!optionsMatch) {
    return { text: block, options: [], correctOptionIndexes: [] };
  }

  const questionText = block.slice(0, optionsMatch.index).trim();
  const afterOptions = block.slice(optionsMatch.index + optionsMatch[0].length);

  const answerMatch = afterOptions.match(ANSWER_MARKER);
  const optionsText = answerMatch
    ? afterOptions.slice(0, answerMatch.index)
    : afterOptions;
  const options = parseNumericOrLetterOptions(optionsText);

  const correctOptionIndexes = [];
  if (answerMatch) {
    const index = matchAnswerToOption(
      afterOptions.slice(answerMatch.index + answerMatch[0].length),
      options,
    );
    if (index !== null) correctOptionIndexes.push(index);
  }

  return { text: questionText, options, correctOptionIndexes };
}

function parseNumericOrLetterOptions(optionsText) {
  const matches = [...optionsText.matchAll(NUMERIC_OPTION_LINE)];
  if (matches.length === 0) return [];

  return matches
    .map((match, i) => {
      const start = match.index + match[0].length;
      const end = matches[i + 1]?.index ?? optionsText.length;
      return { text: optionsText.slice(start, end).trim() };
    })
    .filter((opt) => opt.text.length > 0);
}

function matchAnswerToOption(textAfterAnswer, options) {
  const answerText = normalizeForComparison(textAfterAnswer.split("\n")[0]);
  const index = options.findIndex(
    (opt) => normalizeForComparison(opt.text) === answerText,
  );
  return index === -1 ? null : index;
}

function normalizeForComparison(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.;,]+$/, "");
}

function parseAnswerKeyFormat(text) {
  const { body, answerKeyText } = splitOffAnswerKey(text);
  const answerMap = parseAnswerKeySection(answerKeyText);
  const cleanedBody = body.replace(TAG_LINE, "");

  QUESTION_NUMBER_START.lastIndex = 0;
  const parts = cleanedBody.split(QUESTION_NUMBER_START);

  const questions = [];
  for (let i = 1; i < parts.length; i += 2) {
    const questionNumber = parts[i];
    const content = parts[i + 1] || "";
    questions.push(
      parseLetteredQuestionBlock(content, answerMap[questionNumber]),
    );
  }
  return questions;
}

function splitOffAnswerKey(text) {
  const match = text.match(ANSWER_KEY_HEADING);
  if (!match) return { body: text, answerKeyText: "" };
  return {
    body: text.slice(0, match.index),
    answerKeyText: text.slice(match.index),
  };
}

function parseAnswerKeySection(answerKeyText) {
  const map = {};
  for (const match of answerKeyText.matchAll(ANSWER_KEY_ENTRY)) {
    const [, number, lettersRaw] = match;
    map[number] = lettersRaw
      .split(",")
      .map((letter) => letter.trim().toLowerCase());
  }
  return map;
}

function parseLetteredQuestionBlock(content, correctLetters) {
  let { options, firstIndex } = parseLetterOptions(
    content,
    PARENTHESIZED_OPTION,
  );
  if (options.length === 0) {
    ({ options, firstIndex } = parseLetterOptions(content, BARE_LETTER_OPTION));
  }

  const questionText = content.slice(0, firstIndex ?? content.length).trim();

  const correctOptionIndexes = (correctLetters || [])
    .map((letter) => options.findIndex((opt) => opt.letter === letter))
    .filter((index) => index !== -1);

  return {
    text: questionText,
    options: options.map((opt) => ({ text: opt.text })),
    correctOptionIndexes,
  };
}

function parseLetterOptions(content, pattern) {
  const regex = new RegExp(pattern.source, pattern.flags);
  const matches = [...content.matchAll(regex)];
  if (matches.length === 0) return { options: [], firstIndex: null };

  const options = matches.map((match, i) => {
    const start = match.index + match[0].length;
    const end = matches[i + 1]?.index ?? content.length;
    return {
      letter: match[1].toLowerCase(),
      text: content.slice(start, end).trim(),
    };
  });

  return { options, firstIndex: matches[0].index };
}
