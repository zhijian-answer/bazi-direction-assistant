import { describe, expect, it } from "vitest";
import { formatZodiacDegree } from "../zodiac/format";

describe("formatZodiacDegree", () => {
  it("carries rounded minutes into the next degree", () => {
    expect(formatZodiacDegree(21.9999)).toBe("22°00′");
  });

  it("wraps the final zodiac degree without rendering 30 degrees", () => {
    expect(formatZodiacDegree(29.9999)).toBe("0°00′");
  });
});
