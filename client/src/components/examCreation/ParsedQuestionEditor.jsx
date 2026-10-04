import { compressImage } from "../../utils/compressImage.js";

export default function ParsedQuestionEditor({
  question,
  index,
  sections,
  onChange,
  onRemove,
}) {
  function update(field, value) {
    onChange({ ...question, [field]: value });
  }

  async function handleImageSelected(e) {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await compressImage(file);
    update("imageData", dataUrl);
  }

  function updateOptionText(optionIndex, text) {
    const options = question.options.map((opt, i) =>
      i === optionIndex ? { ...opt, text } : opt,
    );
    update("options", options);
  }

  function toggleCorrect(optionIndex) {
    const isCorrect = question.correctOptionIndexes.includes(optionIndex);
    const correctOptionIndexes = isCorrect
      ? question.correctOptionIndexes.filter((i) => i !== optionIndex)
      : [...question.correctOptionIndexes, optionIndex];
    update("correctOptionIndexes", correctOptionIndexes);
  }

  function addOption() {
    update("options", [...question.options, { text: "" }]);
  }

  function removeOption(optionIndex) {
    const options = question.options.filter((_, i) => i !== optionIndex);
    const correctOptionIndexes = question.correctOptionIndexes
      .filter((i) => i !== optionIndex)
      .map((i) => (i > optionIndex ? i - 1 : i));

    onChange({ ...question, options, correctOptionIndexes });
  }

  return (
    <div className="bg-surface rounded-xl shadow-md p-6 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-text-muted font-bold">
          Question {index + 1}
        </span>
        <div className="flex items-center gap-2">
          <select
            value={question.type}
            onChange={(e) => update("type", e.target.value)}
            className="text-sm px-2 py-1 rounded-lg border border-purple-200 font-bold"
            title="Question type — explicitly chosen, not guessed"
          >
            <option value="mcq">MCQ (single correct)</option>
            <option value="msq">MSQ (multiple correct)</option>
            <option value="numerical">Numerical (typed answer)</option>
          </select>
          <select
            value={question.sectionId}
            onChange={(e) => update("sectionId", e.target.value)}
            className="text-sm px-2 py-1 rounded-lg border border-purple-200"
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <button
            onClick={onRemove}
            className="text-rose-600 text-xs font-bold"
          >
            Remove question
          </button>
        </div>
      </div>

      <textarea
        value={question.text}
        onChange={(e) => update("text", e.target.value)}
        rows={3}
        className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary whitespace-pre-line"
      />

      <div className="mt-3">
        {question.imageData ? (
          <div className="relative inline-block">
            <img
              src={question.imageData}
              alt="Question diagram"
              className="max-w-xs rounded-lg border border-purple-100"
            />
            <button
              onClick={() => update("imageData", null)}
              className="absolute top-1 right-1 bg-white text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full shadow"
            >
              Remove
            </button>
          </div>
        ) : (
          <label className="text-sm text-primary font-bold cursor-pointer">
            + Attach image (diagram, tree, chart)
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelected}
              className="hidden"
            />
          </label>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {question.type === "numerical" ? (
          <div>
            <label className="text-sm text-text-muted font-bold block mb-1">
              Correct answer
            </label>
            <input
              type="text"
              value={question.correctNumericalAnswer ?? ""}
              onChange={(e) =>
                update(
                  "correctNumericalAnswer",
                  e.target.value === "" ? null : e.target.value,
                )
              }
              placeholder="e.g. 42, O(n log n), True..."
              className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        ) : (
          <>
            {question.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={question.correctOptionIndexes.includes(i)}
                  onChange={() => toggleCorrect(i)}
                  title="Mark as correct answer"
                />
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => updateOptionText(i, e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <button
                  onClick={() => removeOption(i)}
                  className="text-rose-600 text-xs font-bold"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="text-primary text-sm font-bold"
            >
              + Add option
            </button>
          </>
        )}
      </div>

      {question.type !== "numerical" &&
        question.correctOptionIndexes.length === 0 && (
          <p className="text-amber-600 text-sm font-semibold mt-2">
            Select at least one correct answer above.
          </p>
        )}
      {question.type === "numerical" &&
        question.correctNumericalAnswer === null && (
          <p className="text-amber-600 text-sm font-semibold mt-2">
            Enter the correct answer above.
          </p>
        )}
    </div>
  );
}
