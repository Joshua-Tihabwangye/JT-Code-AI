import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';

// Sticky banner shown when the browser loses network connectivity.
export function OfflineBanner() {
  const { t } = useTranslation();
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="offline-banner" role="status">
      <WifiOff size={16} aria-hidden />
      {t('chrome.offlineMessage')}
    </div>
  );
}
