"use client";

import { ChevronRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { buildCompatibilityReport, enrichCompatibilityReport } from "@/lib/compatibility";
import { loadCompatibilityDraft, loadLatestCompatibilityReport, saveCompatibilityDraft, saveCompatibilityReport, useCompatibilityHistory } from "@/lib/compatibility/storage";
import { loadMobileProfiles, upsertMobileProfile, useMobileProfile, useMobileProfiles } from "@/lib/mobile/profile";
import { requestMobileChatAnswer } from "@/lib/mobile/chatClient";
import type { MobileChatAnswer } from "@/lib/mobile/chatEngine";
import type { MobileProfile } from "@/lib/mobile/types";
import { resolveBirthPlace } from "@/lib/zodiac";
import BottomNav from "./components/BottomNav";
import ShareModal from "./components/ShareModal";
import CreateStep1 from "./screens/CreateStep1";
import CreateStep2 from "./screens/CreateStep2";
import GeneratingScreen from "./screens/GeneratingScreen";
import HistoryScreen from "./screens/HistoryScreen";
import HomeScreen from "./screens/HomeScreen";
import ResultScreen from "./screens/ResultScreen";
import { personFromProfile, recordFromReport } from "./adapters";
import type { AppScreen, ChartType, CreateFlowData, NavTab, PersonFact } from "./types";

type Props = {
  initialScreen: AppScreen;
  initialChartType?: ChartType;
};

const fallbackPerson: PersonFact = {
  id: "missing",
  name: "对方",
  birthday: "",
  birthTime: "",
  birthTimeAccuracy: "unknown",
  birthPlace: "",
  avatarColor: "#5BA3CE",
};

function profileFromPerson(person: PersonFact): MobileProfile {
  const resolved = resolveBirthPlace(person.birthPlace);
  const exactTime = /^\d{2}:\d{2}$/.test(person.birthTime) ? person.birthTime : "";
  return {
    id: person.id.startsWith("custom-") ? undefined : person.id,
    name: person.name,
    gender: "other",
    calendarType: "solar",
    birthDate: person.birthday,
    birthTime: exactTime,
    birthTimeKnown: person.birthTimeAccuracy !== "unknown" && Boolean(exactTime),
    isLeapMonth: false,
    birthPlace: person.birthPlace,
    latitude: resolved?.latitude,
    longitude: resolved?.longitude,
    timezone: resolved?.timezone,
    birthPlaceResolution: resolved ? "catalog" : "unknown",
    isDemo: false,
    isLocalOnly: true,
    completeness: 0,
    syncStatus: "local",
  };
}

function QuestionSheet({ question, profile, context, onClose }: { question: string; profile: MobileProfile; context: string; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<MobileChatAnswer | null>(null);

  async function ask() {
    setLoading(true);
    const next = await requestMobileChatAnswer(profile, `${question}\n关系背景：${context}`, []);
    setAnswer(next);
    setLoading(false);
  }

  return <>
    <button className="xsc-sheet-backdrop" type="button" aria-label="关闭" onClick={onClose} />
    <section className="xsc-question-sheet" role="dialog" aria-modal="true" aria-label="继续提问">
      <i />
      <header><strong>继续问这段关系</strong><button type="button" onClick={onClose} aria-label="关闭"><X size={20} /></button></header>
      <blockquote>“{question}”</blockquote>
      {!answer && !loading ? <button type="button" className="btn btn-primary" onClick={ask}>听听玄枢怎么说 <ChevronRight size={16} /></button> : null}
      {loading ? <div className="xsc-question-loading"><span /><span /><span /><p>正在结合这段关系整理回答</p></div> : null}
      {answer ? <div className="xsc-question-answer"><h3>{answer.title}</h3><p>{answer.summary}</p>{answer.observations.map((item) => <small key={item}>{item}</small>)}<em>{answer.action}</em></div> : null}
    </section>
  </>;
}

export function CompatibilityV4App({ initialScreen, initialChartType = "synastry" }: Props) {
  const router = useRouter();
  const activeProfile = useMobileProfile();
  const profiles = useMobileProfiles();
  const history = useCompatibilityHistory();
  const [screen, setScreen] = useState<AppScreen>(initialScreen);
  const [createData, setCreateData] = useState<Partial<CreateFlowData>>({ chartType: initialChartType });
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [latest, setLatest] = useState(() => typeof window === "undefined" ? null : loadLatestCompatibilityReport());

  useEffect(() => {
    if (initialScreen !== "generating") return;
    const timer = window.setTimeout(() => {
      const draft = loadCompatibilityDraft();
      if (!draft) return;
      const all = loadMobileProfiles();
      const partner = all.find((item) => item.id === draft.partnerProfileId) ?? draft.partnerSnapshot;
      if (partner) setCreateData({
        chartType: draft.mode === "astrology" ? "synastry" : "birth",
        relationshipType: draft.relationshipType,
        person2: personFromProfile(partner),
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialScreen]);

  const me = personFromProfile(activeProfile);
  const otherPeople = useMemo(() => profiles.filter((profile) => profile.id !== activeProfile.id && !profile.isDemo).map(personFromProfile), [activeProfile.id, profiles]);
  const records = useMemo(() => history.map(recordFromReport), [history]);
  const currentRecord = latest ? recordFromReport(latest) : null;

  function routeFor(next: AppScreen) {
    if (next === "home") return "/m/compatibility";
    if (next === "history") return "/m/compatibility/history";
    if (next === "result") return "/m/compatibility/result";
    if (next === "generating") return "/m/compatibility/generating";
    if (next === "create-1" || next === "create-2") return "/m/compatibility/create";
    if (next === "tools") return "/m/tools";
    return "/m/profile";
  }

  function navigate(next: AppScreen) {
    if (next === "create-2") {
      setScreen(next);
      return;
    }
    if (next === "create-1") {
      router.push(`/m/compatibility/create?mode=${createData.chartType === "birth" ? "bazi" : "astrology"}`);
      return;
    }
    router.push(routeFor(next));
  }

  function handleTab(tab: NavTab) {
    const routes: Record<NavTab, string> = { home: "/m", report: "/m/reports", tools: "/m/tools", my: "/m/profile" };
    router.push(routes[tab]);
  }

  function viewRecord(id: string) {
    const report = history.find((item) => item.id === id);
    if (!report) return;
    saveCompatibilityReport(report, { persistHistory: false });
    setLatest(report);
    router.push("/m/compatibility/result");
  }

  function beginCreate() {
    setCreateData({ chartType: initialChartType });
    router.push(`/m/compatibility/create?mode=${initialChartType === "birth" ? "bazi" : "astrology"}`);
  }

  function saveDraftAndGenerate() {
    const person = createData.person2 as PersonFact | undefined;
    if (!person?.birthday || !createData.relationshipType) return;
    const storedPartner = profiles.find((profile) => profile.id === person.id) ?? upsertMobileProfile(profileFromPerson(person), { activate: false });
    saveCompatibilityDraft({
      id: `compatibility-draft-${Date.now()}`,
      mode: createData.chartType === "birth" ? "bazi" : "astrology",
      primaryProfileId: activeProfile.id || "",
      partnerProfileId: storedPartner.id || "",
      primarySnapshot: activeProfile,
      partnerSnapshot: storedPartner,
      relationshipType: createData.relationshipType,
      createdAt: new Date().toISOString(),
    });
    router.push("/m/compatibility/generating");
  }

  async function generateReport() {
    try {
      const draft = loadCompatibilityDraft();
      const all = loadMobileProfiles();
      const primary = all.find((item) => item.id === draft?.primaryProfileId) ?? draft?.primarySnapshot;
      const partner = all.find((item) => item.id === draft?.partnerProfileId) ?? draft?.partnerSnapshot;
      if (!draft || !primary || !partner) throw new Error("双方资料不完整，请返回检查后再试。 ");
      const base = buildCompatibilityReport(draft, primary, partner);
      const report = await enrichCompatibilityReport(base);
      saveCompatibilityReport(report, { persistHistory: !primary.isDemo && !partner.isDemo });
      setLatest(report);
      router.replace("/m/compatibility/result");
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "这次没有生成完整，请稍后再试。 ");
      throw error;
    }
  }

  const person2 = (createData.person2 as PersonFact | undefined) ?? fallbackPerson;
  const showNav = screen === "home" || screen === "history";

  return <div className="xsc-v4"><div className="phone-outer"><div className={`phone-frame${showNav ? "" : " xsc-no-nav"}`}><div className="app-bg" />
    {screen === "home" ? <HomeScreen me={me} records={records} onNavigate={navigate} onTabChange={handleTab} onViewRecord={viewRecord} /> : null}
    {screen === "create-1" ? <CreateStep1 me={me} knownOthers={otherPeople} data={createData} onChange={setCreateData} onNext={() => setScreen("create-2")} onBack={() => router.back()} /> : null}
    {screen === "create-2" ? <CreateStep2 me={me} data={createData} onChange={setCreateData} onGenerate={saveDraftAndGenerate} onBack={() => setScreen("create-1")} /> : null}
    {screen === "generating" ? <GeneratingScreen person1={me} person2={person2} onDone={generateReport} onError={() => router.push("/m/compatibility/create")} /> : null}
    {screen === "result" && currentRecord ? <ResultScreen record={currentRecord} error={generationError} onBack={() => router.push("/m/compatibility")} onShare={() => setShowShare(true)} onSave={() => latest && saveCompatibilityReport(latest)} onAskQuestion={setActiveQuestion} onGoHome={() => router.push("/m")} /> : null}
    {screen === "result" && !currentRecord ? <HistoryScreen records={[]} onViewRecord={viewRecord} onStartNew={beginCreate} /> : null}
    {screen === "history" ? <HistoryScreen records={records} onViewRecord={viewRecord} onStartNew={beginCreate} /> : null}
    {showNav ? <BottomNav active={screen === "history" ? "report" : "home"} onChange={handleTab} /> : null}
    {showShare && currentRecord ? <ShareModal record={currentRecord} onClose={() => setShowShare(false)} /> : null}
    {activeQuestion && latest ? <QuestionSheet question={activeQuestion} profile={activeProfile} context={`${latest.primary.name}与${latest.partner.name}，${latest.summary}`} onClose={() => setActiveQuestion(null)} /> : null}
  </div></div></div>;
}
