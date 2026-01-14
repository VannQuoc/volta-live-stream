import { useVoltaWebSocket } from '@/hooks/useVoltaWebSocket';
import { VideoPlayer } from '@/components/volta/VideoPlayer';
import { MatchHeader } from '@/components/volta/MatchHeader';
import { BettingStats } from '@/components/volta/BettingStats';
import { LiveBetFeed } from '@/components/volta/LiveBetFeed';
import { ConnectionStatus } from '@/components/volta/ConnectionStatus';
import { Trophy, Gamepad2 } from 'lucide-react';

const Index = () => {
  const { league, isConnected, error, reconnect } = useVoltaWebSocket();
  const currentMatch = league?.matches?.[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center volta-glow-live">
              <Gamepad2 className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base sm:text-xl">VOLTA LIVE</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                {league?.name || 'Virtual Football Betting'}
              </p>
            </div>
          </div>
          <ConnectionStatus
            isConnected={isConnected}
            error={error}
            onReconnect={reconnect}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 compact-main">
        {!currentMatch ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 compact-wait">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-muted rounded-full flex items-center justify-center mb-4 sm:mb-6 animate-pulse compact-wait-icon">
              <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground compact-wait-trophy" />
            </div>
            <h2 className="font-display font-bold text-lg sm:text-2xl mb-2 text-center compact-wait-title">
              {isConnected ? 'Đang tải trận đấu...' : 'Đang kết nối...'}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground compact-wait-sub">
              Vui lòng đợi trong giây lát
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 compact-grid">
            {/* Left Column - Video & Match Header */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-6 compact-stack">
              <VideoPlayer
                streamUrl={currentMatch.streamUrl}
                isLive={currentMatch.isLive}
              />
              <div className="compact-hidden">
                <MatchHeader match={currentMatch} />
              </div>
            </div>

            {/* Right Column - Stats & Feed - Always visible on desktop */}
            <div className="space-y-3 sm:space-y-6 compact-hidden lg:block">
              <BettingStats match={currentMatch} />
              <LiveBetFeed bets={currentMatch.liveBets} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto py-2 sm:py-4">
        <div className="container mx-auto px-2 sm:px-4 text-center text-xs sm:text-sm text-muted-foreground">
          <p>Volta League • Match ID: {currentMatch?.matchId || '---'}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
