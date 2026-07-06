import { MarketInfoPage } from "@/components/site/MarketInfoPage";
import { termsContent } from "@/lib/market-info-content";

export const metadata = { title: "用户协议与内容边界 - 玄枢" };

export default function StaticTermsPage() {
  return <MarketInfoPage content={termsContent} />;
}
