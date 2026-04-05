import { Home, FileText, TrendingUp, MoreHorizontal } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Inicio' },
  { to: '/transactions', icon: FileText, label: 'Transacciones' },
  { to: '/statistics', icon: TrendingUp, label: 'Estadísticas' },
  { to: '/more', icon: MoreHorizontal, label: 'Más' },
];

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground transition-colors"
            activeClassName="text-primary"
            aria-label={item.label}
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
            <span className="text-[11px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
