import { describe, expect, it } from "vitest";
import { IztroEngine } from "../engines/iztroEngine";
import { ziweiFixtures } from "../fixtures";

describe("IztroEngine", () => {
  const engine = new IztroEngine();

  it.each(ziweiFixtures.filter((fixture) => fixture.expected))("matches reviewed fixture: $id", async ({ input, expected }) => {
    const chart = await engine.calculate(input);
    const soulPalace = chart.palaces.find((palace) => palace.name === "命宫");
    const bodyPalace = chart.palaces.find((palace) => palace.isBodyPalace);

    expect(chart.palaces).toHaveLength(12);
    expect(chart.palaces.filter((palace) => palace.isBodyPalace)).toHaveLength(1);
    expect(chart.solarDate).toBe(expected?.solarDate);
    expect(chart.time).toBe(expected?.time);
    expect(chart.soulPalaceBranch).toBe(expected?.soulPalaceBranch);
    expect(chart.bodyPalaceBranch).toBe(expected?.bodyPalaceBranch);
    expect(soulPalace?.majorStars.map((star) => star.name)).toEqual(expected?.soulMajorStars);
    expect(bodyPalace?.name).toBe(expected?.bodyPalace);
    expect(chart.palaces[chart.horoscope.daily.index]?.name).toBe(expected?.dailyPalace);
    expect(chart.palaces[chart.horoscope.decadal.index]?.name).toBe(expected?.decadalPalace);
    expect(Object.getPrototypeOf(chart.palaces[0])).toBe(Object.prototype);
    expect(JSON.parse(JSON.stringify(chart))).toEqual(chart);
  });

  it("reports pinned engine metadata", () => {
    expect(engine.getEngineInfo()).toMatchObject({ name: "iztro", version: "2.5.8", license: "MIT" });
  });

  it("produces the same natal structure for equivalent solar and lunar inputs", async () => {
    const lunar = ziweiFixtures.find((fixture) => fixture.id === "lunar-female-known-time")!;
    const solar = ziweiFixtures.find((fixture) => fixture.id === "solar-female-lunar-equivalent")!;
    const [lunarChart, solarChart] = await Promise.all([engine.calculate(lunar.input), engine.calculate(solar.input)]);
    expect(lunarChart.palaces).toEqual(solarChart.palaces);
    expect(lunarChart.soulPalaceBranch).toBe(solarChart.soulPalaceBranch);
    expect(lunarChart.bodyPalaceBranch).toBe(solarChart.bodyPalaceBranch);
    expect(lunarChart.horoscope).toEqual(solarChart.horoscope);
  });
});
