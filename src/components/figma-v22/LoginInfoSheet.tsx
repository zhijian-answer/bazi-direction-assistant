import { FormEvent, useState } from "react";
import { ArrowRight, Cloud, LogOut, Smartphone, X } from "lucide-react";

export type MobileAccount = {
  name: string;
  email: string;
};

interface LoginInfoSheetProps {
  open: boolean;
  account: MobileAccount | null;
  onClose: () => void;
  onAuthenticated: (account: MobileAccount) => Promise<string>;
  onSync: () => Promise<string>;
  onLogout: () => Promise<void>;
}

async function postAccount(url: string, body?: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "这次没有成功，请稍后再试。");
  return data as { user: MobileAccount };
}

export default function LoginInfoSheet({
  open,
  account,
  onClose,
  onAuthenticated,
  onSync,
  onLogout,
}: LoginInfoSheetProps) {
  const [view, setView] = useState<"info" | "login" | "register">("info");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  if (!open) return null;

  function close() {
    setView("info");
    setMessage("");
    onClose();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      const result = await postAccount(view === "register" ? "/api/auth/register" : "/api/auth/login", {
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      });
      const syncMessage = await onAuthenticated(result.user);
      setView("info");
      setMessage(syncMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "这次没有成功，请稍后再试。");
    } finally {
      setBusy(false);
    }
  }

  async function sync() {
    setBusy(true);
    setMessage("");
    try {
      setMessage(await onSync());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "档案暂时没有同步成功，请稍后再试。");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    setMessage("");
    try {
      await onLogout();
      setMessage("已经退出登录，本机档案仍然保留。");
    } catch {
      setMessage("这次没有退出成功，请稍后再试。");
    } finally {
      setBusy(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    padding: "16px 18px",
    borderRadius: 18,
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 14,
  };

  return (
    <>
      <div
        onClick={close}
        style={{
          position: "absolute", inset: 0,
          background: "rgba(40,37,61,0.28)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 55,
        }}
      />

      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        zIndex: 60, maxHeight: "88svh", overflowY: "auto",
        borderRadius: "28px 28px 0 0",
        background: "rgba(252,250,255,0.96)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.92)",
        borderBottom: "none",
        boxShadow: "0 -8px 40px rgba(100,80,160,0.16)",
        paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
        animation: "sheet-rise 0.32s cubic-bezier(0.32,0.72,0,1) both",
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: "rgba(180,160,220,0.35)",
          margin: "12px auto 0",
        }} />

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 22px 0",
        }}>
          <span style={{
            fontSize: 15, fontFamily: "'Noto Serif SC', serif",
            fontWeight: 600, color: "#28253D",
          }}>{view === "info" ? "档案保存方式" : view === "login" ? "登录账号" : "注册账号"}</span>
          <button onClick={close} aria-label="关闭" style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(192,172,222,0.18)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={15} color="#7B6E94" />
          </button>
        </div>

        <div style={{ padding: "18px 22px 0" }}>
          {view === "info" ? (
            <>
              <div style={{
                ...cardStyle,
                background: "rgba(208,234,224,0.30)",
                border: "1px solid rgba(107,191,160,0.25)",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                  background: "rgba(107,191,160,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Smartphone size={18} color="#4A8E7A" />
                </div>
                <div>
                  <div style={{
                    fontSize: 13.5, fontFamily: "'Noto Serif SC', serif",
                    fontWeight: 500, color: "#28253D", marginBottom: 4,
                  }}>本机档案一直可用</div>
                  <div style={{
                    fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
                    color: "#4A6E5E", lineHeight: 1.65,
                  }}>
                    不登录也能查看报告。本机档案只有在你登录并主动同步时才会上传。
                  </div>
                </div>
              </div>

              <div style={{
                ...cardStyle,
                background: "rgba(192,172,222,0.12)",
                border: "1px solid rgba(192,172,222,0.25)",
                marginBottom: 20,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                  background: "rgba(192,172,222,0.22)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Cloud size={18} color="#7B6E94" />
                </div>
                <div>
                  <div style={{
                    fontSize: 13.5, fontFamily: "'Noto Serif SC', serif",
                    fontWeight: 500, color: "#28253D", marginBottom: 4,
                  }}>{account ? `已登录：${account.name}` : "登录后可以跨设备恢复"}</div>
                  <div style={{
                    fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
                    color: "#4A4168", lineHeight: 1.65,
                  }}>
                    {account ? account.email : "同步前会比较本机与云端版本，发现差异时不会直接覆盖。"}
                  </div>
                </div>
              </div>

              {message ? <p role="status" style={{
                margin: "0 0 16px", padding: "10px 12px", borderRadius: 12,
                background: "rgba(107,191,160,0.12)", color: "#4A6E5E",
                fontSize: 12.5, lineHeight: 1.6,
              }}>{message}</p> : null}

              {account ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button type="button" onClick={() => void sync()} disabled={busy} style={primaryButtonStyle}>
                    {busy ? "正在保存" : "同步当前档案"}<ArrowRight size={14} />
                  </button>
                  <button type="button" onClick={() => void logout()} disabled={busy} style={secondaryButtonStyle}>
                    <LogOut size={14} />退出登录
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button type="button" onClick={() => { setView("login"); setMessage(""); }} style={primaryButtonStyle}>
                    登录或注册<ArrowRight size={14} />
                  </button>
                  <button type="button" onClick={close} style={secondaryButtonStyle}>继续保存在本机</button>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                {(["login", "register"] as const).map((item) => (
                  <button key={item} type="button" onClick={() => { setView(item); setMessage(""); }} style={{
                    flex: 1, height: 40, borderRadius: 13,
                    border: view === item ? "1.5px solid rgba(192,172,222,0.55)" : "1px solid rgba(192,172,222,0.20)",
                    background: view === item ? "rgba(192,172,222,0.20)" : "rgba(255,255,255,0.55)",
                    color: view === item ? "#6B5A9A" : "#9088A8",
                    fontSize: 13, cursor: "pointer",
                  }}>{item === "login" ? "登录" : "注册"}</button>
                ))}
              </div>

              {view === "register" ? <label style={fieldLabelStyle}>称呼
                <input name="name" required maxLength={40} autoComplete="name" placeholder="怎么称呼你" style={inputStyle} />
              </label> : null}
              <label style={fieldLabelStyle}>邮箱
                <input name="email" type="email" required autoComplete="email" placeholder="用于登录和找回档案" style={inputStyle} />
              </label>
              <label style={fieldLabelStyle}>密码
                <input name="password" type="password" required minLength={6} autoComplete={view === "login" ? "current-password" : "new-password"} placeholder="至少 6 位" style={inputStyle} />
              </label>

              {message ? <p role="alert" style={{ margin: 0, color: "#C0604A", fontSize: 12.5, lineHeight: 1.6 }}>{message}</p> : null}

              <button type="submit" disabled={busy} style={primaryButtonStyle}>
                {busy ? "请稍候" : view === "login" ? "登录并保存档案" : "注册并保存档案"}<ArrowRight size={14} />
              </button>
              <button type="button" onClick={() => { setView("info"); setMessage(""); }} style={secondaryButtonStyle}>返回保存说明</button>
              <p style={{ margin: "2px 0 0", textAlign: "center", color: "#A8A0BC", fontSize: 11.5, lineHeight: 1.6 }}>
                登录不会改变命盘结果，只用于恢复你主动同步的档案。
              </p>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes sheet-rise {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

const primaryButtonStyle: React.CSSProperties = {
  width: "100%", height: 50, borderRadius: 18,
  background: "linear-gradient(135deg, #8068B8, #9A86C8)",
  border: "1.5px solid rgba(128,104,184,0.35)",
  cursor: "pointer", color: "#fff", fontSize: 14, fontWeight: 500,
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  boxShadow: "0 4px 14px rgba(128,104,184,0.22)",
};

const secondaryButtonStyle: React.CSSProperties = {
  width: "100%", height: 48, borderRadius: 18,
  background: "rgba(255,255,255,0.60)",
  border: "1.5px solid rgba(192,172,222,0.22)",
  cursor: "pointer", color: "#7B6E94", fontSize: 14,
  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
};

const fieldLabelStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 7,
  color: "#5A5272", fontSize: 12.5,
};

const inputStyle: React.CSSProperties = {
  width: "100%", height: 46, borderRadius: 14,
  border: "1.5px solid rgba(192,172,222,0.28)",
  background: "rgba(255,255,255,0.78)",
  padding: "0 14px", color: "#28253D", fontSize: 14, outline: "none",
};
