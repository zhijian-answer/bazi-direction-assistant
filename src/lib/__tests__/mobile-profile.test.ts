import { describe, expect, it } from "vitest";
import { normalizeMobileProfile } from "../mobile/profile";

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
