import { FullAstrologyPage } from "@/components/mobile/FullAstrologyPage";

export default function MobileNatalChartPage() {
  return <FullAstrologyPage initialMode="natal" transitSeed={new Date().toISOString()} />;
}
