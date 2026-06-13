"use client";

import { useState, useEffect, useRef } from "react";
import { Sticker, X, Loader2 } from "lucide-react";
import { getCommunityStickers } from "@/lib/actions";

interface StickerData {
  id: string;
  url: string;
  filename: string;
}

export default function StickerPicker({
  onSelect,
  label = "Sticker",
  className = "",
}: {
  onSelect: (stickerUrl: string) => void;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const loadStickers = () => {
    if (stickers.length === 0 && !loading) {
      setLoading(true);
      getCommunityStickers()
        .then((s: any) => setStickers(s || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  };

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) loadStickers();
  };

  return (
    <div className={`relative inline-block ${className}`} ref={panelRef}>
      <button
        type="button"
        onClick={handleToggle}
        className={`px-3 py-2 text-sm rounded-xl flex items-center gap-1.5 transition-colors ${
          open
            ? "bg-accent/10 text-accent"
            : "text-text-muted hover:text-accent hover:bg-accent/5"
        }`}
        title={label}
      >
        <Sticker size={16} />
        {label}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-2xl border border-border shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <span className="text-sm font-semibold text-text-primary">Stickers</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-background text-text-muted"
            >
              <X size={16} />
            </button>
          </div>

          {/* Grid */}
          <div className="p-2 max-h-52 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-text-muted" />
              </div>
            ) : stickers.length === 0 ? (
              <div className="text-center py-6 text-xs text-text-muted">
                No community stickers yet
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {stickers.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onSelect(s.url);
                      setOpen(false);
                    }}
                    className="aspect-square rounded-lg border border-border hover:border-accent hover:bg-accent/5 p-1 transition-colors overflow-hidden"
                    title={s.filename}
                  >
                    <img
                      src={s.url}
                      alt={s.filename}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
