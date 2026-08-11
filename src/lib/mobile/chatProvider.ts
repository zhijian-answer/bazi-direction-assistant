import OpenAI from "openai";
import { getChatAiSettings } from "../ai-config";
import { buildChatAppContentBrief, renderAppContentSystemPrompt } from "../narrative/appContentProtocol";
import type { MobileChatAnswer } from "./chatEngine";
import { generatedMobileChatSchema, type GeneratedMobileChatCopy, type MobileChatRequest } from "./chatAiSchema";

let client: OpenAI | null = null;
let clientKey = "";

export const mobileChatPromptVersion = "xuanshu-chat-v2";

const mobileChatSystemPrompt = `你是“玄枢”的在线解读编辑。命理计算已经由本地算法完成，你不负责排盘，也不能补充任何没有提供的星曜、干支、宫位、事件或对方心理。

你的任务是根据已确认的证据、用户当前问题和最近对话，写出自然、有生活感、愿意继续读的中文回答。

必须遵守：
1. 直接回答用户此刻的问题，不写产品介绍，不复述整份命盘。
2. 只能使用输入中的 evidence、limitations 和 localDraft；证据没有说明的内容必须明确保留边界。
3. 不判断第三方内心，不承诺复合、发财、疾病结果或具体事件一定发生。
4. title 是一句直接判断；summary 用 2 至 4 句说清现实含义。
5. observations 写 2 至 3 个用户能在现实里核对的信号，不能全是抽象性格词。
6. action 只给一个现在能做的小动作，不列长清单。
7. suggestions 是 2 至 3 个自然的后续问题，要承接当前对话。
8. 少用“能量、结构、维度、赋能、探索、洞察、命运密码、人生课题”。
9. 不制造焦虑，不使用“注定、必然、一定会、正缘已定、大师”等绝对化表达。
10. 输出纯 JSON，不要 Markdown，不解释生成过程。

JSON 格式：
{"title":"","summary":"","observations":["",""],"action":"","suggestions":["",""]}`;

function activeClient() {
  const settings = getChatAiSettings();
  if (!settings.enabled || !settings.apiKey) return null;
  const nextKey = `${settings.baseURL || "openai"}:${settings.apiKey.slice(-6)}`;
  if (!client || clientKey !== nextKey) {
    client = new OpenAI({
      apiKey: settings.apiKey,
      baseURL: settings.baseURL,
      timeout: settings.timeoutMs,
    });
    clientKey = nextKey;
  }
  return { client, settings };
}

export function buildMobileChatPromptPayload(
  input: MobileChatRequest,
  localAnswer: MobileChatAnswer,
  revisionIssues: string[] = [],
) {
  return {
    promptVersion: mobileChatPromptVersion,
    question: input.question,
    category: localAnswer.category,
    appContentBrief: buildChatAppContentBrief(localAnswer.category),
    recentConversation: input.history,
    evidence: localAnswer.evidence.map(({ system, label, value, detail }) => ({ system, label, value, detail })),
    limitations: localAnswer.limitations,
    localDraft: {
      title: localAnswer.title,
      summary: localAnswer.summary,
      observations: localAnswer.observations,
      action: localAnswer.action,
      suggestions: localAnswer.suggestions,
    },
    revision: revisionIssues.length
      ? `上一版没有符合当前 App 问答场景，请改正：${revisionIssues.join("；")}`
      : undefined,
  };
}

export async function generateMobileChatWithApi(
  input: MobileChatRequest,
  localAnswer: MobileChatAnswer,
  revisionIssues: string[] = [],
): Promise<{ copy: GeneratedMobileChatCopy; provider: string; model: string } | null> {
  const active = activeClient();
  if (!active) return null;

  const completion = await active.client.chat.completions.create({
    model: active.settings.model,
    temperature: 0.76,
    max_tokens: 1200,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: mobileChatSystemPrompt },
      { role: "system", content: renderAppContentSystemPrompt(buildChatAppContentBrief(localAnswer.category)) },
      { role: "user", content: JSON.stringify(buildMobileChatPromptPayload(input, localAnswer, revisionIssues)) },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("在线模型没有返回内容");
  return {
    copy: generatedMobileChatSchema.parse(JSON.parse(raw)),
    provider: active.settings.provider,
    model: completion.model || active.settings.model,
  };
}
