export const ZIWEI_ENGINE_VERSION = "2.5.8";

export const ZIWEI_ENGINE_CONFIG = {
  yearDivide: "exact",
  horoscopeDivide: "exact",
  ageDivide: "birthday",
  dayDivide: "forward",
  algorithm: "default",
} as const;

export type ZiweiBirthInput = {
  calendarType: "solar" | "lunar";
  birthDate: string;
  birthTime: string | null;
  birthTimeKnown: boolean;
  gender: "male" | "female" | "other";
  isLeapMonth?: boolean;
  targetDate?: string;
  targetTime?: string;
};

export type RawZiweiStar = {
  name: string;
  type: string;
  scope: string;
  brightness: string;
  mutagen: string;
};

export type RawZiweiPalace = {
  index: number;
  name: string;
  isBodyPalace: boolean;
  isOriginalPalace: boolean;
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: RawZiweiStar[];
  minorStars: RawZiweiStar[];
  adjectiveStars: RawZiweiStar[];
  decadal: {
    range: [number, number];
    heavenlyStem: string;
    earthlyBranch: string;
  };
  ages: number[];
};

export type RawZiweiHoroscopeItem = {
  index: number;
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  palaceNames: string[];
  mutagen: string[];
};

export type RawZiweiHoroscope = {
  solarDate: string;
  lunarDate: string;
  decadal: RawZiweiHoroscopeItem;
  age: RawZiweiHoroscopeItem & { nominalAge: number };
  yearly: RawZiweiHoroscopeItem;
  monthly: RawZiweiHoroscopeItem;
  daily: RawZiweiHoroscopeItem;
  hourly: RawZiweiHoroscopeItem;
};

export type RawZiweiChart = {
  gender: string;
  solarDate: string;
  lunarDate: string;
  chineseDate: string;
  time: string;
  timeRange: string;
  timeIndex: number;
  sign: string;
  zodiac: string;
  soulPalaceBranch: string;
  bodyPalaceBranch: string;
  soulStar: string;
  bodyStar: string;
  fiveElementsClass: string;
  palaces: RawZiweiPalace[];
  horoscope: RawZiweiHoroscope;
};

export type ZiweiEngineInfo = {
  name: string;
  version: string;
  license: string;
  source: string;
  config: typeof ZIWEI_ENGINE_CONFIG;
};

export interface ZiweiEngine {
  calculate(input: ZiweiBirthInput): Promise<RawZiweiChart>;
  getEngineInfo(): ZiweiEngineInfo;
}

export type ZiweiUnavailableReason = "birth_time_unknown" | "gender_required" | "invalid_birth_date" | "invalid_birth_time";

export type ZiweiCalculationResult =
  | { status: "ready"; chart: RawZiweiChart; insight: NormalizedZiweiInsight }
  | { status: "insufficient_input"; reasons: ZiweiUnavailableReason[] }
  | { status: "calculation_error"; message: string };

export type NormalizedZiweiInsight = {
  identity: {
    title: string;
    summary: string;
    tags: string[];
  };
  environment: {
    stableZone: string[];
    drainZone: string[];
  };
  relationship: {
    summary: string;
    prompts: string[];
  };
  today: {
    keyword: string;
    summary: string;
    doList: string[];
    avoidList: string[];
    action: string;
  };
  stage: {
    rangeLabel: string;
    summary: string;
  };
  evidence: {
    engine: string;
    engineVersion: string;
    license: string;
    config: typeof ZIWEI_ENGINE_CONFIG;
    mingGong?: string;
    shenGong?: string;
    majorStars: string[];
    mutagens: string[];
    palaces: Array<{
      name: string;
      heavenlyStem: string;
      earthlyBranch: string;
      majorStars: string[];
      isBodyPalace: boolean;
      isOriginalPalace: boolean;
    }>;
    rawFieldsUsed: string[];
    rulesApplied: string[];
  };
};
