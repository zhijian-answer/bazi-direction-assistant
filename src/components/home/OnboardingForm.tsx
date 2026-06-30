"use client";

import { CalendarDays, Clock3, LockKeyhole, MapPin, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";

type Props = {
  busy: boolean;
  error: string;
  onRegister: (event: FormEvent<HTMLFormElement>) => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
};

export function OnboardingForm({ busy, error, onRegister, onLogin }: Props) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [timeUnknown, setTimeUnknown] = useState(false);

  return (
    <div className="onboarding-panel">
      <div className="onboarding-tabs" role="tablist" aria-label="账号操作">
        <button type="button" role="tab" aria-selected={mode === "register"} onClick={() => setMode("register")}>创建免费账号并排盘</button>
        <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => setMode("login")}>已有账号登录</button>
      </div>

      {mode === "login" ? (
        <form onSubmit={onLogin} className="onboarding-form">
          <div className="onboarding-form-intro">
            <span>继续查看已保存的命盘</span>
            <p>登录后可查看报告、流年方向、历史提问和每日行动。</p>
          </div>
          <label className="product-field"><span>邮箱</span><input name="email" type="email" autoComplete="email" required placeholder="请输入注册邮箱" /></label>
          <label className="product-field"><span>密码</span><input name="password" type="password" autoComplete="current-password" required minLength={6} placeholder="请输入密码" /></label>
          {error && <p className="product-form-error" role="alert">{error}</p>}
          <button className="product-submit" type="submit" disabled={busy}>{busy ? "正在登录…" : "登录并查看命盘"}</button>
        </form>
      ) : (
        <form onSubmit={onRegister} className="onboarding-form">
          <div className="onboarding-form-intro">
            <span>填写一次，生成完整命盘报告</span>
            <p>请尽量按照出生证明或家人确认的信息填写。所有必填项均用于排盘。</p>
          </div>

          <div className="product-form-grid">
            <label className="product-field"><span><UserRound aria-hidden="true" />命盘名称</span><input name="profileName" required maxLength={40} placeholder="例如：我的命盘" /></label>
            <label className="product-field"><span>注册邮箱</span><input name="email" type="email" autoComplete="email" required placeholder="用于登录和保存报告" /></label>
          </div>

          <div className="product-form-grid">
            <label className="product-field"><span>设置密码</span><input name="password" type="password" autoComplete="new-password" required minLength={6} placeholder="至少 6 位" /></label>
            <fieldset className="product-field"><legend>性别</legend><div className="product-segmented"><label><input name="gender" type="radio" value="male" defaultChecked /><span>男</span></label><label><input name="gender" type="radio" value="female" /><span>女</span></label></div></fieldset>
          </div>

          <fieldset className="product-field"><legend>历法</legend><div className="product-segmented"><label><input name="calendarType" type="radio" value="solar" checked={calendarType === "solar"} onChange={() => setCalendarType("solar")} /><span>阳历</span></label><label><input name="calendarType" type="radio" value="lunar" checked={calendarType === "lunar"} onChange={() => setCalendarType("lunar")} /><span>农历</span></label></div></fieldset>

          <div className="product-form-grid">
            <label className="product-field"><span><CalendarDays aria-hidden="true" />出生日期</span><input name="birthDate" type="date" required /></label>
            <label className="product-field"><span><Clock3 aria-hidden="true" />出生时间</span><input name="birthTime" type="time" required={!timeUnknown} disabled={timeUnknown} defaultValue="12:00" /></label>
          </div>

          <div className="product-form-grid">
            <label className="product-field"><span><MapPin aria-hidden="true" />出生地</span><input name="birthPlace" required placeholder="例如：四川省成都市" /></label>
            <label className="product-field"><span>时区</span><select name="timezone" defaultValue="Asia/Shanghai"><option value="Asia/Shanghai">中国标准时间 UTC+8</option><option value="Asia/Hong_Kong">中国香港 UTC+8</option><option value="Asia/Tokyo">日本标准时间 UTC+9</option><option value="Europe/London">英国时间</option><option value="America/New_York">美国东部时间</option></select></label>
          </div>

          <div className="onboarding-checks">
            <label><input name="timeUnknown" type="checkbox" checked={timeUnknown} onChange={(event) => setTimeUnknown(event.target.checked)} /><span>不清楚出生时间</span></label>
            {calendarType === "lunar" && <label><input name="isLeapMonth" type="checkbox" /><span>出生月份是闰月</span></label>}
          </div>

          {error && <p className="product-form-error" role="alert">{error}</p>}
          <button className="product-submit" type="submit" disabled={busy}>{busy ? "正在生成命盘…" : "免费生成我的命盘"}</button>
          <p className="onboarding-privacy"><LockKeyhole aria-hidden="true" />出生信息仅用于生成并保存你的命盘，不会公开展示。</p>
        </form>
      )}
    </div>
  );
}
