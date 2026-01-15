import { VoltaMatch } from '@/types/volta';
import { Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface DebugPanelProps {
  match: VoltaMatch;
}

export function DebugPanel({ match }: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getStateLabel = (stateCode?: number) => {
    switch (stateCode) {
      case 0: return { label: 'Chuẩn bị (Betting)', color: 'text-yellow-400' };
      case 1: return { label: 'Đang đá (Live)', color: 'text-green-400' };
      case 2: return { label: 'Kết thúc (Finished)', color: 'text-red-400' };
      default: return { label: `Unknown (${stateCode ?? 'null'})`, color: 'text-muted-foreground' };
    }
  };

  const stateInfo = getStateLabel(match.stateCode);

  return (
    <div className="volta-card overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-orange-400" />
          <span className="font-mono text-sm font-bold text-orange-400">DEBUG PANEL</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="p-3 pt-0 space-y-3 font-mono text-xs">
          {/* State Code - Highlight */}
          <div className="bg-muted/50 rounded-lg p-3 border border-orange-500/30">
            <div className="text-muted-foreground mb-1">Field 25 - stateCode</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-orange-400">{match.stateCode ?? 'null'}</span>
              <span className={`${stateInfo.color} font-medium`}>→ {stateInfo.label}</span>
            </div>
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-2 gap-3">
            {/* Left column */}
            <div className="space-y-2">
              <DebugField 
                label="Field 1 - isLive" 
                value={String(match.isLive)} 
                highlight={match.isLive ? 'green' : 'gray'}
              />
              <DebugField 
                label="Field 8 - matchId" 
                value={String(match.matchId)} 
              />
              <DebugField 
                label="Field 22 - streamUrl" 
                value={match.streamUrl ? '✓ Có' : '✗ Không'} 
                highlight={match.streamUrl ? 'green' : 'red'}
              />
              <DebugField 
                label="Field 30 - result" 
                value={match.result ? `{${match.result.home},${match.result.away}}` : 'null'} 
                highlight={match.result ? 'green' : 'gray'}
              />
            </div>

            {/* Right column */}
            <div className="space-y-2">
              <DebugField 
                label="Field 0 - serverTime" 
                value={formatTime(match.serverSnapshotTime)} 
              />
              <DebugField 
                label="Field 28 - kickoffTime" 
                value={formatTime(match.kickoffTime)} 
              />
              <DebugField 
                label="Field 29 - md5Hash" 
                value={match.md5Hash ? match.md5Hash.substring(0, 8) + '...' : 'null'} 
              />
              <DebugField 
                label="resultSignature" 
                value={match.resultSignature || 'null'} 
              />
            </div>
          </div>

          {/* Betting Stats */}
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="text-muted-foreground mb-1">Field 24 - bettingStats</div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-volta-home">Home:</span>{' '}
                {match.bettingStats.homeAmount.toLocaleString()} ({match.bettingStats.homeCount} bets)
              </div>
              <div>
                <span className="text-volta-away">Away:</span>{' '}
                {match.bettingStats.awayAmount.toLocaleString()} ({match.bettingStats.awayCount} bets)
              </div>
            </div>
          </div>

          {/* Live Bets count */}
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="text-muted-foreground mb-1">Field 31 - liveBets</div>
            <div className="text-foreground">
              Tổng: <span className="text-primary font-bold">{match.liveBets.length}</span> bản ghi trong mảng
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DebugField({ 
  label, 
  value, 
  highlight 
}: { 
  label: string; 
  value: string; 
  highlight?: 'green' | 'red' | 'gray';
}) {
  const highlightClass = 
    highlight === 'green' ? 'text-green-400' : 
    highlight === 'red' ? 'text-red-400' : 
    highlight === 'gray' ? 'text-muted-foreground' : 
    'text-foreground';

  return (
    <div className="bg-muted/30 rounded p-1.5">
      <div className="text-muted-foreground text-[10px] truncate">{label}</div>
      <div className={`${highlightClass} truncate`}>{value}</div>
    </div>
  );
}

function formatTime(timeStr?: string): string {
  if (!timeStr) return 'null';
  try {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('vi-VN');
  } catch {
    return timeStr.substring(11, 19);
  }
}
