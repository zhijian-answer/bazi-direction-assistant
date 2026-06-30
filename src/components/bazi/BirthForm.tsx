"use client";

import { CalendarDays, Check, Clock3, MapPin, RotateCcw } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type BirthDraft = {
  name: string;
  gender: "male" | "female";
  calendarType: "solar" | "lunar";
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  timezone: string;
  isLeapMonth: boolean;
  timeUnknown: boolean;
  remember: boolean;
};

const storageKey = "bazi-birth-form-v1";

const emptyDraft: BirthDraft = {
  name: "",
  gender: "male",
  calendarType: "solar",
  birthDate: "",
  birthTime: "12:00",
  birthPlace: "",
  timezone: "Asia/Shanghai",
  isLeapMonth: false,
  timeUnknown: false,
  remember: true,
};

export function BirthForm({
  busy,
  defaultName,
  profileCount,
  onSubmit,
}: {
  busy: boolean;
  defaultName?: string;
  profileCount: number;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [draft, setDraft] = useState<BirthDraft>({ ...emptyDraft, name: defaultName || "" });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          setDraft({ ...emptyDraft, name: defaultName || "", ...JSON.parse(saved) });
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      } finally {
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [defaultName]);

  function update<K extends keyof BirthDraft>(key: K, value: BirthDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    if (draft.remember) {
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
    } else {
      window.localStorage.removeItem(storageKey);
    }
    onSubmit(event);
  }

  function reset() {
    window.localStorage.removeItem(storageKey);
    setDraft({ ...emptyDraft, name: defaultName || "" });
  }

  if (!ready) {
    return <div className="h-96 animate-pulse rounded-md bg-[var(--soft)]" />;
  }

  return (
    <section className="panel p-5 sm:p-6" aria-labelledby="birth-form-title">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="section-kicker">出生信息</div>
          <h2 id="birth-form-title" className="mt-2 font-display text-2xl text-[var(--ink)]">填写后立即排盘</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">请按出生证明或家人确认的信息填写。已保存 {profileCount}/3 个档案。</p>
        </div>
        <button type="button" onClick={reset} className="icon-button" title="重新填写" aria-label="重新填写">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <label className="field-label">
          档案名称
          <input name="name" value={draft.name} onChange={(event) => update("name", event.target.value)} className="field-control" placeholder="例如：我的命盘" maxLength={40} />
        </label>

        <fieldset>
          <legend className="field-label">性别</legend>
          <div className="segmented mt-2">
            {(["male", "female"] as const).map((value) => (
              <label key={value} className={draft.gender === value ? "is-active" : ""}>
                <input type="radio" name="gender" value={value} checked={draft.gender === value} onChange={() => update("gender", value)} />
                {value === "male" ? "男" : "女"}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="field-label">日历类型</legend>
          <div className="segmented mt-2">
            {(["solar", "lunar"] as const).map((value) => (
              <label key={value} className={draft.calendarType === value ? "is-active" : ""}>
                <input type="radio" name="calendarType" value={value} checked={draft.calendarType === value} onChange={() => update("calendarType", value)} />
                {value === "solar" ? "阳历" : "农历"}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field-label">
            <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[var(--cinnabar)]" />出生日期</span>
            <input name="birthDate" type="date" required value={draft.birthDate} onChange={(event) => update("birthDate", event.target.value)} className="field-control" />
          </label>
          {!draft.timeUnknown && (
            <label className="field-label">
              <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[var(--cinnabar)]" />出生时间</span>
              <input name="birthTime" type="time" required value={draft.birthTime} onChange={(event) => update("birthTime", event.target.value)} className="field-control" />
            </label>
          )}
        </div>

        {draft.timeUnknown && <input type="hidden" name="birthTime" value="12:00" />}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field-label">
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--cinnabar)]" />出生地</span>
            <input name="birthPlace" required value={draft.birthPlace} onChange={(event) => update("birthPlace", event.target.value)} className="field-control" placeholder="例如：四川省成都市" />
          </label>
          <label className="field-label">
            时区
            <select name="timezone" value={draft.timezone} onChange={(event) => update("timezone", event.target.value)} className="field-control">
              <option value="Asia/Shanghai">中国标准时间 UTC+8</option>
              <option value="Asia/Hong_Kong">中国香港 UTC+8</option>
              <option value="Asia/Tokyo">日本标准时间 UTC+9</option>
              <option value="Europe/London">英国时间</option>
              <option value="America/New_York">美国东部时间</option>
            </select>
          </label>
        </div>

        <div className="grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
          {draft.calendarType === "lunar" && (
            <label className="check-row">
              <input name="isLeapMonth" type="checkbox" checked={draft.isLeapMonth} onChange={(event) => update("isLeapMonth", event.target.checked)} />
              <span><Check className="h-3.5 w-3.5" /></span>
              这是闰月
            </label>
          )}
          <label className="check-row">
            <input name="timeUnknown" type="checkbox" checked={draft.timeUnknown} onChange={(event) => update("timeUnknown", event.target.checked)} />
            <span><Check className="h-3.5 w-3.5" /></span>
            不知道具体出生时间
          </label>
          <label className="check-row">
            <input type="checkbox" checked={draft.remember} onChange={(event) => update("remember", event.target.checked)} />
            <span><Check className="h-3.5 w-3.5" /></span>
            记住我的填写信息
          </label>
        </div>

        <button type="submit" disabled={busy} className="btn-primary min-h-12 w-full px-5">
          {busy ? "正在排盘…" : "立即排盘"}
        </button>
        <p className="text-center text-xs leading-5 text-[var(--muted)]">排盘结果仅供传统文化研究与娱乐参考。</p>
      </form>
    </section>
  );
}
