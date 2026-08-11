import type { MobileChatAnswer } from "./chatEngine";
import { buildMobileChatAnswer } from "./chatEngine";
import { inspectGeneratedMobileChat, type GeneratedMobileChatCopy, type MobileChatRequest } from "./chatAiSchema";
import { generateMobileChatWithApi } from "./chatProvider";

export function applyGeneratedChatCopy(
  localAnswer: MobileChatAnswer,
  copy: GeneratedMobileChatCopy,
  provider: string,
  model: string,
): MobileChatAnswer {
  return {
    ...localAnswer,
    title: copy.title,
    summary: copy.summary,
    observations: copy.observations,
    action: copy.action,
    suggestions: copy.suggestions,
    poster: {
      ...localAnswer.poster,
      title: copy.title,
      body: `${copy.summary} ${copy.action}`,
    },
    delivery: { source: "api", provider, model },
  };
}

export async function resolveMobileChatAnswer(input: MobileChatRequest): Promise<MobileChatAnswer> {
  const localAnswer = await buildMobileChatAnswer(input.profile, input.question);
  try {
    let generated = await generateMobileChatWithApi(input, localAnswer);
    if (!generated) return localAnswer;
    let issues = inspectGeneratedMobileChat(generated.copy, localAnswer.category);
    for (let attempt = 0; issues.length && attempt < 2; attempt += 1) {
      const revised = await generateMobileChatWithApi(input, localAnswer, issues);
      if (!revised) break;
      generated = revised;
      issues = inspectGeneratedMobileChat(revised.copy, localAnswer.category);
    }
    if (issues.length) {
      return {
        ...localAnswer,
        delivery: {
          source: "fallback",
          provider: process.env.NODE_ENV === "development" ? issues[0].slice(0, 80) : undefined,
        },
      };
    }
    return applyGeneratedChatCopy(localAnswer, generated.copy, generated.provider, generated.model);
  } catch (error) {
    return {
      ...localAnswer,
      delivery: {
        source: "fallback",
        provider: process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message.slice(0, 80)
          : undefined,
      },
    };
  }
}
