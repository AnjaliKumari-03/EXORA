import { extractQuestionsWithAI } from "./aiQuestionExtractorService.js";
import { extractQuestions as extractQuestionsWithRegex } from "./questionExtractorService.js";

const PAGES_PER_BATCH = 8;
const CONCURRENT_BATCHES = 3;

export async function extractQuestionsFromPdfPages(pages) {
  const batches = chunk(pages, PAGES_PER_BATCH);
  const results = new Array(batches.length);
  let anyBatchUsedFallback = false;

  let nextBatchIndex = 0;
  async function worker() {
    while (nextBatchIndex < batches.length) {
      const batchIndex = nextBatchIndex++;
      const batch = batches[batchIndex];
      const batchText = batch.map((p) => p.text).join("\n\n");
      const batchImages = batch.map((p) => p.image);

      try {
        results[batchIndex] = await extractQuestionsWithAI(
          batchText,
          batchImages,
        );
      } catch (err) {
        console.warn(
          `Gemini extraction failed for batch ${batchIndex + 1}, falling back to regex for it:`,
          err.message,
        );
        anyBatchUsedFallback = true;
        results[batchIndex] = extractQuestionsWithRegex(batchText);
      }
    }
  }

  const workerCount = Math.min(CONCURRENT_BATCHES, batches.length);
  await Promise.all(Array.from({ length: workerCount }, worker));

  return { questions: results.flat(), usedFallback: anyBatchUsedFallback };
}

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
