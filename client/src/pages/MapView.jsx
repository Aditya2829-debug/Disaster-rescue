import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import db from '../db/db';
import BottomNav from '../components/BottomNav';
import StatusBadge from '../components/StatusBadge';
import useAuthStore from '../store/authStore';
import useGeolocation from '../hooks/useGeolocation';
import useOnlineStatus from '../hooks/useOnlineStatus';
import { getCoords, formatLocation } from '../utils/geo';

const COLOR = { critical: '#EF4444', high: '#FB923C', medium: '#F59E0B', low: '#22C55E' };
const DEFAULT_CENTER = [20.5937, 78.9629]; // India default

// Helper to keep map centered when location changes
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, map.getZoom());
  }, [coords, map]);
  return null;
}

export default function MapView() {
  const { token }           = useAuthStore();
  const { location: userLoc } = useGeolocation();
  const isOnline            = useOnlineStatus();
  const [markers, setMarkers] = useState([]);
  const [selected, setSelected] = useState(null);

  const userCoords = useMemo(() => getCoords(userLoc), [userLoc]);

  const load = useCallback(async () => {
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
      } catch { /* local fallback */ }
    }

    const all = [
      ...victims.map((v) => ({ ...v, _label: v.name || 'Victim', _type: 'victim' })),
      ...sos.map((s)     => ({ ...s, _label: 'SOS Request',       _type: 'sos'    })),
    ]
    .map(m => ({ ...m, _coords: getCoords(m.location) }))
    .filter((m) => m._coords);

    setMarkers(all);
  }, [isOnline, token]);

  useEffect(() => { load(); }, [load]);

  const center = userCoords || DEFAULT_CENTER;

  return (
    <div className="min-h-screen bg-base flex flex-col pb-20">
      <header className="flex items-center justify-between px-5 pt-12 pb-3">
        <h1 className="text-xl font-bold">Map View</h1>
        <div className="flex items-center gap-2">
          <span className="text-muted text-xs">{markers.length} incidents</span>
          <button id="map-refresh" onClick={load} aria-label="Refresh map"
            className="text-lg text-muted active:scale-90 transition-transform">🔄</button>
        </div>
      </header>

      {/* Legend */}
      <div className="flex gap-3 px-5 pb-3">
        {Object.entries(COLOR).map(([sev, col]) => (
          <div key={sev} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: col }} />
            <span className="text-muted text-xs capitalize">{sev}</span>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="flex-1 mx-4 rounded-2xl overflow-hidden border border-white/[0.08]"
           style={{ minHeight: '55vh' }}>
        <MapContainer
          center={center} zoom={12}
          style={{ height: '100%', width: '100%', minHeight: '55vh' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          />

          <RecenterMap coords={userCoords} />

          {/* User location */}
          {userCoords && (
            <CircleMarker
              center={userCoords}
              radius={8} color="#60A5FA" fillColor="#3B82F6" fillOpacity={0.9}
            >
              <Popup>📍 Your location</Popup>
            </CircleMarker>
          )}

          {/* Incident markers */}
          {markers.map((m) => {
            const isSelected = selected && (selected.localId || selected._id) === (m.localId || m._id);
            return (
              <CircleMarker
                key={m.localId || m._id}
                center={m._coords}
                radius={isSelected ? 14 : 10}
                weight={isSelected ? 3 : 1}
                color={isSelected ? '#FFFFFF' : (COLOR[m.severity] || '#94A3B8')}
                fillColor={COLOR[m.severity] || '#94A3B8'}
                fillOpacity={isSelected ? 1 : 0.85}
                eventHandlers={{ click: () => setSelected(m) }}
              />
            );
          })}
        </MapContainer>
      </div>

      {/* Bottom sheet — selected incident */}
      {selected && (
        <div className="mx-4 mt-3 card-glass p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold">{selected._label}</p>
              <p className="text-muted text-sm mt-0.5">
                {selected._type === 'sos' ? selected.emergencyType : 'Victim report'}
                {' · '}
                {formatLocation(selected.location)}
              </p>
            </div>
            <div className="flex gap-1">
              <StatusBadge label={selected.severity} />
              <StatusBadge label={selected.status} />
            </div>
          </div>
          <button onClick={() => setSelected(null)}
            className="text-xs text-muted mt-2">✕ Close</button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
