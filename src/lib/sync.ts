import { useState, useEffect, useCallback, useRef } from 'react';

type SyncCollection = 'chat' | 'tasks' | 'notes' | 'habits' | 'blocks' | 'calendar' | 'journal';

interface SyncPayload {
  type: 'sync';
  collection: SyncCollection;
  data: any;
}

export function useSync<T>(collection: SyncCollection, initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'init_all') {
        if (payload.data[collection]) {
          setData(payload.data[collection]);
        }
      } else if (payload.type === 'sync' && payload.collection === collection) {
        setData(payload.data);
      }
    };

    return () => ws.close();
  }, [collection]);

  const sync = useCallback((newData: T[] | T) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'sync',
        collection,
        data: newData
      }));
    }
  }, [collection]);

  return [data, sync] as const;
}
