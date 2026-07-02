"use client";

import { Check, LoaderCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileShell } from "./MobileShell";

const steps = ["正在校对出生时间", "正在生成四柱结构", "正在整理五行关系", "正在生成适合阅读的解读"];

export function GeneratingScreen({ next = "bazi" }: { next?: string }) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timers = steps.map((_, index) => window.setTimeout(() => setCurrent(index + 1), 320 * (index + 1)));
    const finish = window.setTimeout(() => router.replace(next === "zodiac" ? "/m/report/zodiac" : "/m/report/bazi"), 1650);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(finish);
    };
  }, [next, router]);

  return (
    <MobileShell withNav={false} theme={next === "zodiac" ? "zodiac" : "bazi"}>
      <section className="generating-screen">
        <motion.div
          className="generating-mark"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          aria-hidden="true"
        >
          <span>玄</span>
        </motion.div>
        <small>正在为你整理</small>
        <h1>把复杂信息变成一份好读的报告</h1>
        <div className="generating-steps">
          {steps.map((step, index) => {
            const done = current > index;
            const active = current === index;
            return (
              <div key={step} className={done ? "is-done" : active ? "is-active" : ""}>
                <span>{done ? <Check /> : active ? <LoaderCircle className="is-spinning" /> : index + 1}</span>
                <p>{step}</p>
              </div>
            );
          })}
        </div>
      </section>
    </MobileShell>
  );
}
