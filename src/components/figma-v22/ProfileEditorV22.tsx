"use client";

import { useRouter } from "next/navigation";
import CreateProfileScreen, { type ProfileFormData } from "./CreateProfileScreen";
import { saveMobileProfile, useMobileProfileState } from "@/lib/mobile/profile";

const shichenHours = [23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21];

function shichenFromTime(time: string) {
  const hour = Number(time.split(":")[0]);
  if (!Number.isFinite(hour)) return -1;
  if (hour === 23 || hour < 1) return 0;
  return Math.min(11, Math.floor((hour + 1) / 2));
}

export function ProfileEditorV22({ mode, returnTo }: { mode: "new" | "edit"; returnTo?: string }) {
  const router = useRouter();
  const { profile, hasProfile } = useMobileProfileState();
  const existing = mode === "edit" && hasProfile && !profile.isDemo ? profile : null;
  const [year, month, day] = (existing?.birthDate || "1995-06-15").split("-").map(Number);
  const initialData: Partial<ProfileFormData> = existing ? {
    name: existing.name,
    gender: existing.gender === "female" ? "女" : existing.gender === "male" ? "男" : "未选",
    calType: existing.calendarType === "lunar" ? "农历" : "公历",
    year, month, day,
    shichen: existing.birthTimeKnown ? shichenFromTime(existing.birthTime) : -1,
    city: existing.birthPlace,
    citySkipped: !existing.birthPlace,
  } : {};

  function complete(data: ProfileFormData) {
    const hour = data.shichen >= 0 ? shichenHours[data.shichen] : null;
    saveMobileProfile({
      ...profile,
      id: mode === "new" ? undefined : profile.id,
      name: data.name.trim() || "朋友",
      gender: data.gender === "女" ? "female" : data.gender === "男" ? "male" : "other",
      calendarType: data.calType === "农历" ? "lunar" : "solar",
      birthDate: `${data.year}-${String(data.month).padStart(2, "0")}-${String(data.day).padStart(2, "0")}`,
      birthTime: hour == null ? "" : `${String(hour).padStart(2, "0")}:00`,
      birthTimeKnown: hour != null,
      isLeapMonth: false,
      birthPlace: data.citySkipped ? "" : data.city.trim(),
      isDemo: false,
      isLocalOnly: true,
      syncStatus: "local",
    });
    const destination = returnTo?.startsWith("/m") && !returnTo.startsWith("/m/create") && !returnTo.startsWith("/m/generating") ? returnTo : "/m/report/bazi";
    router.push(`/m/generating?next=${encodeURIComponent(destination)}`);
  }

  return <div className="figma-v22-app" style={{ minHeight: "100svh", background: "linear-gradient(140deg, #EDE8F8 0%, #E4F4EE 50%, #FCEEE9 100%)" }}><div className="figma-v22-shell" style={{ width: "100%", maxWidth: 430, height: "100svh", maxHeight: 932, position: "relative", overflow: "hidden", margin: "0 auto" }}><CreateProfileScreen initialData={initialData} onBack={() => router.back()} onComplete={complete} /></div></div>;
}
