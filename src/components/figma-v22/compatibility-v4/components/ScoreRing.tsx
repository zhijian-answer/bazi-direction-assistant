import { useEffect, useRef, useState } from 'react';

interface Props {
  score: number;
  size?: number;
  color?: string;
  label?: string;
}

export default function ScoreRing({ score, size = 80, color = 'var(--lav-deep)', label }: Props) {
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress / 100);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const t = setTimeout(() => setProgress(score), 250);
        obs.disconnect();
        return () => clearTimeout(t);
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [score]);

  return (
    <div ref={ref} style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}1E`} strokeWidth={7} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={7}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.25,0.8,0.25,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="serif" style={{ fontSize: Math.round(size * 0.27), fontWeight: 700, color, lineHeight: 1 }}>
          {progress}
        </span>
        {label && (
          <span style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 2, fontWeight: 500 }}>{label}</span>
        )}
      </div>
    </div>
  );
}
