import type { NarrativeCard, NarrativeRequest } from "./contracts";
import { inspectNarrativeCard, normalizeNarrativeCard } from "./quality";

type LocalCopy = Pick<NarrativeCard, "hook" | "scene" | "misunderstanding" | "action">;

const baziElementCopy: Record<string, LocalCopy> = {
  wood: {
    hook: "只要还能往前长，你就愿意多走一段",
    scene: "工作里看得见学习空间、关系里能一起进步时，你通常很有耐心；真正让你泄气的，是长期停在原地。",
    misunderstanding: "别人有时觉得你总想换方向，其实你在确认这条路还有没有继续投入的价值。",
    action: "今天找一件停滞的事，只补一个能让它继续往前的信息。",
  },
  fire: {
    hook: "事情有回应时，你的状态会很快被点亮",
    scene: "目标清楚、结果有人接住时，你推进得很快；只有投入却迟迟没有反馈，才是最容易消耗你的部分。",
    misunderstanding: "你在意回应，不等于急着被肯定；你只是需要知道这份投入有没有落点。",
    action: "今天先推进一件能在当天得到反馈的小事。",
  },
  earth: {
    hook: "生活越有秩序，你越能把重要的事接稳",
    scene: "安排清楚、责任稳定时，你很能扛事；计划反复变化、所有人都临时找你时，耐心会被一点点磨掉。",
    misunderstanding: "你看起来谨慎，是因为不愿意轻易答应一件最后无法负责到底的事。",
    action: "今天只重新排好一件最影响节奏的事。",
  },
  metal: {
    hook: "标准说清楚以后，你做决定其实很快",
    scene: "你不怕事情难，怕的是要求一直变、边界说不清。完成标准明确时，你反而是最能快速收拢局面的人。",
    misunderstanding: "别人可能把你的边界感看成挑剔，但你只是希望彼此都知道什么算做好。",
    action: "今天先把一件事的完成标准写成一句话。",
  },
  water: {
    hook: "信息还没看全时，你通常不会急着下结论",
    scene: "你习惯先观察人和局面，再决定怎么投入。连续被催着表态，往往比事情本身更让你疲惫。",
    misunderstanding: "沉默不代表没有想法，你通常是在把零散信息拼成一个更完整的判断。",
    action: "今天给一个重要决定补齐最缺的那条信息。",
  },
};

const zodiacSunCopy: Record<string, LocalCopy> = {
  aries: { hook: "你愿意先迈出那一步，但不喜欢一直等回应", scene: "有明确目标时，你通常边做边调整；真正让你烦躁的，是话说了一半、事情迟迟没有下一步。", misunderstanding: "反应快不代表没有分寸，你只是更愿意用行动确认答案。", action: "今天挑一件想了很久的事，先完成最小的一步。" },
  taurus: { hook: "你给人的稳定感，来自心里那套明确的取舍", scene: "你愿意为真正认定的人和事花时间，但频繁变动、临时改口，会比工作量本身更消耗你。", misunderstanding: "慢一点通常不是拖延，而是你不愿意轻易改变已经确认的东西。", action: "今天守住一个最重要的安排，不为临时热闹让路。" },
  gemini: { hook: "你真正离不开的，是一直有新东西可以交换", scene: "有趣的对话、新鲜的信息和快速反馈会让你马上进入状态；长时间没有交流，才容易让注意力散掉。", misunderstanding: "变化快不等于不认真，你会在交流里不断修正自己的判断。", action: "今天把一个还没想透的问题，拿去和靠谱的人聊十分钟。" },
  cancer: { hook: "你会先记住一个人的感受，再决定靠近多少", scene: "关系里的语气、停顿和细小变化，你常常比别人更早察觉；真正累的是看见了，却一直装作没发生。", misunderstanding: "敏感不是脆弱，它让你比别人更早发现关系里的温度变化。", action: "今天把一个含糊的感受说具体，不替对方先下结论。" },
  leo: { hook: "你愿意把热情给出去，也希望它被认真接住", scene: "被信任、被托付时，你很愿意站出来承担；如果投入长期无人回应，你也会悄悄收回热情。", misunderstanding: "想被看见不等于爱表现，你在意的是投入有没有被尊重。", action: "今天把精力给一件真正有人接住的事。" },
  virgo: { hook: "你总能先看见哪里还可以再好一点", scene: "别人觉得已经差不多时，你还会顺手补齐遗漏；真正辛苦的是把所有责任都默默算到自己头上。", misunderstanding: "挑细节不一定是否定，你常常只是想让事情少留一点遗憾。", action: "今天只修正最影响结果的一处，其余允许先到八十分。" },
  libra: { hook: "你很会顾及彼此，但不想永远替所有人圆场", scene: "你能同时看见不同人的立场，也习惯把场面照顾得舒服；可当自己的需要一直被放到最后，疲惫会慢慢累积。", misunderstanding: "犹豫通常来自同时看见了多方需要，而不是没有自己的答案。", action: "今天做一个选择时，先写下你自己的第一答案。" },
  scorpio: { hook: "你不会轻易交出信任，一旦确认就很认真", scene: "你更看重话背后的真实动机，也会记住关系里前后是否一致；含糊和试探，比直接拒绝更让你不安。", misunderstanding: "保留不代表冷淡，你在观察对方是否经得住更深的靠近。", action: "今天把一个反复猜测的问题，换成一次直接确认。" },
  sagittarius: { hook: "能让你留下来的，从来不是束缚而是共同方向", scene: "看到新的可能、可以自主安排节奏时，你会很有动力；只有规则却讲不清意义的事情，很难让你长期投入。", misunderstanding: "需要自由不等于逃避承诺，你更在意承诺有没有真实空间。", action: "今天为正在做的事补一句：它最终想带我去哪里。" },
  capricorn: { hook: "你习惯先把事情做好，再慢慢说自己的感受", scene: "面对重要目标，你会自然进入负责和规划的状态；但长期只顾结果、不确认自己的消耗，也容易让你突然想停下来。", misunderstanding: "克制不等于没有需要，你只是更相信持续行动。", action: "今天完成主线以后，给自己留一段不需要证明效率的时间。" },
  aquarius: { hook: "你需要自己的判断，也珍惜真正能聊到一起的人", scene: "能交换不同观点、彼此保留空间时，你会很投入；被要求按固定方式回应，反而容易先退开一步。", misunderstanding: "偶尔抽离不是不在意，你需要一点距离看清关系。", action: "今天向一个值得交流的人，说出你真正不同意的地方。" },
  pisces: { hook: "你很容易接住别人的情绪，也需要有人接住你", scene: "你常能感受到别人没说出口的部分，也愿意顺手照顾气氛；如果一直分不清哪些感受属于自己，就容易莫名疲惫。", misunderstanding: "共情不是没有边界，真正舒服的关系会给你恢复空间。", action: "今天遇到强烈情绪时，先问一句：这真的是我的感受吗？" },
};

const ziweiStarCopy: Record<string, LocalCopy> = {
  紫微: { hook: "你更习惯先看清全局，再决定自己怎么投入", scene: "事情牵涉的人越多、影响越长远，你越会先确认责任和方向；真正让你难受的，是被推着表态却没有足够信息。", misunderstanding: "这不是控制欲强，而是你希望重要决定经得起后续变化。", action: "今天先明确一件重要事情由谁负责、做到什么程度。" },
  天机: { hook: "新信息一出现，你的判断也会跟着更新", scene: "你很会从细节里发现变化，也容易同时想到几种可能；当信息不断涌进来，却没有停下来整理时，脑子会一直转。", misunderstanding: "改变想法不代表摇摆，你是在用新线索修正判断。", action: "今天给一个复杂问题设定停止收集信息的时间。" },
  太阳: { hook: "被需要的时候，你往往比自己想象得更有力量", scene: "有人信任你、事情有公共意义时，你很愿意站出来；如果付出长期被当成理所当然，热情也会明显下降。", misunderstanding: "愿意承担不等于你不需要回应，你也在意自己的付出是否被看见。", action: "今天把帮助别人和照顾自己各留出一个位置。" },
  武曲: { hook: "你更相信做出来的结果，而不是说得漂亮", scene: "目标、资源和责任都清楚时，你会很稳地推进；反复讨论却迟迟不落地，最容易消耗你的耐心。", misunderstanding: "务实不等于只看利益，你只是希望投入能留下真实结果。", action: "今天把一个模糊计划换成可交付的下一步。" },
  天同: { hook: "你想要的稳定，不是停着不动，而是心里有余地", scene: "气氛友好、节奏不被逼迫时，你更容易发挥温和和创造力；持续冲突会让你先保护自己的感受。", misunderstanding: "回避争执不代表没有立场，你需要更安全的方式表达。", action: "今天用一句不带指责的话，说清楚一个真实需要。" },
  廉贞: { hook: "关系越重要，你越在意边界是否真的被尊重", scene: "你可以接受分歧，却很难接受规则对不同的人不一样；含糊的承诺和反复试探，会迅速消耗信任。", misunderstanding: "要求清楚不等于苛刻，你只是不愿靠猜测维持关系。", action: "今天把一个默认约定，改成双方都听得懂的话。" },
  天府: { hook: "你擅长把事情接稳，也会默默计算长期成本", scene: "资源够不够、安排能否持续，你往往会比别人多想一步；真正累的是所有人都依赖你，却没人一起分担。", misunderstanding: "谨慎不等于缺少冒险心，你只是希望行动有后手。", action: "今天从一件长期责任里，明确分出去一个部分。" },
  太阴: { hook: "很多决定，你会先在心里反复确认才说出口", scene: "安静、熟悉、有安全感的环境更容易让你恢复；被催着马上回应时，你常常来不及分清真实需要。", misunderstanding: "慢一点不是没有答案，而是你需要先听见自己的感受。", action: "今天为一个重要答复争取一点独处时间。" },
  贪狼: { hook: "你很容易被有趣的人和新的可能点亮", scene: "有变化、有交流、有发挥空间时，你会迅速打开状态；选择太多又都舍不得放下，反而容易分散力量。", misunderstanding: "兴趣广不等于不专注，你需要的是一个值得持续投入的主线。", action: "今天从最想做的三件事里，只保留一件继续推进。" },
  巨门: { hook: "你会在一句话背后，多听见一层没有说出的意思", scene: "你擅长发现矛盾和漏洞，也容易在信息不完整时反复推敲；越重要的关系，越需要把猜测变成确认。", misunderstanding: "追问不等于挑刺，你只是希望事情经得起解释。", action: "今天把一个心里的推测，改成一个可以直接问的问题。" },
  天相: { hook: "你很会照顾局面，也在意彼此是否公平", scene: "多人协作时，你常能找到让大家都能继续的方法；可如果长期只负责协调，自己的需要很容易被藏起来。", misunderstanding: "顾全大局不等于没有偏好，你也需要被纳入安排。", action: "今天协调一件事前，先说清楚自己的底线。" },
  天梁: { hook: "遇到真正重要的事，你会自然站到负责的位置", scene: "别人需要建议或兜底时，你往往愿意多做一步；长期成为所有人的解决方案，也会让你没有恢复空间。", misunderstanding: "爱提醒不等于居高临下，你常常只是先看见风险。", action: "今天只帮助一件你确实有余力承担的事。" },
  七杀: { hook: "局面越需要快速推进，你越容易显出决断力", scene: "目标明确、责任集中时，你能迅速切掉多余选项；长期处在高压和对抗里，也会让身体一直绷着。", misunderstanding: "果断不等于不顾感受，你只是不想让问题无限拖延。", action: "今天推进一件关键事，也给自己设一个明确的停止时间。" },
  破军: { hook: "当旧方法已经失效，你通常比别人更敢重新开始", scene: "变化真正发生时，你反而能迅速找到新的落点；最难受的是明知不合适，却还要维持表面稳定。", misunderstanding: "想改变不等于否定过去，你只是不愿继续消耗在失效的方法上。", action: "今天停止一个已经证明无效的小习惯。" },
};

function signalValue(input: NarrativeRequest, name: string) {
  const prefix = `${name}:`;
  return input.signals.find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

function approvedFallback(input: NarrativeRequest) {
  const normalized = normalizeNarrativeCard(input.fallback);
  return inspectNarrativeCard(normalized).length ? {
    ...normalized,
    hook: "先看清自己在哪些时刻最容易进入状态",
    scene: "把结论放回最近真实发生的事情里，更容易判断哪些部分值得保留，哪些地方需要重新安排。",
    misunderstanding: "一条命理结论只能提供观察角度，不能替代你的经历和选择。",
    action: "今天只选一个最有感觉的场景，记录当时发生了什么。",
    nextQuestion: "这种表现最近最常出现在哪里？",
  } : normalized;
}

export function buildLocalNarrative(input: NarrativeRequest): NarrativeCard {
  const fallback = approvedFallback(input);

  if (input.context === "bazi") {
    const copy = baziElementCopy[signalValue(input, "dominant") || ""];
    if (copy) return normalizeNarrativeCard({ ...fallback, ...copy });
  }

  if (input.context === "zodiac") {
    const copy = zodiacSunCopy[signalValue(input, "sun") || ""];
    if (copy) return normalizeNarrativeCard({ ...fallback, ...copy });
  }

  if (input.context === "ziwei") {
    const star = input.signals.find((item) => item.startsWith("star:"))?.slice("star:".length) || "";
    const copy = ziweiStarCopy[star];
    if (copy) return normalizeNarrativeCard({ ...fallback, ...copy });
  }

  return fallback;
}
