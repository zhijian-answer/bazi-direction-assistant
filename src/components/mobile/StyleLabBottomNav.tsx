import Image from "next/image";

const navItems = [
  { label: "首页", iconSrc: "/mobile/style-lab-assets/nav-home.png", active: true },
  { label: "生辰", iconSrc: "/mobile/style-lab-assets/nav-bazi.png" },
  { label: "星座", iconSrc: "/mobile/style-lab-assets/nav-zodiac.png" },
  { label: "我的", iconSrc: "/mobile/style-lab-assets/nav-profile.png" },
];

export function StyleLabBottomNav() {
  return (
    <nav className="style-lab-bottom-nav" aria-label="实验页底部导航">
      {navItems.map((item) => {
        return (
          <button key={item.label} className={item.active ? "is-active" : ""} type="button">
            <span aria-hidden="true">
              <Image src={item.iconSrc} alt="" width={76} height={64} />
            </span>
            <small>{item.label}</small>
          </button>
        );
      })}
    </nav>
  );
}
