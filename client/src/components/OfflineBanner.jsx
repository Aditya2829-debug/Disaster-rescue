import useOnlineStatus from '../hooks/useOnlineStatus';

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;
  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 bg-warning text-black text-center text-sm py-2 font-medium"
    >
      📵 Offline — changes are saved and will sync when connected
    </div>
  );
}
