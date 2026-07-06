import { describe, expect, it } from "vitest";
import { ziweiFixtures } from "../fixtures";
import { calculateZiweiInsight, validateZiweiInput } from "../service";

describe("Ziwei service input boundary", () => {
  it("does not generate a full chart when birth time is unknown", async () => {
    const result = await calculateZiweiInsight(ziweiFixtures.find((fixture) => fixture.id === "unknown-birth-time")!.input);
    expect(result).toEqual({ status: "insufficient_input", reasons: ["birth_time_unknown"] });
  });

  it("requires a supported gender for direction-sensitive calculations", () => {
    expect(validateZiweiInput({ ...ziweiFixtures[0].input, gender: "other" })).toContain("gender_required");
  });

  it("rejects impossible solar dates and invalid times", () => {
    expect(validateZiweiInput({ ...ziweiFixtures[0].input, birthDate: "2026-02-30", birthTime: "25:00" })).toEqual(expect.arrayContaining(["invalid_birth_date", "invalid_birth_time"]));
  });
});
