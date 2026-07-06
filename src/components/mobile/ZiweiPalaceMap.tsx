const palaces: ReadonlyArray<{ label: string; note: string; position: number; key?: boolean }> = [
  { label: "兄弟", note: "同辈协作", position: 1 },
  { label: "夫妻", note: "亲密回应", position: 2, key: true },
  { label: "子女", note: "创造表达", position: 3 },
  { label: "财帛", note: "资源方式", position: 4 },
  { label: "疾厄", note: "身心节奏", position: 5 },
  { label: "迁移", note: "外部环境", position: 6 },
  { label: "交友", note: "合作网络", position: 7 },
  { label: "官禄", note: "工作主线", position: 8, key: true },
  { label: "田宅", note: "生活基础", position: 9 },
  { label: "福德", note: "恢复方式", position: 10, key: true },
  { label: "父母", note: "规则来源", position: 11 },
  { label: "命宫", note: "底层气质", position: 12, key: true },
];

export function ZiweiPalaceMap({ mingGong, shenGong }: { mingGong?: string; shenGong?: string }) {
  return (
    <div className="ziwei-palace-map" role="img" aria-label="简化十二宫领域结构图">
      {palaces.map((palace) => (
        <div key={palace.label} className={`ziwei-palace-cell ziwei-palace-cell--${palace.position} ${palace.key ? "is-key" : ""}`}>
          {palace.label}
          <small>{palace.note}</small>
        </div>
      ))}
      <div className="ziwei-palace-center">
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
