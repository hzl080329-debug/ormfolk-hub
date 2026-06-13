"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, SkipForward, SkipBack, Music, ChevronUp, ChevronDown, Repeat, ListOrdered, Loader2 } from "lucide-react";

interface Track {
  title: string;
  artist: string;
  vid: string;
  startSeconds?: number;
}

const PLAYLIST: Track[] = [
  { title: "Apple of My Eyes", artist: "Ormsin — Apple My Love OST", vid: "IsKtf2DoCBU" },
  { title: "My Boo", artist: "OrmFolk", vid: "FD-ZpEg0l5I" },
  { title: "Because Love (เพราะรัก)", artist: "Ormsin — Love Bound รักนี้ตีตรา OST", vid: "N1FBDXXDWpc" },
  { title: "รักนานๆ Forever Love", artist: "OrmFolk", vid: "71DcAUX06ZQ", startSeconds: 74 },
];

export default function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [loop, setLoop] = useState(false);
  const [loading, setLoading] = useState(false);
  const playerRef = useRef<any>(null);
  const apiLoadedRef = useRef(false);
  const initAttemptedRef = useRef(false);

  const track = PLAYLIST[currentTrack];

  // Load YouTube IFrame API once
  useEffect(() => {
    if (apiLoadedRef.current) return;
    apiLoadedRef.current = true;

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  }, []);

  // Create player ONCE on mount, immediately
  useEffect(() => {
    if (initAttemptedRef.current) return;
    initAttemptedRef.current = true;

    const container = document.getElementById("yt-player-container");
    if (!container) return;
    container.innerHTML = '<div id="yt-player"></div>';

    let attempts = 0;
    const maxAttempts = 50; // 10 seconds max

    const initPlayer = () => {
      attempts++;
      if (!(window as any).YT?.Player) {
        if (attempts < maxAttempts) setTimeout(initPlayer, 200);
        return;
      }

      playerRef.current = new (window as any).YT.Player("yt-player", {
        videoId: track.vid,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          start: track.startSeconds || 0,
        },
        events: {
          onReady: () => {
            setReady(true);
            playerRef.current?.cueVideoById(track.vid, track.startSeconds || 0);
          },
          onStateChange: (e: any) => {
            if (e.data === 1) { setIsPlaying(true); setLoading(false); } // YT.PlayerState.PLAYING
            if (e.data === 2) setIsPlaying(false); // YT.PlayerState.PAUSED
            if (e.data === 3) setLoading(true); // YT.PlayerState.BUFFERING
            if (e.data === 0) {
              // Track ended
              if (loop) {
                playerRef.current?.playVideo();
              } else {
                setIsPlaying(false);
                setCurrentTrack((p) => (p + 1) % PLAYLIST.length);
              }
            }
          },
        },
      });
    };

    initPlayer();
  }, []); // Only on mount — never destroy

  // Switch track via loadVideoById (fast, no destroy/recreate)
  const switchTrack = useCallback((index: number) => {
    setCurrentTrack(index);
    setLoading(true);
    const t = PLAYLIST[index];
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(t.vid, t.startSeconds || 0);
      if (isPlaying) {
        setTimeout(() => playerRef.current?.playVideo(), 300);
      }
    }
  }, [isPlaying]);

  const play = useCallback(() => {
    if (playerRef.current?.playVideo) {
      setLoading(true);
      playerRef.current.playVideo();
    }
  }, []);

  const pause = useCallback(() => {
    if (playerRef.current?.pauseVideo) {
      playerRef.current.pauseVideo();
    }
  }, []);

  const prev = () => switchTrack((currentTrack - 1 + PLAYLIST.length) % PLAYLIST.length);
  const next = () => switchTrack((currentTrack + 1) % PLAYLIST.length);

  return (
    <>
      <div id="yt-player-container" className="hidden" />

      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${isOpen ? "translate-y-0" : "translate-y-[calc(100%-44px)]"}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -top-8 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white border border-border rounded-t-xl shadow-md flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-accent transition-colors"
        >
          <Music size={14} />
          {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          {!isOpen && <span className="text-xs text-text-muted truncate max-w-[140px]">🎵 {track.title}</span>}
        </button>

        <div className="bg-white/95 backdrop-blur-md border-t border-border shadow-lg">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-text-primary truncate">{track.title}</div>
              <div className="text-xs text-text-muted">{track.artist}</div>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={prev} className="p-2 rounded-lg hover:bg-background text-text-muted hover:text-text-primary transition-colors">
                <SkipBack size={18} />
              </button>
              <button
                onClick={isPlaying ? pause : play}
                disabled={!ready}
                className={`p-2.5 rounded-xl text-white shadow-sm transition-all ${ready ? "bg-accent hover:bg-accent/80 active:scale-95" : "bg-text-muted cursor-wait"}`}
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : isPlaying ? (
                  <Pause size={20} fill="white" />
                ) : (
                  <Play size={20} fill="white" />
                )}
              </button>
              <button onClick={next} className="p-2 rounded-lg hover:bg-background text-text-muted hover:text-text-primary transition-colors">
                <SkipForward size={18} />
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <button onClick={() => setLoop(!loop)}
                className={`p-1 rounded transition-colors ${loop ? "text-accent" : "text-text-muted hover:text-text-primary"}`}
                title={loop ? "Loop" : "Sequential"}>
                {loop ? <Repeat size={14} /> : <ListOrdered size={14} />}
              </button>
              {PLAYLIST.map((_, i) => (
                <button key={i} onClick={() => switchTrack(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === currentTrack ? "bg-accent" : "bg-border"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
