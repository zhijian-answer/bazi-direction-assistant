import { useEffect, useRef, useState } from 'react';

interface Props {
  label: string;
  score: number;
  color: string;
  delay?: number;
}

export default function ScoreBar({ label, score, color, delay = 0 }: Props) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const t = setTimeout(() => setWidth(score), delay);
        obs.disconnect();
        return () => clearTimeout(t);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [score, delay]);

  return (
    <div ref={ref} style={{ marginBottom: 11 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, color, fontWeight: 700 }}>{score}</span>
      </div>
      <div className="score-track">
        <div
          className="score-fill"
          style={{ width: `${width}%`, background: `linear-gradient(90deg, ${color}80 0%, ${color} 100%)` }}
        />
      </div>
    </div>
  );
}
