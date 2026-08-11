import type { ElementKey } from "../lib/types";

export type DailyCopyKey = "same" | "support" | "output" | "manage" | "pressure";

export const mobileCopy = {
  home: {
    heroEyebrow: "今日观察",
    heroLabel: "今天，先看这一件",
    heroAction: "看看今天怎么走",
    focusEyebrow: "今天可以怎么做",
    focusTitle: "把它落到生活里",
    suitable: "适合",
    avoid: "先放一放",
    questionsTitle: "有件事想不明白？",
    questionsMore: "再看看别的问题",
    customQuestion: "把心里的事直接说出来",
  },
  bazi: {
    coverEyebrow: "关于你",
    coverMeta: "生活里的高频表现",
    misunderstood: "别人可能没看见的部分",
    todayEyebrow: "今天可以怎么做",
    shareEyebrow: "最像你的那句话",
    shareTitle: "先把这一句留给自己",
    structureEyebrow: "为什么会这样",
    elementsEyebrow: "五行分布",
    elementsTitle: "你的力气，通常花在了哪里",
    questionsTitle: "可以问问自己",
  },
  zodiac: {
    coverEyebrow: "太阳 · 月亮 · 上升",
    coverMeta: "你在不同场景里的样子",
    questionsTitle: "关系里，哪件事最让你想不明白？",
    traitsEyebrow: "熟悉以后才会发现",
    traitsTitle: "这些看起来矛盾的样子，其实都是你",
    dailyEyebrow: "今天的小提醒",
    shareEyebrow: "适合分享的我",
    shareTitle: "有些话，替你说出来更容易",
  },
  ziwei: {
    pageEyebrow: "紫微斗数",
    pageTitle: "你最近的力气，都花到哪里去了？",
    pageDescription: "工作、关系和别人的事同时占着注意力时，真正属于自己的计划，反而最容易被往后放。",
    coverEyebrow: "命宫 · 身宫 · 十二宫",
    coverLabel: "这段时间最值得留意的事",
    todayEyebrow: "今天先做这一件",
    overviewEyebrow: "先看重点",
    overviewTitle: "不用一次读完十二宫，先看和你最近最有关的三件事",
    lifeEyebrow: "放回生活里",
    lifeTitle: "最近，哪些地方最需要你分配力气",
    questionsTitle: "现在最想先弄明白哪一件事？",
    shareEyebrow: "把这一刻留下来",
    shareTitle: "生成一张真正像你的紫微卡",
  },
  compatibility: {
    dimensionsEyebrow: "五个相处侧面",
    dimensionsTitle: "先看你们哪里合拍，再看哪里容易误会",
    reportEyebrow: "把关系说具体",
    reportTitle: "从吸引、误解，到下一次可以怎么聊",
    questionsEyebrow: "可以一起想想",
    questionsTitle: "有些问题，说清楚比算一个分数更重要",
  },
  questionSheet: {
    title: "这件事，可以换个角度看",
    eyebrow: "玄枢回应",
    answer: "直接回应",
    observe: "你可以留意",
    action: "现在可以怎么做",
    share: "生成分享卡",
    next: "换一个问题",
    close: "先看到这里",
  },
} as const;

export const dailyCopyByKey: Record<DailyCopyKey, {
  title: string;
  plainInsight: string;
  workNote: string;
  relationshipNote: string;
  oneAction: string;
  shareLine: string;
}> = {
  same: {
    title: "今天的状态不差，别把力气分得太散。",
    plainInsight: "熟悉的节奏正在回来。与其同时顾着很多件事，不如选一件拖了很久的，认真做出一个结果。",
    workNote: "适合收尾、复盘和兑现已经答应的事。",
    relationshipNote: "少替别人猜答案，先听清对方真正说了什么。",
    oneAction: "选一件今天能做完的事，先把它完整收尾。",
    shareLine: "我不是没有方向，只是该把力气收回到一件事上。",
  },
  support: {
    title: "今天不用一个人硬扛，有些帮助可以接住。",
    plainInsight: "别人给出的信息、建议或顺手帮的一把，可能正好补上你卡住的地方。接受帮助，不等于把决定交给别人。",
    workNote: "适合请教、协作，也适合把零散资源重新整理一遍。",
    relationshipNote: "有人愿意靠近时，不必总用“我没事”把话挡回去。",
    oneAction: "把一件卡住的事说具体，向合适的人问一个明确问题。",
    shareLine: "真正的轻松，不是什么都自己扛下来。",
  },
  output: {
    title: "想说的话变多了，先说最重要的那一句。",
    plainInsight: "今天更容易进入表达和行动的状态。真正需要留意的，是别让每个新想法都变成一个没收尾的新开头。",
    workNote: "适合沟通、展示和交付一个看得见的阶段结果。",
    relationshipNote: "别用长篇解释掩盖真正的需要，先把核心那句话说出来。",
    oneAction: "完成一个能被别人看见、也能收到反馈的小结果。",
    shareLine: "我不是话太多，只是终于想把真正重要的事说清楚。",
  },
  manage: {
    title: "今天更重要的是取舍，不是继续加码。",
    plainInsight: "新的机会未必不好，只是时间、钱和注意力都有限。先决定什么值得留下，心里会比继续比较更清楚。",
    workNote: "适合谈清责任、排期和投入上限。",
    relationshipNote: "不要因为舍不得一段投入，就忽略它是否还有真实回应。",
    oneAction: "从待办里划掉一件低回报的事，把时间还给真正重要的部分。",
    shareLine: "有些选择不是要不要，而是还值不值得继续投入。",
  },
  pressure: {
    title: "别急着证明自己，先把手上的事减到能呼吸。",
    plainInsight: "外部要求一多，你很容易下意识地全部接住。真正让人累的，往往不是任务本身，而是没有给自己留下确认和恢复的时间。",
    workNote: "适合守住底线、减少并行，不适合仓促承诺。",
    relationshipNote: "情绪紧的时候先别下结论，也别把沉默自动理解成拒绝。",
    oneAction: "推迟一件不必今天答复的事，留半小时只处理最关键的问题。",
    shareLine: "我不是做不到，只是不想再用硬撑证明自己。",
  },
};

export const baziNarrativeByElement: Record<ElementKey, {
  hook: string;
  scene: string;
  misunderstanding: string;
  action: string;
  tags: [string, string, string];
}> = {
  wood: {
    hook: "只要还看得见成长，你就愿意多走一段。",
    scene: "你真正怕的不是辛苦，而是努力很久，却不知道这条路还能不能把自己带到更远的地方。工作里有学习空间、关系里能一起进步时，你通常很有耐心。",
    misunderstanding: "别人有时觉得你总想换方向，其实你只是在确认，这件事还值不值得继续投入。",
    action: "找一件停滞的事，只补上那个能让它继续往前的关键信息。",
    tags: ["需要成长", "重视方向", "愿意长期投入"],
  },
  fire: {
    hook: "事情有回应时，你的状态会很快亮起来。",
    scene: "你愿意主动，也愿意把热情给出去。真正让你泄气的，不是事情难，而是投入迟迟没有回音，连下一步该往哪里走都不知道。",
    misunderstanding: "你在意回应，不是急着被肯定，而是想知道这份认真有没有被接住。",
    action: "今天推进一件能在当天收到反馈的小事。",
    tags: ["需要回应", "行动直接", "热情来得快"],
  },
  earth: {
    hook: "生活越有秩序，你越能把重要的事接稳。",
    scene: "安排清楚、责任明确时，你很能扛事。可一旦计划反复变化，所有人都临时来找你，真正消耗你的不是忙，而是什么都没有着落。",
    misunderstanding: "你看起来谨慎，是因为不愿意随口答应一件最后负责不了的事。",
    action: "今天只重新排好一件最影响你节奏的事。",
    tags: ["重视稳定", "习惯负责", "需要确定感"],
  },
  metal: {
    hook: "标准说清楚以后，你做决定其实很快。",
    scene: "你不怕事情难，怕的是要求一直变、边界说不清。只要彼此知道什么算做好，你反而很能迅速抓住重点，把局面收拢起来。",
    misunderstanding: "别人可能把你的边界感看成挑剔，但你只是希望认真和责任都有明确落点。",
    action: "今天先把一件事的完成标准写成一句话。",
    tags: ["边界清楚", "判断直接", "重视完成"],
  },
  water: {
    hook: "你是那种沉得住的人，看清方向以后，行动反而很稳。",
    scene: "你的判断常常来自很深的感知，不是冲动。旁人可能觉得你慢，其实你是在等一个真正值得的理由；一旦确定，通常很少后悔。",
    misunderstanding: "沉默不代表没有想法，你只是在把零散的信息拼成一个完整判断。",
    action: "给一个重要决定补齐最缺的那条信息，然后停下来听听自己的第一反应。",
    tags: ["深层感知", "先观察", "确定后很稳"],
  },
};
