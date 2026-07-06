import type { ZodiacBodyKey, ZodiacSignKey } from "./types";

export type SignProfile = {
  name: string;
  element: "火" | "土" | "风" | "水";
  mode: "开创" | "固定" | "变动";
  drive: string;
  emotion: string;
  impression: string;
  expression: string;
  attraction: string;
  action: string;
  friction: string;
  recovery: string;
  strength: string;
  daily: string;
  scores: { action: number; curiosity: number; affinity: number; stability: number };
};

export const signProfiles: Record<ZodiacSignKey, SignProfile> = {
  aries: {
    name: "白羊", element: "火", mode: "开创", drive: "用直接行动打开局面", emotion: "需要及时回应，不喜欢长期压住感受", impression: "坦率、有行动感、反应很快", expression: "先说结论，再处理细节", attraction: "直接、有热情、愿意一起行动的人", action: "启动快，遇到阻力也愿意先试一次", friction: "容易在等待和含糊回应里失去耐心", recovery: "通过运动、独处片刻和明确下一步恢复", strength: "果断和开创", daily: "把最想推进的事先做出一个小动作", scores: { action: 94, curiosity: 76, affinity: 62, stability: 48 },
  },
  taurus: {
    name: "金牛", element: "土", mode: "固定", drive: "把有价值的事稳定做下去", emotion: "需要可预期的回应和舒服的生活节奏", impression: "稳重、慢热、有分寸", expression: "想清楚再说，更重视具体事实", attraction: "可靠、真诚、愿意兑现承诺的人", action: "启动不快，但认定以后很能坚持", friction: "最消耗的是反复变化却没有明确理由", recovery: "回到熟悉环境、规律饮食和稳定作息", strength: "耐力和落实", daily: "先完成一件已经答应过的事情", scores: { action: 66, curiosity: 48, affinity: 76, stability: 95 },
  },
  gemini: {
    name: "双子", element: "风", mode: "变动", drive: "连接信息、观点和有趣的人", emotion: "需要交流、新鲜输入和能接住话题的回应", impression: "灵活、好聊、反应很快", expression: "善于换角度，把复杂信息说得轻松", attraction: "有趣、聪明、愿意持续交流的人", action: "靠兴趣启动，适合短周期反馈", friction: "可能同时看到太多可能，完成边界不够清楚", recovery: "换一个环境、整理信息或进行轻松对话", strength: "好奇和连接", daily: "把脑中的想法说给一个可信的人听", scores: { action: 74, curiosity: 97, affinity: 82, stability: 52 },
  },
  cancer: {
    name: "巨蟹", element: "水", mode: "开创", drive: "保护重要的人和熟悉的生活秩序", emotion: "需要被认真回应，也需要安全的退回空间", impression: "温和、谨慎、会照顾气氛", expression: "先感受关系，再决定说到什么程度", attraction: "有同理心、稳定、尊重情绪边界的人", action: "为了在意的人很有推动力", friction: "容易把没有回应理解为关系变冷", recovery: "回到熟悉的人、空间和日常仪式里", strength: "感受力和照顾", daily: "先照顾好自己的节奏，再处理别人的情绪", scores: { action: 68, curiosity: 58, affinity: 92, stability: 78 },
  },
  leo: {
    name: "狮子", element: "火", mode: "固定", drive: "把热情投入一件值得被看见的事", emotion: "需要真诚认可，也希望关系里有明确回应", impression: "有存在感、大方、愿意承担", expression: "表达有重点，也自然带着个人立场", attraction: "真诚、有自信、愿意欣赏彼此的人", action: "目标明确时很能持续带动别人", friction: "容易在被忽视或价值没有被看见时受挫", recovery: "重新连接擅长的事和真正欣赏自己的人", strength: "创造和带动", daily: "把一件你真正认可的事做得更完整", scores: { action: 88, curiosity: 70, affinity: 79, stability: 76 },
  },
  virgo: {
    name: "处女", element: "土", mode: "变动", drive: "把混乱整理成可以执行的步骤", emotion: "需要清楚、可靠和有细节的关心", impression: "克制、认真、观察细致", expression: "倾向先核对事实，再给出具体建议", attraction: "靠谱、自律、愿意一起解决问题的人", action: "擅长拆解任务并持续优化", friction: "可能把标准设得太细，迟迟不允许自己完成", recovery: "收拾环境、列清单并完成一个小闭环", strength: "分析和改进", daily: "先定义完成标准，不必一次做到满分", scores: { action: 72, curiosity: 78, affinity: 67, stability: 86 },
  },
  libra: {
    name: "天秤", element: "风", mode: "开创", drive: "在不同立场之间找到可继续合作的方式", emotion: "需要公平回应和不失尊重的沟通", impression: "有礼貌、会照顾分寸、容易相处", expression: "善于比较角度，也重视说话方式", attraction: "有审美、会沟通、尊重边界的人", action: "看见共识后推进很顺", friction: "选项太多时容易延后自己的真实决定", recovery: "减少外界意见，独立确认自己最在意什么", strength: "协调和判断", daily: "少比较一个选项，明确一次自己的偏好", scores: { action: 64, curiosity: 80, affinity: 96, stability: 66 },
  },
  scorpio: {
    name: "天蝎", element: "水", mode: "固定", drive: "深入理解真正重要的人和问题", emotion: "需要信任、忠诚和不敷衍的回应", impression: "安静、有边界、观察力强", expression: "不轻易表态，但会直指问题核心", attraction: "真诚、有深度、愿意建立信任的人", action: "一旦认定目标，会投入很深", friction: "信息不透明时容易反复揣测和自我保护", recovery: "退出噪音，独立消化后再进行坦率沟通", strength: "洞察和专注", daily: "把一个猜测换成一次直接确认", scores: { action: 82, curiosity: 74, affinity: 58, stability: 89 },
  },
  sagittarius: {
    name: "射手", element: "火", mode: "变动", drive: "通过探索、学习和新的体验扩展边界", emotion: "需要空间、坦率和对未来的期待", impression: "开放、直爽、容易带来轻松感", expression: "喜欢讲清大方向，不爱困在过多细节里", attraction: "独立、乐观、愿意共同成长的人", action: "看见可能性时很有推动力", friction: "长期重复或限制太多时容易失去投入感", recovery: "换环境、学习新事物或重新看见长远方向", strength: "探索和乐观", daily: "给日常增加一个新的输入或小变化", scores: { action: 87, curiosity: 92, affinity: 78, stability: 49 },
  },
  capricorn: {
    name: "摩羯", element: "土", mode: "开创", drive: "建立长期有效、经得起时间检验的结果", emotion: "需要可靠、负责和不轻易失约的关系", impression: "冷静、克制、值得信任", expression: "重视逻辑、责任和可执行结论", attraction: "成熟、稳定、有目标感的人", action: "擅长把目标放进现实计划", friction: "容易把休息理解成落后，把压力留给自己", recovery: "重新排序责任，允许一部分事情稍后再做", strength: "规划和担当", daily: "只守住今天最关键的一项责任", scores: { action: 81, curiosity: 55, affinity: 59, stability: 97 },
  },
  aquarius: {
    name: "水瓶", element: "风", mode: "固定", drive: "用自己的方法理解问题并创造新连接", emotion: "需要空间、思想共鸣和不被控制的关系", impression: "独立、理性、带一点距离感", expression: "擅长抽离情绪，看见系统和不同可能", attraction: "有独立观点、尊重差异、能平等交流的人", action: "认同理念后会持续投入", friction: "不喜欢被迫按常规表达感受", recovery: "保留独处空间，和同频的人交换观点", strength: "创新和独立", daily: "试着用一个不同的方法解决旧问题", scores: { action: 69, curiosity: 96, affinity: 70, stability: 72 },
  },
  pisces: {
    name: "双鱼", element: "水", mode: "变动", drive: "感受人和环境之间细微但真实的联系", emotion: "需要理解、柔软回应和不过度紧绷的空间", impression: "温和、有想象力、容易共情", expression: "通过故事、画面和感受传递复杂信息", attraction: "温柔、有创造力、愿意理解情绪的人", action: "在有意义和有共鸣的事情上投入很深", friction: "边界不清时容易吸收太多别人的情绪", recovery: "减少外界刺激，通过睡眠、音乐或安静独处恢复", strength: "想象和共情", daily: "先分清什么是你的感受，什么来自环境", scores: { action: 56, curiosity: 75, affinity: 94, stability: 51 },
  },
};

export const bodyLabels: Record<ZodiacBodyKey | "rising", string> = {
  sun: "太阳",
  moon: "月亮",
  mercury: "水星",
  venus: "金星",
  mars: "火星",
  rising: "上升",
};

export function signName(sign: ZodiacSignKey) {
  return signProfiles[sign].name;
}
