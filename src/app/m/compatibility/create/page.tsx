import { CompatibilityV4App } from "@/components/figma-v22/compatibility-v4/CompatibilityV4App";
export default async function MobileCompatibilityCreatePage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  return <CompatibilityV4App initialScreen="create-1" initialChartType={mode === "bazi" ? "birth" : "synastry"} />;
}
