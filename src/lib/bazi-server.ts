import "server-only";

import { BaziCalculator } from "bazi-calculator-by-alvamind";
import { buildBaziChart, type BaziChartInput } from "./bazi";
import type { BaziChart, ChartPosition } from "./types";

function splitDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

function getHour(input: BaziChartInput) {
  if (input.timeUnknown) return 12;
  const hour = Number(input.birthTime.split(":")[0]);
  return Number.isFinite(hour) ? hour : 12;
}

export function buildValidatedBaziChart(input: BaziChartInput): BaziChart {
  const chart = buildBaziChart(input);
  const { year, month, day } = splitDate(chart.solarText.slice(0, 10));
  if (year < 1930 || year > 2048) return chart;

  try {
    const calculator = new BaziCalculator(
      year,
      month,
      day,
      getHour(input),
      input.gender === "female" ? "female" : "male",
    );
    const comparison = calculator.calculatePillars();
    const matchedPillars = (Object.keys(chart.pillars) as ChartPosition[]).filter(
      (position) => comparison[position].chinese === chart.pillars[position],
    ).length;
    const weighted = calculator.calculateBasicAnalysis().fiveFactors;

    return {
      ...chart,
      engine: {
        primary: "lunar-javascript",
        validator: "bazi-calculator-by-alvamind",
        validationStatus: matchedPillars === 4 ? "matched" : "different",
        matchedPillars,
        weightedBalance: {
          wood: weighted.WOOD,
          fire: weighted.FIRE,
          earth: weighted.EARTH,
          metal: weighted.METAL,
          water: weighted.WATER,
        },
      },
    };
  } catch {
    return {
      ...chart,
      engine: {
        primary: "lunar-javascript",
        validator: "bazi-calculator-by-alvamind",
        validationStatus: "unavailable",
      },
    };
  }
}
