import { CalendarDays, Home, Sparkles, UserRound } from "lucide-react";

const navItems = [
  { label: "首页", icon: Home, active: true },
  { label: "生辰", icon: CalendarDays },
  { label: "星座", icon: Sparkles },
  { label: "我的", icon: UserRound },
];

export function StyleLabBottomNav() {
  return (
    <nav className="style-lab-bottom-nav" aria-label="实验页底部导航">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button key={item.label} className={item.active ? "is-active" : ""} type="button">
            <span aria-hidden="true">
              <Icon />
            </span>
            <small>{item.label}</small>
          </button>
        );
      })}
    </nav>
  );
}
