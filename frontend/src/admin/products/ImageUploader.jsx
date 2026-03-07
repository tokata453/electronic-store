import { useRef, useState } from "react";

export default function ImageUploader({
  imageUrls = [],
  onFilesSelected,
  onRemove,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer?.files || []).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length === 0) return;

    onFilesSelected({
      target: {
        files,
        value: "",
      },
    });
  }

  function handleClick() {
    inputRef.current?.click();
  }

  return (
    <div className="space-y-4">
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex h-36 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition ${
          isDragging
            ? "border-emerald-400 bg-emerald-400/10"
            : "border-slate-600 bg-slate-900 hover:border-slate-400"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onFilesSelected}
        />

        <div className="text-center">
          <p className="font-medium text-slate-200">
            Drag images here or click to upload
          </p>
          <p className="mt-1 text-sm text-slate-400">
            PNG, JPG, WEBP supported
          </p>
        </div>
      </div>

      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {imageUrls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative overflow-hidden rounded-lg border border-slate-700 bg-slate-950"
            >
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="h-32 w-full object-cover"
              />

              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute right-2 top-2 rounded-md bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}