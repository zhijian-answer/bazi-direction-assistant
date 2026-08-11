import { Lunar } from "lunar-javascript";
import type { MobileProfile, QuestionInsightData, ShareInsightData } from "./types";
import { chinaTimezoneAnchor, circularZodiacEngine, resolveBirthPlace } from "../zodiac";
import { bodyLabels, signName, signProfiles } from "../zodiac/contentCatalog";
import type { BirthPlaceCoordinates } from "../zodiac/birthPlaceCatalog";
import type { ZodiacBodyKey, ZodiacChart, ZodiacPlacement, ZodiacSignKey } from "../zodiac/types";

const peakColors = ["#718FD2", "#DF7B8F", "#65AE9B", "#D5A66B"];
const bodyOrder: ZodiacBodyKey[] = ["sun", "moon", "mercury", "venus", "mars"];

function splitDate(value: string) {
  const [year, month, date] = value.split("-").map(Number);
  if (!year || !month || !date) throw new Error("出生日期不完整");
  return { year, month, date };
}

function splitTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return { hour: Number.isFinite(hour) ? hour : 12, minute: Number.isFinite(minute) ? minute : 0 };
}

function toSolarParts(profile: MobileProfile) {
  const { year, month, date } = splitDate(profile.birthDate);
  const { hour, minute } = splitTime(profile.birthTimeKnown ? profile.birthTime : "12:00");
  if (profile.calendarType === "solar") return { year, month, date, hour, minute };
  const solar = Lunar.fromYmdHms(year, profile.isLeapMonth ? -month : month, date, hour, minute, 0).getSolar();
  return {
    year: Number(solar.getYear()),
    month: Number(solar.getMonth()),
    date: Number(solar.getDay()),
    hour,
    minute,
  };
}

function resolveProfileLocation(profile: MobileProfile): BirthPlaceCoordinates | null {
  const catalogLocation = resolveBirthPlace(profile.birthPlace);
  if (catalogLocation) return catalogLocation;
  if (!Number.isFinite(profile.latitude) || !Number.isFinite(profile.longitude)) return null;
  return {
    id: "profile-coordinates",
    label: profile.birthPlace || "已保存坐标",
    latitude: Number(profile.latitude),
    longitude: Number(profile.longitude),
    timezone: profile.timezone || "",
    aliases: [],
  };
}

function calculateChart(profile: MobileProfile, hour: number, minute: number, includeAngles: boolean): ZodiacChart {
  const parts = toSolarParts(profile);
  const resolved = resolveProfileLocation(profile);
  const coordinates = resolved ?? chinaTimezoneAnchor;
  return circularZodiacEngine.calculate({
    ...parts,
    hour,
    minute,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    includeAngles,
  });
}

function stablePlacement(start: ZodiacChart, middle: ZodiacChart, end: ZodiacChart, body: ZodiacBodyKey) {
  const signs = new Set([start.placements[body].sign, middle.placements[body].sign, end.placements[body].sign]);
  return signs.size === 1 ? middle.placements[body] : undefined;
}

function getPlacements(profile: MobileProfile) {
  const resolvedLocation = resolveProfileLocation(profile);
  const warnings: string[] = [];
  const uncertainBodies: ZodiacBodyKey[] = [];

  if (profile.birthTimeKnown) {
    const { hour, minute } = splitTime(profile.birthTime);
    const chart = calculateChart(profile, hour, minute, Boolean(resolvedLocation));
    if (!resolvedLocation) warnings.push("出生城市尚未匹配到坐标，上升星座暂不展示；太阳与行星按中国标准时间提供参考。");
    return { chart, placements: chart.placements, uncertainBodies, resolvedLocation, warnings };
  }

  const start = calculateChart(profile, 0, 0, false);
  const middle = calculateChart(profile, 12, 0, false);
  const end = calculateChart(profile, 23, 59, false);
  const placements = {} as Partial<Record<ZodiacBodyKey, ZodiacPlacement>>;
  bodyOrder.forEach((body) => {
    const placement = stablePlacement(start, middle, end, body);
    if (placement) placements[body] = placement;
    else uncertainBodies.push(body);
  });
  warnings.push("出生时辰不确定，只展示在当天范围内保持不变的星体；月亮或行星临近换座时会暂时隐藏。");
  if (!resolvedLocation) warnings.push("出生城市尚未匹配到坐标，上升星座暂不展示。");
  return { chart: middle, placements, uncertainBodies, resolvedLocation, warnings };
}

function average(values: number[]) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));
}

function scoresFor(signs: ZodiacSignKey[], key: keyof (typeof signProfiles)[ZodiacSignKey]["scores"]) {
  return average(signs.map((sign) => signProfiles[sign].scores[key]));
}

function emotionNeed(value: string) {
  return value.replace(/^需要/, "");
}

function roleReading(body: ZodiacBodyKey | "rising", sign: ZodiacSignKey) {
  const profile = signProfiles[sign];
  const title = `${bodyLabels[body]} · ${profile.name}`;
  if (body === "sun") return {
    id: "sun", title, highlight: `你会通过${profile.drive}，确认自己正在向前。`, term: "太阳星座用于观察你主动追求的生活方式与自我认同。", summary: `太阳${profile.name}让你更容易${profile.drive}。在工作和生活里，能发挥${profile.strength}的环境，会明显提升你的投入感。`, detail: `需要留意的是：${profile.friction}。这里描述的是高频倾向，不代表你只能以这一种方式行动。`,
  };
  if (body === "moon") return {
    id: "moon", title, highlight: `你的情绪更需要${emotionNeed(profile.emotion)}。`, term: "月亮星座用于观察情绪需求、安全感与恢复方式。", summary: `月亮${profile.name}意味着你在有压力时更需要${emotionNeed(profile.emotion)}。当这种需要被看见，你会更容易回到稳定状态。`, detail: `你可以尝试${profile.recovery}。情绪需要不是弱点，而是帮助你理解消耗来源的线索。`,
  };
  if (body === "rising") return {
    id: "rising", title, highlight: `别人通常先感受到你的${profile.impression}。`, term: "上升星座用于观察你进入新环境时呈现出的外在方式。", summary: `上升${profile.name}让你在陌生环境里更容易显得${profile.impression}。这是你与环境建立第一轮联系时的习惯。`, detail: `熟悉以后，太阳和月亮的需要会逐渐出现。上升不是面具，而是你适应场景的一种方式。`,
  };
  if (body === "mercury") return {
    id: "mercury", title, highlight: `你更习惯${profile.expression}。`, term: "水星用于观察理解信息、组织语言和交流观点的方式。", summary: `水星${profile.name}让你在表达时倾向于${profile.expression}。用适合自己的节奏组织信息，会比勉强模仿别人更有效。`, detail: `沟通卡住时，可以先把事实、感受和请求分开表达，减少${profile.friction}带来的误解。`,
  };
  if (body === "venus") return {
    id: "venus", title, highlight: `你容易被${profile.attraction}吸引。`, term: "金星用于观察表达喜欢、建立亲密感与价值偏好的方式。", summary: `金星${profile.name}让你更容易欣赏${profile.attraction}。关系里的真实行动，通常比抽象标签更能帮助你判断是否适合。`, detail: "吸引力只说明靠近的起点，能否长期相处仍取决于沟通、边界与现实选择。",
  };
  return {
    id: "mars", title, highlight: `你行动时更接近“${profile.action}”。`, term: "火星用于观察行动方式、耐力以及面对冲突时的反应。", summary: `火星${profile.name}让你的行动方式更偏向${profile.action}。目标越具体，你越容易把这股力量用在真正重要的地方。`, detail: `冲突出现时，留意${profile.friction}。先确认目标，再决定速度，会减少无效消耗。`,
  };
}

export function buildMobileZodiacReport(profile: MobileProfile) {
  const result = getPlacements(profile);
  const placements = result.placements;
  const sun = placements.sun ?? result.chart.placements.sun;
  const moon = placements.moon;
  const mercury = placements.mercury;
  const venus = placements.venus;
  const mars = placements.mars;
  const rising = result.resolvedLocation && profile.birthTimeKnown ? result.chart.ascendant : undefined;
  const sunProfile = signProfiles[sun.sign];
  const moonProfile = moon ? signProfiles[moon.sign] : undefined;
  const risingProfile = rising ? signProfiles[rising.sign] : undefined;
  const mercuryProfile = mercury ? signProfiles[mercury.sign] : sunProfile;
  const venusProfile = venus ? signProfiles[venus.sign] : sunProfile;
  const marsProfile = mars ? signProfiles[mars.sign] : sunProfile;
  const stableSigns = [sun.sign, moon?.sign, rising?.sign].filter(Boolean) as ZodiacSignKey[];
  const tags = [
    `太阳${signName(sun.sign)}`,
    moon ? `月亮${signName(moon.sign)}` : "月亮待确认",
    rising ? `上升${signName(rising.sign)}` : "上升待补充",
  ];

  const identityTitle = rising && moon
    ? `上升${signName(rising.sign)}的你看起来${risingProfile!.impression}，熟悉以后才会发现你其实很${sunProfile.strength}`
    : moon
      ? `你一边靠${sunProfile.strength}往前走，一边也很需要${emotionNeed(moonProfile!.emotion)}`
      : `当生活里还能${sunProfile.drive}，你会更容易找回自己`;

  const identitySubtitle = moon
    ? `你主动面对生活时会${sunProfile.drive}，心里真正累的时候却更需要${emotionNeed(moonProfile!.emotion)}${rising ? `。刚认识你的人，通常先看到你的${risingProfile!.impression}` : ""}。`
    : `目前先能看见你主动面对生活的那一面。补充准确时辰与出生城市后，再看情绪需要和别人眼中的你。`;

  const peaks = [
    { name: "行动力", value: scoresFor([mars?.sign ?? sun.sign, moon?.sign ?? sun.sign], "action"), color: peakColors[0] },
    { name: "好奇心", value: scoresFor([sun.sign, mercury?.sign ?? sun.sign], "curiosity"), color: peakColors[1] },
    { name: "亲和力", value: scoresFor([moon?.sign ?? sun.sign, venus?.sign ?? sun.sign], "affinity"), color: peakColors[2] },
    { name: "稳定感", value: scoresFor([rising?.sign ?? sun.sign, moon?.sign ?? sun.sign], "stability"), color: peakColors[3] },
  ];

  const core = [
    { title: `太阳 · ${signName(sun.sign)}`, value: sunProfile.strength, note: `你靠${sunProfile.drive}保持生命力` },
    ...(moon ? [{ title: `月亮 · ${signName(moon.sign)}`, value: moonProfile!.emotion, note: `压力出现时，${moonProfile!.recovery}` }] : []),
    ...(rising ? [{ title: `上升 · ${signName(rising.sign)}`, value: risingProfile!.impression, note: "别人通常先从这一面认识你" }] : []),
  ];

  const traits = [
    { title: "你给人的第一印象", value: risingProfile?.impression ?? sunProfile.impression, note: risingProfile ? `这是你进入陌生环境时的默认方式。熟悉以后，太阳${sunProfile.name}带来的${sunProfile.strength}会逐渐出现。` : `目前没有足够资料确认上升配置，这一项只保留太阳${sunProfile.name}中相对稳定的外在表现。`, highlight: rising ? `上升${risingProfile!.name}` : "上升待补充" },
    { title: "你真正的情绪节奏", value: moonProfile?.emotion ?? "时辰不足，暂不下结论", note: moonProfile ? `压力出现时，${moonProfile.recovery}，通常比继续压住感受更容易恢复。` : "月亮在出生当天可能发生换座，因此暂不使用中午位置替代。", highlight: moon ? `月亮${moonProfile!.name}` : "月亮待确认" },
    { title: "你在关系里的反应方式", value: marsProfile.action, note: moonProfile ? `关系有压力时，除了处理事情，也要照顾自己对${emotionNeed(moonProfile.emotion)}的需要。` : "关系有压力时，除了处理事情，也要给自己的真实感受留出位置。", highlight: "先看行动，再看回应" },
    { title: "你会被什么样的人吸引", value: venusProfile.attraction, note: `金星${venusProfile.name}更容易被${venusProfile.attraction}吸引。能否长期相处，还要看行动是否一致。`, highlight: `金星${venusProfile.name}` },
    { title: "你擅长的表达风格", value: mercuryProfile.expression, note: `水星${mercuryProfile.name}让你更习惯${mercuryProfile.expression}。在有反馈的环境里，这种优势更容易被看见。`, highlight: `水星${mercuryProfile.name}` },
    { title: "你最容易卡住的点", value: sunProfile.friction, note: `这不是缺点，而是太阳${sunProfile.name}在压力下更容易出现的惯性。${sunProfile.daily}，会比一味逼自己更有效。`, highlight: "看见惯性，再做调整" },
  ];

  const shareInsights: ShareInsightData[] = [
    { id: "social", eyebrow: "今日社交提醒", title: `表达时，先用你擅长的${mercuryProfile.expression}。`, body: `水星${mercuryProfile.name}更习惯${mercuryProfile.expression}。先给对方一个清楚入口，再补充感受和背景，沟通更容易继续。`, footer: `太阳${sunProfile.name} · 水星${mercuryProfile.name}`, tone: "sky" },
    { id: "memory", eyebrow: "最容易被别人记住的特质", title: risingProfile ? `你给人的第一印象是${risingProfile.impression}。` : `你最容易被记住的是${sunProfile.strength}。`, body: risingProfile ? `上升${risingProfile.name}先建立外在印象，太阳${sunProfile.name}则让熟悉后的你展现${sunProfile.strength}。` : `目前没有足够地点与时辰计算上升，因此只保留太阳配置中较稳定的观察。`, footer: risingProfile ? `上升${risingProfile.name} · 太阳${sunProfile.name}` : "上升待补充", tone: "violet" },
    { id: "love", eyebrow: "感情里更需要什么", title: moonProfile ? `既要被${venusProfile.attraction}吸引，也需要${emotionNeed(moonProfile.emotion)}。` : `你会被${venusProfile.attraction}吸引。`, body: "吸引决定靠近，回应、边界与现实行动决定能否长期留下。", footer: `金星${venusProfile.name}${moonProfile ? ` · 月亮${moonProfile.name}` : ""}`, tone: "coral" },
    { id: "week", eyebrow: "本周适合主动还是观察", title: `先做一次符合“${marsProfile.action}”的小行动。`, body: "主动的价值是获得真实反馈，不是保证结果。做完一步，再根据现实回应决定下一步。", footer: `火星${marsProfile.name} · 行动节奏`, tone: "sage" },
  ];

  const readings = [
    roleReading("sun", sun.sign),
    ...(moon ? [roleReading("moon", moon.sign)] : []),
    ...(rising ? [roleReading("rising", rising.sign)] : []),
    ...(venus ? [roleReading("venus", venus.sign)] : []),
    ...(mars ? [roleReading("mars", mars.sign)] : []),
    ...(mercury ? [roleReading("mercury", mercury.sign)] : []),
  ];

  const questions: QuestionInsightData[] = [
    { id: "zodiac-attraction", context: "zodiac", prompt: "为什么我总会被同一类人吸引？", shortLabel: "总被谁吸引", source: `来自金星${venusProfile.name}${risingProfile ? `、上升${risingProfile.name}` : ""}与太阳${sunProfile.name}的组合`, interpretation: `你容易被${venusProfile.attraction}吸引。太阳${sunProfile.name}还会让你在关系里重视${sunProfile.strength}。`, observation: "心动只解释了为什么靠近，稳定回应和现实行动才决定关系能不能继续。", action: "除了聊天时的感觉，也看看对方愿不愿意落实一个小约定。", tone: "coral" },
    { id: "zodiac-fear", context: "zodiac", prompt: "为什么喜欢的人，总让我没有安全感？", shortLabel: "为什么没安全感", source: `来自${moonProfile ? `月亮${moonProfile.name}` : "情绪配置待确认"}${risingProfile ? `与上升${risingProfile.name}` : ""}的组合`, interpretation: moonProfile ? `当关系里缺少${emotionNeed(moonProfile.emotion)}，你会更容易不安，也更想尽快确认对方的态度。` : "出生时辰不足，暂时无法确认月亮位置，因此不对具体情绪需要下结论。", observation: "安全感不是靠一个星座标签保证的，它更需要清楚的沟通和持续的行动。", action: "先确认正在发生的事实，再把你真正需要的回应说出来。", tone: "violet" },
    { id: "zodiac-hot-cold", context: "zodiac", prompt: "我在关系里为什么容易忽冷忽热？", shortLabel: "为何忽冷忽热", source: `来自太阳${sunProfile.name}${moonProfile ? `与月亮${moonProfile.name}` : ""}的节奏差异`, interpretation: moonProfile ? `太阳推动你${sunProfile.drive}，月亮却需要${emotionNeed(moonProfile.emotion)}。两种需要轮流出现时，别人可能觉得你忽近忽远。` : `太阳${sunProfile.name}会让你${sunProfile.drive}；月亮尚待确认，因此这里只解释能看见的部分。`, observation: "退开一点不一定是不在意，也可能是你需要重新整理注意力和情绪。", action: "需要一点距离时先说明原因，也告诉对方什么时候可以继续聊。", tone: "sky" },
    { id: "zodiac-relax", context: "zodiac", prompt: "什么样的人会让我真正放松？", shortLabel: "谁让我放松", source: `来自${moonProfile ? `月亮${moonProfile.name}` : "太阳配置"}${risingProfile ? `与上升${risingProfile.name}` : ""}的恢复方式`, interpretation: moonProfile ? `能尊重你对${emotionNeed(moonProfile.emotion)}的需要，也允许你${moonProfile.recovery}的人，更容易让你放松。` : `能理解你${sunProfile.drive}，同时不过度要求你持续表现的人，更容易让你放松。`, observation: "真正舒服的关系允许表达，也允许短暂安静。", action: "留意谁能尊重你的节奏，而不是只在你有状态时靠近。", tone: "sage" },
    { id: "zodiac-initiative", context: "zodiac", prompt: "感情里我更适合主动，还是被动？", shortLabel: "主动还是被动", source: `来自火星${marsProfile.name}、金星${venusProfile.name}与关系反馈`, interpretation: `你的行动方式更接近${marsProfile.action}，而吸引模式偏向${venusProfile.attraction}。清楚地主动一次，比持续追逐或完全等待更适合观察真实反馈。`, observation: "主动的价值是获得信息，不是保证关系一定发生。", action: "表达一次具体邀请，再根据对方是否回应决定下一步。", tone: "warm" },
  ];

  const whyConfiguration: QuestionInsightData = {
    id: "zodiac-configuration",
    context: "zodiac",
    prompt: "为什么我的外在表现和内在需要不总是一致？",
    shortLabel: "为什么会这样",
    source: `来自太阳${sunProfile.name}${moonProfile ? `、月亮${moonProfile.name}` : ""}${risingProfile ? `与上升${risingProfile.name}` : ""}的组合观察`,
    interpretation: moonProfile ? `太阳让你${sunProfile.drive}，月亮却需要${emotionNeed(moonProfile.emotion)}${risingProfile ? `，上升又让别人先看到你的${risingProfile.impression}` : ""}。它们描述的是不同层面的反应。` : `目前只能确认太阳${sunProfile.name}的主动方向，月亮和上升需要更多出生资料。`,
    observation: "同一个人在不同关系和场景里出现不同状态，并不等于矛盾。",
    action: "先分清此刻是在表达目标、照顾情绪，还是适应环境。",
    tone: "sky",
  };

  return {
    identity: { title: identityTitle, subtitle: identitySubtitle, tags },
    highlight: {
      title: "你身上最有意思的地方",
      statistic: moonProfile ? `一边很${sunProfile.strength}，一边又很需要${emotionNeed(moonProfile.emotion)}` : `你最容易被看见的，是${sunProfile.strength}`,
      note: moonProfile ? `太阳${sunProfile.name}负责${sunProfile.drive}，月亮${moonProfile.name}更需要${emotionNeed(moonProfile.emotion)}${risingProfile ? `，上升${risingProfile.name}让你先显得${risingProfile.impression}` : ""}。` : "补充出生时辰后，才能确认月亮、上升与更完整的关系配置。",
    },
    peaks,
    core,
    traits,
    daily: {
      title: `今天适合${mercuryProfile.daily}`,
      note: `不用一下子把所有想法都说完。先让对方听懂最重要的那一句，再慢慢补充。这个提醒结合了水星${mercuryProfile.name}的表达方式与太阳${sunProfile.name}的行动倾向。`,
      luckyColor: ({ 火: "朱砂红", 土: "黄铜金", 风: "雾蓝", 水: "深海青" } as const)[sunProfile.element],
      suitable: `${sunProfile.strength}、${mercuryProfile.expression}、完成一个小闭环`,
    },
    shareInsights,
    readingReminders: [
      { after: 1, title: moonProfile ? `先照顾对${emotionNeed(moonProfile.emotion)}的需要，再继续处理问题` : "先照顾真实感受，再继续处理问题", note: "星座能帮你看见自己的习惯，但最后的答案，仍然要回到真实生活里确认。" },
      { after: 3, title: `把${marsProfile.action}用在一件具体事情上`, note: "行动有了边界，星体标签才会变成可验证的生活观察。" },
    ],
    readings,
    questions,
    whyConfiguration,
    signs: {
      sun: sun.sign,
      moon: moon?.sign,
      rising: rising?.sign,
      mercury: mercury?.sign,
      venus: venus?.sign,
      mars: mars?.sign,
    },
    completeness: {
      isPartial: result.warnings.length > 0 || result.uncertainBodies.length > 0,
      hasTime: profile.birthTimeKnown,
      hasLocation: Boolean(result.resolvedLocation),
      warning: result.warnings.join(" "),
      uncertainBodies: result.uncertainBodies,
      locationLabel: result.resolvedLocation?.label ?? (profile.birthPlace || "未填写"),
      timezone: result.chart.timezone,
      engine: `${result.chart.engine}@${result.chart.engineVersion}`,
    },
    evidence: {
      solarDate: toSolarParts(profile),
      coordinates: result.resolvedLocation ? { latitude: result.resolvedLocation.latitude, longitude: result.resolvedLocation.longitude } : undefined,
      aspects: result.chart.aspects,
      stableSigns,
    },
  };
}

export type MobileZodiacReport = ReturnType<typeof buildMobileZodiacReport>;
