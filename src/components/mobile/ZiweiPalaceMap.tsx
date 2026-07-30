import Image from "next/image";
import type { NormalizedZiweiInsight } from "@/lib/ziwei/contracts";

const keyPalaces = new Set(["命宫", "官禄", "夫妻", "福德"]);

export function ZiweiPalaceMap({ mingGong, shenGong, palaces }: { mingGong?: string; shenGong?: string; palaces: NormalizedZiweiInsight["evidence"]["palaces"] }) {
  return (
    <div className="ziwei-palace-map" role="img" aria-label="根据当前档案计算的十二宫结构图">
      {palaces.map((palace, index) => (
        <div key={`${palace.name}-${palace.earthlyBranch}`} className={`ziwei-palace-cell ziwei-palace-cell--${index + 1} ${keyPalaces.has(palace.name) ? "is-key" : ""} ${palace.isBodyPalace || palace.isOriginalPalace ? "is-merged" : ""}`}>
          {palace.name}
          <small>{palace.majorStars.slice(0, 2).join("·") || `${palace.heavenlyStem}${palace.earthlyBranch}`}</small>
        </div>
      ))}
      <div className="ziwei-palace-center">
        <Image className="ziwei-palace-center__orbit" src="/mobile/style-lab-assets/ziwei-palace-center-alpha.png" alt="" aria-hidden="true" width={377} height={341} />
        <span>十二宫</span>
        <strong>人生领域结构</strong>
        <div className="ziwei-palace-points">
          <em>命宫 {mingGong || "待观察"}</em>
          <em>身宫 {shenGong || "待观察"}</em>
        </div>
      </div>
    </div>
  );
}
