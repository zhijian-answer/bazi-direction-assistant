import { MarketInfoPage } from "@/components/site/MarketInfoPage";
import { privacyContent } from "@/lib/market-info-content";

export const metadata = { title: "隐私说明 - 玄枢", description: "玄枢的本地保存、云端同步、分享图和数据使用说明。" };

export default function PrivacyPage() {
  return <MarketInfoPage content={privacyContent} />;
}
