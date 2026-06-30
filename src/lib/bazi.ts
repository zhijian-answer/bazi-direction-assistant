import { Lunar, Solar } from "lunar-javascript";
import { BaziCalculator } from "bazi-calculator-by-alvamind";
import type {
  BaziChart,
  CalendarType,
  ChartPosition,
  EarthlyRelation,
  ElementBalance,
  ElementKey,
  Gender,
} from "./types";

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

const positionLabels: Record<ChartPosition, string> = {
  year: "年支",
  month: "月支",
  day: "日支",
  time: "时支",
};

const pairRelations: Array<{
  type: EarthlyRelation["type"];
  pairs: string[];
  note: string;
}> = [
  { type: "六合", pairs: ["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"], note: "两支相合，传统上用来观察协作与牵引。" },
  { type: "冲", pairs: ["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"], note: "两支相冲，适合关注变化、拉扯与调整。" },
  { type: "害", pairs: ["子未", "丑午", "寅巳", "卯辰", "申亥", "酉戌"], note: "两支相害，适合留意沟通误差与隐性消耗。" },
  { type: "破", pairs: ["子酉", "卯午", "辰丑", "未戌", "寅亥", "巳申"], note: "两支相破，适合留意计划被打断或关系松动。" },
  { type: "刑", pairs: ["子卯"], note: "两支相刑，适合留意压力、规则与行为惯性。" },
];

const harmonyGroups = [
  { branches: "申子辰", element: "水" },
  { branches: "亥卯未", element: "木" },
  { branches: "寅午戌", element: "火" },
  { branches: "巳酉丑", element: "金" },
];

const punishmentGroups = ["寅巳申", "丑未戌"];
const selfPunishments = ["辰", "午", "酉", "亥"];

function getEarthlyRelations(branches: Record<ChartPosition, string>): EarthlyRelation[] {
  const entries = Object.entries(branches) as Array<[ChartPosition, string]>;
  const relations: EarthlyRelation[] = [];

  for (let left = 0; left < entries.length; left += 1) {
    for (let right = left + 1; right < entries.length; right += 1) {
      const [leftPosition, leftBranch] = entries[left];
      const [rightPosition, rightBranch] = entries[right];
      const pair = `${leftBranch}${rightBranch}`;
      const reversePair = `${rightBranch}${leftBranch}`;
      pairRelations.forEach((relation) => {
        if (relation.pairs.includes(pair) || relation.pairs.includes(reversePair)) {
          relations.push({
            type: relation.type,
            branches: pair,
            positions: [leftPosition, rightPosition],
            note: `${positionLabels[leftPosition]}与${positionLabels[rightPosition]}：${relation.note}`,
          });
        }
      });
      if (leftBranch === rightBranch && selfPunishments.includes(leftBranch)) {
        relations.push({
          type: "刑",
          branches: pair,
          positions: [leftPosition, rightPosition],
          note: `${positionLabels[leftPosition]}与${positionLabels[rightPosition]}构成自刑，宜留意反复和内在压力。`,
        });
      }
    }
  }

  harmonyGroups.forEach((group) => {
    const matches = entries.filter(([, branch]) => group.branches.includes(branch));
    const uniqueBranches = [...new Set(matches.map(([, branch]) => branch))];
    if (uniqueBranches.length >= 2) {
      relations.push({
        type: uniqueBranches.length === 3 ? "三合" : "半合",
        branches: uniqueBranches.join(""),
        positions: matches.map(([position]) => position),
        note: `${uniqueBranches.join("、")}形成${uniqueBranches.length === 3 ? "三合" : "半合"}${group.element}局，作为结构倾向参考。`,
      });
    }
  });

  punishmentGroups.forEach((group) => {
    const matches = entries.filter(([, branch]) => group.includes(branch));
    const uniqueBranches = [...new Set(matches.map(([, branch]) => branch))];
    if (uniqueBranches.length >= 2) {
      relations.push({
        type: "刑",
        branches: uniqueBranches.join(""),
        positions: matches.map(([position]) => position),
        note: `${uniqueBranches.join("、")}构成刑势，适合关注压力下的反应模式。`,
      });
    }
  });

  return relations;
}

function getAlvamindValidation(input: {
  calendarType: CalendarType;
  solarDate: string;
  hour: number;
  gender: Gender;
  pillars: Record<ChartPosition, string>;
}) {
  const { year, month, day } = splitDate(input.solarDate);
  if (year < 1930 || year > 2048) {
    return { primary: "lunar-javascript" as const, validationStatus: "unavailable" as const };
  }

  try {
    const calculator = new BaziCalculator(year, month, day, input.hour, input.gender === "female" ? "female" : "male");
    const comparison = calculator.calculatePillars();
    const matchedPillars = (Object.keys(input.pillars) as ChartPosition[]).filter(
      (position) => comparison[position].chinese === input.pillars[position],
    ).length;
    const weighted = calculator.calculateBasicAnalysis().fiveFactors;
    return {
      primary: "lunar-javascript" as const,
      validator: "bazi-calculator-by-alvamind" as const,
      validationStatus: matchedPillars === 4 ? ("matched" as const) : ("different" as const),
      matchedPillars,
      weightedBalance: {
        wood: weighted.WOOD,
        fire: weighted.FIRE,
        earth: weighted.EARTH,
        metal: weighted.METAL,
        water: weighted.WATER,
      },
    };
  } catch {
    return {
      primary: "lunar-javascript" as const,
      validator: "bazi-calculator-by-alvamind" as const,
      validationStatus: "unavailable" as const,
    };
  }
}

export function buildBaziChart(input: {
  calendarType: CalendarType;
  birthDate: string;
  birthTime: string;
  timeUnknown?: boolean;
  isLeapMonth?: boolean;
  gender?: Gender;
}): BaziChart {
  const { year, month, day } = splitDate(input.birthDate);
  const { hour, minute } = splitTime(input.timeUnknown ? "12:00" : input.birthTime);

  const lunar =
    input.calendarType === "lunar"
      ? Lunar.fromYmdHms(year, input.isLeapMonth ? -month : month, day, hour, minute, 0)
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
  const hiddenStems = {
    year: eightChar.getYearHideGan(),
    month: eightChar.getMonthHideGan(),
    day: eightChar.getDayHideGan(),
    time: eightChar.getTimeHideGan(),
  };
  const hiddenTenGods = {
    year: eightChar.getYearShiShenZhi(),
    month: eightChar.getMonthShiShenZhi(),
    day: eightChar.getDayShiShenZhi(),
    time: eightChar.getTimeShiShenZhi(),
  };
  const yun = eightChar.getYun(input.gender === "female" ? 0 : 1, 2);
  const allLuckCycles = yun.getDaYun(9);
  const luckCycles = allLuckCycles
    .filter((cycle) => cycle.getGanZhi())
    .slice(0, 8)
    .map((cycle) => ({
      ganZhi: cycle.getGanZhi(),
      startAge: cycle.getStartAge(),
      endAge: cycle.getEndAge(),
      startYear: cycle.getStartYear(),
      endYear: cycle.getEndYear(),
    }));
  const currentYear = new Date().getFullYear();
  const annualLuck = allLuckCycles
    .flatMap((cycle) => cycle.getLiuNian())
    .filter((yearItem) => yearItem.getYear() >= currentYear - 2 && yearItem.getYear() <= currentYear + 4)
    .map((yearItem) => ({ year: yearItem.getYear(), age: yearItem.getAge(), ganZhi: yearItem.getGanZhi() }));

  const pillars = {
    year: eightChar.getYear(),
    month: eightChar.getMonth(),
    day: eightChar.getDay(),
    time: eightChar.getTime(),
  };

  return {
    solarText: solar.toYmdHms(),
    lunarText: lunar.toString(),
    pillars,
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
    hiddenStems,
    hiddenTenGods,
    relations: getEarthlyRelations(branches),
    luckCycles,
    annualLuck,
    engine: getAlvamindValidation({
      calendarType: input.calendarType,
      solarDate: solar.toYmdHms().slice(0, 10),
      hour,
      gender: input.gender || "other",
      pillars,
    }),
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
