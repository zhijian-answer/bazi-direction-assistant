import { Home, FileText, Compass, User } from 'lucide-react';
import type { NavTab } from '../types';

interface Props {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

const TABS: { id: NavTab; label: string; Icon: typeof Home }[] = [
  { id: 'home',   label: '首页', Icon: Home },
  { id: 'report', label: '报告', Icon: FileText },
  { id: 'tools',  label: '工具', Icon: Compass },
  { id: 'my',     label: '我的', Icon: User },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav glass-deep">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button key={id} className="nav-item" onClick={() => onChange(id)}>
            <Icon
              size={22}
              strokeWidth={isActive ? 2.2 : 1.6}
              color={isActive ? 'var(--lav-deep)' : 'var(--text-4)'}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--lav-deep)' : 'var(--text-4)',
                letterSpacing: '0.02em',
                fontFamily: "'Noto Sans SC', sans-serif",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
