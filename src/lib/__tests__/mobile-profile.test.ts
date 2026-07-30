import { describe, expect, it } from "vitest";
import { normalizeMobileProfile } from "../mobile/profile";
import { getMobileProfileKind, getReportCapability, isValidProfileBirthDate } from "../mobile/profileCapabilities";

const required = {
  name: "真实用户",
  gender: "other" as const,
  calendarType: "solar" as const,
  birthDate: "1992-11-02",
  birthTime: "18:20",
  birthTimeKnown: true,
  isLeapMonth: false,
};

describe("mobile profile hydration", () => {
  it("keeps missing profile fields empty instead of borrowing demo birth data", () => {
    const profile = normalizeMobileProfile({ name: "草稿用户", isDemo: false });

    expect(profile.birthDate).toBe("");
    expect(profile.birthTime).toBe("");
    expect(profile.birthPlace).toBe("");
    expect(profile.latitude).toBeUndefined();
    expect(profile.longitude).toBeUndefined();
    expect(getMobileProfileKind(profile, true)).toBe("draft");
  });

  it("migrates legacy demo profiles away from the personal identity label", () => {
    const profile = normalizeMobileProfile({ id: "demo-profile", name: "自己", isDemo: true });

    expect(profile.name).toBe("示例：小玄");
    expect(profile.birthDate).toBe("1990-06-18");
    expect(profile.isDemo).toBe(true);
  });

  it("does not leak demo coordinates into a real profile with no city", () => {
    const profile = normalizeMobileProfile({ ...required, birthPlace: "", latitude: 23.1291, longitude: 113.2644, birthPlaceResolution: "unknown", isDemo: false });

    expect(profile.latitude).toBeUndefined();
    expect(profile.longitude).toBeUndefined();
    expect(profile.timezone).toBeUndefined();
    expect(profile.birthPlaceResolution).toBe("unknown");
    expect(profile.isDemo).toBe(false);
  });

  it("hydrates coordinates from a supported city", () => {
    const profile = normalizeMobileProfile({ ...required, birthPlace: "广州" });

    expect(profile.latitude).toBeCloseTo(23.1291);
    expect(profile.longitude).toBeCloseTo(113.2644);
    expect(profile.birthPlaceResolution).toBe("catalog");
  });

  it("preserves saved coordinates for an unlisted place", () => {
    const profile = normalizeMobileProfile({
      ...required,
      birthPlace: "广东省佛山市",
      latitude: 23.0215,
      longitude: 113.1214,
      timezone: "Asia/Shanghai",
    });

    expect(profile.latitude).toBe(23.0215);
    expect(profile.longitude).toBe(113.1214);
    expect(profile.birthPlaceResolution).toBe("coordinates");
  });
});

describe("mobile profile capabilities", () => {
  it("rejects missing and impossible solar dates", () => {
    expect(isValidProfileBirthDate({ birthDate: "", calendarType: "solar" })).toBe(false);
    expect(isValidProfileBirthDate({ birthDate: "2026-02-30", calendarType: "solar" })).toBe(false);
    expect(isValidProfileBirthDate({ birthDate: "1990-06-18", calendarType: "solar" })).toBe(true);
  });

  it("marks reports according to the fields they actually require", () => {
    const partial = normalizeMobileProfile({ ...required, birthPlace: "", birthTime: "", birthTimeKnown: false, isDemo: false });

    expect(getReportCapability(partial, "bazi").availability).toBe("partial");
    expect(getReportCapability(partial, "chart").missing).toEqual(expect.arrayContaining(["birthTime", "birthPlace"]));
    expect(getReportCapability(partial, "ziwei").availability).toBe("unavailable");
  });
});
