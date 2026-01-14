import { VoltaMatch } from '@/types/volta';
import { useEffect, useState, useRef } from 'react';
import { Clock, Zap, Trophy } from 'lucide-react';

interface MatchHeaderProps {
  match: VoltaMatch;
}

export function MatchHeader({ match }: MatchHeaderProps) {
  const [displayTime, setDisplayTime] = useState('00:00');
  const [showResultAnimation, setShowResultAnimation] = useState(false);
  const localStartRef = useRef<number>(0);
  const serverOffsetRef = useRef<number>(0);
  const prevIsLiveRef = useRef<boolean>(match.isLive);

  const prevResultRef = useRef<string | null>(null);

  // Detect khi có result từ server để trigger animation ngay lập tức
  useEffect(() => {
    const currentResultStr = match.result ? `${match.result.home}-${match.result.away}` : null;
    const hasWinner = match.result && (match.result.home === 1 || match.result.away === 1);
    
    // Nếu có result mới và có đội thắng -> trigger animation
    if (hasWinner && prevResultRef.current !== currentResultStr) {
      setShowResultAnimation(true);
    }
    prevResultRef.current = currentResultStr;
  }, [match.result]);

  useEffect(() => {
    const serverSnapshot = new Date(match.serverSnapshotTime).getTime();
    const kickoff = new Date(match.kickoffTime).getTime();
    const localNow = Date.now();
    
    serverOffsetRef.current = localNow - serverSnapshot;
    localStartRef.current = localNow;

    const updateTime = () => {
      const now = Date.now();
      const elapsedSinceMessage = now - localStartRef.current;
      
      const estimatedServerNow = new Date(match.serverSnapshotTime).getTime() + elapsedSinceMessage;
      const kickoffTime = new Date(match.kickoffTime).getTime();
      
      if (match.isLive) {
        const elapsed = Math.max(0, estimatedServerNow - kickoffTime);
        const mins = Math.floor(elapsed / 60000);
        const secs = Math.floor((elapsed % 60000) / 1000);
        setDisplayTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      } else {
        const remaining = Math.max(0, kickoffTime - estimatedServerNow);
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setDisplayTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [match.serverSnapshotTime, match.kickoffTime, match.isLive]);

  const hasResult = match.result && (match.result.home === 1 || match.result.away === 1);
  const homeWin = match.result?.home === 1;
  const awayWin = match.result?.away === 1;

  return (
    <div className="volta-card p-3 sm:p-6">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Home Team */}
        <div className={`flex-1 flex flex-col items-center gap-1.5 sm:gap-3 transition-all duration-500 ${hasResult ? (homeWin ? 'scale-105' : 'opacity-40 scale-95') : ''}`}>
          <div className="relative">
            <img
              src={match.homeLogo}
              alt={match.homeTeam}
              className={`w-12 h-12 sm:w-20 sm:h-20 object-contain drop-shadow-lg transition-all duration-500 ${homeWin ? 'drop-shadow-[0_0_15px_hsl(45,100%,50%,0.5)]' : ''}`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            {homeWin && showResultAnimation && (
              <div className="absolute -top-2 -right-2 volta-winner-badge">
                <span className="text-xl sm:text-2xl volta-trophy-glow">🏆</span>
              </div>
            )}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-volta-home/20 px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-bold text-volta-home uppercase">
              Home
            </div>
          </div>
          <h3 className="font-display font-bold text-xs sm:text-lg text-center leading-tight line-clamp-2">
            {match.homeTeam}
          </h3>
          <div className={`bg-volta-home/10 border border-volta-home/30 px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg ${homeWin ? 'bg-green-500/20 border-green-500/50' : ''}`}>
            <span className={`font-display font-bold text-sm sm:text-xl ${homeWin ? 'text-green-400' : 'text-volta-home'}`}>
              {match.odds.home.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Center - Score/Countdown */}
        <div className="flex flex-col items-center gap-1 sm:gap-2">
          {(() => {
            // Ưu tiên hiển thị kết quả khi có result (dù vẫn đang live)
            if (hasResult) {
              return (
                <div className={`flex flex-col items-center gap-1 sm:gap-2 ${showResultAnimation ? 'volta-winner-reveal' : ''}`}>
                  <div className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-400 px-2 sm:px-3 py-1 rounded-full volta-winner-badge shadow-lg shadow-green-500/30">
                    <Trophy className="w-3 h-3 text-white" />
                    <span className="text-[10px] sm:text-xs font-bold text-white">WINNER</span>
                  </div>
                  <div className="font-display text-3xl sm:text-5xl font-black tracking-tight flex items-center gap-2 sm:gap-4">
                    <span className={`transition-all duration-300 ${homeWin ? 'text-green-400' : 'text-muted-foreground/30'}`}>
                      {match.result!.home}
                    </span>
                    <span className="text-muted-foreground/50 text-xl sm:text-3xl">:</span>
                    <span className={`transition-all duration-300 ${awayWin ? 'text-green-400' : 'text-muted-foreground/30'}`}>
                      {match.result!.away}
                    </span>
                  </div>
                  <div className="volta-winner-text text-[10px] sm:text-sm font-bold text-center">
                    <span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                      {homeWin ? match.homeTeam : match.awayTeam} 🎉
                    </span>
                  </div>
                </div>
              );
            } else if (match.isLive) {
              return (
                <>
                  <div className="flex items-center gap-1 bg-primary px-2 sm:px-3 py-1 rounded-full volta-glow-live">
                    <Zap className="w-3 h-3 text-primary-foreground" />
                    <span className="text-[10px] sm:text-xs font-bold text-primary-foreground">LIVE</span>
                  </div>
                  <div className="font-display text-3xl sm:text-5xl font-black text-muted-foreground tracking-tight">
                    VS
                  </div>
                </>
              );
            } else {
              return (
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-secondary to-amber-500 px-3 sm:px-4 py-1.5 rounded-full volta-glow-betting">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-secondary-foreground animate-pulse" />
                    <span className="text-xs sm:text-sm font-bold text-secondary-foreground uppercase tracking-wider">Đặt Cược</span>
                  </div>
                  
                  {/* Countdown Timer */}
                  <div className="volta-countdown-container">
                    <div className="volta-countdown-ring" />
                    <div className="flex flex-col items-center">
                      <span className="font-display font-black text-2xl sm:text-4xl text-secondary tabular-nums volta-countdown-text">
                        {displayTime}
                      </span>
                      <span className="text-[9px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Bắt đầu sau
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
          })()}
          
          {/* Only show timer for live matches */}
          {match.isLive && !hasResult && (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-primary/10 border border-primary/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
              <span className="w-2 h-2 bg-primary rounded-full volta-pulse" />
              <span className="font-display font-bold text-base sm:text-xl tabular-nums text-primary">{displayTime}</span>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className={`flex-1 flex flex-col items-center gap-1.5 sm:gap-3 transition-all duration-500 ${hasResult ? (awayWin ? 'scale-105' : 'opacity-40 scale-95') : ''}`}>
          <div className="relative">
            <img
              src={match.awayLogo}
              alt={match.awayTeam}
              className={`w-12 h-12 sm:w-20 sm:h-20 object-contain drop-shadow-lg transition-all duration-500 ${awayWin ? 'drop-shadow-[0_0_15px_hsl(45,100%,50%,0.5)]' : ''}`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            {awayWin && showResultAnimation && (
              <div className="absolute -top-2 -right-2 volta-winner-badge">
                <span className="text-xl sm:text-2xl volta-trophy-glow">🏆</span>
              </div>
            )}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-volta-away/20 px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-bold text-volta-away uppercase">
              Away
            </div>
          </div>
          <h3 className="font-display font-bold text-xs sm:text-lg text-center leading-tight line-clamp-2">
            {match.awayTeam}
          </h3>
          <div className={`bg-volta-away/10 border border-volta-away/30 px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg ${awayWin ? 'bg-green-500/20 border-green-500/50' : ''}`}>
            <span className={`font-display font-bold text-sm sm:text-xl ${awayWin ? 'text-green-400' : 'text-volta-away'}`}>
              {match.odds.away.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}