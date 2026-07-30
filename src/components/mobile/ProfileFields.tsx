"use client";

import { CalendarDays, Clock3, MapPin, UserRound } from "lucide-react";
import type { MobileProfile } from "@/lib/mobile/types";
import { birthPlaceOptions, resolveBirthPlace } from "@/lib/zodiac/birthPlaceCatalog";

export type ProfileFieldUpdate = <K extends keyof MobileProfile>(key: K, value: MobileProfile[K]) => void;

export function ProfileIdentityFields({
  profile,
  onChange,
  nameLabel = "称呼",
  namePlaceholder = "请输入昵称",
}: {
  profile: MobileProfile;
  onChange: ProfileFieldUpdate;
  nameLabel?: string;
  namePlaceholder?: string;
}) {
  return (
    <>
      <label className="create-field profile-fields__field">
        <span><UserRound />{nameLabel}</span>
        <input value={profile.name} onChange={(event) => onChange("name", event.target.value)} placeholder={namePlaceholder} autoComplete="off" />
      </label>
      <fieldset className="create-segment profile-fields__segment">
        <legend>性别 <small>可暂不明确</small></legend>
        <div className="create-segment--three">
          <button type="button" className={profile.gender === "male" ? "is-active" : ""} onClick={() => onChange("gender", "male")}>男</button>
          <button type="button" className={profile.gender === "female" ? "is-active" : ""} onClick={() => onChange("gender", "female")}>女</button>
          <button type="button" className={profile.gender === "other" ? "is-active" : ""} onClick={() => onChange("gender", "other")}>暂不明确</button>
        </div>
      </fieldset>
    </>
  );
}

export function ProfileBirthFields({ profile, onChange }: { profile: MobileProfile; onChange: ProfileFieldUpdate }) {
  return (
    <>
      <fieldset className="create-segment profile-fields__segment">
        <legend>历法选择</legend>
        <div>
          <button type="button" className={profile.calendarType === "solar" ? "is-active" : ""} onClick={() => onChange("calendarType", "solar")}><CalendarDays />公历</button>
          <button type="button" className={profile.calendarType === "lunar" ? "is-active" : ""} onClick={() => onChange("calendarType", "lunar")}><CalendarDays />农历</button>
        </div>
      </fieldset>
      {profile.calendarType === "lunar" ? (
        <fieldset className="create-segment create-month-type profile-fields__segment">
          <legend>月份类型</legend>
          <div><button type="button" className={!profile.isLeapMonth ? "is-active" : ""} onClick={() => onChange("isLeapMonth", false)}>普通月份</button><button type="button" className={profile.isLeapMonth ? "is-active" : ""} onClick={() => onChange("isLeapMonth", true)}>闰月</button></div>
        </fieldset>
      ) : null}
      <label className="create-field profile-fields__field"><span><CalendarDays />出生日期</span><input type="date" value={profile.birthDate} onChange={(event) => onChange("birthDate", event.target.value)} /></label>
      <div className="create-time-row profile-fields__time">
        {profile.birthTimeKnown ? <label className="create-field profile-fields__field"><span><Clock3 />出生时间</span><input type="time" value={profile.birthTime} onChange={(event) => onChange("birthTime", event.target.value)} /></label> : <p className="create-field-note">时辰不确定，不生成上升、宫位、时柱和完整紫微结论。</p>}
        <fieldset className="create-time-unknown"><legend>时辰不确定</legend><button type="button" className={!profile.birthTimeKnown ? "is-active" : ""} onClick={() => onChange("birthTimeKnown", !profile.birthTimeKnown)} aria-label={profile.birthTimeKnown ? "标记为时辰不确定" : "标记为时辰已知"} aria-pressed={!profile.birthTimeKnown}><span /></button></fieldset>
      </div>
    </>
  );
}

export function ProfileLocationField({ profile, onChange, listId = "birth-place-options" }: { profile: MobileProfile; onChange: ProfileFieldUpdate; listId?: string }) {
  const resolvedLocation = resolveBirthPlace(profile.birthPlace);
  return (
    <>
      <label className="create-field profile-fields__field">
        <span><MapPin />出生城市 <small>可稍后补充</small></span>
        <input list={listId} value={profile.birthPlace} onChange={(event) => onChange("birthPlace", event.target.value)} placeholder="例如：广东省广州市" />
        <datalist id={listId}>{birthPlaceOptions.map((place) => <option key={place} value={place} />)}</datalist>
      </label>
      <p className="create-field-note">
        {resolvedLocation
          ? profile.birthTimeKnown
            ? `已识别为${resolvedLocation.label}，可用于完整上升与宫位计算。`
            : `已识别为${resolvedLocation.label}；补充出生时辰后，可计算上升与宫位。`
          : "地点会影响上升与宫位等精细计算，可以稍后补充。"}
      </p>
    </>
  );
}
