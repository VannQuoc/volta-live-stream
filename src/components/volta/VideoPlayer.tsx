import { Play, Volume2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface VideoPlayerProps {
  streamUrl?: string;
  isLive: boolean;
}

// Proxy URL để bypass CORS cho HLS stream
const HLS_PROXY_URL = 'https://iuvtr.sb21.net/';

function buildProxiedUrl(originalUrl: string): string {
  const encodedUrl = encodeURIComponent(originalUrl);
  // Keep autoplay muted for browser compatibility.
  // Users can unmute using the embedded player's own controls without reloading.
  return `${HLS_PROXY_URL}?link=${encodedUrl}&autoplay=1&muted=1`;
}

export function VideoPlayer({ streamUrl, isLive }: VideoPlayerProps) {
  const [wantsSoundHint, setWantsSoundHint] = useState(false);
  const prevIsLiveRef = useRef(isLive);
  const [reloadKey, setReloadKey] = useState(0);

  // Auto mute khi trận kết thúc: reload iframe once to ensure it returns to muted autoplay state
  useEffect(() => {
    if (prevIsLiveRef.current && !isLive) {
      setWantsSoundHint(false);
      setReloadKey((k) => k + 1);
    }
    prevIsLiveRef.current = isLive;
  }, [isLive]);

  const requestSound = () => {
    // We avoid remounting the iframe here (remount = restart stream).
    // Instead, we show a hint so the user can unmute inside the player.
    setWantsSoundHint(true);
  };

  if (!isLive || !streamUrl) {
    return (
      <div className="video-player relative aspect-video w-full overflow-hidden rounded-xl bg-muted flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted animate-pulse" />
        <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary/20 flex items-center justify-center volta-glow-betting">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 text-secondary" />
          </div>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">Đang chờ trận đấu...</p>
        </div>
      </div>
    );
  }

  const proxiedUrl = buildProxiedUrl(streamUrl);

  return (
    <div className="video-player relative aspect-video w-full overflow-hidden rounded-xl volta-glow-live bg-black">
      {/* Iframe nhúng video */}
      <iframe
        key={reloadKey}
        src={proxiedUrl}
        className="w-full h-full border-0"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        scrolling="no"
      />

      {/* LIVE badge */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 flex items-center gap-1.5 sm:gap-2 bg-primary/90 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full pointer-events-none">
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-foreground rounded-full volta-pulse" />
        <span className="text-[10px] sm:text-xs font-bold text-primary-foreground uppercase tracking-wider">LIVE</span>
      </div>

      {/* Sound helper (does NOT reload stream) */}
      <button
        onClick={requestSound}
        className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-20 flex items-center gap-1.5 bg-black/70 hover:bg-black/90 backdrop-blur-sm px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all active:scale-95"
      >
        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        <span className="text-[10px] sm:text-xs font-medium text-white/80">Bật tiếng</span>
      </button>

      {wantsSoundHint && (
        <div className="absolute bottom-12 right-2 sm:bottom-14 sm:right-3 z-20 max-w-[220px] rounded-lg border border-border bg-card/90 backdrop-blur px-3 py-2 text-xs text-foreground shadow-lg">
          Bật tiếng trực tiếp trong trình phát (icon loa). Nút này không reload để tránh xem lại từ đầu.
        </div>
      )}
    </div>
  );
}
