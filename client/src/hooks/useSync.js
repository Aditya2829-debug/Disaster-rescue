import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { syncToServer, checkInternet } from '../sync/syncManager';

const useSync = () => {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    const handleOnline = async () => {
      const isReachable = await checkInternet();
      if (isReachable) syncToServer(token);
    };
    
    window.addEventListener('online', handleOnline);
    // Attempt sync on mount
    handleOnline();
    
    return () => window.removeEventListener('online', handleOnline);
  }, [token]);
};

export default useSync;
