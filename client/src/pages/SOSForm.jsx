import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/db';
import { addToQueue } from '../sync/syncManager';
import useGeolocation from '../hooks/useGeolocation';
import useAuthStore from '../store/authStore';
import BottomNav from '../components/BottomNav';
import { formatLocation } from '../utils/geo';

const TYPES      = ['medical', 'fire', 'trapped', 'flood', 'other'];
const SEVERITIES = [
  { key: 'critical', label: 'Critical', cls: 'border-emergency  text-emergency  bg-emergency/10'  },
  { key: 'high',     label: 'High',     cls: 'border-orange-400 text-orange-400 bg-orange-400/10' },
  { key: 'medium',   label: 'Medium',   cls: 'border-warning    text-warning    bg-warning/10'    },
];

export default function SOSForm() {
  const navigate = useNavigate();
  const { location, loading: gpsLoading } = useGeolocation();
  const { token } = useAuthStore();

  const [form,      setForm]      = useState({ emergencyType: 'medical', severity: 'high', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [saving,    setSaving]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const localId = uuidv4();
    const payload = {
      localId,
      ...form,
      location: location || { lat: 0, lng: 0 },
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    await db.sos_signals.put(payload);
    await addToQueue('sos_signals', 'CREATE', localId, payload);

    if (navigator.onLine) {
      try {
        await fetch('/api/sos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
      } catch { /* fallback to queue */ }
    }

    setSaving(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center p-8 gap-5">
      <div className="text-7xl">✅</div>
      <h2 className="text-2xl font-bold text-center">SOS Submitted!</h2>
      <p className="text-muted text-center max-w-xs">
        {navigator.onLine
          ? 'Your request has been transmitted to responders.'
          : 'Saved offline — will transmit automatically when connected.'}
      </p>
      <button id="back-home-btn" onClick={() => navigate('/')} className="btn-primary max-w-xs">
        ← Back to Home
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-base flex flex-col pb-24">
      <header className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button id="back-btn" onClick={() => navigate(-1)} aria-label="Go back"
          className="text-2xl text-muted w-10 h-10 flex items-center justify-center">←</button>
        <h1 className="text-xl font-bold">Request Help</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 px-5 space-y-5">
        {/* Emergency Type */}
        <div>
          <label className="text-sm text-muted mb-2 block" htmlFor="emergency-type">Emergency Type</label>
          <select
            id="emergency-type"
            value={form.emergencyType}
            onChange={(e) => setForm({ ...form, emergencyType: e.target.value })}
            className="input-field"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="text-sm text-muted mb-2 block">Your Location (auto-detected)</label>
          <div className="input-field flex items-center gap-2 cursor-default">
            <span>📍</span>
            <span className={location ? 'text-white' : 'text-muted'}>
              {gpsLoading ? 'Detecting GPS…'
                : location ? formatLocation(location)
                : 'GPS unavailable — location set to 0,0'}
            </span>
          </div>
        </div>

        {/* Severity */}
        <div>
          <label className="text-sm text-muted mb-2 block">Severity</label>
          <div className="flex gap-2">
            {SEVERITIES.map(({ key, label, cls }) => (
              <button
                key={key} type="button" id={`sev-${key}`}
                onClick={() => setForm({ ...form, severity: key })}
                className={`severity-btn border-2 ${cls}
                  ${form.severity === key ? 'opacity-100' : 'opacity-40 border-white/10 bg-transparent text-muted'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm text-muted mb-2 block" htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes" rows={3} maxLength={200}
            placeholder="Brief description of situation…"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="input-field resize-none"
          />
        </div>

        <button id="submit-sos-btn" type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Sending…' : '🆘 Send SOS Request'}
        </button>

        <p className="text-xs text-muted text-center pb-2">
          Works offline — your request is saved to this device
        </p>
      </form>
      <BottomNav />
    </div>
  );
}
