declare module "bazi-calculator-by-alvamind" {
  type Pillar = { chinese: string };
  type ElementBalance = Record<"WOOD" | "FIRE" | "EARTH" | "METAL" | "WATER", number>;

  export class BaziCalculator {
    constructor(year: number, month: number, day: number, hour: number, gender?: "male" | "female");
    calculatePillars(): Record<"year" | "month" | "day" | "time", Pillar>;
    calculateBasicAnalysis(): { fiveFactors: ElementBalance };
  }
}
