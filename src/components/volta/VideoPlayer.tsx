import { Play, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface VideoPlayerProps {
  streamUrl?: string;
  isLive: boolean;
}

// Proxy URL để bypass CORS cho HLS stream
const HLS_PROXY_URL = 'https://iuvtr.sb21.net/';

function buildProxiedUrl(originalUrl: string, muted: boolean): string {
  const encodedUrl = encodeURIComponent(originalUrl);
  return `${HLS_PROXY_URL}?link=${encodedUrl}&autoplay=1&muted=${muted ? 1 : 0}`;
}

export function VideoPlayer({ streamUrl, isLive }: VideoPlayerProps) {
  const [isMuted, setIsMuted] = useState(true);
  const prevIsLiveRef = useRef(isLive);
  const iframeKey = useRef(0);

  // Auto mute khi trận kết thúc
  useEffect(() => {
    if (prevIsLiveRef.current && !isLive) {
      setIsMuted(true);
      iframeKey.current += 1;
    }
    prevIsLiveRef.current = isLive;
  }, [isLive]);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    iframeKey.current += 1;
  };

  if (!isLive || !streamUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted flex items-center justify-center landscape:aspect-[21/9]">
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

  const proxiedUrl = buildProxiedUrl(streamUrl, isMuted);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl volta-glow-live bg-black landscape:aspect-[21/9]">
      {/* Iframe nhúng video */}
      <iframe
        key={iframeKey.current}
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
      
      {/* Mute/Unmute button */}
      <button
        onClick={toggleMute}
        className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-20 flex items-center gap-1.5 bg-black/70 hover:bg-black/90 backdrop-blur-sm px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all active:scale-95"
      >
        {isMuted ? (
          <>
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span className="text-[10px] sm:text-xs font-medium text-white/80">Bật tiếng</span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-[10px] sm:text-xs font-medium text-primary">Đang phát</span>
          </>
        )}
      </button>
    </div>
  );
}
