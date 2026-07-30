"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { MobileProfile } from "./types";
import { resolveBirthPlace } from "../zodiac/birthPlaceCatalog";
import { getMobileProfileKind } from "./profileCapabilities";

export const emptyMobileProfile: MobileProfile = {
  id: undefined,
  name: "",
  gender: "other",
  calendarType: "solar",
  birthDate: "",
  birthTime: "",
  birthTimeKnown: true,
  isLeapMonth: false,
  birthPlace: "",
  latitude: undefined,
  longitude: undefined,
  timezone: undefined,
  birthPlaceResolution: "unknown",
  isDemo: false,
  isLocalOnly: true,
  completeness: 0,
  syncStatus: "local",
};

export const defaultMobileProfile: MobileProfile = {
  id: "demo-profile",
  name: "示例：小玄",
  gender: "female",
  calendarType: "solar",
  birthDate: "1990-06-18",
  birthTime: "09:30",
  birthTimeKnown: true,
  isLeapMonth: false,
  birthPlace: "广东省广州市",
  latitude: 23.1291,
  longitude: 113.2644,
  timezone: "Asia/Shanghai",
  birthPlaceResolution: "catalog",
  isDemo: true,
  isLocalOnly: true,
  completeness: 100,
};

const profileKey = "xuanshu-mobile-profile";
const profilesKey = "xuanshu-mobile-profiles-v1";
const profileEvent = "xuanshu-mobile-profile-change";
const emptyProfileSnapshot = "__xuanshu_empty_profile__";

export function loadMobileProfile(): MobileProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(profileKey);
    return stored ? normalizeMobileProfile(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
}

export function normalizeMobileProfile(value: Partial<MobileProfile>): MobileProfile {
  const source = value.isDemo
    ? { ...defaultMobileProfile, createdAt: value.createdAt, updatedAt: value.updatedAt }
    : value;
  const merged = { ...emptyMobileProfile, ...source };
  const catalogLocation = resolveBirthPlace(merged.birthPlace);
  const hasSavedCoordinates = Boolean(merged.birthPlace.trim()) && Number.isFinite(source.latitude) && Number.isFinite(source.longitude);
  return {
    ...merged,
    latitude: hasSavedCoordinates ? Number(source.latitude) : catalogLocation?.latitude,
    longitude: hasSavedCoordinates ? Number(source.longitude) : catalogLocation?.longitude,
    timezone: hasSavedCoordinates ? source.timezone : catalogLocation?.timezone,
    birthPlaceResolution: catalogLocation ? "catalog" : hasSavedCoordinates ? "coordinates" : "unknown",
    isDemo: Boolean(source.isDemo),
  };
}

export function upsertMobileProfile(profile: MobileProfile, options: { activate?: boolean } = {}) {
  const { activate = true } = options;
  const now = new Date().toISOString();
  const resolvedLocation = resolveBirthPlace(profile.birthPlace);
  const hasSavedCoordinates = Boolean(profile.birthPlace.trim()) && Number.isFinite(profile.latitude) && Number.isFinite(profile.longitude);
  const persisted: MobileProfile = {
    ...profile,
    id: profile.id || window.crypto?.randomUUID?.() || `local-${Date.now()}`,
    isLocalOnly: profile.isLocalOnly ?? true,
    completeness: calculateProfileCompleteness(profile),
    createdAt: profile.createdAt || now,
    updatedAt: now,
    syncStatus: profile.syncStatus ?? "local",
    latitude: resolvedLocation?.latitude ?? (hasSavedCoordinates ? profile.latitude : undefined),
    longitude: resolvedLocation?.longitude ?? (hasSavedCoordinates ? profile.longitude : undefined),
    timezone: resolvedLocation?.timezone ?? (hasSavedCoordinates ? profile.timezone : undefined),
    birthPlaceResolution: resolvedLocation ? "catalog" : hasSavedCoordinates ? "coordinates" : "unknown",
  };
  const profiles = loadMobileProfiles();
  const nextProfiles = [persisted, ...profiles.filter((item) => item.id !== persisted.id)];
  window.localStorage.setItem(profilesKey, JSON.stringify(nextProfiles));
  if (activate) window.localStorage.setItem(profileKey, JSON.stringify(persisted));
  window.dispatchEvent(new Event(profileEvent));
  return persisted;
}

export function saveMobileProfile(profile: MobileProfile) {
  return upsertMobileProfile(profile, { activate: true });
}

export function loadMobileProfiles(): MobileProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(profilesKey);
    const profiles = stored ? (JSON.parse(stored) as Partial<MobileProfile>[]).map(normalizeMobileProfile) : [];
    const active = window.localStorage.getItem(profileKey);
    if (!profiles.length && active) return [normalizeMobileProfile(JSON.parse(active))];
    return profiles;
  } catch {
    return [];
  }
}

export function setActiveMobileProfile(profileId: string) {
  const profile = loadMobileProfiles().find((item) => item.id === profileId);
  if (!profile) return false;
  window.localStorage.setItem(profileKey, JSON.stringify(profile));
  window.dispatchEvent(new Event(profileEvent));
  return true;
}

export function deleteMobileProfile(profileId: string) {
  const profiles = loadMobileProfiles().filter((item) => item.id !== profileId);
  window.localStorage.setItem(profilesKey, JSON.stringify(profiles));
  const active = loadMobileProfile();
  if (active?.id === profileId) {
    const next = profiles[0];
    if (next) window.localStorage.setItem(profileKey, JSON.stringify(next));
    else window.localStorage.removeItem(profileKey);
  }
  window.dispatchEvent(new Event(profileEvent));
}

export function activateDemoProfile() {
  saveMobileProfile({ ...defaultMobileProfile, createdAt: new Date().toISOString() });
}

export function hasSavedMobileProfile() {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(profileKey));
}

function calculateProfileCompleteness(profile: MobileProfile) {
  const checks = [profile.name.trim(), profile.birthDate, profile.birthPlace.trim(), profile.birthTimeKnown ? profile.birthTime : "unknown-time"];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function subscribeProfile(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(profileEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(profileEvent, callback);
  };
}

function getProfileSnapshot() {
  return window.localStorage.getItem(profileKey) || emptyProfileSnapshot;
}

export function useMobileProfileState() {
  const serialized = useSyncExternalStore(subscribeProfile, getProfileSnapshot, () => emptyProfileSnapshot);
  return useMemo(() => {
    const hasProfile = serialized !== emptyProfileSnapshot;
    try {
      const profile = hasProfile ? normalizeMobileProfile(JSON.parse(serialized)) : emptyMobileProfile;
      return {
        profile,
        hasProfile,
        kind: getMobileProfileKind(profile, hasProfile),
      };
    } catch {
      return { profile: emptyMobileProfile, hasProfile: false, kind: "empty" as const };
    }
  }, [serialized]);
}

export function useMobileProfile() {
  return useMobileProfileState().profile;
}

export function useMobileProfiles() {
  const serialized = useSyncExternalStore(subscribeProfile, () => JSON.stringify(loadMobileProfiles()), () => "[]");
  return useMemo(() => {
    try {
      return JSON.parse(serialized) as MobileProfile[];
    } catch {
      return [];
    }
  }, [serialized]);
}
