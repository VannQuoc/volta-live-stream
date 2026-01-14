import { VoltaMatch } from '@/types/volta';
import { TrendingUp, Users, Minus, Square } from 'lucide-react';
import { useState } from 'react';

interface BettingStatsProps {
  match: VoltaMatch;
}

function formatAmount(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toFixed(0);
}

export function BettingStats({ match }: BettingStatsProps) {
  // Default expanded on desktop (lg+), minimized on mobile
  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return true;
  });
  const { bettingStats } = match;
  const totalAmount = bettingStats.homeAmount + bettingStats.awayAmount;
  const homePercent = totalAmount > 0 ? (bettingStats.homeAmount / totalAmount) * 100 : 50;
  const awayPercent = 100 - homePercent;

  const totalCount = bettingStats.homeCount + bettingStats.awayCount;
  const homeCountPercent = totalCount > 0 ? (bettingStats.homeCount / totalCount) * 100 : 50;

  return (
    <div className="volta-card overflow-hidden">
      {/* Window Title Bar */}
      <div 
        className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border cursor-pointer select-none"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <h4 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Thống kê cược
        </h4>
        <div className="flex items-center gap-1">
          <button 
            className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
          >
            {isMinimized ? (
              <Square className="w-3 h-3 text-muted-foreground" />
            ) : (
              <Minus className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Content - Collapsible */}
      <div className={`transition-all duration-300 ease-out ${isMinimized ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
        <div className="p-5 space-y-5">
          {/* Amount Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-volta-home">
                {formatAmount(bettingStats.homeAmount)} VND
              </span>
              <span className="text-muted-foreground">Tổng tiền cược</span>
              <span className="font-medium text-volta-away">
                {formatAmount(bettingStats.awayAmount)} VND
              </span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden flex">
              <div
                className="progress-bar-home transition-all duration-500 ease-out"
                style={{ width: `${homePercent}%` }}
              />
              <div
                className="progress-bar-away transition-all duration-500 ease-out"
                style={{ width: `${awayPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{homePercent.toFixed(1)}%</span>
              <span>{awayPercent.toFixed(1)}%</span>
            </div>
          </div>

          {/* Count Stats */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-volta-home flex items-center gap-1">
                <Users className="w-3 h-3" />
                {bettingStats.homeCount}
              </span>
              <span className="text-muted-foreground">Số lượt cược</span>
              <span className="font-medium text-volta-away flex items-center gap-1">
                {bettingStats.awayCount}
                <Users className="w-3 h-3" />
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden flex">
              <div
                className="progress-bar-home transition-all duration-500"
                style={{ width: `${homeCountPercent}%` }}
              />
              <div
                className="progress-bar-away transition-all duration-500"
                style={{ width: `${100 - homeCountPercent}%` }}
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-volta-home/5 border border-volta-home/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-display font-bold text-volta-home volta-count-up">
                {formatAmount(bettingStats.homeAmount)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{match.homeTeam}</p>
            </div>
            <div className="bg-volta-away/5 border border-volta-away/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-display font-bold text-volta-away volta-count-up">
                {formatAmount(bettingStats.awayAmount)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{match.awayTeam}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
