import { FullAstrologyPage } from "@/components/mobile/FullAstrologyPage";

export default function StaticMobileTransitChartPage() {
  return <FullAstrologyPage initialMode="transit" transitSeed={new Date().toISOString()} />;
}
