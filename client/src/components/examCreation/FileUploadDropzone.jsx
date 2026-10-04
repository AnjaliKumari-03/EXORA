import { useRef, useState } from "react";

export default function FileUploadDropzone({ onFileSelected }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelected(file);
  }

  function handleBrowse(e) {
    const file = e.target.files[0];
    if (file) onFileSelected(file);
  }

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-teal-500"
      }`}
    >
      <p className="text-text-main font-bold">Drop your question paper here</p>
      <p className="text-text-muted text-sm mt-1 font-semibold">
        PDF or Word document — or click to browse
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleBrowse}
        className="hidden"
      />
    </div>
  );
}
