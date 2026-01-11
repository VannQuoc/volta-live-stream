import { VoltaBet } from '@/types/volta';
import { Activity, Coins } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface LiveBetFeedProps {
  bets: VoltaBet[];
}

function formatAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toFixed(0);
}

function maskUsername(username: string): string {
  if (username.length <= 4) return username;
  return username.slice(0, 3) + '***' + username.slice(-2);
}

export function LiveBetFeed({ bets }: LiveBetFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [bets]);

  return (
    <div className="volta-card p-5 space-y-4">
      <h4 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary volta-pulse" />
        Cược mới nhất
      </h4>

      <div
        ref={containerRef}
        className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
      >
        {bets.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Chưa có lệnh cược nào</p>
        ) : (
          bets.map((bet, index) => (
            <div
              key={`${bet.matchId}-${bet.username}-${index}`}
              className={`flex items-center justify-between p-3 rounded-lg volta-slide-in ${
                bet.side === 'Home'
                  ? 'bg-volta-home/5 border border-volta-home/20'
                  : 'bg-volta-away/5 border border-volta-away/20'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    bet.side === 'Home' ? 'bg-volta-home/20' : 'bg-volta-away/20'
                  }`}
                >
                  <Coins
                    className={`w-4 h-4 ${
                      bet.side === 'Home' ? 'text-volta-home' : 'text-volta-away'
                    }`}
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">{maskUsername(bet.username)}</p>
                  <p
                    className={`text-xs ${
                      bet.side === 'Home' ? 'text-volta-home' : 'text-volta-away'
                    }`}
                  >
                    {bet.side}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-display font-bold ${
                    bet.side === 'Home' ? 'text-volta-home' : 'text-volta-away'
                  }`}
                >
                  {formatAmount(bet.amount)}
                </p>
                <p className="text-xs text-muted-foreground">{bet.currency}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
