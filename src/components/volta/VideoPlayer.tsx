import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  streamUrl?: string;
  isLive: boolean;
}

export function VideoPlayer({ streamUrl, isLive }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(console.error);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().catch(console.error);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

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

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl volta-glow-live">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        controls
      />
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-primary/90 px-3 py-1.5 rounded-full">
        <span className="w-2 h-2 bg-primary-foreground rounded-full volta-pulse" />
        <span className="text-xs font-bold text-primary-foreground uppercase tracking-wider">LIVE</span>
      </div>
    </div>
  );
}
