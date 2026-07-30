import { useState } from "react";
import { ChevronLeft } from "lucide-react";

export interface ProfileFormData {
  name: string;
  gender: "未选" | "女" | "男";
  calType: "公历" | "农历";
  year: number;
  month: number;
  day: number;
  shichen: number; // 0–11, -1 = unknown
  city: string;
  citySkipped: boolean;
}

interface CreateProfileProps {
  onBack: () => void;
  onComplete: (data: ProfileFormData) => void;
}

const SHICHEN = [
  { zh: "子", range: "23–01", index: 0 },
  { zh: "丑", range: "01–03", index: 1 },
  { zh: "寅", range: "03–05", index: 2 },
  { zh: "卯", range: "05–07", index: 3 },
  { zh: "辰", range: "07–09", index: 4 },
  { zh: "巳", range: "09–11", index: 5 },
  { zh: "午", range: "11–13", index: 6 },
  { zh: "未", range: "13–15", index: 7 },
  { zh: "申", range: "15–17", index: 8 },
  { zh: "酉", range: "17–19", index: 9 },
  { zh: "戌", range: "19–21", index: 10 },
  { zh: "亥", range: "21–23", index: 11 },
];

const CUR_YEAR = 2026;
const YEARS = Array.from({ length: 100 }, (_, i) => CUR_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.70)",
  backdropFilter: "blur(20px) saturate(160%)",
  WebkitBackdropFilter: "blur(20px) saturate(160%)",
  border: "1px solid rgba(255,255,255,0.90)",
  borderRadius: 20,
  boxShadow: "0 4px 20px rgba(160,130,200,0.09)",
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, letterSpacing: "0.10em", color: "#9088A8",
      fontFamily: "'Noto Sans SC', sans-serif",
      marginBottom: 8, paddingLeft: 2,
    }}>{children}</div>
  );
}

function SelectBox({
  value, onChange, children, style
}: {
  value: number | string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        flex: 1,
        padding: "11px 10px",
        borderRadius: 14,
        border: "1.5px solid rgba(192,172,222,0.30)",
        background: "rgba(255,255,255,0.80)",
        fontSize: 14,
        fontFamily: "'Noto Sans SC', sans-serif",
        color: "#28253D",
        appearance: "none",
        WebkitAppearance: "none",
        outline: "none",
        ...style,
      }}
    >{children}</select>
  );
}

export default function CreateProfileScreen({ onBack, onComplete }: CreateProfileProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"未选" | "女" | "男">("未选");
  const [calType, setCalType] = useState<"公历" | "农历">("公历");
  const [year, setYear] = useState(1995);
  const [month, setMonth] = useState(6);
  const [day, setDay] = useState(15);
  const [shichen, setShichen] = useState(-1);
  const [uncertain, setUncertain] = useState(false);
  const [city, setCity] = useState("");
  const [citySkipped, setCitySkipped] = useState(false);

  function handleBack() {
    if (step === 0) onBack();
    else setStep(s => s - 1);
  }

  function handleNext() {
    if (step < 2) {
      setStep(s => s + 1);
    } else {
      onComplete({
        name: name.trim() || "朋友", gender, calType, year, month, day,
        shichen: uncertain ? -1 : shichen, city, citySkipped,
      });
    }
  }

  const canNext =
    step === 0 ? true :
    step === 1 ? (uncertain || shichen >= 0) :
    (citySkipped || city.trim().length > 0);

  const primaryLabel = step === 2 ? "建立我的观察档案" : "下一步";

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(168deg, #F4F0FF 0%, #EEF9F4 50%, #FDF4F1 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Noto Sans SC', sans-serif",
      overflow: "hidden", // outer shell never scrolls
    }}>
      {/* ── Status bar ── */}
      <div style={{ height: 52, flexShrink: 0 }} />

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "0 20px 14px", gap: 12, flexShrink: 0,
      }}>
        <button onClick={handleBack} style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "rgba(255,255,255,0.70)",
          border: "1px solid rgba(192,172,222,0.28)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}>
          <ChevronLeft size={18} color="#5A5272" />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 16, fontFamily: "'Noto Serif SC', serif",
            fontWeight: 600, color: "#28253D",
          }}>建立观察档案</div>
          <div style={{ fontSize: 11.5, color: "#9088A8", marginTop: 1 }}>
            {step === 0 ? "基本信息" : step === 1 ? "出生时间" : "出生地点"}
          </div>
        </div>
        {/* Step indicator dots */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: i === step ? 18 : 7, height: 7, borderRadius: 4,
              background: i === step ? "#E8816A" : i < step ? "#6BBFA0" : "rgba(192,172,222,0.40)",
              transition: "all 0.25s",
            }} />
          ))}
        </div>
      </div>

      {/* ── Scrollable content area ── */}
      <div style={{
        flex: 1,
        overflowY: "auto", overflowX: "hidden",
        scrollbarWidth: "none",
        padding: "0 22px 16px",
      }}>

        {/* ── Step 0: Name + Gender ── */}
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...glass, padding: "22px 20px" }}>
              <div style={{
                fontSize: 18, fontFamily: "'Noto Serif SC', serif", fontWeight: 600,
                color: "#28253D", marginBottom: 4,
              }}>怎么称呼你？</div>
              <div style={{ fontSize: 13, color: "#7B6E94", marginBottom: 20 }}>
                起个名字方便之后区分不同档案
              </div>
              <Label>昵称</Label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="随便写，只在你的设备里"
                maxLength={16}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "12px 14px", borderRadius: 14,
                  border: "1.5px solid rgba(192,172,222,0.35)",
                  background: "rgba(255,255,255,0.82)",
                  fontSize: 15, fontFamily: "'Noto Sans SC', sans-serif",
                  color: "#28253D", outline: "none",
                }}
              />
            </div>

            <div style={{ ...glass, padding: "20px" }}>
              <Label>性别（可选）</Label>
              <div style={{ display: "flex", gap: 10 }}>
                {(["未选", "女", "男"] as const).map(g => (
                  <button key={g} onClick={() => setGender(g)} style={{
                    flex: 1, padding: "11px 0", borderRadius: 14,
                    border: gender === g ? "1.5px solid #E8816A" : "1.5px solid rgba(192,172,222,0.30)",
                    background: gender === g ? "rgba(232,129,106,0.10)" : "rgba(255,255,255,0.70)",
                    cursor: "pointer",
                    fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif",
                    color: gender === g ? "#E8816A" : "#5A5272",
                    fontWeight: gender === g ? 500 : 400,
                  }}>{g}</button>
                ))}
              </div>
              <div style={{
                fontSize: 11.5, color: "#A8A0BC", marginTop: 10, lineHeight: 1.6,
              }}>
                性别影响某些命理结构的解读方式。若不选则显示通用内容。
              </div>
            </div>

            {/* Privacy note */}
            <div style={{
              padding: "13px 16px", borderRadius: 16,
              background: "rgba(233,201,126,0.10)",
              border: "1px solid rgba(233,201,126,0.28)",
              fontSize: 12, color: "#7B6530", lineHeight: 1.65,
            }}>
              所有信息仅在你的设备上处理，不会上传或储存在任何服务器上。
            </div>
          </div>
        )}

        {/* ── Step 1: Date + Time ── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...glass, padding: "20px" }}>
              <div style={{
                fontSize: 17, fontFamily: "'Noto Serif SC', serif", fontWeight: 600,
                color: "#28253D", marginBottom: 4,
              }}>你出生在什么时候？</div>
              <div style={{ fontSize: 13, color: "#7B6E94", marginBottom: 18 }}>
                这是计算命盘最核心的数据
              </div>

              {/* Cal toggle */}
              <Label>历法</Label>
              <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                {(["公历", "农历"] as const).map(t => (
                  <button key={t} onClick={() => setCalType(t)} style={{
                    flex: 1, padding: "10px 0", borderRadius: 12,
                    border: calType === t ? "1.5px solid #7BBDE0" : "1.5px solid rgba(192,172,222,0.28)",
                    background: calType === t ? "rgba(123,189,224,0.12)" : "rgba(255,255,255,0.65)",
                    cursor: "pointer",
                    fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif",
                    color: calType === t ? "#3A8CB4" : "#5A5272",
                    fontWeight: calType === t ? 500 : 400,
                  }}>{t}</button>
                ))}
              </div>

              {/* Year/Month/Day */}
              <Label>日期</Label>
              <div style={{ display: "flex", gap: 8 }}>
                <SelectBox value={year} onChange={v => setYear(Number(v))}>
                  {YEARS.map(y => <option key={y} value={y}>{y}年</option>)}
                </SelectBox>
                <SelectBox value={month} onChange={v => setMonth(Number(v))} style={{ flex: "0 0 76px" }}>
                  {MONTHS.map(m => <option key={m} value={m}>{m}月</option>)}
                </SelectBox>
                <SelectBox value={day} onChange={v => setDay(Number(v))} style={{ flex: "0 0 68px" }}>
                  {DAYS.map(d => <option key={d} value={d}>{d}日</option>)}
                </SelectBox>
              </div>
            </div>

            <div style={{ ...glass, padding: "20px" }}>
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <Label>出生时辰</Label>
                <button
                  onClick={() => { setUncertain(u => !u); setShichen(-1); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif",
                    color: uncertain ? "#6BBFA0" : "#9088A8",
                    padding: 0, marginBottom: 8,
                  }}>
                  <div style={{
                    width: 28, height: 16, borderRadius: 8,
                    background: uncertain ? "#6BBFA0" : "rgba(192,172,222,0.35)",
                    position: "relative", transition: "background 0.2s", flexShrink: 0,
                  }}>
                    <div style={{
                      position: "absolute", top: 2, left: uncertain ? 13 : 2,
                      width: 12, height: 12, borderRadius: "50%",
                      background: "#fff", transition: "left 0.2s",
                    }} />
                  </div>
                  时辰不确定
                </button>
              </div>

              {uncertain ? (
                <div style={{
                  padding: "14px 16px", borderRadius: 14,
                  background: "rgba(208,234,224,0.35)",
                  border: "1px solid rgba(107,191,160,0.22)",
                  fontSize: 13, color: "#4A6E5E", lineHeight: 1.65,
                }}>
                  时辰不确定时，紫微斗数报告无法生成，但八字总览和本命星盘的基础内容仍然可用。若日后确认了出生时间可以补充。
                </div>
              ) : (
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7,
                }}>
                  {SHICHEN.map(s => (
                    <button key={s.index} onClick={() => setShichen(s.index)} style={{
                      padding: "9px 0 7px",
                      borderRadius: 12,
                      border: shichen === s.index ? "1.5px solid #7BBDE0" : "1.5px solid rgba(192,172,222,0.28)",
                      background: shichen === s.index ? "rgba(123,189,224,0.14)" : "rgba(255,255,255,0.65)",
                      cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                    }}>
                      <span style={{
                        fontSize: 15, fontFamily: "'Noto Serif SC', serif",
                        color: shichen === s.index ? "#2A7FAA" : "#28253D",
                        fontWeight: shichen === s.index ? 600 : 400,
                      }}>{s.zh}</span>
                      <span style={{
                        fontSize: 9, color: shichen === s.index ? "#5AAAD0" : "#9088A8",
                      }}>{s.range}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: City ── */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...glass, padding: "22px 20px" }}>
              <div style={{
                fontSize: 17, fontFamily: "'Noto Serif SC', serif", fontWeight: 600,
                color: "#28253D", marginBottom: 4,
              }}>你出生在哪里？</div>
              <div style={{ fontSize: 13, color: "#7B6E94", marginBottom: 20, lineHeight: 1.6 }}>
                用于校正太阳时，影响行星位置精度。不记得也没关系。
              </div>

              <Label>出生城市</Label>
              <input
                value={city}
                onChange={e => { setCity(e.target.value); setCitySkipped(false); }}
                placeholder="例：北京、上海、成都…"
                disabled={citySkipped}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "12px 14px", borderRadius: 14,
                  border: "1.5px solid rgba(192,172,222,0.35)",
                  background: citySkipped ? "rgba(240,240,248,0.60)" : "rgba(255,255,255,0.82)",
                  fontSize: 15, fontFamily: "'Noto Sans SC', sans-serif",
                  color: citySkipped ? "#B0A8C8" : "#28253D", outline: "none",
                  marginBottom: 14,
                }}
              />

              <button
                onClick={() => { setCitySkipped(s => !s); if (!citySkipped) setCity(""); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "none", border: "none", cursor: "pointer", padding: "2px 0",
                }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  border: `1.5px solid ${citySkipped ? "#6BBFA0" : "rgba(192,172,222,0.45)"}`,
                  background: citySkipped ? "#6BBFA0" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.18s",
                }}>
                  {citySkipped && <span style={{ color: "#fff", fontSize: 11, lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{
                  fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
                  color: citySkipped ? "#4A6E5E" : "#7B6E94",
                }}>记不清出生城市，暂时跳过</span>
              </button>
            </div>

            <div style={{
              padding: "13px 16px", borderRadius: 16,
              background: "rgba(233,201,126,0.10)",
              border: "1px solid rgba(233,201,126,0.28)",
              fontSize: 12, color: "#7B6530", lineHeight: 1.65,
            }}>
              所有信息仅在你的设备上处理，不会上传或储存在任何服务器上。
            </div>
          </div>
        )}

        {/* Bottom breathing room so content clears sticky footer */}
        <div style={{ height: 12 }} />
      </div>

      {/* ── Sticky action footer ── */}
      <div style={{
        flexShrink: 0,
        padding: "12px 22px 36px",
        background: "rgba(250,248,252,0.82)",
        backdropFilter: "blur(18px) saturate(150%)",
        WebkitBackdropFilter: "blur(18px) saturate(150%)",
        borderTop: "1px solid rgba(192,172,222,0.16)",
      }}>
        <button
          onClick={handleNext}
          disabled={!canNext}
          style={{
            width: "100%", height: 52,
            borderRadius: 20,
            background: canNext
              ? "linear-gradient(135deg, #F5C4B8, #E8816A)"
              : "rgba(220,210,235,0.60)",
            border: "none",
            cursor: canNext ? "pointer" : "default",
            fontSize: 15,
            fontFamily: "'Noto Serif SC', serif",
            fontWeight: 600,
            color: canNext ? "#FFFFFF" : "#B0A8C8",
            boxShadow: canNext ? "0 6px 22px rgba(232,129,106,0.32)" : "none",
            letterSpacing: "0.04em",
            transition: "all 0.18s",
          }}
        >{primaryLabel}</button>
      </div>
    </div>
  );
}
