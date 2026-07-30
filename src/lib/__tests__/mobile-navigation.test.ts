import { describe, expect, it } from "vitest";
import { resolveGeneratingRoute } from "../mobile/navigation";

describe("resolveGeneratingRoute", () => {
  it("preserves the mobile home route", () => {
    expect(resolveGeneratingRoute("/m")).toBe("/m");
  });

  it("preserves safe nested mobile routes", () => {
    expect(resolveGeneratingRoute("/m/chart")).toBe("/m/chart");
  });

  it("blocks recursive create and generating destinations", () => {
    expect(resolveGeneratingRoute("/m/create?mode=new")).toBe("/m/report/bazi");
    expect(resolveGeneratingRoute("/m/generating?next=/m")).toBe("/m/report/bazi");
  });

  it("supports legacy report aliases", () => {
    expect(resolveGeneratingRoute("zodiac")).toBe("/m/report/zodiac");
    expect(resolveGeneratingRoute("ziwei")).toBe("/m/report/ziwei");
  });
});
