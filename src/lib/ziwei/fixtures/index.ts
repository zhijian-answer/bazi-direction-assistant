import type { ZiweiBirthInput } from "../contracts";

export type ZiweiFixture = {
  id: string;
  input: ZiweiBirthInput;
  expected?: {
    solarDate: string;
    time: string;
    soulPalaceBranch: string;
    bodyPalaceBranch: string;
    soulMajorStars: string[];
    bodyPalace: string;
    dailyPalace: string;
    decadalPalace: string;
  };
};

const target = { targetDate: "2026-07-03", targetTime: "12:00" };

export const ziweiFixtures: ZiweiFixture[] = [
  {
    id: "solar-male-known-time",
    input: { calendarType: "solar", birthDate: "2000-08-16", birthTime: "03:30", birthTimeKnown: true, gender: "male", ...target },
    expected: { solarDate: "2000-08-16", time: "寅时", soulPalaceBranch: "午", bodyPalaceBranch: "戌", soulMajorStars: ["紫微"], bodyPalace: "官禄", dailyPalace: "迁移", decadalPalace: "福德" },
  },
  {
    id: "solar-female-known-time",
    input: { calendarType: "solar", birthDate: "1990-06-18", birthTime: "09:30", birthTimeKnown: true, gender: "female", ...target },
    expected: { solarDate: "1990-06-18", time: "巳时", soulPalaceBranch: "丑", bodyPalaceBranch: "亥", soulMajorStars: [], bodyPalace: "夫妻", dailyPalace: "官禄", decadalPalace: "子女" },
  },
  {
    id: "lunar-female-known-time",
    input: { calendarType: "lunar", birthDate: "2000-07-17", birthTime: "03:30", birthTimeKnown: true, gender: "female", isLeapMonth: false, ...target },
    expected: { solarDate: "2000-8-16", time: "寅时", soulPalaceBranch: "午", bodyPalaceBranch: "戌", soulMajorStars: ["紫微"], bodyPalace: "官禄", dailyPalace: "迁移", decadalPalace: "夫妻" },
  },
  {
    id: "solar-female-lunar-equivalent",
    input: { calendarType: "solar", birthDate: "2000-08-16", birthTime: "03:30", birthTimeKnown: true, gender: "female", ...target },
    expected: { solarDate: "2000-08-16", time: "寅时", soulPalaceBranch: "午", bodyPalaceBranch: "戌", soulMajorStars: ["紫微"], bodyPalace: "官禄", dailyPalace: "迁移", decadalPalace: "夫妻" },
  },
  {
    id: "lunar-leap-month",
    input: { calendarType: "lunar", birthDate: "2020-04-01", birthTime: "09:30", birthTimeKnown: true, gender: "female", isLeapMonth: true, ...target },
    expected: { solarDate: "2020-5-23", time: "巳时", soulPalaceBranch: "子", bodyPalaceBranch: "戌", soulMajorStars: ["天梁"], bodyPalace: "夫妻", dailyPalace: "迁移", decadalPalace: "命宫" },
  },
  {
    id: "late-rat-hour",
    input: { calendarType: "solar", birthDate: "2000-08-16", birthTime: "23:30", birthTimeKnown: true, gender: "male", ...target },
    expected: { solarDate: "2000-08-16", time: "晚子时", soulPalaceBranch: "申", bodyPalaceBranch: "申", soulMajorStars: ["贪狼"], bodyPalace: "命宫", dailyPalace: "福德", decadalPalace: "福德" },
  },
  {
    id: "unknown-birth-time",
    input: { calendarType: "solar", birthDate: "1990-06-18", birthTime: null, birthTimeKnown: false, gender: "female", ...target },
  },
];
