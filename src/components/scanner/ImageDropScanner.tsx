"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, AlertCircle, Loader2 } from "lucide-react";
import jsQR from "jsqr";

interface ImageDropScannerProps {
  onScanSuccess: (data: string) => void;
}

export const ImageDropScanner: React.FC<ImageDropScannerProps> = ({ onScanSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImageFile = (file: File) => {
    setErrorMsg(null);

    // Validate type
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, WebP, GIF, or SVG).");
      return;
    }

    setIsProcessing(true);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          setErrorMsg("Could not initialize image processing canvas.");
          setIsProcessing(false);
          return;
        }

        // Limit maximum dimension for speed while retaining QR clarity
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;
        const maxDim = 1600;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });

        if (code && code.data) {
          onScanSuccess(code.data);
        } else {
          setErrorMsg(
            "No QR code found in this image. Please try an image with sharper focus or higher contrast."
          );
        }
      } catch (err) {
        console.error("Error decoding QR image with jsQR:", err);
        setErrorMsg("Failed to read the image file. It may be corrupted or in an unsupported format.");
      } finally {
        setIsProcessing(false);
      }
    };

    img.onerror = () => {
      setIsProcessing(false);
      setErrorMsg("Failed to load image. Please try a different file.");
    };

    img.src = objectUrl;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.01]"
            : "border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-900/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
          aria-label="Upload QR code image"
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60 shadow-sm">
            {isProcessing ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isProcessing
                ? "Analyzing image for QR code..."
                : isDragging
                ? "Drop image to scan!"
                : "Drop your QR image here, or browse"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports PNG, JPG, WebP, SVG, GIF (Processed 100% locally)
            </p>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <p className="leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {/* Preview Info (if scanned image) */}
      {previewUrl && !errorMsg && !isProcessing && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Image analyzed successfully</span>
        </div>
      )}
    </div>
  );
};
