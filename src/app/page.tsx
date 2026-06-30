"use client";

import {
  Activity,
  BarChart3,
  BookOpenText,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GalleryHorizontalEnd,
  History,
  Layers3,
  LogOut,
  MessageCircleQuestion,
  Moon,
  Orbit,
  Trash2,
  ShieldCheck,
  Sparkles,
  SunMedium,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { ActionCard, ActionCheckin, BirthProfile, BirthReport, DailyGuidance, GuidanceQuestion, PublicUser, YearForecast } from "@/lib/types";
import { buildActionCheckinStats } from "@/lib/checkin-stats";
import { BirthForm } from "@/components/bazi/BirthForm";
import { ResultSection } from "@/components/bazi/ResultSection";
import { PublicHome } from "@/components/home/PublicHome";
import { DisclaimerFooter } from "@/components/site/DisclaimerFooter";

type AppState = {
  user: PublicUser | null;
  profiles: BirthProfile[];
  questions: GuidanceQuestion[];
  checkins: ActionCheckin[];
  remainingToday: number;
  isAdmin: boolean;
};

type PanelId = "ask" | "report" | "forecast" | "history" | "explore" | "admin";
type NavItem = readonly [PanelId, LucideIcon, string];

type AdminStatsData = {
  users: number;
  profiles: number;
  questions: number;
  checkins: number;
  todayQuestions: number;
  localQuestions: number;
  openaiQuestions: number;
  estimatedTokens: number;
  latestQuestions: Array<{
    id: string;
    category: string;
    question: string;
    source: string;
    createdAt: string;
  }>;
};

const emptyState: AppState = {
  user: null,
  profiles: [],
  questions: [],
  checkins: [],
  remainingToday: 0,
  isAdmin: false,
};

const templates = [
  { category: "direction", label: "我现在迷茫，应该先做哪三件事？" },
  { category: "career", label: "我现在适合换工作或转方向吗？" },
  { category: "timing", label: "这周适合推进重要决定吗？" },
  { category: "relationship", label: "最近适合主动修复一段关系吗？" },
  { category: "study", label: "我更适合学习哪类能力？" },
  { category: "wealth", label: "最近在财务上需要注意什么？" },
];

const elementNames: Record<string, string> = {
  wood: "木",
  fire: "火",
  earth: "土",
  metal: "金",
  water: "水",
};

const elementNotes: Record<string, string> = {
  wood: "成长、学习、规划、修复关系",
  fire: "表达、曝光、热情、主动沟通",
  earth: "稳定、复盘、秩序、承接责任",
  metal: "判断、取舍、规则、专业打磨",
  water: "观察、信息、恢复、长期思考",
};

const pillarNames: Record<string, string> = {
  year: "年柱",
  month: "月柱",
  day: "日柱",
  time: "时柱",
};

const categoryLabels: Record<string, string> = {
  direction: "人生方向",
  career: "事业工作",
  relationship: "感情关系",
  study: "学习成长",
  wealth: "财富规划",
  timing: "行动时机",
  emotion: "情绪低谷",
  custom: "自由提问",
};

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "请求失败");
  }
  return data;
}

export default function Home() {
  const [state, setState] = useState<AppState>(emptyState);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [question, setQuestion] = useState(templates[0].label);
  const [category, setCategory] = useState(templates[0].category);
  const [activePanel, setActivePanel] = useState<PanelId>("ask");
  const [dailyGuidance, setDailyGuidance] = useState<DailyGuidance | null>(null);
  const [birthReport, setBirthReport] = useState<BirthReport | null>(null);
  const [yearForecast, setYearForecast] = useState<YearForecast | null>(null);
  const [actionCard, setActionCard] = useState<ActionCard | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  async function refresh() {
    const response = await fetch("/api/me");
    const data = await response.json();
    setState(data);
    if (data.profiles?.length && !selectedProfileId) {
      setSelectedProfileId(data.profiles[0].id);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function loadInitialState() {
      const response = await fetch("/api/me");
      const data = await response.json();
      if (!cancelled) {
        setState(data);
        if (data.profiles?.length) {
          setSelectedProfileId(data.profiles[0].id);
        }
        setLoading(false);
      }
    }
    loadInitialState().catch(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedProfile = useMemo(
    () => state.profiles.find((profile) => profile.id === selectedProfileId) || state.profiles[0],
    [selectedProfileId, state.profiles],
  );

  useEffect(() => {
    if (!selectedProfile?.id) {
      return;
    }

    const controller = new AbortController();
    fetch(`/api/daily?profileId=${encodeURIComponent(selectedProfile.id)}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("今日方向加载失败"))))
      .then((data) => setDailyGuidance(data.guidance))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setDailyGuidance(null);
      });

    return () => controller.abort();
  }, [selectedProfile?.id]);

  useEffect(() => {
    if (!selectedProfile?.id) {
      return;
    }

    const controller = new AbortController();
    fetch(`/api/action-card?profileId=${encodeURIComponent(selectedProfile.id)}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("低谷行动卡加载失败"))))
      .then((data) => setActionCard(data.card))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setActionCard(null);
      });

    return () => controller.abort();
  }, [selectedProfile?.id]);

  useEffect(() => {
    if (!selectedProfile?.id) {
      return;
    }

    const controller = new AbortController();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    fetch(`/api/forecast?profileId=${encodeURIComponent(selectedProfile.id)}&year=${year}&month=${month}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("流年方向加载失败"))))
      .then((data) => setYearForecast(data.forecast))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setYearForecast(null);
      });

    return () => controller.abort();
  }, [selectedProfile?.id]);

  useEffect(() => {
    if (!selectedProfile?.id) {
      return;
    }

    const controller = new AbortController();
    fetch(`/api/reports?profileId=${encodeURIComponent(selectedProfile.id)}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("命盘报告加载失败"))))
      .then((data) => setBirthReport(data.report))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setBirthReport(null);
      });

    return () => controller.abort();
  }, [selectedProfile?.id]);

  const navItems: NavItem[] = [
    ["ask", MessageCircleQuestion, "提问"],
    ["report", BookOpenText, "报告"],
    ["forecast", CalendarDays, "流年"],
    ["history", History, "历史"],
    ["explore", Layers3, "分享"],
  ];
  if (state.isAdmin) {
    navItems.push(["admin", BarChart3, "统计"]);
  }

  function switchPanel(panel: PanelId) {
    setActivePanel(panel);
    [0, 350].forEach((delay) => {
      window.setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
      }, delay);
    });
  }

  async function handlePublicLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await postJson<{ user: PublicUser }>("/api/auth/login", {
        email: form.get("email"),
        password: form.get("password"),
      });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败，请检查邮箱和密码");
    } finally {
      setBusy(false);
    }
  }

  async function handlePublicRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const profileName = String(form.get("profileName") || "我的命盘");
      await postJson<{ user: PublicUser }>("/api/auth/register", {
        name: profileName,
        email: form.get("email"),
        password: form.get("password"),
      });
      const data = await postJson<{ profile: BirthProfile }>("/api/profiles", {
        name: profileName,
        gender: form.get("gender"),
        calendarType: form.get("calendarType"),
        birthDate: form.get("birthDate"),
        birthTime: form.get("birthTime") || "12:00",
        birthPlace: form.get("birthPlace"),
        timeUnknown: form.get("timeUnknown") === "on",
        isLeapMonth: form.get("isLeapMonth") === "on",
        timezone: form.get("timezone"),
      });
      await refresh();
      setSelectedProfileId(data.profile.id);
      setActivePanel("report");
    } catch (err) {
      setError(err instanceof Error ? err.message : "请检查填写信息后重新生成");
    } finally {
      setBusy(false);
    }
  }

  async function handleProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const data = await postJson<{ profile: BirthProfile }>("/api/profiles", {
        name: form.get("name"),
        gender: form.get("gender"),
        calendarType: form.get("calendarType"),
        birthDate: form.get("birthDate"),
        birthTime: form.get("birthTime"),
        birthPlace: form.get("birthPlace"),
        timeUnknown: form.get("timeUnknown") === "on",
        isLeapMonth: form.get("isLeapMonth") === "on",
        timezone: form.get("timezone"),
      });
      await refresh();
      setSelectedProfileId(data.profile.id);
      switchPanel("report");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await postJson<{ question: GuidanceQuestion; remainingToday: number }>("/api/questions", {
        profileId: selectedProfile?.id,
        category,
        question,
      });
      await refresh();
      setActivePanel("history");
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!selectedProfile) {
      setError("请先创建命盘档案");
      return;
    }

    setBusy(true);
    setError("");
    const form = new FormData(formElement);
    try {
      await postJson<{ checkin: ActionCheckin }>("/api/checkins", {
        profileId: selectedProfile.id,
        action: form.get("action"),
        note: form.get("note"),
      });
      formElement.reset();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存打卡失败");
    } finally {
      setBusy(false);
    }
  }

  async function deleteProfile(profile: BirthProfile) {
    const confirmation = window.prompt(`这会删除“${profile.name}”和关联的提问、打卡记录。请输入“删除档案”确认。`);
    if (confirmation !== "删除档案") {
      return;
    }

    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/profiles?profileId=${encodeURIComponent(profile.id)}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "删除命盘失败");
      }
      const remainingProfiles = state.profiles.filter((item) => item.id !== profile.id);
      setSelectedProfileId(remainingProfiles[0]?.id || "");
      setDailyGuidance(null);
      setBirthReport(null);
      setYearForecast(null);
      setActionCard(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除命盘失败");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await postJson("/api/auth/logout");
    setState(emptyState);
    setSelectedProfileId("");
    setDailyGuidance(null);
    setBirthReport(null);
    setYearForecast(null);
    setActionCard(null);
  }

  async function deleteAccount() {
    const confirmation = window.prompt("这会永久删除账号、命盘档案和提问历史。请输入“删除”确认。");
    if (confirmation !== "删除") {
      return;
    }

    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/me", { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "删除失败");
      }
      setState(emptyState);
      setSelectedProfileId("");
      setDailyGuidance(null);
      setBirthReport(null);
      setYearForecast(null);
      setActionCard(null);
      setActivePanel("ask");
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="xuanshu-app flex min-h-screen items-center justify-center bg-[var(--rice)] text-[var(--ink)]">
        <div className="flex items-center gap-3 rounded-lg border border-[#34322e] bg-[#0d1318] px-4 py-3 text-sm shadow-sm">
          <Sparkles className="h-5 w-5 animate-pulse text-[#bd4c3e]" />
          页面加载中
        </div>
      </main>
    );
  }

  if (!state.user) {
    return <PublicHome busy={busy} error={error} onRegister={handlePublicRegister} onLogin={handlePublicLogin} />;
  }

  return (
    <main className="xuanshu-app min-h-screen bg-[var(--rice)] pb-20 text-[var(--ink)] lg:pb-0">
      <header className="z-20 border-b border-[#34322e] bg-[#090e12]/95 backdrop-blur lg:sticky lg:top-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#151c21] text-[#c7a46a]">
              <Orbit className="h-6 w-6" strokeWidth={1.4} />
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold">玄枢</div>
              <div className="text-xs text-[#8e8980]">免费使用 · 今日剩余 {state.remainingToday} 次</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/terms" className="hidden rounded-md px-2 py-2 text-xs text-[#8e8980] hover:bg-[#151c21] hover:text-[#bd4c3e] sm:inline">
              使用边界
            </a>
            <a href="/privacy" className="hidden rounded-md px-2 py-2 text-xs text-[#8e8980] hover:bg-[#151c21] hover:text-[#bd4c3e] sm:inline">
              隐私
            </a>
            <button onClick={logout} className="flex items-center gap-2 rounded-md border border-[#34322e] px-3 py-2 text-sm">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">退出</span>
            </button>
          </div>
        </div>
      </header>

      <section id="tool" className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[380px_1fr] lg:gap-5">
        <aside className="space-y-4 lg:sticky lg:top-[76px] lg:self-start">
          <BirthForm busy={busy} defaultName={state.user.name} profileCount={state.profiles.length} onSubmit={handleProfile} />

          {state.profiles.length > 0 && (
            <ProfileSummary
              profiles={state.profiles}
              selectedProfile={selectedProfile}
              selectedProfileId={selectedProfileId}
              onSelect={setSelectedProfileId}
              busy={busy}
              onDelete={deleteProfile}
            />
          )}

        </aside>

        <section className="min-w-0 space-y-4">
          <DesktopNav navItems={navItems} activePanel={activePanel} onChange={switchPanel} />

          {activePanel === "ask" && (
            <>
              <DailyGuidanceCard
                guidance={dailyGuidance}
                loading={Boolean(selectedProfile && dailyGuidance?.profileId !== selectedProfile.id)}
                hasProfile={Boolean(selectedProfile)}
                onAsk={() => switchPanel("ask")}
                onReport={() => switchPanel("report")}
              />

              <ActionCheckinCard
                guidance={dailyGuidance}
                profile={selectedProfile}
                checkins={state.checkins}
                busy={busy}
                onSubmit={handleCheckin}
              />

              <QuickMetrics state={state} selectedProfile={selectedProfile} />
            </>
          )}

          <div ref={panelRef} className="scroll-mt-4 space-y-4 lg:scroll-mt-24">
            {error && <p className="rounded-md border border-[#693c35] bg-[#261411] px-3 py-2 text-sm text-[#df7766]">{error}</p>}

            {activePanel === "ask" && (
              <AskPanel
                busy={busy}
                category={category}
                question={question}
                remainingToday={state.remainingToday}
                selectedProfile={selectedProfile}
                actionCard={actionCard}
                onCategoryChange={setCategory}
                onQuestionChange={setQuestion}
                onSubmit={handleQuestion}
              />
            )}

            {activePanel === "report" && (
              <ReportPanel
                profile={selectedProfile}
                report={birthReport}
                loading={Boolean(selectedProfile && birthReport?.profileId !== selectedProfile.id)}
                onAsk={() => switchPanel("ask")}
              />
            )}

            {activePanel === "forecast" && (
              <ForecastPanel
                profile={selectedProfile}
                forecast={yearForecast}
                loading={Boolean(selectedProfile && yearForecast?.profileId !== selectedProfile.id)}
              />
            )}

            {activePanel === "history" && <HistoryPanel questions={state.questions} />}

            {activePanel === "explore" && <ExplorePanel profile={selectedProfile} busy={busy} onDeleteAccount={deleteAccount} />}

            {activePanel === "admin" && <AdminStats />}
          </div>
        </section>
      </section>

      <DisclaimerFooter />
      <MobileNav navItems={navItems} activePanel={activePanel} onChange={switchPanel} />
    </main>
  );
}

function ProfileSummary({
  profiles,
  selectedProfile,
  selectedProfileId,
  onSelect,
  busy,
  onDelete,
}: {
  profiles: BirthProfile[];
  selectedProfile?: BirthProfile;
  selectedProfileId: string;
  onSelect: (id: string) => void;
  busy: boolean;
  onDelete: (profile: BirthProfile) => void;
}) {
  if (!selectedProfile) {
    return null;
  }

  return (
    <section className="rounded-lg border border-[#34322e] bg-[#0d1318] p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 font-semibold">
        <Moon className="h-4 w-4 text-[#5d9290]" />
        已保存档案
      </div>
      <select value={selectedProfileId || selectedProfile.id} onChange={(event) => onSelect(event.target.value)} className="w-full rounded-md border border-[#34322e] px-3 py-2 text-sm">
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name} · {profile.chart.pillars.day}日
          </option>
        ))}
      </select>
      <div className="mt-4 space-y-3 text-sm">
        <div className="grid grid-cols-4 gap-2 text-center">
          {Object.entries(selectedProfile.chart.pillars).map(([key, value]) => (
            <div key={key} className="rounded-md border border-[#292d30] py-2">
              <div className="text-xs text-[#8e8980]">{pillarNames[key] || key}</div>
              <div className="mt-1 font-semibold">{value}</div>
            </div>
          ))}
        </div>
        <WuxingBars balance={selectedProfile.chart.wuxing.balance} compact />
        <p className="leading-6 text-[#aaa59b]">
          日主 {selectedProfile.chart.dayMaster.stem}
          {selectedProfile.chart.dayMaster.elementLabel}，分析会围绕现实选择和行动节奏给出参考。
        </p>
        <button
          type="button"
          data-action="delete-profile"
          disabled={busy}
          onClick={() => onDelete(selectedProfile)}
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-[#693c35] bg-[#0d1318] px-3 py-2 text-sm font-medium text-[#df7766] hover:bg-[#261411] disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" />
          删除当前档案
        </button>
      </div>
    </section>
  );
}

function DesktopNav({
  navItems,
  activePanel,
  onChange,
}: {
  navItems: readonly NavItem[];
  activePanel: PanelId;
  onChange: (panel: PanelId) => void;
}) {
  return (
    <nav className="hidden flex-wrap gap-2 lg:flex">
      {navItems.map(([id, Icon, label]) => (
        <button
          key={id}
          data-panel-id={id}
          onClick={() => onChange(id as PanelId)}
          className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm ${
            activePanel === id ? "border-[#bd4c3e] bg-[#241512] text-white" : "border-[#34322e] bg-[#0d1318] hover:border-[#bd4c3e]"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </nav>
  );
}

function MobileNav({
  navItems,
  activePanel,
  onChange,
}: {
  navItems: readonly NavItem[];
  activePanel: PanelId;
  onChange: (panel: PanelId) => void;
}) {
  const visibleItems = navItems.filter(([id]) => id !== "admin");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid border-t border-[#34322e] bg-[#090e12]/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-8px_24px_rgba(34,34,31,0.08)] backdrop-blur lg:hidden"
      style={{ gridTemplateColumns: `repeat(${visibleItems.length}, minmax(0, 1fr))` }}
    >
      {visibleItems.map(([id, Icon, label]) => (
        <button
          key={id}
          data-panel-id={id}
          onClick={() => onChange(id as PanelId)}
          className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-xs ${
            activePanel === id ? "bg-[#151c21] text-white" : "text-[#aaa59b]"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </nav>
  );
}

function DailyGuidanceCard({
  guidance,
  loading,
  hasProfile,
  onAsk,
  onReport,
}: {
  guidance: DailyGuidance | null;
  loading: boolean;
  hasProfile: boolean;
  onAsk: () => void;
  onReport: () => void;
}) {
  if (!hasProfile) {
    return (
      <section className="rounded-lg border border-[#34322e] bg-[#0d1318] p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <SunMedium className="mt-1 h-5 w-5 text-[#bd4c3e]" />
          <div>
            <h2 className="text-lg font-semibold">今日方向</h2>
            <p className="mt-1 text-sm leading-6 text-[#aaa59b]">先创建一个命盘档案，就能看到每天的行动提醒。</p>
          </div>
        </div>
      </section>
    );
  }

  if (loading || !guidance) {
    return (
      <section className="rounded-lg border border-[#34322e] bg-[#0d1318] p-5 text-sm text-[#aaa59b] shadow-sm">
        正在读取今日方向...
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-[#34322e] bg-[#0d1318] shadow-sm">
      <div className="border-b border-[#2e3235] bg-[#0d1a20] px-5 py-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-[#d1ad73]">
              <SunMedium className="h-4 w-4" />
              今日方向 · {guidance.date} · {guidance.focusElementLabel}
            </div>
            <h2 className="text-2xl font-semibold sm:text-3xl">{guidance.theme}</h2>
            <p className="max-w-3xl text-sm leading-7 text-[#d8e0dc]">{guidance.summary}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onAsk} className="rounded-md border border-white/25 px-3 py-2 text-sm hover:bg-white/10">
              去提问
            </button>
            <button onClick={onReport} className="rounded-md bg-[#0d1318] px-3 py-2 text-sm text-[#0d1a20]">
              看报告
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-3">
        <DailyList title="适合做" items={guidance.suitable} tone="good" />
        <DailyList title="暂缓做" items={guidance.avoid} tone="warn" />
        <DailyList title="三步行动" items={guidance.actionSteps} tone="action" />
      </div>
    </section>
  );
}

function ActionCheckinCard({
  guidance,
  profile,
  checkins,
  busy,
  onSubmit,
}: {
  guidance: DailyGuidance | null;
  profile?: BirthProfile;
  checkins: ActionCheckin[];
  busy: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  if (!profile) {
    return null;
  }

  const profileCheckins = checkins
    .filter((checkin) => checkin.profileId === profile.id)
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt));
  const stats = buildActionCheckinStats(profileCheckins);
  const today = new Date().toISOString().slice(0, 10);
  const todayCheckin = profileCheckins.find((checkin) => checkin.date === today);
  const defaultAction = todayCheckin?.action || guidance?.actionSteps?.[1] || "完成一个 15 分钟内能推进现实的小行动";

  return (
    <section className="rounded-lg border border-[#34322e] bg-[#0d1318] p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-[#5d9290]">
            <ClipboardCheck className="h-4 w-4" />
            今日行动打卡
          </div>
          <h2 className="mt-2 text-xl font-semibold">{todayCheckin ? "今天已经迈出一步" : "把方向变成一个小行动"}</h2>
          <p className="mt-1 text-sm leading-6 text-[#aaa59b]">不用追求完美，只记录今天真实完成的一小步。</p>
        </div>
        {todayCheckin && <span className="rounded-full bg-[#151e22] px-3 py-1 text-xs text-[#5d9290]">今日已打卡</span>}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_2fr]">
        <div className="rounded-lg border border-[#292d30] bg-[#0a1014] p-4">
          <div className="text-xs text-[#8e8980]">连续行动</div>
          <div className="mt-1 flex items-end gap-1">
            <span className="text-3xl font-semibold">{stats.currentStreak}</span>
            <span className="pb-1 text-sm text-[#aaa59b]">天</span>
          </div>
          <div className="mt-1 text-xs leading-5 text-[#aaa59b]">
            {stats.checkedToday ? "今天已经完成记录" : stats.currentStreak > 0 ? "今天补上就能延续节奏" : "从今天的一小步开始"}
          </div>
        </div>
        <div className="rounded-lg border border-[#292d30] bg-[#0a1014] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-xs text-[#8e8980]">最近 7 天</div>
            <div className="text-xs text-[#aaa59b]">累计 {stats.total} 次</div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {stats.last7Days.map((day) => (
              <div key={day.date} className="text-center">
                <div className={`mx-auto h-7 w-7 rounded-full border ${day.checked ? "border-[#5d9290] bg-[#5d9290]" : "border-[#34322e] bg-[#0d1318]"}`} />
                <div className="mt-1 text-[10px] leading-4 text-[#8e8980]">{day.date.slice(5)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form key={todayCheckin?.updatedAt || profile.id} onSubmit={onSubmit} className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
        <label className="block text-sm">
          今天完成了什么
          <input
            name="action"
            required
            maxLength={160}
            defaultValue={defaultAction}
            className="mt-2 w-full rounded-md border border-[#34322e] px-3 py-3 outline-none focus:border-[#bd4c3e]"
          />
        </label>
        <label className="block text-sm">
          简短记录
          <input
            name="note"
            maxLength={240}
            defaultValue={todayCheckin?.note || ""}
            className="mt-2 w-full rounded-md border border-[#34322e] px-3 py-3 outline-none focus:border-[#bd4c3e]"
            placeholder="例如：做完后心里更稳了一点"
          />
        </label>
        <button type="submit" disabled={busy} className="min-h-11 self-end rounded-md bg-[#151c21] px-4 py-3 text-sm font-medium text-white disabled:opacity-60">
          {todayCheckin ? "更新打卡" : "完成打卡"}
        </button>
      </form>

      {profileCheckins.length > 0 && (
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {profileCheckins.slice(0, 3).map((checkin) => (
            <article key={checkin.id} className="rounded-lg border border-[#292d30] bg-[#0a1014] p-3">
              <div className="text-xs text-[#bd4c3e]">{checkin.date}</div>
              <div className="mt-1 text-sm font-medium leading-6">{checkin.action}</div>
              {checkin.note && <p className="mt-1 text-xs leading-5 text-[#aaa59b]">{checkin.note}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function DailyList({ title, items, tone }: { title: string; items: string[]; tone: "good" | "warn" | "action" }) {
  const dotClass = tone === "good" ? "bg-[#5d9290]" : tone === "warn" ? "bg-[#bd4c3e]" : "bg-[#596b41]";
  return (
    <div className="rounded-lg border border-[#292d30] bg-[#0a1014] p-4">
      <div className="mb-3 text-sm font-semibold">{title}</div>
      <ul className="space-y-2 text-sm leading-6 text-[#b7b1a7]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuickMetrics({ state, selectedProfile }: { state: AppState; selectedProfile?: BirthProfile }) {
  const selectedCheckins = selectedProfile
    ? state.checkins.filter((checkin) => checkin.profileId === selectedProfile.id)
    : state.checkins;
  const checkinStats = buildActionCheckinStats(selectedCheckins);

  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {[
        ["已建档案", state.profiles.length, "最多 3 个命盘档案"],
        ["今日可问", state.remainingToday, "免费次数每日刷新"],
        ["连续打卡", checkinStats.currentStreak, selectedProfile ? `${selectedProfile.name} 的行动节奏` : "创建档案后开始"],
      ].map(([label, value, detail]) => (
        <div key={label} className="rounded-lg border border-[#34322e] bg-[#0d1318] p-4 shadow-sm">
          <div className="text-xs text-[#8e8980]">{label}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
          <div className="mt-1 text-xs leading-5 text-[#aaa59b]">{detail}</div>
        </div>
      ))}
    </section>
  );
}

function AskPanel({
  busy,
  category,
  question,
  remainingToday,
  selectedProfile,
  actionCard,
  onCategoryChange,
  onQuestionChange,
  onSubmit,
}: {
  busy: boolean;
  category: string;
  question: string;
  remainingToday: number;
  selectedProfile?: BirthProfile;
  actionCard: ActionCard | null;
  onCategoryChange: (category: string) => void;
  onQuestionChange: (question: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="rounded-lg border border-[#34322e] bg-[#0d1318] p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">今天想问什么</h2>
          <p className="mt-1 text-sm text-[#aaa59b]">建议越具体，回答越能落到行动上。</p>
        </div>
        <ShieldCheck className="h-6 w-6 shrink-0 text-[#5d9290]" />
      </div>
      <LowActionCard
        card={actionCard}
        hasProfile={Boolean(selectedProfile)}
        onUse={() => {
          onCategoryChange("emotion");
          onQuestionChange("我现在状态很低落、很迷茫，想根据我的命盘方向，给我一个今天能执行的小行动计划。");
        }}
      />
      <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((item) => (
          <button
            type="button"
            key={item.label}
            onClick={() => {
              onQuestionChange(item.label);
              onCategoryChange(item.category);
            }}
            className="min-h-16 rounded-md border border-[#34322e] bg-[#0a1014] p-3 text-left text-sm leading-6 hover:border-[#bd4c3e]"
          >
            {item.label}
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <select value={category} onChange={(event) => onCategoryChange(event.target.value)} className="w-full rounded-md border border-[#34322e] px-3 py-3 text-sm">
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <textarea value={question} onChange={(event) => onQuestionChange(event.target.value)} className="min-h-36 w-full rounded-md border border-[#34322e] px-3 py-3 leading-7 outline-none focus:border-[#bd4c3e]" />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#8e8980]">定位为文化娱乐和自我探索参考，不替代专业建议。</p>
          <button type="submit" disabled={busy || !selectedProfile || remainingToday <= 0} className="rounded-md bg-[#151c21] px-5 py-3 text-white disabled:opacity-60">
            {busy ? "正在生成..." : "根据命盘给我建议"}
          </button>
        </div>
      </form>
    </section>
  );
}

function LowActionCard({ card, hasProfile, onUse }: { card: ActionCard | null; hasProfile: boolean; onUse: () => void }) {
  if (!hasProfile) {
    return null;
  }

  if (!card) {
    return <div className="mb-4 rounded-lg border border-[#292d30] bg-[#0a1014] p-4 text-sm text-[#aaa59b]">正在准备低谷行动卡...</div>;
  }

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-[#34322e] bg-[#0a1014]">
      <div className="bg-[#0d1a20] p-4 text-white">
        <div className="flex items-center gap-2 text-sm text-[#d1ad73]">
          <Sparkles className="h-4 w-4" />
          {card.title} · {card.date} · {card.focusElementLabel}
        </div>
        <p className="mt-2 text-sm leading-7 text-[#d8e0dc]">{card.supportNote}</p>
      </div>
      <div className="grid gap-3 p-4 lg:grid-cols-3">
        <DailyList title="先稳下来" items={card.groundingSteps} tone="good" />
        <DailyList title="15分钟小行动" items={card.tinyActions} tone="action" />
        <DailyList title="今天先别做" items={card.avoid} tone="warn" />
      </div>
      <div className="border-t border-[#292d30] p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="text-sm font-semibold">复盘问题</div>
            <ul className="mt-2 space-y-1 text-sm leading-6 text-[#b7b1a7]">
              {card.reflectionPrompts.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
          <button type="button" onClick={onUse} className="rounded-md bg-[#151c21] px-4 py-2 text-sm text-white">
            用这张卡提问
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-[#8e8980]">{card.disclaimer}</p>
      </div>
    </div>
  );
}

function ReportPanel({
  profile,
  report,
  loading,
  onAsk,
}: {
  profile?: BirthProfile;
  report: BirthReport | null;
  loading: boolean;
  onAsk: () => void;
}) {
  if (!profile) {
    return (
      <section className="rounded-lg border border-[#34322e] bg-[#0d1318] p-8 text-center text-[#aaa59b] shadow-sm">
        创建命盘档案后，这里会显示完整报告摘要。
      </section>
    );
  }

  if (loading || !report) {
    return (
      <section className="rounded-lg border border-[#34322e] bg-[#0d1318] p-8 text-center text-[#aaa59b] shadow-sm">
        正在生成命盘报告...
      </section>
    );
  }

  return <ResultSection profile={profile} report={report} onAsk={onAsk} />;
}

function WuxingBars({ balance, compact = false }: { balance: Record<string, number>; compact?: boolean }) {
  const max = Math.max(...Object.values(balance), 1);
  return (
    <div className={compact ? "grid grid-cols-5 gap-1" : "space-y-3"}>
      {Object.entries(balance).map(([key, value]) =>
        compact ? (
          <div key={key} className="rounded-md bg-[#151e22] px-2 py-2 text-center">
            <div className="text-xs">{elementNames[key]}</div>
            <div className="font-semibold">{value}</div>
          </div>
        ) : (
          <div key={key}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium">{elementNames[key]}</span>
              <span className="text-[#8e8980]">{elementNotes[key]}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#151e22]">
              <div className="h-full rounded-full bg-[#5d9290]" style={{ width: `${Math.max(8, (value / max) * 100)}%` }} />
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function ForecastPanel({
  profile,
  forecast,
  loading,
}: {
  profile?: BirthProfile;
  forecast: YearForecast | null;
  loading: boolean;
}) {
  if (!profile) {
    return (
      <section className="rounded-lg border border-[#34322e] bg-[#0d1318] p-8 text-center text-[#aaa59b] shadow-sm">
        创建命盘档案后，这里会显示流年与月度方向。
      </section>
    );
  }

  if (loading || !forecast) {
    return (
      <section className="rounded-lg border border-[#34322e] bg-[#0d1318] p-8 text-center text-[#aaa59b] shadow-sm">
        正在生成流年方向...
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-[#34322e] bg-[#0d1318] p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-[#bd4c3e]">
          <CalendarDays className="h-4 w-4" />
          流年与月度方向
        </div>
        <h2 className="mt-2 text-2xl font-semibold">{forecast.title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[#b7b1a7]">{forecast.overview}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {forecast.yearlyKeywords.map((item) => (
            <span key={item} className="rounded-full border border-[#34322e] bg-[#0a1014] px-3 py-1 text-xs text-[#aaa59b]">
              {item}
            </span>
          ))}
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-[#34322e] bg-[#0d1318] shadow-sm">
        <div className="border-b border-[#292d30] bg-[#0d1a20] p-5 text-white">
          <div className="text-sm text-[#d1ad73]">当前月份 · {forecast.currentMonth.focusElementLabel}</div>
          <h3 className="mt-2 text-2xl font-semibold">{forecast.currentMonth.theme}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[#d8e0dc]">{forecast.currentMonth.summary}</p>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-3">
          <DailyList title="适合推进" items={forecast.currentMonth.suitable} tone="good" />
          <DailyList title="暂缓处理" items={forecast.currentMonth.avoid} tone="warn" />
          <div className="rounded-lg border border-[#292d30] bg-[#0a1014] p-4">
            <div className="mb-3 text-sm font-semibold">本月行动</div>
            <p className="text-sm leading-7 text-[#b7b1a7]">{forecast.currentMonth.action}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {forecast.months.map((month) => (
          <article key={month.month} className="rounded-lg border border-[#34322e] bg-[#0d1318] p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">{month.theme}</h3>
              <span className="rounded-full bg-[#151e22] px-2.5 py-1 text-xs text-[#5f665e]">{month.focusElementLabel}</span>
            </div>
            <p className="mt-2 text-sm leading-7 text-[#b7b1a7]">{month.summary}</p>
            <div className="mt-3 border-t border-[#292d30] pt-3 text-sm leading-6 text-[#b7b1a7]">
              {month.action}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-[#34322e] bg-[#0a1014] p-4 text-xs leading-6 text-[#8e8980]">
        {forecast.disclaimers.join(" ")}
      </section>
    </section>
  );
}

function HistoryPanel({ questions }: { questions: GuidanceQuestion[] }) {
  return (
    <section className="space-y-4">
      {questions.length === 0 ? (
        <div className="rounded-lg border border-[#34322e] bg-[#0d1318] p-8 text-center text-[#aaa59b] shadow-sm">还没有提问记录。</div>
      ) : (
        questions.map((item) => (
          <article key={item.id} className="rounded-lg border border-[#34322e] bg-[#0d1318] p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="mb-1 text-xs text-[#bd4c3e]">{categoryLabels[item.category] || item.category}</div>
                <h3 className="font-semibold">{item.question}</h3>
              </div>
              <span className="text-xs text-[#8e8980]">
                {new Date(item.createdAt).toLocaleString()} · {item.usage.source}
              </span>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-7 text-[#cbc4b8]">{item.answer}</div>
          </article>
        ))
      )}
    </section>
  );
}

function ExplorePanel({
  profile,
  busy,
  onDeleteAccount,
}: {
  profile?: BirthProfile;
  busy: boolean;
  onDeleteAccount: () => void;
}) {
  const coverUrl = profile ? `/api/share-card?profileId=${encodeURIComponent(profile.id)}&type=cover` : "";
  const wuxingUrl = profile ? `/api/share-card?profileId=${encodeURIComponent(profile.id)}&type=wuxing` : "";
  const dailyUrl = profile ? `/api/share-card?profileId=${encodeURIComponent(profile.id)}&type=daily` : "";

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-[#34322e] bg-[#0d1318] p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-[#bd4c3e]">
          <Layers3 className="h-4 w-4" />
          保存与分享
        </div>
        <h2 className="mt-2 text-2xl font-semibold">把报告留在自己手里</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[#aaa59b]">
          保存报告封面、五行能量图和今日方向卡，也可以随时导出或删除自己的数据。
        </p>
      </div>
      <section className="rounded-lg border border-[#34322e] bg-[#0a1014] p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#5d9290]">
              <ShieldCheck className="h-4 w-4" />
              隐私与数据
            </div>
            <h3 className="mt-2 text-xl font-semibold">导出或删除我的数据</h3>
            <p className="mt-2 text-sm leading-7 text-[#aaa59b]">
              可以随时下载自己保存的命盘、提问历史和已生成的报告内容；也可以永久删除账号和个人数据。导出文件不包含密码、登录凭证或其他用户资料。
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[260px] lg:grid-cols-1">
            <a
              href="/api/me/export"
              download
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#151c21] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#34342f]"
            >
              <FileText className="h-4 w-4" />
              下载我的数据
            </a>
            <button
              type="button"
              data-action="delete-account"
              disabled={busy}
              onClick={onDeleteAccount}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#693c35] bg-[#0d1318] px-4 py-2 text-sm font-medium text-[#df7766] hover:bg-[#261411] disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              删除账号数据
            </button>
          </div>
        </div>
      </section>
      <section className="rounded-lg border border-[#34322e] bg-[#0d1318] p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#bd4c3e]">
              <GalleryHorizontalEnd className="h-4 w-4" />
              报告图片
            </div>
            <h3 className="mt-2 text-xl font-semibold">分享卡与报告封面</h3>
            <p className="mt-2 text-sm leading-7 text-[#aaa59b]">将每日方向、报告封面和五行分布保存为清晰图片，方便手机查看和分享。</p>
          </div>
        </div>

        {!profile ? (
          <div className="rounded-lg border border-[#292d30] bg-[#0a1014] p-5 text-sm text-[#aaa59b]">创建命盘后即可生成图片。</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <ShareCardPreview title="今日方向卡" body="适合每天保存或分享，包含今日主题、适合做、暂缓做和一个小行动。" url={dailyUrl} />
            <ShareCardPreview title="报告封面" body="适合保存为个人报告封面，包含四柱、出生信息和能量提示。" url={coverUrl} />
            <ShareCardPreview title="五行能量图" body="适合社交分享或快速查看五行分布，突出日主和五行计数。" url={wuxingUrl} />
          </div>
        )}
      </section>
    </section>
  );
}

function ShareCardPreview({ title, body, url }: { title: string; body: string; url: string }) {
  return (
    <article className="rounded-lg border border-[#292d30] bg-[#0a1014] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="mt-1 text-sm leading-6 text-[#aaa59b]">{body}</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-[#34322e] bg-[#0d1318]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={title} className="aspect-[3/4] w-full object-cover" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <a href={url} target="_blank" rel="noreferrer" className="rounded-md border border-[#34322e] bg-[#0d1318] px-3 py-2 hover:border-[#bd4c3e]">
          打开图片
        </a>
        <a href={url} download className="rounded-md bg-[#151c21] px-3 py-2 text-white">
          下载 SVG
        </a>
      </div>
    </article>
  );
}

function AdminStats() {
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setStats(data);
        }
      })
      .catch(() => setError("统计加载失败"));
  }, []);

  if (error) {
    return <div className="rounded-lg border border-[#34322e] bg-[#0d1318] p-5 text-sm text-[#df7766] shadow-sm">{error}</div>;
  }
  if (!stats) {
    return <div className="rounded-lg border border-[#34322e] bg-[#0d1318] p-5 text-sm text-[#aaa59b] shadow-sm">加载统计中...</div>;
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
        {[
          ["用户", stats.users],
          ["命盘", stats.profiles],
          ["总提问", stats.questions],
          ["打卡", stats.checkins],
          ["今日提问", stats.todayQuestions],
          ["OpenAI", stats.openaiQuestions],
          ["估算Token", stats.estimatedTokens],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-lg border border-[#34322e] bg-[#0d1318] p-4 shadow-sm">
            <div className="text-xs text-[#8e8980]">{String(label)}</div>
            <div className="mt-2 text-2xl font-semibold">{String(value)}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-[#34322e] bg-[#0d1318] p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-semibold">
            <Activity className="h-4 w-4 text-[#5d9290]" />
            最近问题
          </h2>
          <div className="flex flex-wrap gap-2 text-xs">
            <a className="rounded-md border border-[#34322e] px-3 py-2 hover:border-[#bd4c3e]" href="/api/admin/export">
              脱敏导出
            </a>
            <a className="rounded-md border border-[#34322e] px-3 py-2 hover:border-[#bd4c3e]" href="/api/admin/export?mode=backup&confirm=full">
              完整备份
            </a>
          </div>
        </div>
        <div className="space-y-3">
          {stats.latestQuestions.map((item) => (
            <div key={item.id} className="rounded-md border border-[#292d30] p-3 text-sm">
              <div className="font-medium">{item.question}</div>
              <div className="mt-1 text-xs text-[#8e8980]">
                {item.category} · {item.source} · {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
