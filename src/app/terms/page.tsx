import { MarketInfoPage } from "@/components/site/MarketInfoPage";
import { termsContent } from "@/lib/market-info-content";

export const metadata = { title: "用户协议与内容边界 - 玄枢", description: "玄枢的使用条款、内容性质和重要决策边界。" };

export default function TermsPage() {
  return <MarketInfoPage content={termsContent} />;
}
