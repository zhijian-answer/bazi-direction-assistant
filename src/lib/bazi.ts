import { Lunar, Solar } from "lunar-javascript";
import type { BaziChart, CalendarType, ElementBalance, ElementKey } from "./types";

const stemElement: Record<string, ElementKey> = {
  甲: "wood",
  乙: "wood",
  丙: "fire",
  丁: "fire",
  戊: "earth",
  己: "earth",
  庚: "metal",
  辛: "metal",
  壬: "water",
  癸: "water",
};

const branchElement: Record<string, ElementKey> = {
  子: "water",
  丑: "earth",
  寅: "wood",
  卯: "wood",
  辰: "earth",
  巳: "fire",
  午: "fire",
  未: "earth",
  申: "metal",
  酉: "metal",
  戌: "earth",
  亥: "water",
};

export const elementLabels: Record<ElementKey, string> = {
  wood: "木",
  fire: "火",
  earth: "土",
  metal: "金",
  water: "水",
};

const elementAdvice: Record<ElementKey, string> = {
  wood: "成长、学习、规划、人际修复",
  fire: "表达、曝光、沟通、作品发布",
  earth: "稳定、整理、复盘、建立秩序",
  metal: "决策、规则、取舍、专业打磨",
  water: "观察、研究、休息、信息收集",
};

export function getElementAdvice(element: ElementKey) {
  return elementAdvice[element];
}

function splitDate(date: string) {
  const [year, month, day] = date.split("-").map((value) => Number(value));
  if (!year || !month || !day) {
    throw new Error("出生日期格式不正确");
  }
  return { year, month, day };
}

function splitTime(time: string) {
  const [hourRaw, minuteRaw] = time.split(":").map((value) => Number(value));
  const hour = Number.isFinite(hourRaw) ? hourRaw : 12;
  const minute = Number.isFinite(minuteRaw) ? minuteRaw : 0;
  return { hour, minute };
}

function rankElements(balance: ElementBalance, direction: "max" | "min") {
  const values = Object.values(balance);
  const target = direction === "max" ? Math.max(...values) : Math.min(...values);
  return (Object.keys(balance) as ElementKey[]).filter((key) => balance[key] === target);
}

export function buildBaziChart(input: {
  calendarType: CalendarType;
  birthDate: string;
  birthTime: string;
  timeUnknown?: boolean;
}): BaziChart {
  const { year, month, day } = splitDate(input.birthDate);
  const { hour, minute } = splitTime(input.timeUnknown ? "12:00" : input.birthTime);

  const lunar =
    input.calendarType === "lunar"
      ? Lunar.fromYmdHms(year, month, day, hour, minute, 0)
      : Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar();

  const solar = lunar.getSolar();
  const eightChar = lunar.getEightChar();

  const stems = {
    year: eightChar.getYearGan(),
    month: eightChar.getMonthGan(),
    day: eightChar.getDayGan(),
    time: eightChar.getTimeGan(),
  };
  const branches = {
    year: eightChar.getYearZhi(),
    month: eightChar.getMonthZhi(),
    day: eightChar.getDayZhi(),
    time: eightChar.getTimeZhi(),
  };

  const balance: ElementBalance = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  Object.values(stems).forEach((stem) => {
    balance[stemElement[stem]] += 1;
  });
  Object.values(branches).forEach((branch) => {
    balance[branchElement[branch]] += 1;
  });

  const dayElement = stemElement[stems.day];

  return {
    solarText: solar.toYmdHms(),
    lunarText: lunar.toString(),
    pillars: {
      year: eightChar.getYear(),
      month: eightChar.getMonth(),
      day: eightChar.getDay(),
      time: eightChar.getTime(),
    },
    stems,
    branches,
    wuxing: {
      year: eightChar.getYearWuXing(),
      month: eightChar.getMonthWuXing(),
      day: eightChar.getDayWuXing(),
      time: eightChar.getTimeWuXing(),
      balance,
      strongest: rankElements(balance, "max"),
      weakest: rankElements(balance, "min"),
    },
    tenGods: {
      year: eightChar.getYearShiShenGan(),
      month: eightChar.getMonthShiShenGan(),
      day: eightChar.getDayShiShenGan(),
      time: eightChar.getTimeShiShenGan(),
    },
    nayin: {
      year: eightChar.getYearNaYin(),
      month: eightChar.getMonthNaYin(),
      day: eightChar.getDayNaYin(),
      time: eightChar.getTimeNaYin(),
    },
    dayMaster: {
      stem: stems.day,
      element: dayElement,
      elementLabel: elementLabels[dayElement],
    },
  };
}
