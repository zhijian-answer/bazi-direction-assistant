import { BaziReportPage } from "@/components/mobile/BaziReportPage";

export default async function MobileBaziReportPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return <BaziReportPage initialTab={tab === "flow" ? "flow" : "bazi"} />;
}
