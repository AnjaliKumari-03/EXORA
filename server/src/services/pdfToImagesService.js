import * as mupdf from "mupdf";

const SCALE = 2;
const HARD_PAGE_CAP = 300;

export function extractPdfPages(buffer) {
  const doc = mupdf.Document.openDocument(buffer, "application/pdf");
  const pageCount = Math.min(doc.countPages(), HARD_PAGE_CAP);

  const pages = [];
  for (let i = 0; i < pageCount; i++) {
    const page = doc.loadPage(i);
    const pixmap = page.toPixmap(
      mupdf.Matrix.scale(SCALE, SCALE),
      mupdf.ColorSpace.DeviceRGB,
    );
    const text = page.toStructuredText("preserve-whitespace").asText();

    pages.push({ text, image: Buffer.from(pixmap.asPNG()) });
  }

  return pages;
}
