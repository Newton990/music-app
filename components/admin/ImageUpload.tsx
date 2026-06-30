"use client";
import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label,
  accept = "image/*",
  maxSizeMB = 2,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const maxBytes = maxSizeMB * 1024 * 1024;

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > maxBytes) {
      toast.error(`File must be under ${maxSizeMB}MB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <div className={cn("space-y-1", className)}>
      {label && <label className="text-xs text-slate-400 mb-1 block">{label}</label>}
      {value ? (
        <div className="relative w-[120px]">
          <img
            src={value}
            alt="Preview"
            className="w-[120px] h-[160px] object-cover rounded-lg border border-cinema-border bg-cinema-card"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/90 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "w-[120px] h-[160px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-cinema-card",
            dragOver
              ? "border-teal-400 bg-teal-400/5"
              : "border-cinema-border hover:border-teal-400/50 hover:bg-teal-400/5"
          )}
        >
          <Upload className="w-8 h-8 text-slate-500" />
          <span className="text-[10px] text-slate-500 text-center leading-tight px-1">
            Click or drag
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
