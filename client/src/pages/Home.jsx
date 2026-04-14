import { useNavigate } from 'react-router-dom';
import SOSButton from '../components/SOSButton';
import BottomNav from '../components/BottomNav';
import useAuthStore from '../store/authStore';
import useOnlineStatus from '../hooks/useOnlineStatus';
import BackgroundEffect from '../components/BackgroundEffect';

export default function Home() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const isOnline = useOnlineStatus();
  const isField = user?.role && user.role !== 'civilian';

  return (
    <div className="relative min-h-screen flex flex-col pb-24">


      {/* 🌟 Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">


        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-10 pb-3 backdrop-blur-md bg-black/20">
          <div>
            <h1 className="text-xl font-bold">DisasterAid</h1>
            {user && (
              <p className="text-muted text-xs mt-0.5 capitalize">
                {user.role.replace('_', ' ')}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full
              ${isOnline ? 'bg-safe/20 text-safe' : 'bg-emergency/20 text-emergency'}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-safe' : 'bg-emergency'
                  }`}
              />
              {isOnline ? 'Live' : 'Offline'}
            </div>

            {user ? (
              <button
                onClick={() => {
                  clearAuth();
                  navigate('/login');
                }}
                className="text-xs text-muted px-2 py-1"
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="text-xs text-emergency px-2 py-1"
              >
                Sign in
              </button>
            )}
          </div>
        </header>

        {/* Main Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-5 gap-6">

          {/* Glass Card */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl px-10 py-12 shadow-2xl flex flex-col items-center gap-6">

            {user && (
              <p className="text-muted text-sm">
                Welcome,{' '}
                <span className="text-white font-semibold">
                  {user.name}
                </span>
              </p>
            )}

            <SOSButton onClick={() => navigate('/sos')} />

            <p className="text-muted text-sm">
              Tap to request emergency help
            </p>

            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition text-sm"
              >
                🔐 Sign in for field / command access
              </button>
            )}
          </div>

          {/* Quick Actions */}
          {isField && (
            <div className="w-full max-w-xs grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => navigate('/victims/new')}
                className="card-glass p-4 text-center active:scale-95 transition-transform"
              >
                <div className="text-3xl">📋</div>
                <p className="text-sm font-medium mt-1">Log Victim</p>
                <p className="text-xs text-muted mt-0.5">Field report</p>
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="card-glass p-4 text-center active:scale-95 transition-transform"
              >
                <div className="text-3xl">📊</div>
                <p className="text-sm font-medium mt-1">Dashboard</p>
                <p className="text-xs text-muted mt-0.5">All requests</p>
              </button>

              <button
                onClick={() => navigate('/map')}
                className="card-glass p-4 text-center col-span-2 active:scale-95 transition-transform"
              >
                <div className="text-3xl">🗺️</div>
                <p className="text-sm font-medium mt-1">Map View</p>
                <p className="text-xs text-muted mt-0.5">See all incidents</p>
              </button>
            </div>
          )}

        </main>

        <BottomNav />
      </div>
    </div>
  );
}