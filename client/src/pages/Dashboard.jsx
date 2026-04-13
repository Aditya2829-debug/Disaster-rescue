import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import db from '../db/db';
import RequestCard from '../components/RequestCard';
import BottomNav from '../components/BottomNav';
import useAuthStore from '../store/authStore';
import useOnlineStatus from '../hooks/useOnlineStatus';

const TABS = ['all', 'active', 'resolved'];

function matchTab(tab, item) {
  const s = (item.status || '').toLowerCase();
  if (tab === 'all')      return true;
  if (tab === 'active')   return ['reported', 'pending', 'in_progress', 'acknowledged'].includes(s);
  if (tab === 'resolved') return ['rescued', 'resolved', 'deceased'].includes(s);
  return true;
}

export default function Dashboard() {
  const navigate  = useNavigate();
  const isOnline  = useOnlineStatus();
  const { token } = useAuthStore();
  const [tab,     setTab]     = useState('all');
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let victims = await db.victims.toArray();
    let sos     = await db.sos_signals.toArray();

    if (isOnline && token) {
      try {
        const [vRes, sRes] = await Promise.all([
          fetch('/api/victims', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/sos',     { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (vRes.ok) victims = await vRes.json();
        if (sRes.ok) sos     = await sRes.json();
      } catch { /* use local data */ }
    }

    const combined = [
      ...victims.map((v) => ({ ...v, _type: 'victim', emergencyType: 'victim' })),
      ...sos.map((s)     => ({ ...s, _type: 'sos',    name: 'SOS Request'      })),
    ].sort((a, b) =>
      new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0)
    );

    setItems(combined);
    setLoading(false);
  }, [isOnline, token]);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter((i) => matchTab(tab, i));

  return (
    <div className="min-h-screen bg-base flex flex-col pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="text-muted text-xs">{items.length} total</span>
            <button id="refresh-btn" onClick={load} aria-label="Refresh"
              className="text-lg text-muted active:scale-90 transition-transform">🔄</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card/60 p-1 rounded-xl">
          {TABS.map((t) => (
            <button key={t} id={`tab-${t}`}
              onClick={() => setTab(t)}
              className={`tab-btn ${tab === t ? 'tab-btn-active' : 'tab-btn-inactive'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t !== 'all' && (
                <span className="ml-1 text-xs opacity-70">
                  ({items.filter((i) => matchTab(t, i)).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* List */}
      <main className="flex-1 px-5 space-y-3 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center pt-16 text-muted text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center pt-16 gap-3 text-muted">
            <span className="text-4xl">📭</span>
            <p className="text-sm">No {tab === 'all' ? '' : tab} incidents found</p>
          </div>
        ) : (
          filtered.map((item) => (
            <RequestCard key={item.localId || item._id} item={item}
              onClick={() => {}} />
          ))
        )}
      </main>

      {/* FAB — field workers */}
      <button id="fab-log" onClick={() => navigate('/victims/new')}
        aria-label="Log new victim"
        className="fixed right-5 bottom-24 w-14 h-14 rounded-full bg-emergency
                   flex items-center justify-center text-2xl shadow-lg
                   active:scale-90 transition-transform duration-150 z-30">
        +
      </button>

      <BottomNav />
    </div>
  );
}
