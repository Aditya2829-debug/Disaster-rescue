import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/db';
import { addToQueue } from '../sync/syncManager';
import useGeolocation from '../hooks/useGeolocation';
import useAuthStore from '../store/authStore';
import BottomNav from '../components/BottomNav';
import { formatLocation } from '../utils/geo';

const SEVERITIES = ['critical', 'high', 'medium', 'low'];
const STATUSES   = ['reported', 'in_progress', 'rescued', 'deceased'];

export default function VictimLog() {
  const navigate = useNavigate();
  const { location, loading: gpsLoading } = useGeolocation();
  const { token } = useAuthStore();

  const [form,  setForm]  = useState({ name: '', severity: 'high', status: 'reported', notes: '' });
  const [saved, setSaved] = useState(false);
  const [saving,setSaving]= useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const localId = uuidv4();
    const payload = {
      localId, ...form,
      location: location || { lat: 0, lng: 0 },
      createdAt: new Date().toISOString(),
    };

    await db.victims.put(payload);
    await addToQueue('victims', 'CREATE', localId, payload);

    if (navigator.onLine && token) {
      try {
        await fetch('/api/victims', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      } catch { /* queued */ }
    }

    setSaving(false);
    setSaved(true);
  };

  if (saved) return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center p-8 gap-5">
      <div className="text-7xl">📋</div>
      <h2 className="text-2xl font-bold">Victim Logged</h2>
      <p className="text-muted text-center max-w-xs">
        {navigator.onLine ? 'Saved and synced to server.' : 'Saved offline — syncs when connected.'}
      </p>
      <div className="flex gap-3 w-full max-w-xs">
        <button onClick={() => { setSaved(false); setForm({ name:'', severity:'high', status:'reported', notes:'' }); }}
          className="btn-secondary flex-1">Log Another</button>
        <button id="to-dashboard" onClick={() => navigate('/dashboard')}
          className="btn-primary flex-1">Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base flex flex-col pb-24">
      <header className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button onClick={() => navigate(-1)} aria-label="Go back"
          className="text-2xl text-muted w-10 h-10 flex items-center justify-center">←</button>
        <h1 className="text-xl font-bold">Log Victim</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 px-5 space-y-5">
        <div>
          <label className="text-sm text-muted mb-2 block" htmlFor="victim-name">Name</label>
          <input id="victim-name" type="text" placeholder="Full name" required
            className="input-field" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div>
          <label className="text-sm text-muted mb-2 block">Location (auto-detected)</label>
          <div className="input-field flex items-center gap-2 cursor-default">
            <span>📍</span>
            <span className={location ? 'text-white' : 'text-muted'}>
              {gpsLoading ? 'Detecting…'
                : location ? formatLocation(location)
                : 'GPS unavailable'}
            </span>
          </div>
        </div>

        <div>
          <label className="text-sm text-muted mb-2 block">Severity</label>
          <div className="grid grid-cols-2 gap-2">
            {SEVERITIES.map((s) => (
              <button key={s} type="button" id={`vsev-${s}`}
                onClick={() => setForm({ ...form, severity: s })}
                className={`py-3 rounded-xl text-sm font-medium border-2 min-h-touch
                  transition-colors duration-150
                  ${form.severity === s
                    ? 'border-emergency bg-emergency/10 text-emergency'
                    : 'border-white/10 text-muted'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-muted mb-2 block" htmlFor="status-sel">Status</label>
          <select id="status-sel" value={form.status} className="input-field"
            onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-muted mb-2 block" htmlFor="victim-notes">Notes</label>
          <textarea id="victim-notes" rows={3}
            placeholder="Injuries, age, additional info…"
            className="input-field resize-none"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <button id="save-victim-btn" type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : '📋 Save Victim Record'}
        </button>
      </form>
      <BottomNav />
    </div>
  );
}
