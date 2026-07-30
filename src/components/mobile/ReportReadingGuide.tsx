"use client";

import { ArrowDown, Bookmark, Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type ReadingSection = { id: string; label: string };

function storageKey(reportId: string) {
  return `xuanshu-reading-progress:${reportId}`;
}

export function ReportReadingGuide({ reportId, sections }: { reportId: string; sections: ReadingSection[] }) {
  const [progress, setProgress] = useState(0);
  const [savedProgress, setSavedProgress] = useState(0);
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const ticking = useRef(false);
  const sectionSignature = JSON.stringify(sections);
  const usableSections = useMemo(() => (JSON.parse(sectionSignature) as ReadingSection[]).filter((section) => Boolean(section.id && section.label)), [sectionSignature]);

  useEffect(() => {
    const saved = Number(window.localStorage.getItem(storageKey(reportId)) || 0);

    function update() {
      ticking.current = false;
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const nextProgress = Math.max(0, Math.min(100, Math.round((window.scrollY / scrollable) * 100)));
      setProgress(nextProgress);
      if (nextProgress >= 4) window.localStorage.setItem(storageKey(reportId), String(nextProgress));

      let nextActive = usableSections[0]?.id ?? "";
      for (const section of usableSections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= 150) nextActive = section.id;
      }
      setActiveId(nextActive);
    }

    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(update);
    }

    const initialFrame = window.requestAnimationFrame(() => {
      if (Number.isFinite(saved)) setSavedProgress(Math.max(0, Math.min(100, saved)));
      update();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reportId, usableSections]);

  function goTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resume() {
    const scrollable = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({ top: scrollable * (savedProgress / 100), behavior: "smooth" });
  }

  return (
    <nav className="report-reading-guide" aria-label="报告章节与阅读进度">
      <div className="report-reading-guide__progress" aria-label={`已阅读 ${progress}%`}><i style={{ width: `${progress}%` }} /></div>
      <div className="report-reading-guide__sections">
        {usableSections.map((section) => (
          <button type="button" key={section.id} className={activeId === section.id ? "is-active" : ""} onClick={() => goTo(section.id)}>
            {activeId === section.id ? <Check /> : null}{section.label}
          </button>
        ))}
      </div>
      {savedProgress >= 12 && savedProgress < 90 && progress < 8 ? (
        <button type="button" className="report-reading-guide__resume" onClick={resume}>
          <Bookmark />继续上次阅读 · {savedProgress}%<ArrowDown />
        </button>
      ) : null}
    </nav>
  );
}
