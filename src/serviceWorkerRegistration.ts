/**
 * Service Worker registration and lifecycle management for TIMEWALLET.
 * Registration is strictly restricted to production builds.
 */

type SWStatusListener = (isReady: boolean) => void;
const listeners: Set<SWStatusListener> = new Set();

let swReady = false;

export function isServiceWorkerReady(): boolean {
  return swReady;
}

export function subscribeSWStatus(listener: SWStatusListener): () => void {
  listeners.add(listener);
  listener(swReady);
  return () => {
    listeners.delete(listener);
  };
}

export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Strictly restrict Service Worker registration to production builds.
  // In development mode, actively unregister any rogue service worker and clear all cache storage
  // to prevent intercepting Vite dev assets, HMR websocket, and dynamically served TSX modules.
  if (!import.meta.env.PROD) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(() => {
          console.log('[SW Dev Mode] Unregistered development service worker');
        });
      }
    });

    if (typeof caches !== 'undefined') {
      caches.keys().then((keys) => {
        for (const key of keys) {
          caches.delete(key);
        }
      });
    }
    return;
  }

  // Production-only registration logic
  window.addEventListener('load', () => {
    // Check if controller already exists
    if (navigator.serviceWorker.controller) {
      swReady = true;
      listeners.forEach((l) => l(true));
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        if (registration.active) {
          swReady = true;
          listeners.forEach((l) => l(true));
        }

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'activated' && navigator.serviceWorker.controller) {
              swReady = true;
              listeners.forEach((l) => l(true));
            }
          });
        });
      })
      .catch((err) => {
        console.warn('[SW Registration] Failed:', err);
      });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      swReady = true;
      listeners.forEach((l) => l(true));
    });
  });
}
