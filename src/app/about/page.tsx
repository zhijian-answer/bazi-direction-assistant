import { MarketInfoPage } from "@/components/site/MarketInfoPage";
import { aboutContent } from "@/lib/market-info-content";

export const metadata = { title: "关于玄枢", description: "了解玄枢的产品定位、内容边界与隐私原则。" };

export default function AboutPage() {
  return <MarketInfoPage content={aboutContent} />;
}
