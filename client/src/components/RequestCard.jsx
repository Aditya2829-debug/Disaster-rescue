import StatusBadge from './StatusBadge';
import { formatLocation } from '../utils/geo';

const BORDER = {
  critical: 'border-l-emergency',
  high:     'border-l-orange-400',
  medium:   'border-l-warning',
  low:      'border-l-safe',
};

const TYPE_EMOJI = {
  medical: '🚑', fire: '🔥', trapped: '🆘',
  flood: '🌊', other: '⚠️', victim: '👤',
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)   return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function RequestCard({ item, onClick }) {
  const border = BORDER[item.severity] || 'border-l-muted';
  const type   = item.emergencyType || item._type || 'other';
  const when   = item.timestamp || item.createdAt;

  return (
    <button
      className={`card-glass p-4 border-l-4 ${border} w-full text-left
                  active:scale-[0.99] transition-transform duration-100`}
      onClick={() => onClick?.(item)}
      aria-label={`${item.name || 'SOS request'}, ${item.severity} severity`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white truncate">
            {TYPE_EMOJI[type] || '⚠️'} {item.name || 'SOS Request'}
          </p>
          <p className="text-muted text-sm mt-0.5">
            {type.charAt(0).toUpperCase() + type.slice(1)}
            {item.location ? ` · ${formatLocation(item.location)}` : ''}
            {when ? ` · ${timeAgo(when)}` : ''}
          </p>
        </div>
        <div className="flex flex-col gap-1 items-end shrink-0">
          <StatusBadge label={item.severity} />
          <StatusBadge label={item.status} />
        </div>
      </div>
    </button>
  );
}
