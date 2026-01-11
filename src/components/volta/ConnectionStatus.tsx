import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectionStatusProps {
  isConnected: boolean;
  error: string | null;
  onReconnect: () => void;
}

export function ConnectionStatus({ isConnected, error, onReconnect }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-3">
      {isConnected ? (
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-full">
          <Wifi className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Đã kết nối</span>
          <span className="w-2 h-2 bg-primary rounded-full volta-pulse" />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 px-3 py-1.5 rounded-full">
            <WifiOff className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              {error || 'Mất kết nối'}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onReconnect}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Kết nối lại
          </Button>
        </div>
      )}
    </div>
  );
}
