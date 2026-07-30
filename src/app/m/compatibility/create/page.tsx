import { CompatibilityCreateFlow } from "@/components/mobile/CompatibilityCreateFlow";
import type { CompatibilityMode } from "@/lib/compatibility";

export default async function MobileCompatibilityCreatePage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  return <CompatibilityCreateFlow initialMode={(mode === "bazi" ? "bazi" : "astrology") satisfies CompatibilityMode} />;
}
