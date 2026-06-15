import OpenAI from "openai";
import { aiConfig, getAiMode } from "./ai-config";
import { elementLabels, getElementAdvice } from "./bazi";
import type { BirthProfile, GuidanceQuestion, PublicUser, QuestionCategory } from "./types";

let client: OpenAI | null = null;

function getOpenAIClient() {
  if (getAiMode() !== "openai") {
    return null;
  }
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: aiConfig.openaiTimeoutMs,
    });
  }
  return client;
}

function categoryLabel(category: QuestionCategory) {
  const labels: Record<QuestionCategory, string> = {
    direction: "人生方向",
    career: "事业工作",
    relationship: "感情关系",
    study: "学习成长",
    wealth: "财富规划",
    timing: "行动时机",
    emotion: "情绪低谷",
    custom: "自由提问",
  };
  return labels[category];
}

function buildLocalAnswer(input: {
  user: PublicUser;
  profile: BirthProfile;
  question: string;
  category: QuestionCategory;
}) {
  const { profile, question, category } = input;
  const chart = profile.chart;
  const strongest = chart.wuxing.strongest.map((item) => elementLabels[item]).join("、");
  const weakest = chart.wuxing.weakest.map((item) => elementLabels[item]).join("、");
  const useful = chart.wuxing.weakest[0];
  const dominant = chart.wuxing.strongest[0];
  const usefulAdvice = getElementAdvice(useful);
  const dominantAdvice = getElementAdvice(dominant);

  return [
    `先给你一个温和的结论：这件事可以作为参考方向来推进，但不适合用情绪立刻拍板。你的问题是“${question}”，从四柱结构看，更适合先把目标拆小，再用一到两周观察真实反馈。`,
    `你的日主是${chart.dayMaster.stem}${chart.dayMaster.elementLabel}，四柱为年柱${chart.pillars.year}、月柱${chart.pillars.month}、日柱${chart.pillars.day}、时柱${chart.pillars.time}。当前盘面里较明显的能量是${strongest}，相对需要补足的是${weakest}。这代表你在${categoryLabel(category)}这类问题上，不能只靠一时冲劲，更需要找到节奏和落点。`,
    `适合做的事：围绕“${usefulAdvice}”去行动。比如先列出选择清单、找一个可信的人复盘、做小范围尝试、保留可回退方案。这样会比一次性做大决定更稳。`,
    `暂时不太适合做的事：过度消耗在“${dominantAdvice}”的反面状态里，比如反复想却不验证、为了证明自己而硬扛、或者在压力最大的时候做不可逆决定。`,
    "接下来 7 天建议你先做三步：第一，把这件事写成一个具体问题；第二，做一个低成本测试；第三，根据结果决定是否扩大投入。你不是没有方向，只是现在更需要一个能落地的顺序。",
    "提醒：这份分析用于文化娱乐和自我探索，不替代医疗、法律、投资、职业等专业建议。真正重要的决定，仍建议结合现实信息和可信专业意见。",
  ].join("\n\n");
}

export async function generateGuidance(input: {
  user: PublicUser;
  profile: BirthProfile;
  question: string;
  category: QuestionCategory;
}): Promise<Pick<GuidanceQuestion, "answer" | "usage">> {
  const openai = getOpenAIClient();
  const model = aiConfig.model;

  if (!openai) {
    const answer = buildLocalAnswer(input);
    return {
      answer,
      usage: {
        source: "local",
        estimatedTokens: Math.ceil(answer.length / 2),
      },
    };
  }

  try {
    const chart = input.profile.chart;
    const response = await openai.responses.create({
      model,
      input: [
        {
          role: "system",
          content:
            "你是一个免费的四柱八字人生方向助手。你的定位是文化娱乐、自我探索、参考解读。你必须温和、务实、鼓励用户采取小步行动，不能制造恐惧，不能给出医疗、法律、投资等专业结论，不能声称确定预测未来。回答结构：温和结论、命盘依据、适合做、暂缓做、三步行动、提醒。",
        },
        {
          role: "user",
          content: JSON.stringify({
            userName: input.user.name,
            profile: {
              name: input.profile.name,
              gender: input.profile.gender,
              birthPlace: input.profile.birthPlace,
              calendarType: input.profile.calendarType,
              birthDate: input.profile.birthDate,
              birthTime: input.profile.birthTime,
            },
            question: input.question,
            category: input.category,
            chart,
          }),
        },
      ],
    });

    const answer = response.output_text || buildLocalAnswer(input);
    return {
      answer,
      usage: {
        source: "openai",
        model,
        estimatedTokens: Math.ceil(answer.length / 2),
      },
    };
  } catch (error) {
    if (!aiConfig.fallbackOnError) {
      throw error;
    }
    const answer = buildLocalAnswer(input);
    return {
      answer,
      usage: {
        source: "fallback",
        model,
        estimatedTokens: Math.ceil(answer.length / 2),
        error: error instanceof Error ? error.message.slice(0, 300) : "OpenAI request failed",
      },
    };
  }
}
