import type {
  RawZiweiChart,
  RawZiweiHoroscopeItem,
  RawZiweiPalace,
  RawZiweiStar,
  ZiweiBirthInput,
  ZiweiEngine,
} from "../contracts";
import { ZIWEI_ENGINE_CONFIG, ZIWEI_ENGINE_VERSION } from "../contracts";

function toTimeIndex(time: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) throw new Error("invalid_birth_time");
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) throw new Error("invalid_birth_time");
  if (hour === 23) return 12;
  if (hour === 0) return 0;
  return Math.floor((hour + 1) / 2);
}

function copyStar(star: { name?: string; type?: string; scope?: string; brightness?: string; mutagen?: string }): RawZiweiStar {
  return {
    name: star.name || "",
    type: star.type || "",
    scope: star.scope || "",
    brightness: star.brightness || "",
    mutagen: star.mutagen || "",
  };
}

function copyPalace(palace: {
  index: number;
  name: string;
  isBodyPalace: boolean;
  isOriginalPalace: boolean;
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: Parameters<typeof copyStar>[0][];
  minorStars: Parameters<typeof copyStar>[0][];
  adjectiveStars: Parameters<typeof copyStar>[0][];
  decadal: { range: [number, number]; heavenlyStem: string; earthlyBranch: string };
  ages: number[];
}): RawZiweiPalace {
  return {
    index: palace.index,
    name: palace.name,
    isBodyPalace: palace.isBodyPalace,
    isOriginalPalace: palace.isOriginalPalace,
    heavenlyStem: palace.heavenlyStem,
    earthlyBranch: palace.earthlyBranch,
    majorStars: palace.majorStars.map(copyStar),
    minorStars: palace.minorStars.map(copyStar),
    adjectiveStars: palace.adjectiveStars.map(copyStar),
    decadal: {
      range: [...palace.decadal.range],
      heavenlyStem: palace.decadal.heavenlyStem,
      earthlyBranch: palace.decadal.earthlyBranch,
    },
    ages: [...palace.ages],
  };
}

function copyHoroscopeItem(item: {
  index: number;
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  palaceNames: string[];
  mutagen: string[];
}): RawZiweiHoroscopeItem {
  return {
    index: item.index,
    name: item.name,
    heavenlyStem: item.heavenlyStem,
    earthlyBranch: item.earthlyBranch,
    palaceNames: [...item.palaceNames],
    mutagen: [...item.mutagen],
  };
}

export class IztroEngine implements ZiweiEngine {
  getEngineInfo() {
    return {
      name: "iztro",
      version: ZIWEI_ENGINE_VERSION,
      license: "MIT",
      source: "https://github.com/SylarLong/iztro",
      config: ZIWEI_ENGINE_CONFIG,
    } as const;
  }

  async calculate(input: ZiweiBirthInput): Promise<RawZiweiChart> {
    if (!input.birthTime) throw new Error("birth_time_unknown");
    const { astro } = await import("iztro");
    const timeIndex = toTimeIndex(input.birthTime);
    const targetTimeIndex = input.targetTime ? toTimeIndex(input.targetTime) : 6;
    const gender = input.gender === "male" ? "男" : "女";
    const chart = astro.withOptions({
      type: input.calendarType,
      dateStr: input.birthDate,
      timeIndex,
      gender,
      isLeapMonth: input.calendarType === "lunar" ? Boolean(input.isLeapMonth) : false,
      fixLeap: false,
      language: "zh-CN",
      config: ZIWEI_ENGINE_CONFIG,
    });
    const horoscope = chart.horoscope(input.targetDate, targetTimeIndex);

    return {
      gender: chart.gender,
      solarDate: chart.solarDate,
      lunarDate: chart.lunarDate,
      chineseDate: chart.chineseDate,
      time: chart.time,
      timeRange: chart.timeRange,
      timeIndex,
      sign: chart.sign,
      zodiac: chart.zodiac,
      soulPalaceBranch: chart.earthlyBranchOfSoulPalace,
      bodyPalaceBranch: chart.earthlyBranchOfBodyPalace,
      soulStar: chart.soul,
      bodyStar: chart.body,
      fiveElementsClass: chart.fiveElementsClass,
      palaces: chart.palaces.map(copyPalace),
      horoscope: {
        solarDate: horoscope.solarDate,
        lunarDate: horoscope.lunarDate,
        decadal: copyHoroscopeItem(horoscope.decadal),
        age: { ...copyHoroscopeItem(horoscope.age), nominalAge: horoscope.age.nominalAge },
        yearly: copyHoroscopeItem(horoscope.yearly),
        monthly: copyHoroscopeItem(horoscope.monthly),
        daily: copyHoroscopeItem(horoscope.daily),
        hourly: copyHoroscopeItem(horoscope.hourly),
      },
    };
  }
}
