import { z } from "zod";

const text = z.string().trim().min(2).max(220);

export const reportNarrativeSectionSchema = z.object({
  id: z.string().trim().min(1).max(64),
  title: z.string().trim().min(2).max(38),
  body: z.string().trim().min(4).max(220),
  action: z.string().trim().min(4).max(100).optional(),
});

export const reportNarrativeBundleSchema = z.object({
  title: z.string().trim().min(4).max(42),
  summary: z.string().trim().min(10).max(240),
  action: z.string().trim().min(6).max(110),
  shareLine: z.string().trim().min(4).max(52),
  questions: z.array(z.string().trim().min(5).max(48)).min(1).max(6),
  sections: z.array(reportNarrativeSectionSchema).min(1).max(24),
});

export const reportNarrativeRequestSchema = z.object({
  context: z.enum(["daily", "flow", "bazi", "zodiac", "ziwei", "compatibility"]),
  reportKey: z.string().trim().min(2).max(160),
  relationshipType: z.enum(["lover", "partner", "ambiguous", "friend", "family", "colleague", "other"]).optional(),
  facts: z.array(z.object({ label: text, value: text })).min(1).max(40),
  fallback: reportNarrativeBundleSchema,
  promptVersion: z.string().trim().min(1).max(48).optional(),
}).superRefine((value, context) => {
  if (value.context === "compatibility" && !value.relationshipType) {
    context.addIssue({
      code: "custom",
      path: ["relationshipType"],
      message: "合盘报告需要明确关系类型",
    });
  }
});
