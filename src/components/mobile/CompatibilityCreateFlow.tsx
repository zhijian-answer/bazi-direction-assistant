"use client";

import { ArrowLeft, ArrowRight, Plus, UserRound, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { relationshipOptions } from "@/lib/compatibility";
import { saveCompatibilityDraft } from "@/lib/compatibility/storage";
import type { CompatibilityMode, RelationshipType } from "@/lib/compatibility";
import { emptyMobileProfile, upsertMobileProfile, useMobileProfile, useMobileProfiles } from "@/lib/mobile/profile";
import { isValidProfileBirthDate } from "@/lib/mobile/profileCapabilities";
import type { MobileProfile } from "@/lib/mobile/types";
import { resolveBirthPlace } from "@/lib/zodiac";
import { MobileShell } from "./MobileShell";
import { ProfileBirthFields, ProfileIdentityFields, ProfileLocationField } from "./ProfileFields";

const emptyPartner: MobileProfile = {
  ...emptyMobileProfile,
};

const demoPartner: MobileProfile = {
  ...emptyMobileProfile,
  id: "demo-partner-profile",
  name: "示例：小林",
  gender: "male",
  calendarType: "solar",
  birthDate: "1992-11-02",
  birthTime: "18:20",
  birthTimeKnown: true,
  birthPlace: "北京市",
  latitude: 39.9042,
  longitude: 116.4074,
  timezone: "Asia/Shanghai",
  birthPlaceResolution: "catalog",
  isDemo: true,
  completeness: 100,
};

export function CompatibilityCreateFlow({ initialMode }: { initialMode: CompatibilityMode }) {
  const router = useRouter();
  const activeProfile = useMobileProfile();
  const storedProfiles = useMobileProfiles();
  const profiles = useMemo(() => {
    const base = storedProfiles.some((item) => item.id === activeProfile.id) ? storedProfiles : [activeProfile, ...storedProfiles];
    if (!activeProfile.isDemo || base.some((item) => item.id === demoPartner.id)) return base;
    return [...base, demoPartner];
  }, [activeProfile, storedProfiles]);
  const [mode, setMode] = useState<CompatibilityMode>(initialMode);
  const [primaryId, setPrimaryId] = useState("");
  const effectivePrimaryId = primaryId || activeProfile.id || "";
  const initialPartner = activeProfile.isDemo ? demoPartner : profiles.find((item) => item.id !== activeProfile.id);
  const [partnerId, setPartnerId] = useState(initialPartner?.id || "new");
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("partner");
  const [draftPartner, setDraftPartner] = useState<MobileProfile>(emptyPartner);
  const [stage, setStage] = useState<"pair" | "details">("pair");
  const [error, setError] = useState("");
  const selectedPrimary = profiles.find((item) => item.id === effectivePrimaryId) ?? activeProfile;
  const selectedPartner = partnerId === "new" ? null : profiles.find((item) => item.id === partnerId);

  function updatePartner<K extends keyof MobileProfile>(key: K, value: MobileProfile[K]) {
    setDraftPartner((current) => {
      const next = { ...current, [key]: value };
      if (key !== "birthPlace") return next;
      const resolved = resolveBirthPlace(String(value || ""));
      return { ...next, latitude: resolved?.latitude, longitude: resolved?.longitude, timezone: resolved?.timezone };
    });
    setError("");
  }

  function continueToGenerate() {
    const primary = profiles.find((item) => item.id === effectivePrimaryId);
    if (!primary?.id) return setError("请先选择你的档案");
    if (!isValidProfileBirthDate(primary)) return setError("你的档案缺少有效出生日期，请先补充资料");
    let resolvedPartnerId = partnerId;
    let resolvedPartner = profiles.find((item) => item.id === partnerId);
    if (partnerId === "new") {
      if (!draftPartner.name.trim()) return setError("请填写对方称呼");
      if (!isValidProfileBirthDate(draftPartner)) return setError("请填写对方有效出生日期");
      if (draftPartner.birthTimeKnown && !draftPartner.birthTime) return setError("请填写对方出生时间，或标记为时辰不确定");
      const persisted = upsertMobileProfile({ ...draftPartner, name: draftPartner.name.trim() }, { activate: false });
      resolvedPartnerId = persisted.id || "";
      resolvedPartner = persisted;
    }
    if (!resolvedPartnerId || resolvedPartnerId === effectivePrimaryId) return setError("请选择另一份档案作为对方");
    if (!resolvedPartner || !isValidProfileBirthDate(resolvedPartner)) return setError("对方档案缺少有效出生日期，请先补充资料");
    saveCompatibilityDraft({
      id: `compatibility-draft-${Date.now()}`,
      mode,
      primaryProfileId: effectivePrimaryId,
      partnerProfileId: resolvedPartnerId,
      primarySnapshot: primary,
      partnerSnapshot: resolvedPartner,
      relationshipType,
      createdAt: new Date().toISOString(),
    });
    router.push("/m/compatibility/generating");
  }

  function continueFromPair() {
    const primary = profiles.find((item) => item.id === effectivePrimaryId);
    if (!primary?.id) return setError("请先选择你的档案");
    if (!isValidProfileBirthDate(primary)) return setError("你的档案缺少有效出生日期，请先补充资料");
    if (partnerId === "new") {
      setStage("details");
      setError("");
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
      return;
    }
    continueToGenerate();
  }

  function goBack() {
    if (stage === "details") {
      setStage("pair");
      setError("");
      return;
    }
    router.back();
  }

  return (
    <MobileShell withNav={false} theme="home">
      <header className="compatibility-create-topbar"><button type="button" onClick={goBack} aria-label={stage === "details" ? "返回选择双方" : "返回"}><ArrowLeft /></button><strong>建立双人合盘</strong><span>{stage === "pair" ? "1 / 2" : "2 / 2"}</span></header>
      <main className="compatibility-page compatibility-create">
        <header className="compatibility-hero compatibility-hero--compact"><small><UsersRound />{stage === "pair" ? "双方资料" : "对方档案"}</small><h1>{stage === "pair" ? <>先确认是谁，<br /><span>再看关系如何发生</span></> : <>只填写知道的资料，<br /><span>不确定就明确标记</span></>}</h1><p>{stage === "pair" ? "先选择双方和关系类型；需要新建对方档案时，再进入下一步填写。" : "本人和对方使用同一套出生资料规则，不会用默认时辰补齐未知信息。"}</p></header>
        {activeProfile.isDemo ? <aside className="compatibility-demo-note">当前是完整示例体验。示例双方已经准备好，结果可以查看和分享，但不会写入你的合盘历史。</aside> : null}
        {stage === "pair" ? <>
          <section className="compatibility-pair-preview" aria-label="当前合盘双方">
            <div><span>{selectedPrimary.name.slice(0, 1) || "我"}</span><strong>{selectedPrimary.name || "自己"}</strong><small>资料 {selectedPrimary.completeness ?? 100}%</small></div>
            <i><UsersRound /><small>关系结构</small></i>
            <div><span>{selectedPartner?.name.slice(0, 1) || "TA"}</span><strong>{selectedPartner?.name || "选择档案"}</strong><small>{selectedPartner ? `资料 ${selectedPartner.completeness ?? 100}%` : "或新建关系档案"}</small></div>
          </section>
          <fieldset className="compatibility-mode-switch"><legend>合盘类型</legend><div><button type="button" className={mode === "astrology" ? "is-active" : ""} onClick={() => setMode("astrology")}>星盘合盘</button><button type="button" className={mode === "bazi" ? "is-active" : ""} onClick={() => setMode("bazi")}>生辰合盘</button></div></fieldset>
          <section className="compatibility-form-panel xs-instrument-card">
            <label><span><UserRound />我的档案</span><select value={effectivePrimaryId} onChange={(event) => setPrimaryId(event.target.value)}>{profiles.map((profile) => <option key={profile.id || profile.name} value={profile.id}>{profile.name} · {profile.birthDate}</option>)}</select></label>
            <label><span><UsersRound />对方档案</span><select value={partnerId} onChange={(event) => { setPartnerId(event.target.value); setError(""); }}><option value="new">新建对方档案</option>{profiles.filter((profile) => profile.id !== effectivePrimaryId).map((profile) => <option key={profile.id || profile.name} value={profile.id}>{profile.name} · {profile.birthDate}</option>)}</select></label>
            <fieldset><legend>你们现在的关系</legend><div className="compatibility-relation-grid">{relationshipOptions.map((option) => <button type="button" key={option.value} className={relationshipType === option.value ? "is-active" : ""} onClick={() => setRelationshipType(option.value)}>{option.label}</button>)}</div></fieldset>
          </section>
        </> : <section className="compatibility-form-panel compatibility-new-profile xs-instrument-card">
          <h2><Plus />新建对方档案</h2>
          <div className="compatibility-profile-step"><small>01 · 身份</small><ProfileIdentityFields profile={draftPartner} onChange={updatePartner} nameLabel="怎么称呼对方" namePlaceholder="例如：小林" /></div>
          <div className="compatibility-profile-step"><small>02 · 出生时间</small><ProfileBirthFields profile={draftPartner} onChange={updatePartner} /></div>
          <div className="compatibility-profile-step"><small>03 · 出生地点</small><ProfileLocationField profile={draftPartner} onChange={updatePartner} listId="compatibility-birth-places" /></div>
        </section>}
        {error ? <p className="compatibility-form-error" role="alert">{error}</p> : null}
        <button type="button" className="compatibility-primary-action" onClick={stage === "pair" ? continueFromPair : continueToGenerate}>{stage === "pair" && partnerId === "new" ? "继续填写对方资料" : "开始建立关系结构"}<ArrowRight /></button>
        <p className="compatibility-form-boundary">双方资料默认只保存在当前设备。关系区间只用于分层阅读，不代表关系结果。</p>
      </main>
    </MobileShell>
  );
}
