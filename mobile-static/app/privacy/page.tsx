import { MarketInfoPage } from "@/components/site/MarketInfoPage";
import { privacyContent } from "@/lib/market-info-content";

export const metadata = { title: "隐私说明 - 玄枢" };

export default function StaticPrivacyPage() {
  return <MarketInfoPage content={privacyContent} />;
}
