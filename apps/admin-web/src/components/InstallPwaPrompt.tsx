'use client';

import { useState, useEffect } from 'react';

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone mobile app mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsStandalone(true);
      return;
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('SW registration skipped:', err);
      });
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install on iOS: Tap Share 📤 at the bottom of Safari, then choose "Add to Home Screen" ➕.');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (isStandalone || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 bg-slate-900 border border-slate-700 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
          📱
        </div>
        <div>
          <h4 className="text-sm font-bold leading-tight">Install Mobile App</h4>
          <p className="text-xs text-slate-400">Download GMC for quick offline access</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow transition"
        >
          Download
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 text-slate-400 hover:text-slate-200 text-lg leading-none"
          title="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
