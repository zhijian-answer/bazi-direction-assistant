import type { DailyInsightData, MobileProfile } from "./types";

export const dailyInsightCatalog: DailyInsightData[] = [
  {
    id: "clarify",
    keyword: "先理清",
    title: "今天不必急着加速，先把最重要的事说清楚",
    summary: "当目标和边界明确以后，你的执行力会自然回来。今天适合减少来回确认，把注意力放回一件能完成的事。",
    suitable: "确认重点、整理计划、完成收尾",
    avoid: "在信息不全时替别人做决定",
    action: "写下今天唯一必须完成的结果，再开始行动。",
    tags: ["边界清楚", "稳定推进", "减少分心"],
  },
  {
    id: "respond",
    keyword: "先回应",
    title: "今天适合把真实想法说出来，但不用一次说完",
    summary: "你可能比平时更快感受到气氛变化。先给出清楚回应，再补充感受和背景，会比独自猜测更省力。",
    suitable: "沟通需求、确认安排、修复误会",
    avoid: "把短暂沉默理解成最终答案",
    action: "选择一个最在意的问题，用一句直接的话问清楚。",
    tags: ["真实表达", "确认反馈", "保留余地"],
  },
  {
    id: "steady",
    keyword: "稳住主线",
    title: "今天更适合守住已有节奏，再决定要不要接新事情",
    summary: "新的机会可能很有吸引力，但你真正需要的是判断它能否形成长期积累。先完成已有承诺，选择会更清楚。",
    suitable: "复盘进度、处理承诺、筛选机会",
    avoid: "因为怕错过而同时答应太多",
    action: "给新机会列出三个现实条件，满足两个再继续。",
    tags: ["长期积累", "现实判断", "留出精力"],
  },
  {
    id: "recover",
    keyword: "留一点空白",
    title: "今天的恢复，不是停下来，而是减少无意义的切换",
    summary: "反复切换任务会比事情本身更消耗你。给自己一段不被打断的时间，状态会比强迫专注更快回来。",
    suitable: "独立处理、散步、整理信息",
    avoid: "用更多输入掩盖已经出现的疲惫",
    action: "关闭提醒 30 分钟，只处理一件具体的小事。",
    tags: ["减少切换", "恢复节奏", "安静完成"],
  },
  {
    id: "observe",
    keyword: "先观察",
    title: "今天不需要立刻表态，先看清对方真正做了什么",
    summary: "语言可能很热烈，但持续行动更值得参考。把注意力从猜测移到可观察的回应，你会更容易做出稳定判断。",
    suitable: "观察行动、确认事实、延后结论",
    avoid: "只凭一句话决定关系走向",
    action: "记录一个事实和一个感受，暂时不要把两者混在一起。",
    tags: ["看见事实", "降低猜测", "延后判断"],
  },
];

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

export function getDailyInsight(profile: MobileProfile, date = new Date()) {
  const profileId = `${profile.name}|${profile.birthDate}|${profile.birthTime}|${profile.birthPlace}`;
  return dailyInsightCatalog[hash(`${localDateKey(date)}|${profileId}`) % dailyInsightCatalog.length];
}

export function formatDailyDate(date = new Date()) {
  return new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "short" }).format(date);
}
