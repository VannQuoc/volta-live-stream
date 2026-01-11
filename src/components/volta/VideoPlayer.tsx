import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, AlertCircle, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  streamUrl?: string;
  isLive: boolean;
}

// Proxy URL để bypass CORS cho HLS stream
const HLS_PROXY_URL = 'https://iuvtr.sb21.net/';

function buildProxiedUrl(originalUrl: string): string {
  // Sử dụng proxy của họ: https://iuvtr.sb21.net/?link=<encoded_url>&sound=on
  const encodedUrl = encodeURIComponent(originalUrl);
  return `${HLS_PROXY_URL}?link=${encodedUrl}&sound=on`;
}

export function VideoPlayer({ streamUrl, isLive }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const loadStream = () => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setLoading(true);
    setError(null);

    // Cleanup existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Build proxied URL
    const proxiedUrl = buildProxiedUrl(streamUrl);
    console.log('[VideoPlayer] Loading stream:', { original: streamUrl, proxied: proxiedUrl });

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startLevel: -1, // Auto quality
      });
      
      hlsRef.current = hls;
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('[VideoPlayer] Manifest parsed, starting playback');
        setLoading(false);
        setError(null);
        video.play().catch((e) => {
          console.log('Autoplay blocked, user interaction required:', e);
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error('[VideoPlayer] HLS Error:', data);
        
        if (data.fatal) {
          setLoading(false);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (data.details === 'manifestLoadError') {
                setError('Không thể tải video stream. Vui lòng thử lại.');
              } else {
                setError('Lỗi mạng khi tải video. Đang thử lại...');
                // Retry after delay
                setTimeout(() => {
                  if (retryCount < 3) {
                    setRetryCount(prev => prev + 1);
                    hls.startLoad();
                  }
                }, 2000);
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('[VideoPlayer] Recovering from media error');
              hls.recoverMediaError();
              break;
            default:
              setError('Không thể phát video stream.');
              hls.destroy();
              break;
          }
        }
      });

      hls.loadSource(proxiedUrl);
      hls.attachMedia(video);
      
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = proxiedUrl;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        video.play().catch(console.error);
      });
      video.addEventListener('error', () => {
        setLoading(false);
        setError('Không thể phát video stream.');
      });
    } else {
      setError('Trình duyệt không hỗ trợ phát video HLS.');
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  useEffect(() => {
    if (isLive && streamUrl) {
      loadStream();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, isLive]);

  // Reset retry count when stream URL changes
  useEffect(() => {
    setRetryCount(0);
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
    <div className="relative aspect-video w-full overflow-hidden rounded-xl volta-glow-live bg-black">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Đang tải stream...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="flex flex-col items-center gap-4 p-6 text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={loadStream} variant="secondary" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Thử lại
            </Button>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
        muted={isMuted}
        playsInline
        controls
      />
      
      {/* Top controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-primary/90 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-primary-foreground rounded-full volta-pulse" />
          <span className="text-xs font-bold text-primary-foreground uppercase tracking-wider">LIVE</span>
        </div>
        
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70"
          onClick={toggleMute}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
