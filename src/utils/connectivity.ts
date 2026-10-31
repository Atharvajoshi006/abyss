import { useState, useEffect } from 'react';
import { subscribeSWStatus } from '../serviceWorkerRegistration';

export type ConnectivityStatus =
  | 'ONLINE'
  | 'OFFLINE'
  | 'OFFLINE_CACHE_READY'
  | 'SW_UNAVAILABLE';

export interface ConnectivityInfo {
  status: ConnectivityStatus;
  label: string;
  isOnline: boolean;
  hasCache: boolean;
  colorClass: string;
}

export function useConnectivity(): ConnectivityInfo {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [swActive, setSwActive] = useState<boolean>(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }
    return Boolean(navigator.serviceWorker.controller);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to Service Worker readiness
    const unsubscribe = subscribeSWStatus((ready) => {
      setSwActive(ready);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const swSupported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;

  if (!swSupported) {
    return {
      status: 'SW_UNAVAILABLE',
      label: 'Service Worker unavailable',
      isOnline,
      hasCache: false,
      colorClass: 'bg-stone-100 text-stone-600 border-stone-200',
    };
  }

  // Only display Offline cache ready when the Service Worker is actually installed and controlling the page
  if (swActive) {
    return {
      status: 'OFFLINE_CACHE_READY',
      label: isOnline ? 'Offline cache ready' : 'Offline (Cache Ready)',
      isOnline,
      hasCache: true,
      colorClass: isOnline
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
        : 'bg-amber-50 text-amber-800 border-amber-200',
    };
  }

  if (isOnline) {
    return {
      status: 'ONLINE',
      label: 'Online',
      isOnline: true,
      hasCache: false,
      colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  }

  return {
    status: 'OFFLINE',
    label: 'Offline',
    isOnline: false,
    hasCache: false,
    colorClass: 'bg-rose-50 text-rose-800 border-rose-200',
  };
}
