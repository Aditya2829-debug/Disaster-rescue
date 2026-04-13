const CONFIGS = {
  critical:    'bg-emergency/20 text-emergency   border-emergency/30',
  high:        'bg-emergency/10 text-orange-400  border-orange-400/30',
  medium:      'bg-warning/20  text-warning      border-warning/30',
  low:         'bg-safe/20     text-safe         border-safe/30',
  pending:     'bg-warning/20  text-warning      border-warning/30',
  reported:    'bg-warning/20  text-warning      border-warning/30',
  in_progress: 'bg-blue-500/20 text-blue-400    border-blue-500/30',
  rescued:     'bg-safe/20     text-safe         border-safe/30',
  resolved:    'bg-safe/20     text-safe         border-safe/30',
  acknowledged:'bg-blue-500/20 text-blue-400    border-blue-500/30',
  deceased:    'bg-muted/20    text-muted        border-muted/30',
};

export default function StatusBadge({ label }) {
  if (!label) return null;
  const key = label.toLowerCase().replace(' ', '_');
  const cls = CONFIGS[key] || 'bg-muted/20 text-muted border-muted/30';
  const display = label.replace('_', ' ');
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls} whitespace-nowrap`}>
      {display.charAt(0).toUpperCase() + display.slice(1)}
    </span>
  );
}
