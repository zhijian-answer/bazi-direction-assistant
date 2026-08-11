import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import Avatar from '../components/Avatar';
import type { PersonFact } from '../types';

interface Props {
  person1: PersonFact;
  person2: PersonFact;
  onDone: () => void | Promise<void>;
  onError?: () => void;
}

const STAGES = [
  '整理你们的资料',
  '建立关系结构',
  '识别吸引与摩擦',
  '整理易懂的建议',
];

type Phase = 'enter' | 'orbit' | 'merge' | 'progress';

export default function GeneratingScreen({ person1, person2, onDone }: Props) {
  const [phase, setPhase] = useState<Phase>('enter');
  const [currentStage, setCurrentStage] = useState(0);
  const [doneStages, setDoneStages] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('orbit'), 1200);
    const t2 = setTimeout(() => setPhase('merge'), 2800);
    const t3 = setTimeout(() => setPhase('progress'), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    if (phase !== 'progress') return;
    let stage = 0;
    const si = setInterval(() => {
      setDoneStages(prev => [...prev, stage]);
      stage++;
      if (stage < STAGES.length) setCurrentStage(stage);
      else clearInterval(si);
    }, 1500);
    let p = 0;
    const pi = setInterval(() => {
      p += Math.random() * 3 + 1.5;
      if (p >= 96) { p = 96; clearInterval(pi); }
      setProgress(p);
    }, 160);
    const dt = setTimeout(async () => {
      setProgress(100);
      try {
        await onDone();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "这次没有生成完整，请返回检查资料后再试。");
      }
    }, 7000);
    return () => { clearInterval(si); clearInterval(pi); clearTimeout(dt); };
  }, [phase, onDone]);

  const orbitOn = phase !== 'enter';
  const merged  = phase === 'merge' || phase === 'progress';

  // avatar position
  function pos(which: 'left' | 'right') {
    if (merged)     return which === 'left' ? 'translate(-54%, -50%)' : 'translate(-46%, -50%)';
    if (orbitOn)    return which === 'left' ? 'translate(-98%, -50%)' : 'translate(-2%, -50%)';
    return which === 'left' ? 'translate(-160%, -50%)' : 'translate(60%, -50%)';
  }

  return (
    <div className="screen-full" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%' }}>
      <div className="app-bg" style={{ position: 'fixed', inset: 0, zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 28px 40px' }}>

        {error ? <div className="glass-coral a-up" style={{ borderRadius: 16, padding: '16px', marginBottom: 20, maxWidth: 300, textAlign: 'center' }}><strong style={{ color: 'var(--coral-deep)' }}>刚刚没有看完整</strong><p style={{ margin: '8px 0 0', color: 'var(--text-3)' }}>{error}</p></div> : null}

        {/* Orbit area */}
        <div style={{ position: 'relative', width: 210, height: 210, marginBottom: 44 }}>
          {/* Outer ring */}
          {orbitOn && (
            <div className="spin-cw" style={{
              position: 'absolute', width: 190, height: 190, top: 10, left: 10,
              border: '1.5px solid rgba(196,181,232,0.28)', borderRadius: '50%',
              opacity: merged ? 0.4 : 0.9, transition: 'opacity 0.8s',
            }} />
          )}
          {/* Inner ring */}
          {orbitOn && (
            <div className="spin-ccw" style={{
              position: 'absolute', width: 130, height: 130, top: 40, left: 40,
              border: '1.5px dashed rgba(117,184,220,0.32)', borderRadius: '50%',
            }} />
          )}
          {/* Merge glow */}
          {merged && (
            <div className="a-fade" style={{
              position: 'absolute', width: 76, height: 76, top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(155,128,216,0.30) 0%, transparent 70%)',
              filter: 'blur(7px)',
            }} />
          )}
          {/* Person 1 */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: pos('left'),
            transition: 'transform 1.1s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <Avatar name={person1.name} color={person1.avatarColor} size={58} char={person1.avatarChar} ring />
          </div>
          {/* Person 2 */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: pos('right'),
            transition: 'transform 1.1s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <Avatar name={person2.name} color={person2.avatarColor} size={58} char={person2.avatarChar} ring />
          </div>
          {/* Center sparkle (geometric) */}
          {merged && (
            <div className="a-fade a-pulse" style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 18, height: 18, background: 'var(--lav-deep)', borderRadius: '50%', opacity: 0.7,
            }} />
          )}
        </div>

        {/* Names */}
        <div className="a-up" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 30 }}>
          <span className="serif" style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-1)' }}>{person1.name}</span>
          <span style={{ color: 'var(--lavender)', fontSize: 13 }}>与</span>
          <span className="serif" style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-1)' }}>{person2.name}</span>
        </div>

        {/* Stage list */}
        {phase === 'progress' && (
          <div className="a-fade" style={{ width: '100%', maxWidth: 290 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 22 }}>
              {STAGES.map((s, i) => {
                const done   = doneStages.includes(i);
                const active = currentStage === i && !done;
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: done ? 0.5 : active ? 1 : 0.28, transition: 'opacity 0.4s' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: done ? 'var(--mint-bg)' : active ? 'var(--lav-bg)' : 'rgba(196,181,232,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.3s',
                    }}>
                      {done
                        ? <Check size={13} color="var(--mint-deep)" strokeWidth={2.5} />
                        : <div style={{ width: 6, height: 6, borderRadius: '50%', background: active ? 'var(--lav-deep)' : 'var(--text-5)' }} />
                      }
                    </div>
                    <span style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? 'var(--text-1)' : 'var(--text-3)' }}>
                      {s}
                    </span>
                    {active && (
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[0,1,2].map(j => (
                          <div key={j} className="a-pulse" style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--lavender)', animationDelay: `${j * 0.2}s` }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Progress bar */}
            <div style={{ height: 6, background: 'rgba(196,181,232,0.22)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #C4B5E8, var(--lav-deep))', borderRadius: 3, transition: 'width 0.28s ease-out' }} />
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-4)', textAlign: 'center' }}>
              {Math.round(progress)}%
            </p>
          </div>
        )}

        {/* Pre-progress hint */}
        {phase !== 'progress' && (
          <p className="a-fade" style={{ fontSize: 14, color: 'var(--text-4)', textAlign: 'center', maxWidth: 230, lineHeight: 1.7 }}>
            {phase === 'enter' ? '连接中……' : phase === 'orbit' ? '分析双方的星象位置' : '建立关系连线'}
          </p>
        )}
      </div>
    </div>
  );
}
