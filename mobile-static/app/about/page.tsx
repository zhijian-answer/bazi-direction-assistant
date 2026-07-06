import { MarketInfoPage } from "@/components/site/MarketInfoPage";
import { aboutContent } from "@/lib/market-info-content";

export const metadata = { title: "关于玄枢" };

export default function StaticAboutPage() {
  return <MarketInfoPage content={aboutContent} />;
}
