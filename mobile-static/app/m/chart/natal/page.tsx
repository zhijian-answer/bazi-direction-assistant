import { FullAstrologyPage } from "@/components/mobile/FullAstrologyPage";

export default function StaticMobileNatalChartPage() {
  return <FullAstrologyPage initialMode="natal" transitSeed={new Date().toISOString()} />;
}
