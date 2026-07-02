"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { MobileProfile } from "./types";

export const defaultMobileProfile: MobileProfile = {
  name: "自己",
  gender: "female",
  calendarType: "solar",
  birthDate: "1990-06-18",
  birthTime: "09:30",
  birthPlace: "广东省广州市",
};

const profileKey = "xuanshu-mobile-profile";
const profileEvent = "xuanshu-mobile-profile-change";
const defaultProfileJson = JSON.stringify(defaultMobileProfile);

export function loadMobileProfile(): MobileProfile {
  if (typeof window === "undefined") return defaultMobileProfile;
  try {
    const stored = window.localStorage.getItem(profileKey);
    return stored ? { ...defaultMobileProfile, ...JSON.parse(stored) } : defaultMobileProfile;
  } catch {
    return defaultMobileProfile;
  }
}

export function saveMobileProfile(profile: MobileProfile) {
  window.localStorage.setItem(profileKey, JSON.stringify(profile));
  window.dispatchEvent(new Event(profileEvent));
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
  return window.localStorage.getItem(profileKey) || defaultProfileJson;
}

export function useMobileProfile() {
  const serialized = useSyncExternalStore(subscribeProfile, getProfileSnapshot, () => defaultProfileJson);
  return useMemo(() => {
    try {
      return { ...defaultMobileProfile, ...JSON.parse(serialized) } as MobileProfile;
    } catch {
      return defaultMobileProfile;
    }
  }, [serialized]);
}
