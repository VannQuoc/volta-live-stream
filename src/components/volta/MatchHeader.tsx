import { VoltaMatch } from '@/types/volta';
import { useEffect, useState } from 'react';
import { Clock, Zap } from 'lucide-react';

interface MatchHeaderProps {
  match: VoltaMatch;
}

export function MatchHeader({ match }: MatchHeaderProps) {
  const [countdown, setCountdown] = useState('00:00');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const start = new Date(match.startTime);
      const server = new Date(match.serverTime);
      
      // Calculate time difference
      const diff = start.getTime() - server.getTime();
      const remaining = Math.max(0, diff);
      
      if (match.isLive) {
        // Show elapsed time when live
        const elapsed = Math.abs(diff);
        const mins = Math.floor(elapsed / 60000);
        const secs = Math.floor((elapsed % 60000) / 1000);
        setCountdown(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      } else {
        // Show countdown when betting
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setCountdown(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [match.startTime, match.serverTime, match.isLive]);

  return (
    <div className="volta-card p-6">
      <div className="flex items-center justify-between gap-4">
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src={match.homeLogo}
              alt={match.homeTeam}
              className="w-20 h-20 object-contain drop-shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-volta-home/20 px-2 py-0.5 rounded text-[10px] font-bold text-volta-home uppercase">
              Home
            </div>
          </div>
          <h3 className="font-display font-bold text-lg text-center leading-tight">
            {match.homeTeam}
          </h3>
          <div className="bg-volta-home/10 border border-volta-home/30 px-4 py-1.5 rounded-lg">
            <span className="font-display font-bold text-volta-home text-xl">
              {match.odds.home.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Center - Score/Countdown */}
        <div className="flex flex-col items-center gap-2">
          {match.isLive ? (
            <>
              <div className="flex items-center gap-1 bg-primary px-3 py-1 rounded-full">
                <Zap className="w-3 h-3 text-primary-foreground" />
                <span className="text-xs font-bold text-primary-foreground">LIVE</span>
              </div>
              {match.result ? (
                <div className="font-display text-5xl font-black tracking-tight">
                  <span className="text-volta-home">{match.result.home}</span>
                  <span className="text-muted-foreground mx-2">-</span>
                  <span className="text-volta-away">{match.result.away}</span>
                </div>
              ) : (
                <div className="font-display text-5xl font-black text-muted-foreground tracking-tight">
                  VS
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full">
                <Clock className="w-3 h-3 text-secondary-foreground" />
                <span className="text-xs font-bold text-secondary-foreground">BETTING</span>
              </div>
              <div className="font-display text-5xl font-black text-muted-foreground tracking-tight">
                VS
              </div>
            </>
          )}
          <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-display font-bold text-xl tabular-nums">{countdown}</span>
          </div>
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src={match.awayLogo}
              alt={match.awayTeam}
              className="w-20 h-20 object-contain drop-shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-volta-away/20 px-2 py-0.5 rounded text-[10px] font-bold text-volta-away uppercase">
              Away
            </div>
          </div>
          <h3 className="font-display font-bold text-lg text-center leading-tight">
            {match.awayTeam}
          </h3>
          <div className="bg-volta-away/10 border border-volta-away/30 px-4 py-1.5 rounded-lg">
            <span className="font-display font-bold text-volta-away text-xl">
              {match.odds.away.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
