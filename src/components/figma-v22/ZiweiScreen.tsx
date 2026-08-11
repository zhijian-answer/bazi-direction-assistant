import { useState } from "react";
import type { Question } from "./QuestionInsightSheet";
import type { FigmaZiweiViewModel } from "./viewModels";
import EditorialStorySections from "./EditorialStorySections";

// ─── 12-palace data ────────────────────────────────────────────────────────────
interface Palace {
  id: string; branch: string; name: string;
  stars: string[];
  gridRow: number; gridCol: number;
  tag?: string; tagColor?: string;
  desc: string;
}

const PALACES: Palace[] = [
  {
    id: "P01", branch: "巳", name: "父母宫", stars: ["天梁", "天马"],
    gridRow: 1, gridCol: 1,
    desc: "与长辈或权威人物的关系模式。天梁入此，对权威有尊重但也渴望更多自主空间，通常能从长辈处获得资源，但需要主动沟通才能建立真正的联结。",
  },
  {
    id: "P02", branch: "午", name: "命宫", stars: ["紫微", "贪狼"],
    gridRow: 1, gridCol: 2, tag: "命", tagColor: "#E8816A",
    desc: "人生的核心性格与主要轴线。紫微星在命宫，有强烈的自主意识，对被真正看见和认可有深层需求。贪狼带来多元兴趣与社交魅力，但容易在很多方向上分散精力。",
  },
  {
    id: "P03", branch: "未", name: "兄弟宫", stars: ["天同", "文昌"],
    gridRow: 1, gridCol: 3,
    desc: "与同辈、手足的关系模式。天同入此性格温和，在平辈关系中偏向调和而非主导；文昌带来表达能力，在小圈子里往往是擅长说话、被记住的那个人。",
  },
  {
    id: "P04", branch: "申", name: "夫妻宫", stars: ["廉贞", "七杀"],
    gridRow: 1, gridCol: 4,
    desc: "亲密关系的结构模式。廉贞七杀同宫，关系里自我意识较强，需要感受到真正的对等与尊重才能投入，对模糊或不对等的相处状态容忍度较低。",
  },
  {
    id: "P05", branch: "辰", name: "福德宫", stars: ["太阳", "文曲"],
    gridRow: 2, gridCol: 1,
    desc: "精神满足感的来源与内在状态。太阳在福德宫，内心充实感与被社会认可或做出贡献关联密切。安静时容易想太多，需要外在事务来平衡内在，不适合长时间完全独处。",
  },
  {
    id: "P06", branch: "酉", name: "子女宫", stars: ["天机", "右弼"],
    gridRow: 2, gridCol: 4,
    desc: "与年轻一代或自己创造成果的关系。天机在此思虑较多，对下一代有期待但也容易过度操心；右弼带来包容性，在辅助和支持他人成长上有天然的能力。",
  },
  {
    id: "P07", branch: "卯", name: "田宅宫", stars: ["武曲", "天府"],
    gridRow: 3, gridCol: 1,
    desc: "居住环境与物质基础的稳定性。武曲天府同宫，对居住和资产的安全感要求较高，有稳扎稳打积累的倾向，但需要主动规划而非等待机会自然降临。",
  },
  {
    id: "P08", branch: "戌", name: "财帛宫", stars: ["太阴"],
    gridRow: 3, gridCol: 4, tag: "身", tagColor: "#7BBDE0",
    desc: "金钱与资源的安排方式。太阴在财帛宫，更适合观察自己是否偏好长期积累、是否在意收支可控；这里不判断投资结果。身宫落此，也说明财务安排更容易影响安全感。",
  },
  {
    id: "P09", branch: "寅", name: "疾厄宫", stars: ["巨门", "左辅"],
    gridRow: 4, gridCol: 1,
    desc: "压力与休息方式。巨门在此，更适合观察自己紧张时是否习惯把话留在心里；这里不推断具体健康状况，只提醒你给休息和沟通留出位置。",
  },
  {
    id: "P10", branch: "丑", name: "迁移宫", stars: ["天相", "火星"],
    gridRow: 4, gridCol: 2,
    desc: "在外部世界的表现与流动能力。天相带来在外的体面感和协调力；火星带来一定冲劲，但也容易在外部事务中反应过快，需要注意保持节奏而不是被外部环境推着走。",
  },
  {
    id: "P11", branch: "子", name: "交友宫", stars: ["破军", "铃星"],
    gridRow: 4, gridCol: 3,
    desc: "人际关系结构与朋友圈特质。破军在此，朋友圈可能有较多变动，或你倾向在社交关系中保持一定的自主性；关系的质量比数量更重要，不喜欢被人际关系牵绊太深。",
  },
  {
    id: "P12", branch: "亥", name: "事业宫", stars: ["天魁", "天钺"],
    gridRow: 4, gridCol: 4,
    desc: "职业方向与工作模式。天魁天钺同宫，更适合观察自己在协作、获得反馈与借助专业支持时怎样发挥；这里不预测具体机会，也不替你决定职业。",
  },
];

const PALACE_FOCUS: Record<string, string> = {
  命宫: "这里先看你处理事情时最自然的反应，以及别人最先感受到的那一面。",
  兄弟: "这里观察你与手足、同辈之间怎样分工，也看彼此是否容易把话说开。",
  夫妻: "这里关注亲密关系里的期待、边界与回应方式，不直接判断一段关系的结局。",
  子女: "这里也代表你面对创作、作品与需要长期照顾之事时，会怎样投入心力。",
  财帛: "这里观察你如何取得、安排和看待金钱，不等同于具体收入或理财结论。",
  疾厄: "这里适合观察压力来临时的身心反应；涉及健康问题，仍应以专业意见为准。",
  迁移: "这里看你离开熟悉环境以后怎样应对变化，也看陌生场合里的适应方式。",
  仆役: "这里关注朋友、同事与合作对象，重点是你会把信任交给什么样的人。",
  交友: "这里关注朋友、同事与合作对象，重点是你会把信任交给什么样的人。",
  官禄: "这里观察工作中的位置感、责任方式与适合发挥的环境，不替你决定具体职业。",
  事业: "这里观察工作中的位置感、责任方式与适合发挥的环境，不替你决定具体职业。",
  田宅: "这里关系到居住、家庭空间与长期积累，也反映什么样的环境更让你安定。",
  福德: "这里更接近独处时的真实状态，帮助你看清自己靠什么恢复，又为什么容易想多。",
  父母: "这里观察你与长辈、权威和规则的相处方式，也看哪些支持真正对你有用。",
};

export function getZiweiPalaceFallback(name: string, stars: string[]) {
  const focus = PALACE_FOCUS[name] || PALACE_FOCUS[name.replace(/宫$/, "")] || "这里先看这个生活领域里反复出现的习惯。";
  return stars.length
    ? `${focus} 当前主星为${stars.join("、")}，先对照最近真实发生的互动，再看这种倾向是否明显。`
    : `${focus} 当前为空宫，需要结合对宫与三方四正，不用固定星曜替你下结论。`;
}

function palacesFromViewModel(viewModel: FigmaZiweiViewModel): Palace[] {
  const source = viewModel.insight?.evidence.palaces ?? [];
  return source.map((palace, index) => {
    const layout = PALACES[index] ?? PALACES[0];
    return {
      id: `P${String(index + 1).padStart(2, "0")}`,
      branch: palace.earthlyBranch,
      name: palace.name,
      stars: palace.majorStars.length ? palace.majorStars : ["空宫"],
      gridRow: layout.gridRow,
      gridCol: layout.gridCol,
      tag: palace.name === "命宫" ? "命" : palace.isBodyPalace ? "身" : palace.isOriginalPalace ? "来因" : undefined,
      tagColor: palace.name === "命宫" ? "#E8816A" : palace.isBodyPalace ? "#7BBDE0" : palace.isOriginalPalace ? "#A887C8" : undefined,
      desc: viewModel.palaceNarratives?.[palace.name]
        || getZiweiPalaceFallback(palace.name, palace.majorStars),
    };
  });
}

// ─── Shared glass card ─────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div role="tablist" aria-label="紫微报告视图" style={{
      borderRadius: 22,
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(22px) saturate(180%)",
      WebkitBackdropFilter: "blur(22px) saturate(180%)",
      border: "1px solid rgba(255,255,255,0.88)",
      boxShadow: "0 4px 22px rgba(140,110,80,0.09)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Segmented control ─────────────────────────────────────────────────────────
function Seg({ tabs, active, onChange, accent = "#E9C97E" }: {
  tabs: string[]; active: number;
  onChange: (i: number) => void;
  accent?: string;
}) {
  return (
    <div style={{
      display: "flex", gap: 4, padding: "4px",
      borderRadius: 16,
      background: "rgba(245,235,210,0.55)",
      border: "1px solid rgba(233,201,126,0.25)",
    }}>
      {tabs.map((tab, i) => (
        <button type="button" role="tab" aria-selected={active === i} key={tab} onClick={() => onChange(i)} style={{
          flex: 1, padding: "7px 4px", borderRadius: 12,
          border: "none",
          background: active === i ? "rgba(255,255,255,0.92)" : "transparent",
          boxShadow: active === i ? `0 2px 8px ${accent}30` : "none",
          fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif",
          fontWeight: active === i ? 500 : 400,
          color: active === i ? "#28253D" : "#8C7860",
          cursor: "pointer", transition: "all 0.18s ease",
        }}>{tab}</button>
      ))}
    </div>
  );
}

// ─── Palace cell ───────────────────────────────────────────────────────────────
function PalaceCell({ palace, selected, onClick }: {
  palace: Palace; selected: boolean;
  onClick: (p: Palace) => void;
}) {
  const isLife   = palace.tag === "命";
  const isBody   = palace.tag === "身";

  return (
    <button onClick={() => onClick(palace)} style={{
      gridRow: palace.gridRow, gridColumn: palace.gridCol,
      padding: "7px 5px 5px",
      background: isLife
        ? "linear-gradient(145deg, rgba(232,129,106,0.14), rgba(255,255,255,0.80))"
        : isBody
        ? "linear-gradient(145deg, rgba(123,189,224,0.14), rgba(255,255,255,0.80))"
        : selected
        ? "rgba(255,255,255,0.92)"
        : "rgba(255,255,255,0.65)",
      border: isLife
        ? "2px solid rgba(232,129,106,0.55)"
        : isBody
        ? "2px solid rgba(123,189,224,0.55)"
        : selected
        ? "1.5px solid rgba(233,201,126,0.50)"
        : "none",
      cursor: "pointer",
      display: "flex", flexDirection: "column", gap: 2,
      textAlign: "left",
      transition: "background 0.16s ease",
      outline: "none",
    }}>
      {/* Branch + tag row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
        <span style={{ fontSize: 8, color: "#A09070", fontFamily: "'Noto Sans SC', sans-serif" }}>
          {palace.branch}
        </span>
        {palace.tag && (
          <div style={{
            padding: "0px 3px", borderRadius: 3,
            background: (palace.tagColor ?? "#E8816A") + "28",
            border: `1px solid ${palace.tagColor ?? "#E8816A"}55`,
            fontSize: 7, color: palace.tagColor ?? "#E8816A", fontWeight: 700,
            lineHeight: "14px",
          }}>{palace.tag}</div>
        )}
      </div>
      {/* Palace name */}
      <div style={{
        fontSize: 9.5, fontFamily: "'Noto Serif SC', serif",
        fontWeight: palace.tag ? 700 : 500,
        color: isLife ? "#C05840" : isBody ? "#3878A8" : "#28253D",
        lineHeight: 1.2,
      }}>{palace.name}</div>
      {/* Stars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1, marginTop: 1 }}>
        {palace.stars.slice(0, 2).map(s => (
          <span key={s} style={{
            fontSize: 8, color: "#8090A0",
            fontFamily: "'Noto Sans SC', sans-serif", lineHeight: 1.3,
          }}>{s}</span>
        ))}
      </div>
    </button>
  );
}

// ─── 12-palace grid ────────────────────────────────────────────────────────────
function TwelvePalaceGrid({ selectedId, onSelect, palaces, profileName, centerLabel }: {
  selectedId: string | null;
  onSelect: (p: Palace) => void;
  palaces: Palace[];
  profileName: string;
  centerLabel: string;
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gridTemplateRows: "repeat(4, 68px)",
      gap: "1px",
      background: "rgba(200,175,130,0.22)",
      borderRadius: 18,
      overflow: "hidden",
      border: "1.5px solid rgba(200,175,130,0.35)",
    }}>
      {/* Center block */}
      <div style={{
        gridRow: "2 / 4", gridColumn: "2 / 4",
        background: "linear-gradient(135deg, rgba(255,250,238,0.98), rgba(248,243,255,0.95))",
        borderTop: "1px solid rgba(200,175,130,0.20)",
        borderBottom: "1px solid rgba(200,175,130,0.20)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 4,
        padding: "8px 4px",
      }}>
        <div style={{
          fontSize: 13, fontFamily: "'Noto Serif SC', serif",
          fontWeight: 700, color: "#28253D", letterSpacing: "0.08em",
        }}>紫微斗数</div>
        <div style={{ width: 28, height: 1, background: "rgba(200,165,90,0.55)" }} />
        <div style={{
          fontSize: 8.5, color: "#8C7860",
          fontFamily: "'Noto Sans SC', sans-serif",
          textAlign: "center", lineHeight: 1.65,
        }}>{profileName}<br />依据出生资料排盘</div>
        <div style={{
          marginTop: 2, padding: "2px 8px", borderRadius: 8,
          background: "rgba(232,129,106,0.12)",
          border: "1px solid rgba(232,129,106,0.28)",
          fontSize: 8, color: "#C05840",
          fontFamily: "'Noto Serif SC', serif", fontWeight: 500,
        }}>{centerLabel}</div>
      </div>

      {/* 12 palace cells */}
      {palaces.map(p => (
        <PalaceCell key={p.id} palace={p} selected={selectedId === p.id} onClick={onSelect} />
      ))}
    </div>
  );
}

// ─── Human-language card ───────────────────────────────────────────────────────
function HumanCard({ title, body, accent, icon }: {
  title: string; body: string; accent: string; icon: string;
}) {
  return (
    <div style={{
      padding: "15px 15px 14px",
      borderRadius: 18,
      background: `linear-gradient(140deg, ${accent}11, rgba(255,255,255,0.82))`,
      border: `1.5px solid ${accent}28`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 9, flexShrink: 0,
          background: `${accent}1E`,
          border: `1px solid ${accent}45`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13,
        }}>{icon}</div>
        <div style={{
          fontSize: 12.5, fontFamily: "'Noto Serif SC', serif",
          fontWeight: 600, color: "#28253D",
        }}>{title}</div>
      </div>
      <div style={{
        fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
        color: "#4A4168", lineHeight: 1.70,
      }}>{body}</div>
    </div>
  );
}

// ─── Domain observation row ────────────────────────────────────────────────────
function DomainCard({ label, body, color }: { label: string; body: string; color: string }) {
  return (
    <div style={{
      padding: "12px 13px",
      borderRadius: 14,
      background: `${color}0D`,
      border: `1px solid ${color}28`,
    }}>
      <div style={{
        fontSize: 10, color, fontFamily: "'Noto Sans SC', sans-serif",
        fontWeight: 500, marginBottom: 6, letterSpacing: "0.04em",
      }}>{label}</div>
      <div style={{
        fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif",
        color: "#4A4168", lineHeight: 1.65,
      }}>{body}</div>
    </div>
  );
}

// ─── Collapsible 专业依据 ──────────────────────────────────────────────────────
function ProfessionalBasis({ viewModel }: { viewModel: FigmaZiweiViewModel }) {
  const [open, setOpen] = useState(false);
  const insight = viewModel.insight!;
  const rows = [
    { label: "排盘体系", value: "紫微斗数 · 安星法" },
    { label: "命宫", value: insight.evidence.mingGong || "待识别" },
    { label: "身宫", value: insight.evidence.shenGong || "待识别" },
    { label: "当前阶段", value: insight.stage.rangeLabel },
    { label: "资料档案", value: viewModel.profileName },
    { label: "注意", value: "本盘依赖精确时辰，请确认出生时间无误" },
  ];

  return (
    <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(200,175,130,0.28)" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", padding: "14px 18px",
        background: "rgba(255,255,255,0.55)", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", color: "#5A5272", fontWeight: 500 }}>
          专业依据
        </span>
        <span style={{
          fontSize: 11, color: "#C0A050",
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform 0.22s ease", display: "inline-block",
        }}>▼</span>
      </button>
      {open && (
        <div style={{ padding: "2px 18px 16px", background: "rgba(255,255,255,0.40)" }}>
          {rows.map(r => (
            <div key={r.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              padding: "8px 0", borderBottom: "1px solid rgba(200,175,130,0.15)", gap: 12,
            }}>
              <span style={{ fontSize: 11.5, color: "#8C7860", fontFamily: "'Noto Sans SC', sans-serif", flexShrink: 0 }}>
                {r.label}
              </span>
              <span style={{ fontSize: 11.5, color: "#28253D", fontFamily: "'Noto Sans SC', sans-serif", textAlign: "right" }}>
                {r.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 总览 tab ──────────────────────────────────────────────────────────────────
function OverviewTab({ onOpenSheet, onSharePoster, viewModel, palaces }: {
  onOpenSheet: (q: Question[], i: number) => void;
  onSharePoster?: () => void;
  viewModel: FigmaZiweiViewModel;
  palaces: Palace[];
}) {
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);
  const insight = viewModel.insight!;

  function handlePalaceSelect(p: Palace) {
    setSelectedPalace(prev => prev?.id === p.id ? null : p);
  }

  return (
    <>
      {/* Life synthesis */}
      <Card style={{
        padding: "20px 20px 18px", marginBottom: 14,
        background: "linear-gradient(145deg, rgba(233,201,126,0.13), rgba(255,255,255,0.78))",
      }}>
        <div style={{
          fontSize: 10, color: "#C0A050",
          fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500,
          marginBottom: 10, letterSpacing: "0.08em",
        }}>命盘综述</div>
        <div style={{
          fontSize: 17, fontFamily: "'Noto Serif SC', serif",
          fontWeight: 700, color: "#28253D", lineHeight: 1.55,
        }}>
          {viewModel.story?.title || insight.identity.title}<br />
          <span style={{ color: "#8C7040" }}>{viewModel.story?.summary || insight.identity.summary}</span>
        </div>
      </Card>

      {/* 12-palace grid */}
      <Card style={{ padding: "16px 14px 14px", marginBottom: 4 }}>
        <div style={{
          fontSize: 11, fontFamily: "'Noto Serif SC', serif",
          fontWeight: 500, color: "#28253D", marginBottom: 12,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span>十二宫结构</span>
          <span style={{ fontSize: 10, color: "#A09070", fontWeight: 400 }}>点击宫位查看说明</span>
        </div>
        <TwelvePalaceGrid
          selectedId={selectedPalace?.id ?? null}
          onSelect={handlePalaceSelect}
          palaces={palaces}
          profileName={viewModel.profileName}
          centerLabel={insight.evidence.mingGong ? `命宫 · ${insight.evidence.mingGong}` : "十二宫结构"}
        />
      </Card>

      {/* Palace detail bubble */}
      {selectedPalace && (
        <div style={{
          margin: "6px 0 10px",
          padding: "13px 16px",
          borderRadius: 16,
          background: "rgba(255,252,244,0.92)",
          border: "1px solid rgba(200,175,130,0.35)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          transition: "all 0.20s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
            <div style={{
              padding: "2px 9px", borderRadius: 8,
              background: selectedPalace.tag === "命"
                ? "rgba(232,129,106,0.14)"
                : selectedPalace.tag === "身"
                ? "rgba(123,189,224,0.14)"
                : "rgba(200,175,130,0.12)",
              border: `1px solid ${
                selectedPalace.tag === "命" ? "rgba(232,129,106,0.40)"
                : selectedPalace.tag === "身" ? "rgba(123,189,224,0.40)"
                : "rgba(200,175,130,0.28)"
              }`,
              fontSize: 11, fontFamily: "'Noto Serif SC', serif",
              fontWeight: 600,
              color: selectedPalace.tag === "命" ? "#C05840" : selectedPalace.tag === "身" ? "#3878A8" : "#6A5A3A",
            }}>
              {selectedPalace.branch} · {selectedPalace.name}
            </div>
            <span style={{ fontSize: 10.5, color: "#A09070", fontFamily: "'Noto Sans SC', sans-serif" }}>
              {selectedPalace.stars.join(" · ")}
            </span>
          </div>
          <div style={{
            fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
            color: "#3D3758", lineHeight: 1.70,
          }}>{selectedPalace.desc}</div>
        </div>
      )}

      {viewModel.story && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, margin: "10px 0 14px" }}>
          <EditorialStorySections story={viewModel.story} tone="ziwei" />
        </div>
      )}

      {/* Current focus card */}
      <Card style={{
        padding: "18px 18px 16px", marginBottom: 14,
        background: "linear-gradient(140deg, rgba(107,191,160,0.12), rgba(255,255,255,0.80))",
      }}>
        <div style={{
          fontSize: 10, color: "#5A9E80", fontFamily: "'Noto Sans SC', sans-serif",
          fontWeight: 500, marginBottom: 10, letterSpacing: "0.06em",
        }}>最近更值得留意 · {insight.stage.rangeLabel}</div>
        <div style={{
          fontSize: 14.5, fontFamily: "'Noto Serif SC', serif",
          fontWeight: 700, color: "#28253D", marginBottom: 10,
        }}>{insight.today.keyword}</div>
        <div style={{
          fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#4A4168", lineHeight: 1.70,
        }}>
          {insight.stage.summary}
        </div>
      </Card>

      {/* 4 human-language cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <HumanCard
          title="你真正重视什么"
          icon="◆"
          accent="#E8816A"
          body={viewModel.story?.summary || insight.identity.summary}
        />
        <HumanCard
          title="你的工作节奏"
          icon="◉"
          accent="#7BBDE0"
          body={insight.stage.summary}
        />
        <HumanCard
          title="你容易卡在哪里"
          icon="◐"
          accent="#C0ACDE"
          body={insight.environment.drainZone.join("；")}
        />
        <HumanCard
          title="你通常怎么恢复"
          icon="◑"
          accent="#6BBFA0"
          body={insight.environment.stableZone.join("；")}
        />
      </div>

      {/* Domain observations 2×2 */}
      <Card style={{ padding: "18px 16px", marginBottom: 14 }}>
        <div style={{
          fontSize: 12, fontFamily: "'Noto Serif SC', serif",
          fontWeight: 500, color: "#28253D", marginBottom: 13,
        }}>放回生活里看</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          <DomainCard label="关系" color="#E8816A" body={insight.relationship.summary} />
          <DomainCard label="工作" color="#7BBDE0" body={insight.stage.summary} />
          <DomainCard label="让你安心" color="#E9C97E" body={insight.environment.stableZone.join("；")} />
          <DomainCard label="容易累" color="#6BBFA0" body={insight.environment.drainZone.join("；")} />
        </div>
      </Card>

      {/* Question prompts */}
      <Card style={{ padding: "18px 16px", marginBottom: 14 }}>
        <div style={{
          fontSize: 12, fontFamily: "'Noto Serif SC', serif",
          fontWeight: 500, color: "#28253D", marginBottom: 13,
        }}>值得问自己的问题</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {(viewModel.questions ?? []).map((q, i) => (
            <button key={q.id} onClick={() => onOpenSheet(viewModel.questions ?? [], i)} style={{
              width: "100%", textAlign: "left",
              padding: "13px 15px", borderRadius: 14,
              background: ["rgba(233,201,126,0.10)","rgba(232,129,106,0.08)","rgba(107,191,160,0.09)"][i],
              border: `1px solid ${["rgba(233,201,126,0.28)","rgba(232,129,106,0.22)","rgba(107,191,160,0.25)"][i]}`,
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 11,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                background: ["rgba(233,201,126,0.25)","rgba(232,129,106,0.18)","rgba(107,191,160,0.20)"][i],
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9.5, fontWeight: 600, fontFamily: "'Noto Sans SC', sans-serif",
                color: ["#C0A050","#E8816A","#6BBFA0"][i],
              }}>{i + 1}</div>
              <span style={{
                fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
                color: "#28253D", lineHeight: 1.55,
              }}>{q.title}</span>
            </button>
          ))}
        </div>
      </Card>

      <ProfessionalBasis viewModel={viewModel} />

      {/* Share entry */}
      {onSharePoster && (
        <button onClick={onSharePoster} style={{
          width: "100%", padding: "14px 20px", marginTop: 4,
          borderRadius: 18,
          background: "linear-gradient(135deg, rgba(233,201,126,0.22), rgba(255,255,255,0.85))",
          border: "1.5px solid rgba(233,201,126,0.38)",
          backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          <span style={{ fontSize: 15, color: "#B8962A" }}>⊙</span>
          <span style={{ fontSize: 13.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 500, color: "#28253D" }}>
            生成紫微分享卡
          </span>
        </button>
      )}
    </>
  );
}

// ─── 十二宫 tab ────────────────────────────────────────────────────────────────
function PalacesTab({ palaces }: { palaces: Palace[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {palaces.map(p => (
        <Card key={p.id} style={{ padding: "15px 16px 13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: p.tag === "命"
                ? "rgba(232,129,106,0.16)"
                : p.tag === "身"
                ? "rgba(123,189,224,0.16)"
                : "rgba(200,175,130,0.14)",
              border: `1.5px solid ${
                p.tag === "命" ? "rgba(232,129,106,0.45)"
                : p.tag === "身" ? "rgba(123,189,224,0.45)"
                : "rgba(200,175,130,0.30)"
              }`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
              color: p.tag === "命" ? "#C05840" : p.tag === "身" ? "#3878A8" : "#6A5A3A",
            }}>{p.branch}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontSize: 13.5, fontFamily: "'Noto Serif SC', serif",
                  fontWeight: 600, color: "#28253D",
                }}>{p.name}</span>
                {p.tag && (
                  <div style={{
                    padding: "1px 6px", borderRadius: 6,
                    background: (p.tagColor ?? "#E8816A") + "20",
                    border: `1px solid ${p.tagColor ?? "#E8816A"}50`,
                    fontSize: 9.5, color: p.tagColor ?? "#E8816A", fontWeight: 600,
                  }}>{p.tag === "命" ? "命宫" : "身宫"}</div>
                )}
              </div>
              <div style={{
                fontSize: 10.5, color: "#A09070",
                fontFamily: "'Noto Sans SC', sans-serif", marginTop: 2,
              }}>{p.stars.join(" · ")}</div>
            </div>
          </div>
          <div style={{
            fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
            color: "#4A4168", lineHeight: 1.70,
          }}>{p.desc}</div>
        </Card>
      ))}
    </div>
  );
}

// ─── 阶段 tab ──────────────────────────────────────────────────────────────────
function PhaseTab({ viewModel }: { viewModel: FigmaZiweiViewModel }) {
  const insight = viewModel.insight!;
  const phaseEvidence = insight.evidence.palaces
    .filter((palace) => palace.isOriginalPalace || palace.isBodyPalace || palace.majorStars.length > 0)
    .slice(0, 4)
    .map((palace) => `${palace.name}位于${palace.earthlyBranch}宫${palace.majorStars.length ? `，主要星曜：${palace.majorStars.join("、")}` : ""}`);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Current major period */}
      <Card style={{
        padding: "20px 18px 18px",
        background: "linear-gradient(145deg, rgba(233,201,126,0.14), rgba(255,255,255,0.82))",
      }}>
        <div style={{
          fontSize: 10, color: "#C0A050", fontFamily: "'Noto Sans SC', sans-serif",
          fontWeight: 500, marginBottom: 10, letterSpacing: "0.06em",
        }}>当前大限（10年运程）</div>
        <div style={{
          fontSize: 17, fontFamily: "'Noto Serif SC', serif",
          fontWeight: 700, color: "#28253D", marginBottom: 10,
        }}>{insight.stage.rangeLabel}</div>
        <div style={{
          fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#4A4168", lineHeight: 1.72, marginBottom: 14,
        }}>
          {insight.stage.summary}
        </div>
        <div style={{
          padding: "12px 14px", borderRadius: 14,
          background: "rgba(233,201,126,0.12)", border: "1px solid rgba(233,201,126,0.30)",
        }}>
          <div style={{
            fontSize: 10, color: "#C0A050", fontFamily: "'Noto Sans SC', sans-serif",
            marginBottom: 7, letterSpacing: "0.04em",
          }}>这个阶段需要注意</div>
          {insight.today.avoidList.slice(0, 3).map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: 8, alignItems: "flex-start",
              padding: "5px 0",
              borderBottom: i < 2 ? "1px solid rgba(200,175,130,0.18)" : "none",
            }}>
              <span style={{ fontSize: 8, color: "#C0A050", marginTop: 5 }}>◆</span>
              <span style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#3D3758", lineHeight: 1.65 }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Current year */}
      <Card style={{
        padding: "16px 18px",
        background: "linear-gradient(145deg, rgba(107,191,160,0.11), rgba(255,255,255,0.82))",
      }}>
        <div style={{
          fontSize: 10, color: "#5A9E80", fontFamily: "'Noto Sans SC', sans-serif",
          fontWeight: 500, marginBottom: 8, letterSpacing: "0.06em",
        }}>最近这段时间</div>
        <div style={{
          fontSize: 13.5, fontFamily: "'Noto Serif SC', serif",
          fontWeight: 600, color: "#28253D", marginBottom: 8,
        }}>{insight.today.keyword}</div>
        <div style={{
          fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#4A4168", lineHeight: 1.70,
        }}>
          {insight.today.summary}
        </div>
      </Card>

      {/* Stage evidence */}
      <Card style={{ padding: "16px 18px" }}>
        <div style={{
          fontSize: 12, fontFamily: "'Noto Serif SC', serif",
          fontWeight: 500, color: "#28253D", marginBottom: 14,
        }}>为什么这样看</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {phaseEvidence.map((item, index) => (
            <div key={`${item}-${index}`} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "11px 13px", borderRadius: 14,
              background: index === 0
                ? "linear-gradient(135deg, rgba(233,201,126,0.14), rgba(255,255,255,0.85))"
                : "rgba(255,255,255,0.45)",
              border: index === 0
                ? "1.5px solid rgba(233,201,126,0.45)"
                : "1px solid rgba(200,175,130,0.18)",
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 6,
                background: index === 0 ? "#E9C97E" : "rgba(200,175,130,0.40)",
                boxShadow: index === 0 ? "0 0 6px rgba(233,201,126,0.60)" : "none",
              }} />
              <span style={{
                fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif",
                color: "#4A4168", lineHeight: 1.65,
              }}>{item}</span>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 12, padding: "10px 13px", borderRadius: 12,
          background: "rgba(238,233,248,0.50)",
          fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#A094B8", lineHeight: 1.65,
        }}>
          这里只展示现有出生资料能支持的阶段范围，不补写没有依据的前后大限。阶段内容用来理解背景与倾向，不代表固定结果。
        </div>
      </Card>
    </div>
  );
}

// ─── Insufficient data state ───────────────────────────────────────────────────
function IncompleteState({ onCompleteProfile, onBack }: { onCompleteProfile: () => void; onBack: () => void }) {
  return (
    <div style={{ padding: "20px 18px 100px", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Explanation card */}
      <Card style={{ padding: "28px 22px 24px", textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 18, margin: "0 auto 16px",
          background: "linear-gradient(135deg, rgba(233,201,126,0.20), rgba(255,248,225,0.80))",
          border: "1.5px solid rgba(233,201,126,0.40)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24,
        }}>⊙</div>
        <div style={{
          fontSize: 16, fontFamily: "'Noto Serif SC', serif",
          fontWeight: 700, color: "#28253D", marginBottom: 14,
        }}>还需要补充两项信息</div>
        <div style={{
          fontSize: 13.5, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#4A4168", lineHeight: 1.75, marginBottom: 18,
        }}>
          紫微斗数排盘需要<strong style={{ color: "#28253D" }}>精确到时辰的出生时间</strong>和<strong style={{ color: "#28253D" }}>性别</strong>。
          这两项信息决定了命宫的位置，而命宫是整张命盘的核心。
        </div>
        {/* Warning box */}
        <div style={{
          padding: "14px 16px", borderRadius: 14,
          background: "rgba(233,201,126,0.10)",
          border: "1px solid rgba(233,201,126,0.35)",
          textAlign: "left",
        }}>
          <div style={{
            fontSize: 10.5, color: "#C0A050",
            fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500,
            marginBottom: 8, letterSpacing: "0.04em",
          }}>为什么不能默认时间</div>
          <div style={{
            fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
            color: "#4A4168", lineHeight: 1.70,
          }}>
            出生时辰不同，命宫位置会完全不同，解读结果没有可比性。使用正午时间或随机时辰会产生误导性的解读，因此我们不会默认填充。
          </div>
        </div>
      </Card>

      {/* What can still be used */}
      <Card style={{ padding: "16px 18px" }}>
        <div style={{
          fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#5A5272", fontWeight: 500, marginBottom: 12,
        }}>已有数据可以使用</div>
        {[
          { label: "生辰八字", sub: "仅需年月日，已可解读" },
          { label: "本命星盘", sub: "西洋占星，时辰精度要求较低" },
          { label: "性格图谱", sub: "基于多维度问答，无需出生时间" },
        ].map(item => (
          <div key={item.label} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 0", borderBottom: "1px solid rgba(180,160,220,0.12)",
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#6BBFA0", flexShrink: 0,
            }} />
            <div>
              <div style={{ fontSize: 12.5, color: "#28253D", fontFamily: "'Noto Sans SC', sans-serif" }}>
                {item.label}
              </div>
              <div style={{ fontSize: 11, color: "#9088A8", fontFamily: "'Noto Sans SC', sans-serif", marginTop: 1 }}>
                {item.sub}
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Actions */}
      <button onClick={onCompleteProfile} style={{
        width: "100%", padding: "15px 20px",
        borderRadius: 18,
        background: "linear-gradient(135deg, #F6EACC, #E9C97E)",
        border: "none", cursor: "pointer",
        fontSize: 14, fontFamily: "'Noto Serif SC', serif",
        fontWeight: 600, color: "#5A3E10",
        boxShadow: "0 6px 20px rgba(200,160,60,0.28)",
      }}>补充资料</button>

      <button onClick={onBack} style={{
        width: "100%", padding: "14px 20px",
        borderRadius: 18,
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(200,175,130,0.35)",
        cursor: "pointer",
        fontSize: 13.5, fontFamily: "'Noto Sans SC', sans-serif",
        color: "#5A5272",
      }}>查看可用报告</button>
    </div>
  );
}

// ─── ZiweiScreen ───────────────────────────────────────────────────────────────
interface ZiweiProps {
  onBack: () => void;
  onOpenSheet: (questions: Question[], index: number) => void;
  onSharePoster?: () => void;
  onCompleteProfile: () => void;
  viewModel: FigmaZiweiViewModel;
}

export default function ZiweiScreen({ onBack, onOpenSheet, onSharePoster, onCompleteProfile, viewModel }: ZiweiProps) {
  const [tab, setTab] = useState(0);
  const palaces = palacesFromViewModel(viewModel);
  const isReady = viewModel.status === "ready" && Boolean(viewModel.insight);

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(168deg, #FFF8EE 0%, #F6F0E8 35%, #EEF3FF 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Noto Sans SC', sans-serif",
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: "52px 20px 14px",
        background: "rgba(255,250,238,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(200,175,130,0.22)",
        flexShrink: 0,
      }}>
        {/* Top row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14, marginBottom: 14,
        }}>
          <button onClick={onBack} style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(255,255,255,0.80)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(200,175,130,0.30)",
            cursor: "pointer", fontSize: 14, color: "#C0A050",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(160,130,60,0.10)",
          }}>←</button>

          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 17, fontFamily: "'Noto Serif SC', serif",
              fontWeight: 700, color: "#28253D", letterSpacing: "0.06em",
            }}>紫微斗数</div>
          </div>

          {/* Profile chip */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 12px 5px 8px", borderRadius: 20,
            background: "rgba(255,255,255,0.78)",
            border: "1px solid rgba(200,175,130,0.30)",
            boxShadow: "0 2px 8px rgba(160,130,60,0.08)",
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: "linear-gradient(135deg, #F6EACC, #E9C97E)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, color: "#5A3E10", fontWeight: 700,
            }}>{viewModel.profileInitial}</div>
            <span style={{ fontSize: 12, color: "#28253D" }}>{viewModel.profileName}</span>
          </div>
        </div>

        {/* Segmented control */}
        {isReady && (
          <Seg tabs={["总览", "十二宫", "阶段"]} active={tab} onChange={setTab} />
        )}
      </div>

      {/* ── Content ── */}
      {viewModel.status === "loading" ? (
        <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 24 }}>
          <Card style={{ padding: "28px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 12 }}>◎</div>
            <div style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D", marginBottom: 8 }}>正在整理十二宫结构</div>
            <div style={{ fontSize: 12.5, color: "#6B607E", lineHeight: 1.7 }}>正在根据你的出生时间排列十二宫；不知道的资料不会替你猜。</div>
          </Card>
        </div>
      ) : viewModel.status === "insufficient_input" ? (
        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
          <IncompleteState onCompleteProfile={onCompleteProfile} onBack={onBack} />
        </div>
      ) : viewModel.status === "calculation_error" ? (
        <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 24 }}>
          <Card style={{ padding: "28px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D", marginBottom: 8 }}>这次没有生成成功</div>
            <div style={{ fontSize: 12.5, color: "#6B607E", lineHeight: 1.7 }}>{viewModel.error || "请检查出生资料后重试。"}</div>
          </Card>
        </div>
      ) : (
        <div style={{
          flex: 1, overflowY: "auto", overflowX: "hidden",
          padding: "16px 18px 100px",
          scrollbarWidth: "none",
        }}>
          {tab === 0 && <OverviewTab viewModel={viewModel} palaces={palaces} onOpenSheet={onOpenSheet} onSharePoster={onSharePoster} />}
          {tab === 1 && <PalacesTab palaces={palaces} />}
          {tab === 2 && <PhaseTab viewModel={viewModel} />}
        </div>
      )}
    </div>
  );
}
