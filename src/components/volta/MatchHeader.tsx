import { VoltaMatch } from '@/types/volta';
import { useEffect, useState, useRef } from 'react';
import { Clock, Zap } from 'lucide-react';

interface MatchHeaderProps {
  match: VoltaMatch;
}

export function MatchHeader({ match }: MatchHeaderProps) {
  const [displayTime, setDisplayTime] = useState('00:00');
  const localStartRef = useRef<number>(0);
  const serverOffsetRef = useRef<number>(0);

  useEffect(() => {
    // Khi nhận được message mới, tính toán offset
    const serverSnapshot = new Date(match.serverSnapshotTime).getTime();
    const kickoff = new Date(match.kickoffTime).getTime();
    const localNow = Date.now();
    
    // Server offset = local time - server snapshot time
    serverOffsetRef.current = localNow - serverSnapshot;
    localStartRef.current = localNow;

    const updateTime = () => {
      const now = Date.now();
      const elapsedSinceMessage = now - localStartRef.current;
      
      // Thời gian server hiện tại (ước tính) = serverSnapshot + elapsed
      const estimatedServerNow = new Date(match.serverSnapshotTime).getTime() + elapsedSinceMessage;
      const kickoffTime = new Date(match.kickoffTime).getTime();
      
      if (match.isLive) {
        // Khi live: đếm thời gian đã trôi qua kể từ kickoff
        const elapsed = Math.max(0, estimatedServerNow - kickoffTime);
        const mins = Math.floor(elapsed / 60000);
        const secs = Math.floor((elapsed % 60000) / 1000);
        setDisplayTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      } else {
        // Khi betting: đếm ngược đến kickoff
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
              {/* Chỉ hiện VS khi đang live, kết quả sẽ hiện sau khi kết thúc */}
              <div className="font-display text-5xl font-black text-muted-foreground tracking-tight">
                VS
              </div>
            </>
          ) : match.result ? (
            <>
              <div className="flex items-center gap-1 bg-green-500 px-3 py-1 rounded-full">
                <span className="text-xs font-bold text-white">KẾT THÚC</span>
              </div>
              <div className="font-display text-5xl font-black tracking-tight">
                <span className="text-volta-home">{match.result.home}</span>
                <span className="text-muted-foreground mx-2">-</span>
                <span className="text-volta-away">{match.result.away}</span>
              </div>
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
            <span className="font-display font-bold text-xl tabular-nums">{displayTime}</span>
            {!match.isLive && (
              <span className="text-xs text-muted-foreground">còn lại</span>
            )}
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