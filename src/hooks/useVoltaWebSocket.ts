import { useEffect, useRef, useState, useCallback } from 'react';
import { VoltaLeague, VoltaWebSocketMessage, parseVoltaData } from '@/types/volta';

const WS_URL = 'wss://novoga.sb21.net/ws';
const CLIENT_ID = 'b52';
const TOKEN = '13-55eaf614d4adfb0d3d3b8b2fcdb8d071';

interface UseVoltaWebSocketReturn {
  league: VoltaLeague | null;
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

export function useVoltaWebSocket(): UseVoltaWebSocketReturn {
  const [league, setLeague] = useState<VoltaLeague | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(`${WS_URL}?clientId=${CLIENT_ID}&token=${TOKEN}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Volta WebSocket connected');
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const message: VoltaWebSocketMessage = JSON.parse(event.data);
          
          if (message.t === 'current' && message.d) {
            const parsedLeague = parseVoltaData(message.d);
            if (parsedLeague) {
              setLeague(parsedLeague);
            }
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Lỗi kết nối WebSocket');
      };

      ws.onclose = () => {
        console.log('Volta WebSocket disconnected');
        setIsConnected(false);
        
        // Auto reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
    } catch (e) {
      console.error('Failed to create WebSocket:', e);
      setError('Không thể kết nối đến server');
    }
  }, []);

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    connect();
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { league, isConnected, error, reconnect };
}
