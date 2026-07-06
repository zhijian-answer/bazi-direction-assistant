import type { ZiweiBirthInput, ZiweiCalculationResult, ZiweiUnavailableReason } from "./contracts";
import { normalizeZiwei } from "./normalizeZiwei";

function validDateParts(value: string, calendarType: ZiweiBirthInput["calendarType"]) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1) return false;
  if (calendarType === "lunar") return day <= 30;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function validTime(value: string | null) {
  if (!value) return false;
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  return Boolean(match && Number(match[1]) <= 23 && Number(match[2]) <= 59);
}

export function validateZiweiInput(input: ZiweiBirthInput): ZiweiUnavailableReason[] {
  const reasons: ZiweiUnavailableReason[] = [];
  if (!input.birthTimeKnown || !input.birthTime) reasons.push("birth_time_unknown");
  else if (!validTime(input.birthTime)) reasons.push("invalid_birth_time");
  if (input.gender === "other") reasons.push("gender_required");
  if (!validDateParts(input.birthDate, input.calendarType)) reasons.push("invalid_birth_date");
  return reasons;
}

export async function calculateZiweiInsight(input: ZiweiBirthInput): Promise<ZiweiCalculationResult> {
  const reasons = validateZiweiInput(input);
  if (reasons.length) return { status: "insufficient_input", reasons };

  try {
    const { IztroEngine } = await import("./engines/iztroEngine");
    const engine = new IztroEngine();
    const chart = await engine.calculate(input);
    return { status: "ready", chart, insight: normalizeZiwei(chart, engine.getEngineInfo()) };
  } catch {
    return { status: "calculation_error", message: "紫微结构暂时无法生成，请检查出生资料后重试。" };
  }
}
