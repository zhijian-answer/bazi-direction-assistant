"use client";

import {
  Archive,
  CalendarRange,
  ChevronRight,
  CircleDotDashed,
  CircleHelp,
  Cloud,
  CloudOff,
  Download,
  FileText,
  Image as ImageIcon,
  LockKeyhole,
  LogIn,
  Pencil,
  Plus,
  Trash2,
  UserX,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  deleteMobileProfile,
  saveMobileProfile,
  setActiveMobileProfile,
  useMobileProfile,
  useMobileProfiles,
} from "@/lib/mobile/profile";
import { useShareImageHistory } from "@/lib/mobile/shareHistory";
import { trackMobileEvent } from "@/lib/mobile/analytics";
import { MobileShell } from "./MobileShell";

const shareTypeLabel = {
  personality: "生辰人格",
  daily: "今日观察",
  zodiac: "星座人格",
  ziwei: "紫微领域",
  question: "问题解读",
};

function formatRecordTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function MobileProfilePage() {
  const isStaticPreview = process.env.NEXT_PUBLIC_MOBILE_STATIC === "1";
  const profile = useMobileProfile();
  const profiles = useMobileProfiles();
  const shareHistory = useShareImageHistory(profile.id);
  const [account, setAccount] = useState<{ name: string; email: string } | null>(null);
  const [accountReady, setAccountReady] = useState(isStaticPreview);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncConflict, setSyncConflict] = useState(false);
  const [accountBusy, setAccountBusy] = useState(false);

  useEffect(() => {
    if (isStaticPreview) {
      return;
    }
    let active = true;
    fetch("/api/me")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (active) setAccount(data?.user || null); })
      .catch(() => undefined)
      .finally(() => { if (active) setAccountReady(true); });
    return () => { active = false; };
  }, [isStaticPreview]);

  async function syncProfile(resolution?: "keep-local" | "keep-cloud") {
    if (profile.isDemo) {
      setSyncMessage("示例档案不会同步，请先创建自己的档案。");
      return;
    }
    setSyncing(true);
    setSyncMessage("");
    try {
      const response = await fetch("/api/sync/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, resolution }),
      });
      const result = await response.json();
      if (response.status === 409) setSyncConflict(true);
      if (!response.ok) throw new Error(result.error || "同步失败");
      const nextProfile = resolution === "keep-cloud"
        ? { ...profile, name: result.profile.name, gender: result.profile.gender, calendarType: result.profile.calendarType, isLeapMonth: Boolean(result.profile.isLeapMonth), birthDate: result.profile.birthDate, birthTime: result.profile.birthTime, birthTimeKnown: !result.profile.timeUnknown, birthPlace: result.profile.birthPlace }
        : profile;
      saveMobileProfile({ ...nextProfile, isLocalOnly: false, syncStatus: "synced", cloudProfileId: result.profile.id });
      trackMobileEvent("sync_success", { resolution: resolution || "automatic", reused: Boolean(result.reused) });
      setSyncConflict(false);
      setSyncMessage(resolution === "keep-cloud" ? "已使用云端版本更新本机档案。" : resolution === "keep-local" ? "已用本机版本更新云端档案。" : result.reused ? "已与云端已有档案建立关联。" : "档案已经安全保存到云端。");
    } catch (error) {
      saveMobileProfile({ ...profile, syncStatus: "error" });
      trackMobileEvent("sync_fail", { resolution: resolution || "automatic", reason: error instanceof Error ? error.message.slice(0, 60) : "unknown" });
      setSyncMessage(error instanceof Error ? error.message : "同步失败，请稍后重试。");
    } finally {
      setSyncing(false);
    }
  }

  function removeProfile(profileId: string, name: string) {
    if (!window.confirm(`确认删除“${name}”的本地档案吗？此操作不会删除已经保存到相册的图片。`)) return;
    deleteMobileProfile(profileId);
  }

  async function deleteCloudAccount() {
    if (!window.confirm("确认永久删除云端账号、档案、报告、问题和分享记录吗？本机档案会保留为仅本地状态。")) return;
    setAccountBusy(true);
    setSyncMessage("");
    try {
      const response = await fetch("/api/me", { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "删除账号失败");
      saveMobileProfile({ ...profile, cloudProfileId: undefined, isLocalOnly: true, syncStatus: "local" });
      setAccount(null);
      setSyncConflict(false);
      setSyncMessage("云端账号和关联数据已删除，本机档案仍保留在当前浏览器。 ");
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : "删除账号失败，请稍后重试。 ");
    } finally {
      setAccountBusy(false);
    }
  }

  return (
    <MobileShell active="profile" theme="home">
      <div className="market-profile-page">
        <header className="profile-page-header">
          <small>我的玄枢</small>
          <h1>档案、报告与分享记录</h1>
          <p>当前内容保存在这台设备。登录只用于跨设备同步，不影响游客继续使用。</p>
        </header>

        <section className="profile-account-card">
          <span>{profile.name.slice(0, 1) || "自"}</span>
          <div>
            <small>{profile.isDemo ? "示例档案" : "当前档案"}</small>
            <strong>{profile.name || "自己"}</strong>
            <em>{profile.syncStatus === "synced" ? <><Cloud />已同步到云端</> : <><CloudOff />仅保存在本机</>}</em>
          </div>
          <Link href="/m/create" aria-label="编辑出生档案"><Pencil /></Link>
        </section>

        <section className="profile-data-card">
          <header><CalendarRange /><div><small>出生档案</small><strong>资料完整度 {profile.completeness ?? 100}%</strong></div></header>
          <dl>
            <div><dt>日历</dt><dd>{profile.calendarType === "lunar" ? "农历" : "公历"}</dd></div>
            <div><dt>出生时间</dt><dd>{profile.birthDate} {profile.birthTimeKnown ? (profile.birthTime || "待补充") : "时辰不确定"}</dd></div>
            <div><dt>出生地点</dt><dd>{profile.birthPlace || "暂未填写"}</dd></div>
          </dl>
        </section>

        <section className="profile-archive-section">
          <header><div><small>本地档案</small><h2>切换正在查看的人</h2></div><Link href="/m/create?mode=new"><Plus />新建</Link></header>
          <div>
            {profiles.map((item) => {
              const active = item.id === profile.id;
              return (
                <article key={item.id} className={active ? "is-active" : ""}>
                  <button type="button" onClick={() => item.id && setActiveMobileProfile(item.id)}>
                    <span>{item.name.slice(0, 1) || "档"}</span>
                    <div><strong>{item.name}</strong><small>{item.birthDate} · {item.birthTimeKnown ? item.birthTime : "时辰未知"}</small></div>
                    <em>{active ? "当前" : "切换"}</em>
                  </button>
                  {item.id ? <button type="button" className="profile-delete-button" onClick={() => removeProfile(item.id!, item.name)} aria-label={`删除${item.name}档案`}><Trash2 /></button> : null}
                </article>
              );
            })}
          </div>
        </section>

        <section className="profile-sync-card">
          <span><Cloud /></span>
          <div>
            <small>跨设备保存</small>
            <h2>{isStaticPreview ? "当前为本地体验版" : account ? `已登录：${account.name}` : "登录后同步本地档案"}</h2>
            <p>{isStaticPreview ? "档案和分享记录保存在当前浏览器。此预览不连接账号服务，也不会假装同步成功。" : account ? "同步会比较本地和云端版本；发现差异时会停止并提示，不会自动覆盖。" : "登录后可以安全保存档案和分享记录，不影响游客继续使用。"}</p>
            {syncMessage ? <em className="profile-sync-message">{syncMessage}</em> : null}
          </div>
          {isStaticPreview ? <Link href="/m/create?mode=new"><Plus />继续新建本地档案</Link> : account ? <div className="profile-sync-actions">{syncConflict ? <><button type="button" onClick={() => syncProfile("keep-local")} disabled={syncing}>保留本机</button><button type="button" onClick={() => syncProfile("keep-cloud")} disabled={syncing}>使用云端</button></> : <button type="button" onClick={() => syncProfile()} disabled={syncing}><Cloud />{syncing ? "正在同步" : profile.syncStatus === "synced" ? "重新检查" : "同步当前档案"}</button>}</div> : <Link href="/?next=/m/profile" onClick={() => trackMobileEvent("login_prompt_show", { source: "profile_sync" })}><LogIn />{accountReady ? "登录并同步" : "检查登录状态"}</Link>}
        </section>

        {account && !isStaticPreview ? (
          <section className="profile-account-data-actions">
            <a href="/api/me/export"><Download />导出我的云端数据</a>
            <button type="button" onClick={deleteCloudAccount} disabled={accountBusy}><UserX />{accountBusy ? "正在删除" : "永久删除云端账号"}</button>
          </section>
        ) : null}

        <section className="profile-share-history">
          <header><div><small>分享图记录</small><h2>最近生成的图片</h2></div><ImageIcon /></header>
          {shareHistory.length ? (
            <div>{shareHistory.slice(0, 4).map((item) => (
              <article key={item.id}>
                <span><ImageIcon /></span>
                <div><strong>{item.title}</strong><small>{shareTypeLabel[item.type]} · {formatRecordTime(item.createdAt)}</small></div>
                <em>{item.delivery === "shared" ? "已分享" : item.delivery === "saved" ? "已保存" : "已生成"}</em>
              </article>
            ))}</div>
          ) : (
            <p>还没有生成分享图。你可以在生辰、星座、紫微或问题解读中生成第一张。</p>
          )}
        </section>

        <nav className="profile-menu" aria-label="报告与设置">
          <Link href="/m/report/bazi"><span><FileText />我的生辰与流盘</span><ChevronRight /></Link>
          <Link href="/m/report/zodiac"><span><UserRound />我的星座报告</span><ChevronRight /></Link>
          <Link href="/m/report/ziwei"><span><CircleDotDashed />我的紫微报告</span><ChevronRight /></Link>
          <Link href="/privacy"><span><LockKeyhole />隐私与本地数据说明</span><ChevronRight /></Link>
          <Link href="/terms"><span><FileText />用户协议与内容边界</span><ChevronRight /></Link>
          <Link href="/about"><span><CircleHelp />关于玄枢</span><ChevronRight /></Link>
        </nav>

        <section className="profile-boundary">
          <strong><Archive />使用边界</strong>
          <p>玄枢提供传统文化、娱乐与自我探索内容。涉及健康、法律、投资或重大人生决定时，请结合现实信息和专业意见。</p>
        </section>
      </div>
    </MobileShell>
  );
}
