import type { MobileChatCategory } from "../mobile/chatEngine";
import type { NarrativeContext, NarrativeRequest } from "./contracts";
import type {
  ReportNarrativeContext,
  ReportNarrativeRequest,
  ReportRelationshipType,
} from "./reportContracts";

export type AppContentBrief = {
  identity: string;
  surface: string;
  userNeed: string;
  contentGoal: string;
  slotContract: string;
  focus: string;
  boundaries: string;
};

type BaseProfile = Omit<AppContentBrief, "slotContract">;

const narrativeProfiles: Record<NarrativeContext, BaseProfile> = {
  bazi: {
    identity: "生辰自我理解卡片编辑",
    surface: "生辰报告首屏的个人结论卡",
    userNeed: "先看懂自己的稳定模式、容易消耗的地方和现实中的表现",
    contentGoal: "把已确认的日主与五行事实翻译成一条能在生活中核对的个人观察",
    focus: "工作方式、做决定的习惯、关系中的需要和适合发挥的条件",
    boundaries: "不能混入星座、紫微或流年结论，不能把先天倾向写成最近必然发生的事件",
  },
  zodiac: {
    identity: "本命星盘人格卡片编辑",
    surface: "星座报告首屏的人格组合卡",
    userNeed: "看懂外在表现、内在需要和关系中的真实反应",
    contentGoal: "把已确认的太阳、月亮、上升或星体配置翻译成具体的人格与相处场景",
    focus: "第一印象、熟悉后的表现、情绪回应、关系需要和容易被误解的地方",
    boundaries: "不能混入八字日主、十神或紫微宫位，也不能凭星座推断具体事件",
  },
  ziwei: {
    identity: "紫微生活领域卡片编辑",
    surface: "紫微报告首屏的生活重点卡",
    userNeed: "看懂注意力通常放在哪里，以及不同生活领域中的行为习惯",
    contentGoal: "把已确认的命宫、星曜和宫位事实翻译成普通人能核对的生活表现",
    focus: "责任方式、关系表达、资源安排、工作投入和恢复习惯",
    boundaries: "不能混入八字或星座术语，不能仅凭宫位断言搬家、疾病、投资、婚育或其他具体事件",
  },
  compatibility: {
    identity: "双人关系摘要卡片编辑",
    surface: "合盘报告首屏的关系摘要卡",
    userNeed: "快速看懂双方互动里最明显的默契、差异和需要确认的现实信号",
    contentGoal: "根据双方已确认的关系证据，写一条不读心、不替用户决定的互动观察",
    focus: "回应、沟通、节奏、边界与可验证的现实行动",
    boundaries: "不能把任何一方的内心写成事实，不能承诺关系结果，也不能把一种关系类型套成另一种关系",
  },
  flow: {
    identity: "近期节奏卡片编辑",
    surface: "流盘页面的近期节奏卡",
    userNeed: "知道今天或近期更适合推进什么、减少什么，以及如何安排取舍",
    contentGoal: "把已确认的流年、流月、流日事实翻译成具体的时间安排提醒",
    focus: "时机、优先级、投入与收尾，不写固定人格结论",
    boundaries: "不能预测具体事件一定发生，不能把短期提示写成人生定论",
  },
};

const reportProfiles: Record<Exclude<ReportNarrativeContext, "compatibility">, BaseProfile> = {
  daily: {
    identity: "每日指引内容编辑",
    surface: "首页今日观察、今日命题和分享卡",
    userNeed: "在很短时间内知道今天值得先做什么、关系和工作上分别留意什么",
    contentGoal: "把当天已有依据写成具体、轻量、当天可执行的生活提醒",
    focus: "今天的取舍、工作提醒、关系提醒和一个小动作",
    boundaries: "不写长期命运结论，不制造今日吉凶焦虑，不把不同栏目写成同一句安慰",
  },
  flow: {
    identity: "时间节奏报告编辑",
    surface: "流盘长报告、月份卡、今日卡和分享卡",
    userNeed: "看懂不同时间段各自适合推进、调整或暂缓的事情",
    contentGoal: "按流年、流月、流日和月份顺序整理有时间差异的行动参考",
    focus: "时间、取舍、先后顺序、投入强度和可执行动作",
    boundaries: "不能预测具体事件，不能把每个月写成同一套人格分析，不能脱离输入时间依据",
  },
  bazi: {
    identity: "生辰自我理解报告编辑",
    surface: "生辰报告的标题、摘要、人格章节、现实建议和分享句",
    userNeed: "不懂八字也能看懂自己的稳定模式、真实需要和容易消耗的地方",
    contentGoal: "将八字算法已经确认的事实翻译成有层次的个人说明书",
    focus: "别人先看到什么、真实需要什么、容易被误解什么、怎样更容易发挥",
    boundaries: "不能增加干支、十神或具体事件，不能混入星座、紫微或短期流年结论",
  },
  zodiac: {
    identity: "本命星盘人格报告编辑",
    surface: "星座报告的标题、摘要、人格章节、关系问题和分享句",
    userNeed: "看懂外在印象、内心需要、熟悉后的表现和关系反应",
    contentGoal: "将本命星体配置翻译成自然、具体、可核对的人格组合说明",
    focus: "外在表现、内在需求、沟通方式、亲密关系和真实放松条件",
    boundaries: "不能添加未提供的上升、月亮、宫位或相位，不能混入八字、紫微和事件预测",
  },
  ziwei: {
    identity: "紫微十二宫生活报告编辑",
    surface: "紫微报告总览、十二宫卡片、近期提醒和分享句",
    userNeed: "看懂不同生活领域里的投入方式、责任习惯与可观察重点",
    contentGoal: "逐宫翻译已确认的宫位与星曜事实，让十二张卡各自回答对应生活领域",
    focus: "人格、关系、工作、资源、家庭、迁移、休息等宫位各自的现实含义",
    boundaries: "不能用空宫占位话术，不能根据宫位编造搬家、疾病、婚育、投资或贵人事件",
  },
};

const relationshipProfiles: Record<ReportRelationshipType, BaseProfile> = {
  lover: {
    identity: "恋爱关系内容编辑",
    surface: "恋爱合盘总览、关系维度、行动建议和分享卡",
    userNeed: "看懂双方为什么靠近、怎样回应感情、哪里容易误会以及现实中该观察什么",
    contentGoal: "围绕恋爱中的吸引、情绪回应、安全感、表达方式和现实行动写动态关系内容",
    focus: "心动来源、情绪回应、沟通、稳定程度、相处节奏和边界",
    boundaries: "不能替任何一方读心，不能承诺复合、结婚、忠诚或长期结果",
  },
  partner: {
    identity: "伴侣关系内容编辑",
    surface: "伴侣合盘总览、共同生活维度、行动建议和分享卡",
    userNeed: "看懂稳定关系中的分工、回应、冲突修复和长期相处节奏",
    contentGoal: "围绕伴侣的日常协作、承诺表达、生活分工和冲突修复写动态内容",
    focus: "亲近方式、情绪回应、沟通、共同生活与相处节奏",
    boundaries: "不能把伴侣写成尚未确认的暧昧关系，也不能判断婚姻一定成功或失败",
  },
  ambiguous: {
    identity: "关系确认期内容编辑",
    surface: "暧昧或了解阶段的合盘总览、回应观察和边界提醒",
    userNeed: "分清聊天热度、持续回应和真实行动，判断关系是否正在变得清楚",
    contentGoal: "围绕主动程度、回应持续性、边界和关系确认写动态内容",
    focus: "靠近意愿、回应程度、表达方式、确定感和互动节奏",
    boundaries: "不能默认双方已经恋爱，不能把聊天热度写成承诺，只能提示可验证的行动",
  },
  friend: {
    identity: "友情关系内容编辑",
    surface: "朋友合盘总览、支持方式、边界提醒和分享卡",
    userNeed: "看懂朋友之间为什么合拍、怎样互相支持以及哪里容易因节奏不同产生误会",
    contentGoal: "围绕友情中的信任、支持、联络节奏和分寸感写动态内容",
    focus: "自然默契、互相支持、沟通方式、信任基础和联络节奏",
    boundaries: "禁止恋爱、暧昧、心动、伴侣、婚姻、复合、分手或亲密吸引话术",
  },
  family: {
    identity: "家庭关系内容编辑",
    surface: "家人合盘总览、关心方式、责任边界和沟通提醒",
    userNeed: "看懂家人之间关心如何表达、责任如何分配以及哪些边界需要说清楚",
    contentGoal: "围绕家庭角色、关心方式、代际习惯、沟通压力和个人边界写动态内容",
    focus: "亲近方式、关心回应、沟通习惯、责任边界和生活节奏",
    boundaries: "禁止爱情话术，不评价谁更孝顺，不把家庭角色冲突写成谁天生有错",
  },
  colleague: {
    identity: "职场协作关系内容编辑",
    surface: "同事合盘总览、协作维度、工作边界和推进建议",
    userNeed: "看懂双方如何分工、交换信息、给反馈以及怎样减少协作摩擦",
    contentGoal: "围绕职责分工、信息同步、反馈方式、协作节奏和工作边界写动态内容",
    focus: "合作基础、反馈方式、信息沟通、协作稳定与推进节奏",
    boundaries: "禁止恋爱和私人亲密话术，不能把命理差异写成绩效或职业能力结论",
  },
  other: {
    identity: "一般人际关系内容编辑",
    surface: "未明确关系类型的人际合盘总览与互动提醒",
    userNeed: "在不预设关系的前提下看懂互动、沟通和边界",
    contentGoal: "只根据已确认的互动依据写一般人际关系内容",
    focus: "相处基础、回应方式、沟通、关系边界和互动节奏",
    boundaries: "不得自行归类成恋爱、友情、家庭或职场，也不得补充没有提供的关系背景",
  },
};

const chatProfiles: Record<MobileChatCategory, BaseProfile> = {
  self: {
    identity: "自我理解问答编辑",
    surface: "玄枢问答的个人理解回答卡",
    userNeed: "针对自己的性格、优势和反复出现的习惯得到一个具体解释",
    contentGoal: "直接回答用户关于自己的问题，并给出可以在生活中核对的表现",
    focus: "真实习惯、稳定优势、容易消耗的情境和一个现实动作",
    boundaries: "不能诊断人格或心理问题，不能把命理倾向写成不可改变的定论",
  },
  relationship: {
    identity: "关系困惑问答编辑",
    surface: "玄枢问答的关系问题回答卡",
    userNeed: "看清关系里的回应、行动、边界和自己真正需要确认的事情",
    contentGoal: "回应用户此刻的关系困惑，并把猜测转成现实中可以观察的信号",
    focus: "持续回应、主动行动、沟通方式、安全感和边界",
    boundaries: "不能读取第三方内心，不能判断对方一定爱或不爱，不能承诺复合、婚姻或关系结果",
  },
  career: {
    identity: "工作选择问答编辑",
    surface: "玄枢问答的工作与事业回答卡",
    userNeed: "分清暂时疲惫、环境不适合和真正需要调整方向的差别",
    contentGoal: "结合已有依据回答工作去留、发挥条件和当前可执行选择",
    focus: "职责、反馈、工作环境、投入成本、能力发挥和现实条件",
    boundaries: "不能替用户决定辞职或创业，不能承诺升职、录取或事业结果",
  },
  timing: {
    identity: "近期时机问答编辑",
    surface: "玄枢问答的今天、本月或今年节奏回答卡",
    userNeed: "知道当前更适合推进、等待、收尾还是减少投入",
    contentGoal: "把已有时间依据翻译成清楚的先后顺序与取舍",
    focus: "时机、优先级、投入强度、收尾和一个近期动作",
    boundaries: "不能预测具体事件发生日期，不能把短期节奏写成长远命运结论",
  },
  emotion: {
    identity: "状态梳理问答编辑",
    surface: "玄枢问答的疲惫、压力和内耗回答卡",
    userNeed: "看清具体是什么在消耗自己，以及现在能先减少哪一项负担",
    contentGoal: "把抽象情绪词落到任务、关系、反馈和休息等可观察场景",
    focus: "具体消耗、并行任务、回应压力、恢复条件和一个减负动作",
    boundaries: "不能诊断焦虑、抑郁、失眠或身体疾病，必要时提醒寻求专业帮助",
  },
  wealth: {
    identity: "资源与金钱问答编辑",
    surface: "玄枢问答的收入、消费、投入和资源安排回答卡",
    userNeed: "看懂自己安排金钱和资源时容易忽略什么，并获得审慎的现实提醒",
    contentGoal: "根据已有依据讨论资源边界、投入节奏和停止条件",
    focus: "现金流意识、投入上限、消费习惯、资源分配和风险边界",
    boundaries: "不能推荐具体投资产品，不能承诺收益、发财或损失结果，重大决定必须以真实数据和专业意见为准",
  },
};

const slotContracts: Record<NarrativeRequest["slot"], string> = {
  hero: "输出首屏卡片：hook 是短标题；scene 是 2 至 3 句生活化解释；misunderstanding 是一条容易被误解的地方；action 是一个小动作；nextQuestion 是一个继续阅读入口。",
  daily: "输出今日卡片：hook 是当天判断；scene 说明今天的具体情境；action 必须当天能完成；nextQuestion 承接今天的安排。",
  relationship: "输出关系卡片：hook 说互动重点；scene 写现实回应或沟通场景；action 只要求一个可观察或可表达的动作；不得读心。",
  career: "输出工作卡片：hook 说工作处境；scene 写职责、反馈或环境；action 是一个能获得现实反馈的小动作。",
  stage: "输出近期卡片：hook 说当前取舍；scene 体现时间范围；action 是近期可执行动作；不得预测具体事件。",
};

const reportSlotContract = "保持现有 App 槽位不变：title 为首屏总判断，summary 为两到四句解释，sections 按既有 id 逐项填写，action 只给一个动作，shareLine 是用户愿意分享的一句话，questions 是继续探索入口。";

const chatSlotContract = "保持问答卡槽位不变：title 直接回答，summary 解释现实含义，observations 给 2 至 3 个可核对信号，action 只给一个动作，suggestions 承接当前问题。";

export function buildNarrativeAppContentBrief(input: NarrativeRequest): AppContentBrief {
  return { ...narrativeProfiles[input.context], slotContract: slotContracts[input.slot] };
}

export function buildReportAppContentBrief(input: ReportNarrativeRequest): AppContentBrief {
  const profile = input.context === "compatibility"
    ? relationshipProfiles[input.relationshipType || "other"]
    : reportProfiles[input.context];
  return { ...profile, slotContract: reportSlotContract };
}

export function buildChatAppContentBrief(category: MobileChatCategory): AppContentBrief {
  return { ...chatProfiles[category], slotContract: chatSlotContract };
}

export function renderAppContentSystemPrompt(brief: AppContentBrief) {
  return `本次调用不是自由创作。你在玄枢 App 内的具体身份是“${brief.identity}”。

页面位置：${brief.surface}
用户此刻需要：${brief.userNeed}
本次内容目标：${brief.contentGoal}
重点内容：${brief.focus}
页面槽位约束：${brief.slotContract}
内容边界：${brief.boundaries}

先完成当前页面承诺的内容，再考虑文字是否好听。不能把其他页面、其他命理体系或其他关系场景的语言套进来。只能依据输入事实动态组织内容，不能为了生动补写用户没有提供的经历。`;
}
