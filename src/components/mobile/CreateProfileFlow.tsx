"use client";

import { ArrowLeft, ChevronRight, Orbit } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { trackMobileEvent } from "@/lib/mobile/analytics";
import { emptyMobileProfile, saveMobileProfile, useMobileProfileState } from "@/lib/mobile/profile";
import type { MobileProfile } from "@/lib/mobile/types";
import { resolveBirthPlace } from "@/lib/zodiac/birthPlaceCatalog";
import { MobileShell } from "./MobileShell";
import { ProfileBirthFields, ProfileIdentityFields, ProfileLocationField } from "./ProfileFields";
import armillaryImage from "../../../public/mobile/xuanshu-armillary-hero.webp";

const emptyProfile: MobileProfile = {
  ...emptyMobileProfile,
};

const stepCopy = [
  { title: "先建立你的", accent: "观察档案", description: "称呼用于区分不同档案，性别可以暂不明确。" },
  { title: "记录你的", accent: "出生时间", description: "日期与时辰会影响结构计算；不确定时请直接标记，不会用随机时间代替。" },
  { title: "确认", accent: "地点与用途", description: "城市可以稍后补充。资料只保存在当前设备，登录后才会同步。" },
];

export function CreateProfileFlow({ mode = "edit", returnTo = "/m/report/bazi" }: { mode?: "new" | "edit"; returnTo?: string }) {
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
    const destination = returnTo.startsWith("/m") && !returnTo.startsWith("/m/create") && !returnTo.startsWith("/m/generating")
      ? returnTo
      : "/m/report/bazi";
    persistProfile(`/m/generating?next=${encodeURIComponent(destination)}`);
  }

  return (
    <MobileShell withNav={false} theme="home">
      <header className="create-topbar create-topbar--market">
        <button type="button" className="mobile-icon-button" onClick={goBack} aria-label={step > 1 ? "返回上一步" : "返回上一页"}><ArrowLeft /></button>
        <strong>创建档案</strong>
        <span><b>{step}</b> / 3</span>
      </header>

      <section className="create-intro create-intro--market">
        <Image src="/mobile/style-lab-assets/ziwei-hero-plate.png" alt="" aria-hidden="true" width={1600} height={1127} priority loading="eager" />
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

      <form className="create-form create-form--market" onSubmit={(event) => event.preventDefault()}>
        <section className="create-market-panel" data-current-step={step}>
          <div className={`create-field-group ${step === 1 ? "is-current" : ""}`}>
            <ProfileIdentityFields profile={profile} onChange={update} namePlaceholder="请输入你的昵称" />
          </div>

          <div className={`create-field-group ${step === 2 ? "is-current" : ""}`}>
            <ProfileBirthFields profile={profile} onChange={update} />
          </div>

          <div className={`create-field-group ${step === 3 ? "is-current" : ""}`}>
            <ProfileLocationField profile={profile} onChange={update} />
          </div>
        </section>

        <section className="create-uses">
          <Image src={armillaryImage} alt="" aria-hidden="true" loading="eager" sizes="96px" />
          <strong>将用于</strong>
          <span><Orbit />生辰</span><span><Orbit />星座</span><span><Orbit />紫微</span>
        </section>

        {error ? <p className="create-error" role="alert">{error}</p> : null}

        <motion.button type="button" className="create-submit" onClick={step < 3 ? nextStep : completeProfile} whileTap={{ scale: 0.98 }}>
          {step < 3 ? "继续下一步" : "生成我的报告"}<ChevronRight />
        </motion.button>

        <p className="create-boundary">完成第三步后，档案才会保存在当前设备。登录仅用于跨设备同步，不影响游客体验。</p>
      </form>
    </MobileShell>
  );
}
