'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { API_BASE_URL } from '@/lib/constants';
import type { FraudAlertEvent } from '@/types';
import { voiceAlertService } from '@/services/voiceAlertService';

interface UseFraudAlertStreamOptions {
  onNewAlert?: (alert: FraudAlertEvent) => void;
  enableVoiceAlert?: boolean;
}

export function useFraudAlertStream(options: UseFraudAlertStreamOptions = {}) {
  const { onNewAlert, enableVoiceAlert = true } = options;
  const [alerts, setAlerts] = useState<FraudAlertEvent[]>([]);
  const [latestAlert, setLatestAlert] = useState<FraudAlertEvent | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const processedAlertIds = useRef<Set<string>>(new Set());

  const handleAlert = useCallback(
    (alert: FraudAlertEvent) => {
      if (processedAlertIds.current.has(alert.orderId)) {
        return; // Avoid duplicate triggers
      }
      processedAlertIds.current.add(alert.orderId);

      setAlerts((prev) => [alert, ...prev.slice(0, 19)]);
      setLatestAlert(alert);

      if (enableVoiceAlert && alert.voiceMessage) {
        voiceAlertService.playFraudVoiceAlert(alert.voiceMessage).catch((err) => {
          console.warn('Voice alert playback error:', err);
        });
      }

      if (onNewAlert) {
        onNewAlert(alert);
      }
    },
    [enableVoiceAlert, onNewAlert]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isSubscribed = true;

    const connectSSE = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('boki_token') : null;
      const streamUrl = `${API_BASE_URL.replace(/\/+$/, '')}/admin/orders/alerts/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;

      try {
        eventSource = new EventSource(streamUrl);

        eventSource.onopen = () => {
          if (isSubscribed) setConnected(true);
        };

        eventSource.addEventListener('FRAUD_ALERT', (event: MessageEvent) => {
          try {
            const data: FraudAlertEvent = JSON.parse(event.data);
            handleAlert(data);
          } catch (err) {
            console.error('Failed to parse FRAUD_ALERT SSE data', err);
          }
        });

        eventSource.onerror = () => {
          if (isSubscribed) {
            setConnected(false);
            if (eventSource) {
              eventSource.close();
            }
            // Retry after 10s
            reconnectTimeout = setTimeout(() => {
              if (isSubscribed) connectSSE();
            }, 10000);
          }
        };
      } catch (err) {
        console.warn('SSE creation error, falling back to quiet mode:', err);
        if (isSubscribed) {
          reconnectTimeout = setTimeout(connectSSE, 10000);
        }
      }
    };

    connectSSE();

    return () => {
      isSubscribed = false;
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [handleAlert]);

  const dismissLatestAlert = () => {
    setLatestAlert(null);
  };

  const clearAlerts = () => {
    setAlerts([]);
    setLatestAlert(null);
  };

  return {
    alerts,
    latestAlert,
    connected,
    dismissLatestAlert,
    clearAlerts,
    handleAlert,
  };
}
