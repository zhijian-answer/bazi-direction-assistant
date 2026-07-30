"use client";

import { Archive, ChevronDown } from "lucide-react";
import Image from "next/image";
import orbitMark from "../../../public/mobile/xuanshu-orbit-mark.webp";

export function ReportBrandBar({ profileName, onProfileClick }: { profileName: string; onProfileClick: () => void }) {
  return (
    <header className="report-brand-bar">
      <div className="report-brand-bar__identity">
        <Image src={orbitMark} alt="" priority />
        <div><strong>玄枢</strong><small>东方命理数据实验室</small></div>
      </div>
      <button type="button" onClick={onProfileClick} aria-label={`切换当前档案，当前为${profileName}`}>
        <Archive aria-hidden="true" />
        切换档案
        <ChevronDown aria-hidden="true" />
      </button>
    </header>
  );
}
