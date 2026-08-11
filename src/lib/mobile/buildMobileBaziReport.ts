import { Solar } from "lunar-javascript";
import { buildBaziChart, elementLabels } from "../bazi";
import type { ChartPosition, ElementKey } from "../types";
import type { ElementDatum, FeatureTileData, InsightCardData, MobileProfile, ShareInsightData } from "./types";
import { baziNarrativeByElement } from "../../content/mobile-copy";

const elementColors: Record<ElementKey, string> = { wood: "#6F8F65", fire: "#C96858", earth: "#B38B5E", metal: "#8F918D", water: "#62899B" };
const elementMeaning: Record<ElementKey, string> = {
  wood: "学习、连接和打开新的成长路径",
  fire: "表达、行动和让结果被看见",
  earth: "承接责任和稳定生活节奏",
  metal: "判断边界和确认完成标准",
  water: "观察、恢复和为思考留下余地",
};
const elementStyle: Record<ElementKey, { decision: string; strength: string; pressure: string; tag: string; relationship: string }> = {
  wood: { decision: "先确认这件事能否带来成长，再决定长期投入", strength: "持续学习与建立连接", pressure: "方向长期停滞或缺少成长空间", tag: "重视成长", relationship: "关系里需要共同成长，也需要方向能被说清楚" },
  fire: { decision: "先感受是否值得表达，再用行动确认结果", strength: "主动表达与推动事情被看见", pressure: "长期压抑表达或只有投入没有反馈", tag: "需要回应", relationship: "你更在意真实回应，长期冷处理会让你失去投入感" },
  earth: { decision: "先稳住基本秩序，再判断是否扩大投入", strength: "承接责任与把事情落到现实", pressure: "责任反复变化或生活节奏长期失衡", tag: "重视稳定", relationship: "稳定行动和可预期的安排，比短期热烈更重要" },
  metal: { decision: "先明确标准和边界，再做取舍", strength: "判断、整理与确认完成标准", pressure: "规则模糊、反馈含混或反复返工", tag: "边界清晰", relationship: "边界清楚、言行一致，才会让你真正放松" },
  water: { decision: "先收集足够信息，再选择行动时点", strength: "观察、理解局面与保存恢复空间", pressure: "信息过载或被迫连续快速决策", tag: "先看全局", relationship: "你需要被理解，也需要保留消化情绪的空间" },
};
const tenGodNotes: Record<string, string> = {
  正官: "面对规则、责任与长期目标时的习惯",
  七杀: "应对压力、竞争和紧迫任务的方式",
  正印: "吸收知识、获得支持和恢复状态的方式",
  偏印: "独立消化信息、保护自己与形成判断的方式",
  比肩: "坚持立场、独立推进和与同伴协作的方式",
  劫财: "面对竞争、资源分配和群体关系的反应",
  食神: "表达想法、创造内容与享受过程的方式",
  伤官: "质疑旧规则、展示能力和直接表达的方式",
  正财: "管理稳定资源、承诺与日常秩序的方式",
  偏财: "识别机会、调动资源和处理变化的方式",
  日主: "你处理外界事情时最常使用的核心方式",
};
const stemElement: Record<string, ElementKey> = { 甲: "wood", 乙: "wood", 丙: "fire", 丁: "fire", 戊: "earth", 己: "earth", 庚: "metal", 辛: "metal", 壬: "water", 癸: "water" };
const generates: Record<ElementKey, ElementKey> = { wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood" };
const controls: Record<ElementKey, ElementKey> = { wood: "earth", earth: "water", water: "fire", fire: "metal", metal: "wood" };
const positions: ChartPosition[] = ["year", "month", "day", "time"];

export function buildMobileBaziReport(profile: MobileProfile) {
  const chart = buildBaziChart({
    calendarType: profile.calendarType,
    birthDate: profile.birthDate,
    birthTime: profile.birthTime || "12:00",
    timeUnknown: !profile.birthTimeKnown,
    isLeapMonth: profile.isLeapMonth,
    gender: profile.gender,
    birthPlace: profile.birthPlace,
    latitude: profile.latitude,
    longitude: profile.longitude,
    timezone: profile.timezone,
  });
  const dayElement = chart.dayMaster.element;
  const style = elementStyle[dayElement];
  const narrative = baziNarrativeByElement[dayElement];
  const strongest = chart.wuxing.strongest[0] || dayElement;
  const weakest = chart.wuxing.weakest[0] || dayElement;
  const total = Object.values(chart.wuxing.balance).reduce((sum, value) => sum + value, 0) || 1;
  const elements = (Object.keys(chart.wuxing.balance) as ElementKey[]).map((key) => ({
    key,
    label: elementLabels[key],
    value: Math.round((chart.wuxing.balance[key] / total) * 100),
    color: elementColors[key],
    meaning: elementMeaning[key],
  })) satisfies ElementDatum[];
  const tenGods = buildTenGods(chart);
  const strongestLabel = elementLabels[strongest];
  const weakestLabel = elementLabels[weakest];
  const dayLabel = `${chart.dayMaster.stem}${chart.dayMaster.elementLabel}`;
  const currentYear = new Date().getFullYear();
  const currentLuck = chart.luckCycles?.find((item) => currentYear >= item.startYear && currentYear <= item.endYear);
  const currentAnnual = chart.annualLuck?.find((item) => item.year === currentYear);
  const now = new Date();
  const currentMonth = Solar.fromYmdHms(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
  ).getLunar().getEightChar().getMonth();

  const identity = {
    dayPillar: chart.pillars.day,
    dayLabel,
    strongestLabel,
    weakestLabel,
    title: `${dayLabel}日主的你，${narrative.hook}`,
    subtitle: narrative.scene,
    dayMaster: style.decision,
    tags: narrative.tags,
    basis: `依据：${dayLabel}日主 · ${strongestLabel}为结构重心 · ${tenGods[0]?.name || "十神"}更突出`,
    pattern: "什么样的环境，会让你更像自己",
    patternEvidence: `当环境允许你${style.strength}，而且目标与回应都比较清楚时，你通常越做越稳。`,
    patternScene: `如果长期遇到${style.pressure}，你会把很多力气花在确认和防守上；那种累未必是能力不够，而是环境没有给你合适的落点。`,
    patternBoundary: "这里描述的是结构倾向，不是固定命运。现实经验、关系质量和具体选择仍然会改变结果。",
    coverReading: {
      title: narrative.misunderstanding,
      note: `这部分与${dayLabel}日主、${strongestLabel}较突出有关。目标和反馈越清楚，你越容易稳定发挥。`,
    },
    supportElements: [strongestLabel, weakestLabel],
  };

  const lightConclusions: FeatureTileData[] = [
    { eyebrow: "适合你的环境", title: "不需要反复证明，也能把事情做深", value: `更容易发挥${strongestLabel}带来的优势`, note: `目标清楚、反馈真实、可以持续积累的环境，更容易让你把${style.strength}变成长期能力。`, highlight: "清楚比热闹重要" },
    { eyebrow: "关系里的需要", title: "不用解释太多，也不用一直猜", value: style.relationship, note: "真正舒服的关系，不只让你感到被需要，也允许你直接说出自己的需要。回应是否稳定，比一时热烈更值得看。", highlight: "看行动，也说需要" },
    { eyebrow: "时间与金钱", title: "看得懂的安排，才更容易坚持", value: "适合可复盘、可持续的节奏", note: `涉及时间、钱和精力时，先留出${weakestLabel}对应的余地。比起跟着短期热度走，你更适合知道投入最后会留下什么。`, highlight: "先算长期成本" },
  ];

  const shareInsights: ShareInsightData[] = [
    { id: "poster", eyebrow: "关于我", title: narrative.hook, body: narrative.scene, footer: `${dayLabel}日主 · ${strongestLabel}较突出`, tone: "ink" },
    { id: "zones", eyebrow: "让我自在 / 让我疲惫", title: `能${style.strength}时，你会越来越稳`, body: `如果长期面对${style.pressure}，你会需要更多独处和确定感，才能慢慢恢复。`, footer: "先看环境，再决定投入", tone: "warm" },
    { id: "today", eyebrow: "今天可以怎么做", title: narrative.action, body: "不需要一次改变全部。只做第一步，也算把事情重新交回自己手里。", footer: "给今天的一句提醒", tone: "sage" },
    { id: "signature", eyebrow: "这张盘最像你的地方", title: narrative.misunderstanding, body: `从${dayLabel}日主和${strongestLabel}较突出的表现看，你更重视一件事是否值得、是否有落点。`, footer: "让命理，被科学看见", tone: "coral" },
  ];

  const todayAction = {
    title: shareInsights[2].title,
    note: shareInsights[2].body,
  };

  const readings: InsightCardData[] = [
    reading("day-master", "你通常怎么做决定", narrative.hook, `日主是${dayLabel}，常用来观察你处理外界事情时最熟悉的方式。`, `${narrative.scene}这会在工作选择、关系判断和日常安排中反复出现，但不代表你只能这样做。`),
    reading("month-pillar", "你进入环境后的适应方式", `月柱为${chart.pillars.month}，你会先辨认环境的主要规则`, "月柱用于观察成长环境和进入群体后的适应节奏。", `你的月柱十神是${chart.tenGods.month}。进入新环境时，先确认关键人物、反馈方式和责任边界，会比立刻证明自己更省力。`),
    reading("career", "什么样的工作让你越做越有底气", `${style.strength}会让你慢慢进入状态`, "这里看的是工作偏好，不限定具体职业。", `命盘以${strongestLabel}为重心，适合把${elementMeaning[strongest]}变成可以积累的能力。真正要看的，不是职位名字，而是这份工作能不能让你的能力留下来。`),
    reading("relationship", "在关系里，你真正想确认什么", style.relationship, "关系倾向描述互动习惯，不代表固定结局。", "你更需要的是不用反复猜测的关系。把感受和请求说清楚，再看对方是否持续回应，会比只盯着一时的热烈更有帮助。"),
    reading(
      "annual",
      "最近更适合主动，还是先稳住",
      !profile.birthTimeKnown ? "补充出生时辰后，再看完整阶段节奏" : currentAnnual ? `${currentYear} 为${currentAnnual.ganZhi}流年，先守住主线再选择主动点` : "先守住主线，再选择一个值得主动的方向",
      "流年用于观察阶段节奏，不能替代现实信息。",
      !profile.birthTimeKnown ? "当前只保留不依赖时柱的观察，不用中午或随机时辰补出大运结论。" : `当前大运${currentLuck?.ganZhi || "尚待确认"}，流年${currentAnnual?.ganZhi || "尚待确认"}。重要决定仍需结合现实数据和专业意见。`,
    ),
  ];

  return {
    identity,
    elements,
    lightConclusions,
    tenGods,
    luckTrend: buildLuckTrend(chart.luckCycles || [], dayElement),
    pillars: buildPillars(chart),
    flowColumns: [
      { label: "本命", value: chart.pillars.day, note: `${dayLabel}日主` },
      { label: "大运", value: currentLuck?.ganZhi || (profile.birthTimeKnown ? "待确认" : "待补时辰"), note: currentLuck ? `${currentLuck.startAge}–${currentLuck.endAge} 岁` : "阶段资料" },
      { label: "流年", value: currentAnnual?.ganZhi || (profile.birthTimeKnown ? "待确认" : "仅看当年干支"), note: String(currentYear) },
      { label: "流月", value: currentMonth, note: `${new Date().getMonth() + 1} 月` },
    ],
    todayAction,
    shareInsights,
    readings,
    calculation: {
      scope: chart.engine?.calculationScope || (profile.birthTimeKnown ? "four-pillar" : "three-pillar"),
      birthTimeKnown: profile.birthTimeKnown,
      balanceMethod: chart.engine?.balanceMethod || "visible-stems-branches",
      engine: chart.engine?.primary || "lunar-javascript",
      warnings: chart.engine?.uncertainties || [],
    },
    evidence: {
      pillars: chart.pillars,
      dayMaster: chart.dayMaster,
      visibleElementBalance: chart.wuxing.balance,
      strongest: chart.wuxing.strongest,
      weakest: chart.wuxing.weakest,
      tenGods: chart.tenGods,
    },
  };
}

function reading(id: string, title: string, highlight: string, term: string, summary: string): InsightCardData {
  return { id, title, highlight, term, summary, detail: `${summary} 需要把它放回你当前的生活阶段、环境条件和真实关系里理解。` };
}

function buildTenGods(chart: ReturnType<typeof buildBaziChart>) {
  const names = [...Object.values(chart.tenGods), ...Object.values(chart.hiddenTenGods || {}).flat()].filter((name) => Boolean(name) && name !== "待补");
  const counts = new Map<string, number>();
  names.forEach((name) => counts.set(name, (counts.get(name) || 0) + 1));
  const total = names.length || 1;
  return [...counts.entries()]
    .map(([name, count], index) => ({ name, value: Math.round((count / total) * 100), note: tenGodNotes[name] || "你处理人和事时可能反复使用的方式", color: ["#A66A5B", "#748A75", "#9B855F", "#5F8392", "#B57464", "#8A755B"][index % 6] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

function buildLuckTrend(cycles: NonNullable<ReturnType<typeof buildBaziChart>["luckCycles"]>, dayElement: ElementKey) {
  return cycles.slice(0, 5).map((cycle) => {
    const element = stemElement[cycle.ganZhi.slice(0, 1)] || dayElement;
    const relation = element === dayElement ? [78, "同频"] : generates[element] === dayElement ? [72, "支持"] : generates[dayElement] === element ? [65, "输出"] : controls[dayElement] === element ? [58, "管理"] : [50, "压力"];
    return { age: `${cycle.startAge}–${cycle.endAge}`, value: relation[0] as number, keyword: relation[1] as string };
  });
}

function buildPillars(chart: ReturnType<typeof buildBaziChart>) {
  const relationCell = (position: ChartPosition) => chart.relations?.filter((item) => item.positions.includes(position)).map((item) => `${item.type}${item.branches}`).join("、") || "—";
  return {
    headers: ["项目", "年柱", "月柱", "日柱", "时柱"],
    rows: [
      ["天干", ...positions.map((position) => chart.stems[position] || "待补")],
      ["地支", ...positions.map((position) => chart.branches[position] || "待补")],
      ["藏干", ...positions.map((position) => chart.hiddenStems?.[position]?.join("·") || (position === "time" && chart.engine?.birthTimeKnown === false ? "待补" : "—"))],
      ["十神", ...positions.map((position) => chart.tenGods[position])],
      ["纳音", ...positions.map((position) => chart.nayin[position])],
      ["地支关系", ...positions.map(relationCell)],
      ["五行状态", ...positions.map((position) => chart.wuxing[position])],
      ["神煞", "—", "—", "—", "—"],
    ],
  };
}
