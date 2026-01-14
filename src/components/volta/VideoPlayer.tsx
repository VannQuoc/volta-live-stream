import { Play } from 'lucide-react';

interface VideoPlayerProps {
  streamUrl?: string;
  isLive: boolean;
}

// Proxy URL để bypass CORS cho HLS stream
const HLS_PROXY_URL = 'https://iuvtr.sb21.net/';

function buildProxiedUrl(originalUrl: string): string {
  const encodedUrl = encodeURIComponent(originalUrl);
  return `${HLS_PROXY_URL}?link=${encodedUrl}&sound=on`;
}

export function VideoPlayer({ streamUrl, isLive }: VideoPlayerProps) {
  if (!isLive || !streamUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted animate-pulse" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center volta-glow-betting">
            <Play className="w-10 h-10 text-secondary" />
          </div>
          <p className="text-muted-foreground font-medium">Đang chờ trận đấu bắt đầu...</p>
        </div>
      </div>
    );
  }

  const proxiedUrl = buildProxiedUrl(streamUrl);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl volta-glow-live bg-black">
      {/* Iframe nhúng video */}
      <iframe
        src={proxiedUrl}
        className="w-full h-full border-0"
        allow="autoplay; encrypted-media"
        allowFullScreen
        scrolling="no"
      />
      
      {/* Overlay chặn tương tác - không cho pause/seek */}
      <div 
        className="absolute inset-0 z-10"
        style={{ pointerEvents: 'auto' }}
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => e.preventDefault()}
        onDoubleClick={(e) => e.preventDefault()}
      />
      
      {/* LIVE badge */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-primary/90 px-3 py-1.5 rounded-full pointer-events-none">
        <span className="w-2 h-2 bg-primary-foreground rounded-full volta-pulse" />
        <span className="text-xs font-bold text-primary-foreground uppercase tracking-wider">LIVE</span>
      </div>
    </div>
  );
}
