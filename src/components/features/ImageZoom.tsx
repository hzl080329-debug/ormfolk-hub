"use client";

import { X } from "lucide-react";

export default function ImageZoom({ src, onClose }: { src: string; onClose: () => void }) {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center cursor-pointer" onClick={onClose}>
      <img src={src} alt="Zoom" className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
      <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white text-xl flex items-center justify-center transition-colors">
        <X size={20} />
      </button>
    </div>
  );
}
