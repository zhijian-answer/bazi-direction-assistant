"use client";

import { ArrowLeft, CalendarDays, ChevronRight, Clock3, MapPin, Orbit, Save, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { trackMobileEvent } from "@/lib/mobile/analytics";
import { defaultMobileProfile, saveMobileProfile, useMobileProfileState } from "@/lib/mobile/profile";
import type { MobileProfile } from "@/lib/mobile/types";
import { birthPlaceOptions, resolveBirthPlace } from "@/lib/zodiac/birthPlaceCatalog";
import { MobileShell } from "./MobileShell";
import armillaryImage from "../../../public/mobile/xuanshu-armillary-hero.webp";

const emptyProfile: MobileProfile = {
  ...defaultMobileProfile,
  id: undefined,
  name: "",
  gender: "other",
  birthDate: "",
  birthTime: "",
  birthTimeKnown: true,
  birthPlace: "",
  latitude: undefined,
  longitude: undefined,
  timezone: undefined,
  birthPlaceResolution: "unknown",
  isDemo: false,
  completeness: 0,
  createdAt: undefined,
  updatedAt: undefined,
};

const stepCopy = [
  { title: "先建立你的", accent: "观察档案", description: "称呼用于区分不同档案，性别可以暂不明确。" },
  { title: "记录你的", accent: "出生时间", description: "日期与时辰会影响结构计算；不确定时请直接标记，不会用随机时间代替。" },
  { title: "确认", accent: "地点与用途", description: "城市可以稍后补充。资料只保存在当前设备，登录后才会同步。" },
];

export function CreateProfileFlow({ mode = "edit" }: { mode?: "new" | "edit" }) {
  const router = useRouter();
  const { profile: savedProfile, hasProfile } = useMobileProfileState();
  const initialProfile = mode === "new" ? emptyProfile : hasProfile && !savedProfile.isDemo ? savedProfile : emptyProfile;
  const [draft, setDraft] = useState<MobileProfile | null>(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const profile = draft ?? initialProfile;
  const copy = stepCopy[step - 1];
  const resolvedLocation = resolveBirthPlace(profile.birthPlace);

  useEffect(() => {
    trackMobileEvent("profile_create_start", { source: "create_page", mode });
  }, [mode]);

  function update<K extends keyof MobileProfile>(key: K, value: MobileProfile[K]) {
    setDraft((current) => {
      const next = { ...(current ?? initialProfile), [key]: value, isDemo: false };
      if (key !== "birthPlace") return next;
      return { ...next, latitude: undefined, longitude: undefined, timezone: undefined, birthPlaceResolution: "unknown" };
    });
    setError("");
  }

  function validateCurrentStep() {
    if (step === 1 && !profile.name.trim()) return "请填写档案称呼";
    if (step === 2 && !profile.birthDate) return "请选择出生日期";
    if (step === 2 && profile.birthTimeKnown && !profile.birthTime) return "请选择出生时间，或标记为时辰不确定";
    return "";
  }

  function nextStep() {
    const nextError = validateCurrentStep();
    if (nextError) return setError(nextError);
    trackMobileEvent("profile_create_step_complete", { step, calendarType: profile.calendarType, birthTimeKnown: profile.birthTimeKnown });
    setStep((current) => Math.min(3, current + 1));
    setError("");
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }

  function goBack() {
    if (step > 1) {
      setStep((current) => current - 1);
      setError("");
      return;
    }
    router.back();
  }

  function persistProfile(nextPath: string) {
    saveMobileProfile({ ...profile, name: profile.name.trim(), birthPlace: profile.birthPlace.trim(), isDemo: false });
    router.push(nextPath);
  }

  function completeProfile() {
    const nextError = validateCurrentStep();
    if (nextError) return setError(nextError);
    trackMobileEvent("profile_create_complete", {
      mode,
      calendarType: profile.calendarType,
      birthTimeKnown: profile.birthTimeKnown,
      locationMatched: Boolean(resolvedLocation),
      genderProvided: profile.gender !== "other",
    });
    persistProfile("/m/generating?next=bazi");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (step < 3) {
      nextStep();
      return;
    }
    completeProfile();
  }

  return (
    <MobileShell withNav={false} theme="home">
      <header className="create-topbar create-topbar--market">
        <button type="button" className="mobile-icon-button" onClick={goBack} aria-label={step > 1 ? "返回上一步" : "返回上一页"}><ArrowLeft /></button>
        <strong>创建档案</strong>
        <span><b>{step}</b> / 3</span>
      </header>

      <section className="create-intro create-intro--market">
        <Image src={armillaryImage} alt="" aria-hidden="true" priority loading="eager" />
        <div>
          <small>建立本地观察档案</small>
          <h1>{copy.title}<span>{copy.accent}</span></h1>
          <p>{copy.description}</p>
        </div>
      </section>

      <nav className="create-progress" aria-label="创建档案进度">
        {["称呼", "出生时间", "出生地点"].map((label, index) => {
          const number = index + 1;
          return <span key={label} className={step === number ? "is-active" : step > number ? "is-done" : ""}><b>{number}</b>{label}</span>;
        })}
      </nav>

      <form className="create-form create-form--market" onSubmit={submit}>
        <section className="create-market-panel">
          {step === 1 ? (
            <>
              <label className="create-field">
                <span><UserRound />称呼</span>
                <input value={profile.name} onChange={(event) => update("name", event.target.value)} placeholder="请输入你的昵称" autoComplete="nickname" />
              </label>

              <fieldset className="create-segment">
                <legend>性别 <small>可选</small></legend>
                <div className="create-segment--three">
                  <button type="button" className={profile.gender === "male" ? "is-active" : ""} onClick={() => update("gender", "male")}>男</button>
                  <button type="button" className={profile.gender === "female" ? "is-active" : ""} onClick={() => update("gender", "female")}>女</button>
                  <button type="button" className={profile.gender === "other" ? "is-active" : ""} onClick={() => update("gender", "other")}>暂不明确</button>
                </div>
              </fieldset>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <fieldset className="create-segment">
                <legend>历法选择</legend>
                <div>
                  <button type="button" className={profile.calendarType === "solar" ? "is-active" : ""} onClick={() => update("calendarType", "solar")}><CalendarDays />公历</button>
                  <button type="button" className={profile.calendarType === "lunar" ? "is-active" : ""} onClick={() => update("calendarType", "lunar")}><CalendarDays />农历</button>
                </div>
              </fieldset>

              {profile.calendarType === "lunar" ? (
                <fieldset className="create-segment">
                  <legend>月份类型</legend>
                  <div>
                    <button type="button" className={!profile.isLeapMonth ? "is-active" : ""} onClick={() => update("isLeapMonth", false)}>普通月份</button>
                    <button type="button" className={profile.isLeapMonth ? "is-active" : ""} onClick={() => update("isLeapMonth", true)}>闰月</button>
                  </div>
                </fieldset>
              ) : null}

              <label className="create-field">
                <span><CalendarDays />出生日期</span>
                <input type="date" value={profile.birthDate} onChange={(event) => update("birthDate", event.target.value)} />
              </label>

              <fieldset className="create-segment">
                <legend><Clock3 />出生时辰</legend>
                <div>
                  <button type="button" className={profile.birthTimeKnown ? "is-active" : ""} onClick={() => update("birthTimeKnown", true)}>知道时间</button>
                  <button type="button" className={!profile.birthTimeKnown ? "is-active" : ""} onClick={() => update("birthTimeKnown", false)}>时辰不确定</button>
                </div>
              </fieldset>

              {profile.birthTimeKnown ? (
                <label className="create-field">
                  <span><Clock3 />出生时间</span>
                  <input type="time" value={profile.birthTime} onChange={(event) => update("birthTime", event.target.value)} />
                </label>
              ) : (
                <p className="create-field-note">时辰不确定时仍可查看生辰与星座内容，但不会生成完整紫微十二宫报告。</p>
              )}
            </>
          ) : null}

          {step === 3 ? (
            <>
              <label className="create-field">
                <span><MapPin />出生城市 <small>可选</small></span>
                <input list="birth-place-options" value={profile.birthPlace} onChange={(event) => update("birthPlace", event.target.value)} placeholder="例如：广东省广州市" />
                <datalist id="birth-place-options">
                  {birthPlaceOptions.map((place) => <option key={place} value={place} />)}
                </datalist>
              </label>
              <p className="create-field-note">{resolvedLocation ? `已识别为${resolvedLocation.label}，可计算完整上升配置。` : "地点会影响上升星座。未匹配到城市时仍可保存，但不会用默认地点生成上升结论。"}</p>
              <dl className="create-review">
                <div><dt>档案称呼</dt><dd>{profile.name || "待填写"}</dd></div>
                <div><dt>出生日期</dt><dd>{profile.birthDate || "待填写"}</dd></div>
                <div><dt>出生时间</dt><dd>{profile.birthTimeKnown ? profile.birthTime || "待填写" : "时辰不确定"}</dd></div>
                <div><dt>保存位置</dt><dd>仅当前设备</dd></div>
              </dl>
            </>
          ) : null}
        </section>

        <section className="create-uses">
          <Image src={armillaryImage} alt="" aria-hidden="true" />
          <strong>将用于</strong>
          <span><Orbit />生辰</span><span><Orbit />星座</span><span><Orbit />紫微</span>
        </section>

        {error ? <p className="create-error" role="alert">{error}</p> : null}

        <motion.button type="button" className="create-submit" onClick={step < 3 ? nextStep : completeProfile} whileTap={{ scale: 0.98 }}>
          {step < 3 ? "继续下一步" : "生成我的报告"}<ChevronRight />
        </motion.button>

        {step > 1 ? <button type="button" className="create-secondary" onClick={() => setStep((current) => current - 1)}>返回上一步</button> : null}
        {step === 3 ? <button type="button" className="create-secondary" onClick={() => persistProfile("/m")}><Save />先保存基础资料</button> : null}
        <p className="create-boundary">档案默认只保存在当前设备。登录仅用于跨设备同步，不影响游客体验。</p>
      </form>
    </MobileShell>
  );
}
