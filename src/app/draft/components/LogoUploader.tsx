"use client";

import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface Props {
  logoDataUrl: string | null;
  onLogoChange: (dataUrl: string | null) => void;
}

export default function LogoUploader({ logoDataUrl, onLogoChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) return;
    if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onLogoChange(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (logoDataUrl) {
    return (
      <div className="glass-card rounded-xl p-4">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Company Logo
        </p>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center p-2 border border-zinc-200">
            <img
              src={logoDataUrl}
              alt="Logo"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <button
            onClick={() => onLogoChange(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition"
          >
            <X className="w-3 h-3" /> Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
        Company Logo
      </p>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-accent bg-accent/5"
            : "border-zinc-700 hover:border-zinc-500"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          {dragOver ? (
            <ImageIcon className="w-6 h-6 text-accent" />
          ) : (
            <Upload className="w-6 h-6 text-zinc-500" />
          )}
          <p className="text-xs text-zinc-400">
            {dragOver ? "Drop to upload" : "Click or drag logo here"}
          </p>
          <p className="text-[10px] text-zinc-600">PNG, JPG, SVG — Max 2MB</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
