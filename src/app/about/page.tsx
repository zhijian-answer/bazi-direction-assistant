import { MarketInfoPage } from "@/components/site/MarketInfoPage";
import { aboutContent } from "@/lib/market-info-content";

export const metadata = { title: "关于玄枢", description: "了解玄枢的产品定位、算法原则和当前测试状态。" };

export default function AboutPage() {
  return <MarketInfoPage content={aboutContent} />;
}
