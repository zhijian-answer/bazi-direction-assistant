import { z } from "zod";
import type { MobileChatCategory } from "./chatEngine";

const cleanText = (min: number, max: number) => z.string().trim().min(min).max(max);
const forbiddenClaims = [
  "注定",
  "必然",
  "一定会",
  "保证复合",
  "保证赚钱",
  "必定分手",
  "就是正缘",
  "患有",
  "诊断为",
];

export const generatedMobileChatSchema = z.object({
  title: cleanText(4, 36),
  summary: cleanText(12, 240),
  observations: z.array(cleanText(6, 100)).min(2).max(3),
  action: cleanText(6, 90),
  suggestions: z.array(cleanText(4, 42)).min(2).max(3),
}).superRefine((value, context) => {
  const joined = [value.title, value.summary, ...value.observations, value.action, ...value.suggestions].join("\n");
  forbiddenClaims.forEach((phrase) => {
    if (joined.includes(phrase)) {
      context.addIssue({ code: "custom", message: `包含不允许的绝对化表达：${phrase}` });
    }
  });
});

export type GeneratedMobileChatCopy = z.infer<typeof generatedMobileChatSchema>;

export function inspectGeneratedMobileChat(copy: GeneratedMobileChatCopy, category: MobileChatCategory) {
  const joined = [copy.title, copy.summary, ...copy.observations, copy.action, ...copy.suggestions].join("\n");
  const issues: string[] = [];
  if (category === "relationship" && /(他其实|她其实|对方心里|对方一定|他一定|她一定)/.test(joined)) {
    issues.push("关系回答替第三方读心，应改写成用户可以观察的回应和行动");
  }
  if (category === "career" && /(必须|应该立刻|马上)(辞职|创业|转行)/.test(joined)) {
    issues.push("工作回答替用户作出了重大职业决定");
  }
  if (category === "wealth" && /(稳赚|必赚|买入|卖出|抄底|梭哈|保证收益)/.test(joined)) {
    issues.push("财富回答包含投资指令或收益承诺");
  }
  if (category === "emotion" && /(你患有|你得了|诊断为|抑郁症|焦虑症|失眠症)/.test(joined)) {
    issues.push("状态回答越界进行了医疗或心理诊断");
  }
  if (category === "timing" && /(一定在|必定在).{0,12}(日|月|年)/.test(joined)) {
    issues.push("时机回答给出了没有依据的确定日期");
  }
  return issues;
}

export const mobileChatProfileSchema = z.object({
  id: z.string().max(100).optional(),
  name: z.string().trim().min(1).max(40),
  gender: z.enum(["male", "female", "other"]),
  calendarType: z.enum(["solar", "lunar"]),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().max(8),
  birthTimeKnown: z.boolean(),
  isLeapMonth: z.boolean(),
  birthPlace: z.string().trim().max(80),
  latitude: z.number().finite().optional(),
  longitude: z.number().finite().optional(),
  timezone: z.string().max(80).optional(),
  birthPlaceResolution: z.enum(["catalog", "coordinates", "unknown"]).optional(),
  isDemo: z.boolean().optional(),
  isLocalOnly: z.boolean().optional(),
  completeness: z.number().min(0).max(100).optional(),
  createdAt: z.string().max(40).optional(),
  updatedAt: z.string().max(40).optional(),
  syncStatus: z.enum(["local", "pending", "synced", "error"]).optional(),
  cloudProfileId: z.string().max(100).optional(),
});

export const mobileChatRequestSchema = z.object({
  profile: mobileChatProfileSchema,
  question: z.string().trim().min(2).max(240),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(600),
  })).max(10).default([]),
});

export type MobileChatRequest = z.infer<typeof mobileChatRequestSchema>;
