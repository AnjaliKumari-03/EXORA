export function downloadResultAnalysis(examTitle, data) {
  const html = buildAnalysisHtml(examTitle, data);
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${examTitle.replace(/[^a-z0-9]+/gi, "-")}-analysis.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

function buildAnalysisHtml(examTitle, { result, sections, insights }) {
  const sectionScoreRows =
    result.sectionScores.length > 1
      ? `<table class="section-table">
          <thead><tr><th>Section</th><th>Score</th><th>Correct</th><th>Wrong</th><th>Skipped</th></tr></thead>
          <tbody>
            ${result.sectionScores
              .map(
                (s) => `<tr>
                  <td>${escapeHtml(s.title)}</td>
                  <td>${s.score}</td>
                  <td>${s.correctCount}</td>
                  <td>${s.wrongCount}</td>
                  <td>${s.skippedCount}</td>
                </tr>`,
              )
              .join("")}
          </tbody>
        </table>`
      : "";

  const insightsHtml = insights ? buildInsightsHtml(insights) : "";

  const sectionsHtml = sections
    .map(
      (section, sIndex) => `
        ${sections.length > 1 ? `<h3 class="section-title">${escapeHtml(section.title)}</h3>` : ""}
        ${section.questions.map((q, i) => questionHtml(q, i)).join("")}
      `,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(examTitle)} — Result analysis</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; background: #f5f2fb; color: #1f1330; padding: 24px; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  h2 { font-size: 17px; margin: 28px 0 12px; }
  h3 { font-size: 13px; color: #6b6178; margin: 20px 0 8px; }
  .score { text-align: center; background: #fff; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
  .score .big { font-size: 34px; font-weight: bold; color: #7c3aed; }
  .stats { display: flex; justify-content: center; gap: 32px; margin-top: 12px; }
  .stats div { text-align: center; }
  .stats .val { font-size: 20px; font-weight: bold; }
  .correct-val { color: #059669; } .wrong-val { color: #e11d48; } .skip-val { color: #78716c; }
  table.section-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 8px; }
  table.section-table th, table.section-table td { border-bottom: 1px solid #ede9f7; padding: 6px 8px; text-align: left; }
  .insights { background: #fff; border-radius: 12px; padding: 16px 20px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); font-size: 13px; }
  .insights li { margin-bottom: 6px; }
  .insights .weak { color: #e11d48; font-weight: 700; }
  .insights .strong { color: #059669; font-weight: 700; }
  .insights .pace { color: #d97706; font-weight: 700; }
  .type-chip { display: inline-block; background: #f5f2fb; border-radius: 8px; padding: 4px 10px; margin: 4px 6px 0 0; }
  .q-card { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
  .q-text { font-weight: 600; margin-bottom: 10px; white-space: pre-line; }
  .q-text img { max-width: 100%; border-radius: 8px; margin-top: 8px; display: block; }
  .opt { padding: 8px 10px; border-radius: 8px; border: 1px solid #ede9f7; font-size: 13px; margin-bottom: 6px; }
  .opt-correct { background: #d1fae5; border-color: #10b981; color: #047857; }
  .opt-wrong { background: #ffe4e6; border-color: #fb7185; color: #be123c; }
  .not-answered { color: #78716c; font-size: 13px; margin-top: 6px; }
  @media print { body { background: #fff; } .q-card, .score, .insights { box-shadow: none; border: 1px solid #ede9f7; } }
</style>
</head>
<body>
  <h1>${escapeHtml(examTitle)}</h1>
  <p style="color:#6b6178; margin-top:0;">Result analysis &middot; generated ${new Date().toLocaleString()}</p>

  <div class="score">
    <div style="font-size:13px; color:#6b6178; font-weight:600;">Score</div>
    <div class="big">${result.totalScore} <span style="font-size:18px; color:#6b6178; font-weight:500;">/ ${result.maxPossibleScore}</span></div>
    <div class="stats">
      <div><div class="val correct-val">${result.correctCount}</div>Correct</div>
      <div><div class="val wrong-val">${result.wrongCount}</div>Wrong</div>
      <div><div class="val skip-val">${result.skippedCount}</div>Skipped</div>
    </div>
  </div>

  ${sectionScoreRows}
  ${insightsHtml}

  <h2>Answer review</h2>
  ${sectionsHtml}
</body>
</html>`;
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes === 0 ? `${seconds}s` : `${minutes}m ${seconds}s`;
}

const TYPE_LABELS = { mcq: "MCQ", msq: "MSQ", numerical: "Numerical" };

function buildInsightsHtml(insights) {
  const { weakestSection, strongestSection, timeInsights, accuracyByType } =
    insights;
  const typeEntries = Object.entries(accuracyByType || {});
  const hasAnything =
    weakestSection || timeInsights.length > 0 || typeEntries.length > 1;
  if (!hasAnything) return "";

  const listItems = [
    weakestSection
      ? `<li><span class="weak">Weakest area:</span> ${escapeHtml(weakestSection.title)} — ${Math.round(
          weakestSection.accuracy * 100,
        )}% accuracy.</li>`
      : "",
    strongestSection
      ? `<li><span class="strong">Strongest area:</span> ${escapeHtml(strongestSection.title)} — ${Math.round(
          strongestSection.accuracy * 100,
        )}% accuracy.</li>`
      : "",
    ...timeInsights.map(
      (t) =>
        `<li><span class="pace">Pacing:</span> spent ${formatDuration(t.timeSpentSeconds)} on ${escapeHtml(
          t.title,
        )} — more than its fair share (~${formatDuration(t.fairShareSeconds)} expected).</li>`,
    ),
  ].join("");

  const typeChips = typeEntries
    .map(
      ([type, stats]) =>
        `<span class="type-chip">${TYPE_LABELS[type] || type}: ${stats.correct}/${stats.attempted} (${Math.round(
          stats.accuracy * 100,
        )}%)</span>`,
    )
    .join("");

  return `<div class="insights">
    <strong>Insights</strong>
    <ul>${listItems}</ul>
    ${typeEntries.length > 1 ? `<div>${typeChips}</div>` : ""}
  </div>`;
}

function questionHtml(q, index) {
  const isNumerical = q.type === "numerical";

  if (isNumerical) {
    const isCorrect = q.isNumericalCorrect;
    return `<div class="q-card">
      <div class="q-text">${index + 1}. ${escapeHtml(q.text)}${
        q.imageData ? `<img src="${q.imageData}" alt="Question diagram" />` : ""
      }</div>
      <div class="opt ${q.numericalAnswer === null ? "" : isCorrect ? "opt-correct" : "opt-wrong"}">
        Your answer: ${q.numericalAnswer === null ? "not answered" : escapeHtml(q.numericalAnswer)}
      </div>
      ${!isCorrect ? `<div class="opt opt-correct">Correct answer: ${escapeHtml(q.correctNumericalAnswer)}</div>` : ""}
    </div>`;
  }

  const optionsHtml = q.options
    .map((opt) => {
      const isCorrect = q.correctOptionIds.includes(opt.id);
      const wasSelected = q.selectedOptionIds.includes(opt.id);
      const isWrongPick = wasSelected && !isCorrect;
      const cls = isCorrect ? "opt-correct" : isWrongPick ? "opt-wrong" : "";
      const tag = isCorrect
        ? " &#10003; correct answer"
        : isWrongPick
          ? " &#10007; your answer"
          : "";
      return `<div class="opt ${cls}">${escapeHtml(opt.text)}${tag}</div>`;
    })
    .join("");

  return `<div class="q-card">
    <div class="q-text">${index + 1}. ${escapeHtml(q.text)}${
      q.imageData ? `<img src="${q.imageData}" alt="Question diagram" />` : ""
    }</div>
    ${optionsHtml}
    ${q.selectedOptionIds.length === 0 ? `<p class="not-answered">You didn't answer this question.</p>` : ""}
  </div>`;
}
