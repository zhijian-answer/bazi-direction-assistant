import { useState } from "react";
import {
  Smartphone, ChevronRight, FileText, Users,
  Shield, FileWarning, Info, Sparkles, ChevronsUpDown,
} from "lucide-react";
import type { MobileProfile } from "@/lib/mobile/types";

interface ProfileScreenProps {
  onOpenSwitcher: () => void;
  onOpenLoginInfo: () => void;
  onWelcome: () => void;
  onGoToReports: () => void;
  onGoToCompatibilityHistory: () => void;
  onGoToPrivacy: () => void;
  onGoToTerms: () => void;
  onGoToAbout: () => void;
  accountName?: string;
  profile: MobileProfile;
}

// ── Shared glass card ─────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(22px) saturate(180%)",
      WebkitBackdropFilter: "blur(22px) saturate(180%)",
      border: "1px solid rgba(255,255,255,0.90)",
      borderRadius: 22,
      boxShadow: "0 4px 20px rgba(160,130,200,0.10)",
      overflow: "hidden",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, letterSpacing: "0.10em", color: "#9088A8",
      fontFamily: "'Noto Sans SC', sans-serif",
      padding: "0 4px 8px",
    }}>{children}</div>
  );
}

// ── Row item ─────────────────────────────────────────────────────────────────
function RowItem({
  icon, label, sub, accent, onTap, last,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  accent?: string;
  onTap?: () => void;
  last?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onTap}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: "100%", display: "flex", alignItems: "center",
        gap: 14, padding: "14px 18px",
        background: pressed ? "rgba(238,233,248,0.50)" : "transparent",
        border: "none", cursor: onTap ? "pointer" : "default",
        borderBottom: last ? "none" : "1px solid rgba(192,172,222,0.12)",
        transition: "background 0.12s",
        textAlign: "left",
      }}>
      {/* Icon bubble */}
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: accent ? `${accent}18` : "rgba(192,172,222,0.14)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#28253D", fontWeight: 400,
        }}>{label}</div>
        {sub && (
          <div style={{
            fontSize: 11.5, color: "#9088A8",
            fontFamily: "'Noto Sans SC', sans-serif", marginTop: 2,
          }}>{sub}</div>
        )}
      </div>
      {onTap && <ChevronRight size={15} color="#C0ACDE" />}
    </button>
  );
}

// ── Completeness bar ──────────────────────────────────────────────────────────
function CompletenessBar({ value }: { value: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        flex: 1, height: 5, borderRadius: 3,
        background: "rgba(192,172,222,0.22)", overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: 3,
          width: `${value}%`,
          background: value >= 80
            ? "linear-gradient(90deg, #6BBFA0, #7BBDE0)"
            : "linear-gradient(90deg, #E9C97E, #E8816A)",
          transition: "width 0.6s ease",
        }} />
      </div>
      <span style={{
        fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif",
        color: value >= 80 ? "#4A8E7A" : "#B07040",
        fontWeight: 500, flexShrink: 0,
      }}>{value}%</span>
    </div>
  );
}

// ── ProfileScreen ─────────────────────────────────────────────────────────────
export default function ProfileScreen({
  onOpenSwitcher,
  onOpenLoginInfo,
  onWelcome,
  onGoToReports,
  onGoToCompatibilityHistory,
  onGoToPrivacy,
  onGoToTerms,
  onGoToAbout,
  accountName,
  profile,
}: ProfileScreenProps) {
  const profileColor = "#6BBFA0";
  const profileInitial = profile.name.trim().slice(0, 1) || "档";
  const completeness = profile.completeness ?? Math.round(([profile.name, profile.birthDate, profile.birthPlace, profile.birthTimeKnown ? profile.birthTime : "未知时辰"].filter(Boolean).length / 4) * 100);
  const storageLabel = profile.syncStatus === "synced" ? "已同步" : profile.syncStatus === "pending" ? "正在同步" : "未同步";
  const canViewZiwei = profile.birthTimeKnown && Boolean(profile.birthTime) && profile.gender !== "other";
  const storageTitle = profile.syncStatus === "synced" ? "出生资料已经同步保存" : profile.syncStatus === "pending" ? "出生资料正在同步" : "出生资料目前只保存在这台设备";
  const storageDescription = profile.syncStatus === "synced"
    ? "这台设备仍保留一份资料，换设备登录后也能继续查看。"
    : profile.syncStatus === "pending"
      ? "同步完成前请不要清理浏览器数据；失败时可以重新尝试。"
      : "如果准备清理浏览器数据，记得先登录同步，避免出生资料和记录一起消失。";

  const [welcomePressed, setWelcomePressed] = useState(false);

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(168deg, #F4F0FF 0%, #EEF9F4 44%, #FDF4F1 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Noto Sans SC', sans-serif",
      overflow: "hidden",
    }}>
      {/* Status bar spacer */}
      <div style={{ height: 52, flexShrink: 0 }} />

      {/* Header */}
      <div style={{
        padding: "0 22px 16px", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{
          fontSize: 22, fontFamily: "'Noto Serif SC', serif",
          fontWeight: 700, color: "#28253D",
        }}>我的</div>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "5px 12px 5px 8px", borderRadius: 20,
          background: "rgba(255,255,255,0.70)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(192,172,222,0.25)",
          boxShadow: "0 2px 10px rgba(160,130,200,0.09)",
        }}>
          <Smartphone size={12} color="#9088A8" />
          <span style={{ fontSize: 11.5, color: "#9088A8", fontFamily: "'Noto Sans SC', sans-serif" }}>
            {storageLabel}
          </span>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{
        flex: 1, overflowY: "auto", overflowX: "hidden",
        scrollbarWidth: "none", padding: "0 18px 100px",
      }}>

        {/* ── Archive Hero ── */}
        <div style={{ marginBottom: 22 }}>
          <Card>
            {/* Top: avatar + name + manage button */}
            <div style={{
              padding: "20px 20px 16px",
              borderBottom: "1px solid rgba(192,172,222,0.13)",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              {/* Avatar */}
              <div style={{
                width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                background: `linear-gradient(135deg, ${profileColor}DD, ${profileColor}77)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontFamily: "'Noto Serif SC', serif",
                fontWeight: 700, color: "#fff",
                boxShadow: `0 4px 16px ${profileColor}44`,
              }}>{profileInitial}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 18, fontFamily: "'Noto Serif SC', serif",
                  fontWeight: 700, color: "#28253D", marginBottom: 4,
                }}>{profile.name}</div>
                {/* Storage badge */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "3px 9px", borderRadius: 10,
                  background: "rgba(208,234,224,0.40)",
                  border: "1px solid rgba(107,191,160,0.28)",
                }}>
                  <Smartphone size={10} color="#4A8E7A" />
                  <span style={{
                    fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif",
                    color: "#4A8E7A",
                  }}>{storageLabel}</span>
                </div>
              </div>

              {/* Switch/manage button */}
              <button onClick={onOpenSwitcher} style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "8px 14px", borderRadius: 14,
                background: "rgba(232,129,106,0.10)",
                border: "1.5px solid rgba(232,129,106,0.28)",
                cursor: "pointer",
                fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
                color: "#C0604A", fontWeight: 500,
              }}>
                <ChevronsUpDown size={13} color="#C0604A" />
                切换
              </button>
            </div>

            {/* Birth data + completeness */}
            <div style={{ padding: "16px 20px 18px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
                {[
                  { label: "出生日期", value: profile.birthDate || "待补充" },
                  { label: "出生时辰", value: profile.birthTimeKnown && profile.birthTime ? profile.birthTime : "未知时辰" },
                  { label: "出生地点", value: profile.birthPlace || "待补充" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      fontSize: 11.5, color: "#9088A8",
                      fontFamily: "'Noto Sans SC', sans-serif",
                      width: 52, flexShrink: 0,
                    }}>{item.label}</span>
                    <span style={{
                      fontSize: 13.5, color: "#28253D",
                      fontFamily: "'Noto Sans SC', sans-serif",
                    }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 6 }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  marginBottom: 6,
                }}>
                  <span style={{
                    fontSize: 11.5, color: "#7B6E94",
                    fontFamily: "'Noto Sans SC', sans-serif",
                  }}>档案完整度</span>
                  <span style={{
                    fontSize: 11.5, color: "#7B6E94",
                    fontFamily: "'Noto Sans SC', sans-serif",
                  }}>{canViewZiwei ? "可查看生辰、星盘与紫微" : "生辰与部分星盘可用，紫微仍需准确时辰和性别"}</span>
                </div>
                <CompletenessBar value={completeness} />
              </div>
            </div>
          </Card>
        </div>

        {/* ── Local privacy card ── */}
        <div style={{ marginBottom: 22 }}>
          <Card style={{ background: "rgba(208,234,224,0.35)", border: "1px solid rgba(107,191,160,0.22)" }}>
            <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: "rgba(107,191,160,0.20)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Shield size={17} color="#4A8E7A" />
              </div>
              <div>
                <div style={{
                  fontSize: 13.5, fontFamily: "'Noto Serif SC', serif",
                  fontWeight: 500, color: "#28253D", marginBottom: 3,
                }}>{storageTitle}</div>
                <div style={{
                  fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif",
                  color: "#4A6E5E", lineHeight: 1.6,
                }}>{storageDescription}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Report history ── */}
        <div style={{ marginBottom: 22 }}>
          <SectionLabel>报告与记录</SectionLabel>
          <Card>
            <RowItem
              icon={<FileText size={16} color="#7BBDE0" />}
              label="最近报告"
              sub="继续查看生辰、星盘和紫微报告"
              accent="#7BBDE0"
              onTap={onGoToReports}
            />
            <RowItem
              icon={<Users size={16} color="#6BBFA0" />}
              label="合盘记录"
              sub="回看两个人的相处方式与建议"
              accent="#6BBFA0"
              onTap={onGoToCompatibilityHistory}
              last
            />
          </Card>
        </div>

        {/* ── Deferred login card ── */}
        <div style={{ marginBottom: 22 }}>
          <Card style={{
            background: "linear-gradient(140deg, rgba(244,240,255,0.85), rgba(255,255,255,0.70))",
            border: "1px solid rgba(192,172,222,0.28)",
          }}>
            <div style={{ padding: "18px 20px" }}>
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 14,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                  background: "rgba(192,172,222,0.22)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Sparkles size={18} color="#9074C4" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 14, fontFamily: "'Noto Serif SC', serif",
                    fontWeight: 500, color: "#28253D", marginBottom: 6,
                  }}>{accountName ? `已登录：${accountName}` : "登录后可跨设备恢复与管理多个档案"}</div>
                  <div style={{
                    fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
                    color: "#5A5272", lineHeight: 1.65, marginBottom: 14,
                  }}>
                    {accountName ? "当前档案可以主动同步到云端，本机内容仍会保留。" : "换机时不丢失档案，在多台设备上查看报告。你可以随时选择登录。"}
                  </div>
                  <button onClick={onOpenLoginInfo} style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "7px 14px", borderRadius: 12,
                    background: "rgba(192,172,222,0.22)",
                    border: "1.5px solid rgba(192,172,222,0.38)",
                    cursor: "pointer",
                    fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
                    color: "#6B5A9A", fontWeight: 500,
                  }}>
                    {accountName ? "管理同步" : "了解保存方式"}
                    <ChevronRight size={12} color="#9074C4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Settings ── */}
        <div style={{ marginBottom: 22 }}>
          <SectionLabel>设置与支持</SectionLabel>
          <Card>
            <RowItem
              icon={<Shield size={16} color="#6BBFA0" />}
              label="数据与隐私"
              accent="#6BBFA0"
              onTap={onGoToPrivacy}
            />
            <RowItem
              icon={<FileWarning size={16} color="#E9C97E" />}
              label="免责声明"
              accent="#E9C97E"
              onTap={onGoToTerms}
            />
            <RowItem
              icon={<Info size={16} color="#7BBDE0" />}
              label="关于玄枢"
              sub="版本 1.0.0"
              accent="#7BBDE0"
              onTap={onGoToAbout}
              last
            />
          </Card>
        </div>

        {/* ── Onboarding re-entry ── */}
        <div style={{ marginBottom: 8 }}>
          <button
            onClick={onWelcome}
            onPointerDown={() => setWelcomePressed(true)}
            onPointerUp={() => setWelcomePressed(false)}
            onPointerLeave={() => setWelcomePressed(false)}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              gap: 12, padding: "13px 18px",
              borderRadius: 18,
              background: welcomePressed
                ? "rgba(255,255,255,0.60)"
                : "rgba(255,255,255,0.45)",
              border: "1.5px dashed rgba(192,172,222,0.30)",
              cursor: "pointer", textAlign: "left",
              transition: "background 0.12s",
            }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: "rgba(244,240,255,0.80)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14,
            }}>◎</div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
                color: "#7B6E94",
              }}>重新查看使用介绍</div>
            </div>
            <ChevronRight size={14} color="#C0ACDE" />
          </button>
        </div>

        {/* Footer note */}
        <div style={{
          textAlign: "center", paddingTop: 12,
          fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#C0B8D8", lineHeight: 1.6,
        }}>
          玄枢提供一种理解自己与关系的角度。<br />重要决定仍请结合现实信息与专业意见。
        </div>
      </div>
    </div>
  );
}
