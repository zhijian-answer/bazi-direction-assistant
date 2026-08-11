import type { NarrativeFact } from "@/lib/narrative/contracts";
import type { ReportNarrativeRequest, ReportNarrativeResponse } from "@/lib/narrative/reportContracts";
import type { EditorialStory } from "./editorialCatalog";

export function buildEditorialNarrativeRequest({
  context,
  reportKey,
  story,
  facts,
}: {
  context: "bazi" | "zodiac";
  reportKey: string;
  story: EditorialStory;
  facts: NarrativeFact[];
}): ReportNarrativeRequest {
  return {
    context,
    reportKey,
    facts,
    fallback: {
      title: story.title,
      summary: story.summary,
      action: story.actionNote,
      shareLine: story.title,
      questions: [context === "bazi" ? "什么样的环境更容易让我发挥？" : "什么样的人会让我真正放松？"],
      sections: [
        ...story.othersSee.map((body, index) => ({ id: `others-${index}`, title: "别人先看到的", body })),
        ...story.realNeeds.map((body, index) => ({ id: `needs-${index}`, title: "真正需要的", body })),
        { id: "hidden", title: story.hiddenTitle, body: story.hiddenBody },
        { id: "misunderstanding", title: story.misunderstandingTitle, body: story.misunderstandingBody },
      ],
    },
  };
}

export function applyEditorialNarrative(story: EditorialStory, response: ReportNarrativeResponse): EditorialStory {
  const sections = new Map(response.bundle.sections.map((item) => [item.id, item]));
  const actionTitle = response.bundle.action.split(/[，。；]/)[0]?.trim() || story.actionTitle;
  return {
    ...story,
    title: response.bundle.title,
    summary: response.bundle.summary,
    othersSee: story.othersSee.map((item, index) => sections.get(`others-${index}`)?.body || item) as EditorialStory["othersSee"],
    realNeeds: story.realNeeds.map((item, index) => sections.get(`needs-${index}`)?.body || item) as EditorialStory["realNeeds"],
    hiddenTitle: sections.get("hidden")?.title || story.hiddenTitle,
    hiddenBody: sections.get("hidden")?.body || story.hiddenBody,
    misunderstandingTitle: sections.get("misunderstanding")?.title || story.misunderstandingTitle,
    misunderstandingBody: sections.get("misunderstanding")?.body || story.misunderstandingBody,
    actionTitle,
    actionNote: response.bundle.action,
  };
}
