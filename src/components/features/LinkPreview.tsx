"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Image } from "lucide-react";

interface LinkPreviewProps {
  url: string;
}

export default function LinkPreview({ url }: LinkPreviewProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    setError(false);
    // Try to fetch Open Graph data via a proxy
    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [url]);

  if (!url || error) return null;
  if (loading) {
    return (
      <div className="mt-2 p-4 bg-background rounded-xl border animate-pulse flex items-center gap-3">
        <div className="w-16 h-16 bg-border rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-border rounded w-2/3" />
          <div className="h-3 bg-border rounded w-full" />
        </div>
      </div>
    );
  }
  if (!data) return null;

  return (
    <a href={url} target="_blank" rel="noreferrer" className="mt-2 block p-4 bg-background rounded-xl border hover:border-accent/30 transition-colors group">
      <div className="flex gap-3">
        {data.image && (
          <img src={data.image} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-text-primary group-hover:text-accent truncate">{data.title || url}</div>
          {data.description && <p className="text-xs text-text-muted mt-1 line-clamp-2">{data.description}</p>}
          <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
            <ExternalLink size={10} />
            <span className="truncate">{new URL(url).hostname}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
