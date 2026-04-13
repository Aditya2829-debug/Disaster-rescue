import { NavLink } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function BottomNav() {
  const { user } = useAuthStore();
  const role = user?.role;
  const isField = role && role !== 'civilian';

  const links = [
    { to: '/',          label: 'Home',      icon: '🏠',  id: 'nav-home' },
    { to: '/sos',       label: 'SOS',       icon: '🆘',  id: 'nav-sos'  },
    ...(isField ? [
      { to: '/victims/new', label: 'Log',    icon: '📋', id: 'nav-log'  },
      { to: '/dashboard',   label: 'Board',  icon: '📊', id: 'nav-board'},
      { to: '/map',         label: 'Map',    icon: '🗺️', id: 'nav-map'  },
    ] : []),
  ];

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 border-t border-white/[0.08] flex justify-around py-2 safe-area-inset-bottom"
      style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      {links.map(({ to, label, icon, id }) => (
        <NavLink
          key={to}
          to={to}
          id={id}
          aria-label={label}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 min-h-touch justify-center
             text-xs font-medium transition-colors duration-150
             ${isActive ? 'text-emergency' : 'text-muted'}`
          }
        >
          <span className="text-xl leading-none">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
