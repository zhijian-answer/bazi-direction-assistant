import { FullAstrologyPage } from "@/components/mobile/FullAstrologyPage";

export default function MobileTransitChartPage() {
  return <FullAstrologyPage initialMode="transit" transitSeed={new Date().toISOString()} />;
}
