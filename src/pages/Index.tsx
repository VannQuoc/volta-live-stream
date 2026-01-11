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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center volta-glow-live">
              <Gamepad2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">VOLTA LIVE</h1>
              <p className="text-xs text-muted-foreground">
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
      <main className="container mx-auto px-4 py-6">
        {!currentMatch ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Trophy className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="font-display font-bold text-2xl mb-2">
              {isConnected ? 'Đang tải trận đấu...' : 'Đang kết nối...'}
            </h2>
            <p className="text-muted-foreground">
              Vui lòng đợi trong giây lát
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Video & Match Header */}
            <div className="lg:col-span-2 space-y-6">
              <VideoPlayer
                streamUrl={currentMatch.streamUrl}
                isLive={currentMatch.isLive}
              />
              <MatchHeader match={currentMatch} />
            </div>

            {/* Right Column - Stats & Feed */}
            <div className="space-y-6">
              <BettingStats match={currentMatch} />
              <LiveBetFeed bets={currentMatch.liveBets} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Volta League • Match ID: {currentMatch?.matchId || '---'}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
