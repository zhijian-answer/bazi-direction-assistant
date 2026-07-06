import { Solar } from "lunar-javascript";
import { buildBaziChart, elementLabels } from "../bazi";
import type { ChartPosition, ElementKey } from "../types";
import { mockBaziReport } from "./mockBaziReport";
import type { ElementDatum, FeatureTileData, InsightCardData, MobileProfile, ShareInsightData } from "./types";

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
  });
  const dayElement = chart.dayMaster.element;
  const style = elementStyle[dayElement];
  const strongest = chart.wuxing.strongest[0] || dayElement;
  const weakest = chart.wuxing.weakest[0] || dayElement;
  const weighted = chart.engine?.weightedBalance;
  const total = Object.values(chart.wuxing.balance).reduce((sum, value) => sum + value, 0) || 1;
  const elements = (Object.keys(chart.wuxing.balance) as ElementKey[]).map((key) => ({
    key,
    label: elementLabels[key],
    value: Math.round(weighted?.[key] ?? (chart.wuxing.balance[key] / total) * 100),
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
    title: `${dayLabel}日出生的你，${style.decision}`,
    subtitle: `你的命盘重心更偏${strongestLabel}，说明${elementMeaning[strongest]}更容易成为主要发力方式；${weakestLabel}相对较少，适合通过环境和习惯补足。`,
    dayMaster: style.decision,
    tags: [style.tag, `${strongestLabel}是主要力量`, `${weakestLabel}需要补充`],
    basis: `依据：${dayLabel}日主 · ${strongestLabel}为结构重心 · ${tenGods[0]?.name || "十神"}更突出`,
    pattern: `你更容易通过${style.strength}建立稳定感`,
    patternEvidence: `从命盘结构看，${strongestLabel}承担了更多力量，${elementMeaning[strongest]}会成为高频倾向；${weakestLabel}较少意味着相关能力更依赖后天环境。`,
    patternScene: `当环境允许你${style.strength}时，更容易持续投入；遇到${style.pressure}时，消耗会明显增加。`,
    patternBoundary: "这里描述的是结构倾向，不是固定命运。现实经验、关系质量和具体选择仍然会改变结果。",
    coverReading: {
      title: style.strength,
      note: `${style.decision}。目标和反馈越清楚，这种力量越容易稳定发挥。`,
    },
    supportElements: [strongestLabel, weakestLabel],
  };

  const lightConclusions: FeatureTileData[] = [
    { eyebrow: "适合方向", title: `把${style.strength}变成长期能力`, value: `${strongestLabel}的力量更容易被调用`, note: `选择能持续积累、反馈明确的环境，更容易让你的${strongestLabel}优势变成结果。`, highlight: "先看能否形成积累" },
    { eyebrow: "关系倾向", title: "先把需要说清楚，再观察回应", value: style.relationship, note: `你的核心方式是“${style.decision}”。关系里不必只靠猜测，把感受、事实和请求分开表达，会更容易看见对方是否愿意持续回应。`, highlight: `${style.tag}，也要看真实行动` },
    { eyebrow: "资源节奏", title: `用${weakestLabel}补足长期稳定性`, value: "适合可复盘、可持续的安排", note: `在涉及时间、金钱和精力时，为${weakestLabel}对应的能力预留空间，能减少只靠单一优势硬撑。`, highlight: "平衡比追涨重要" },
  ];

  const shareInsights: ShareInsightData[] = [
    { id: "poster", eyebrow: "一句话人格结论", title: identity.title, body: identity.subtitle, footer: `${dayLabel}日主 · 结构观察`, tone: "ink" },
    { id: "zones", eyebrow: "我的稳定区 / 消耗区", title: `${style.strength}让你稳定，${style.pressure}让你消耗`, body: `稳定区来自${strongestLabel}的高频支持；消耗区常出现在${weakestLabel}相关条件长期不足时。`, footer: "先识别环境，再决定投入", tone: "warm" },
    { id: "today", eyebrow: "今天更适合怎么做", title: `先完成一件能发挥${strongestLabel}优势的小事`, body: `把最想推进的事缩小到 30 分钟内可以完成的一步，完成后再决定是否加速。`, footer: "今日行动提醒", tone: "sage" },
    { id: "signature", eyebrow: "这张盘最有辨识度的地方", title: `${dayLabel}的核心方式，遇上${strongestLabel}的主要力量`, body: `${style.decision}。真正能让你稳定发挥的，是能持续调用${style.strength}的环境。`, footer: "让命理，被科学看见", tone: "coral" },
  ];

  const todayAction = {
    title: shareInsights[2].title,
    note: shareInsights[2].body,
  };

  const readings: InsightCardData[] = [
    reading("day-master", "你做决定的方式", style.decision, `日主是${dayLabel}，代表你处理外界事情时最常用的方式。`, `${style.decision}。这会在工作选择、关系判断和日常安排中反复出现。这里描述的是高频方式，不代表你只能这样做。`),
    reading("month-pillar", "你进入环境后的适应方式", `月柱为${chart.pillars.month}，你会先辨认环境的主要规则`, "月柱用于观察成长环境和进入群体后的适应节奏。", `你的月柱十神是${chart.tenGods.month}。进入新环境时，先确认关键人物、反馈方式和责任边界，会比立刻证明自己更省力。`),
    reading("career", "什么样的工作更容易让你发挥", `${style.strength}能让复杂事情逐渐变清楚`, "这里看工作偏好，不限定具体职业。", `命盘以${strongestLabel}为重心，适合把${elementMeaning[strongest]}转化为可积累的能力。职业选择仍需结合经验、机会和现实成本。`),
    reading("relationship", "你在关系里最在意什么", style.relationship, "关系倾向描述互动习惯，不代表固定结局。", `你的核心方式是${style.decision}。关系里把感受和请求说清楚，再观察回应是否持续，会比反复猜测更有帮助。`),
    reading("annual", "最近更适合主动，还是先稳住", currentAnnual ? `${currentYear} 为${currentAnnual.ganZhi}流年，先守住主线再选择主动点` : "先守住主线，再选择一个值得主动的方向", "流年用于观察阶段节奏，不能替代现实信息。", `当前大运${currentLuck?.ganZhi || "尚待确认"}，流年${currentAnnual?.ganZhi || "尚待确认"}。重要决定仍需结合现实数据和专业意见。`),
  ];

  return {
    ...mockBaziReport,
    identity,
    elements,
    lightConclusions,
    tenGods,
    luckTrend: buildLuckTrend(chart.luckCycles || [], dayElement),
    pillars: buildPillars(chart),
    flowColumns: [
      { label: "本命", value: chart.pillars.day, note: `${dayLabel}日主` },
      { label: "大运", value: currentLuck?.ganZhi || "待确认", note: currentLuck ? `${currentLuck.startAge}–${currentLuck.endAge} 岁` : "阶段资料" },
      { label: "流年", value: currentAnnual?.ganZhi || "待确认", note: String(currentYear) },
      { label: "流月", value: currentMonth, note: `${new Date().getMonth() + 1} 月` },
    ],
    todayAction,
    shareInsights,
    readings,
  };
}

function reading(id: string, title: string, highlight: string, term: string, summary: string): InsightCardData {
  return { id, title, highlight, term, summary, detail: `${summary} 需要把它放回你当前的生活阶段、环境条件和真实关系里理解。` };
}

function buildTenGods(chart: ReturnType<typeof buildBaziChart>) {
  const names = [...Object.values(chart.tenGods), ...Object.values(chart.hiddenTenGods || {}).flat()].filter(Boolean);
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
      ["天干", ...positions.map((position) => chart.stems[position])],
      ["地支", ...positions.map((position) => chart.branches[position])],
      ["藏干", ...positions.map((position) => chart.hiddenStems?.[position]?.join("·") || "—")],
      ["十神", ...positions.map((position) => chart.tenGods[position])],
      ["纳音", ...positions.map((position) => chart.nayin[position])],
      ["地支关系", ...positions.map(relationCell)],
      ["五行状态", ...positions.map((position) => chart.wuxing[position])],
      ["神煞", "—", "—", "—", "—"],
    ],
  };
}
