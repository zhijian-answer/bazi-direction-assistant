import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronDown, Share2, Bookmark, ChevronRight, Sun, Home, Check } from 'lucide-react';
import Avatar from '../components/Avatar';
import ScoreBar from '../components/ScoreBar';
import ScoreRing from '../components/ScoreRing';
import type { SynastryRecord, ReportSection, SectionColorKey } from '../types';
import { RELATION_LABELS, SECTION_COLORS } from '../types';

interface Props {
  record: SynastryRecord;
  onBack: () => void;
  onShare: () => void;
  onSave: () => void;
  onAskQuestion: (q: string) => void;
  onGoHome: () => void;
  loading?: boolean;
  error?: string | null;
}

const SCORE_META: { key: keyof SynastryRecord['api']['scores']; label: string; color: string }[] = [
  { key: 'attraction',    label: '吸引力',   color: 'var(--coral-deep)' },
  { key: 'emotion',       label: '情绪回应', color: 'var(--lav-deep)'   },
  { key: 'communication', label: '沟通方式', color: 'var(--sky-deep)'   },
  { key: 'values',        label: '价值观',   color: 'var(--mint-deep)'  },
  { key: 'pace',          label: '行动节奏', color: 'var(--gold-deep)'  },
  { key: 'intimacy',      label: '亲密需求', color: 'var(--coral-deep)' },
];

const DEFAULT_OPEN = 2;

// Scroll-reveal hook
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('visible'); obs.disconnect(); }
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function RevealDiv({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useReveal();
  return <div ref={ref} className="reveal" style={style}>{children}</div>;
}

function SectionCard({ sec, defaultOpen }: { sec: ReportSection; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useReveal();
  const clr = SECTION_COLORS[sec.colorKey as SectionColorKey] ?? SECTION_COLORS.lavender;

  return (
    <div ref={ref} className="reveal glass" style={{ borderRadius: 18, marginBottom: 10, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '15px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', minHeight: 52 }}
      >
        <div style={{ width: 30, height: 30, borderRadius: 9, background: clr.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: clr.text }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{sec.title}</span>
            {sec.score != null && <span style={{ fontSize: 12, fontWeight: 700, color: clr.text }}>{sec.score}</span>}
          </div>
        </div>
        <ChevronDown size={16} color="var(--text-4)" strokeWidth={2} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s', flexShrink: 0 }} />
      </button>

      <div style={{ maxHeight: open ? 700 : 0, overflow: 'hidden', transition: 'max-height 0.36s cubic-bezier(0.25,0.8,0.25,1)' }}>
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(196,181,232,0.14)' }}>
          {/* body from api */}
          <p style={{ margin: '14px 0', fontSize: 14, color: 'var(--text-2)', lineHeight: 1.85 }}>{sec.body}</p>

          {sec.signals && sec.signals.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ margin: '0 0 7px', fontSize: 12, fontWeight: 600, color: 'var(--text-4)', letterSpacing: '0.03em' }}>现实信号</p>
              {sec.signals.map((sig, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, alignItems: 'flex-start' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: clr.text, marginTop: 6, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.65 }}>{sig}</span>
                </div>
              ))}
            </div>
          )}

          {sec.actions && sec.actions.length > 0 && (
            <div>
              <p style={{ margin: '0 0 7px', fontSize: 12, fontWeight: 600, color: 'var(--text-4)', letterSpacing: '0.03em' }}>可以试试</p>
              {sec.actions.map((act, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7, alignItems: 'flex-start', background: clr.bg, borderRadius: 10, padding: '9px 11px' }}>
                  <ChevronRight size={13} color={clr.text} strokeWidth={2.3} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65 }}>{act}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonLine({ h = 16, w = '100%', mb = 8 }: { h?: number; w?: string; mb?: number }) {
  return <div className="skeleton" style={{ height: h, width: w, marginBottom: mb }} />;
}

export default function ResultScreen({ record, onBack, onShare, onSave, onAskQuestion, onGoHome, loading, error }: Props) {
  const [saved, setSaved] = useState(false);
  const api = record.api;

  function handleSave() {
    onSave();
    setSaved(true);
    // Reset so it can be saved again after navigation if needed
    setTimeout(() => setSaved(false), 3000);
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="screen-scroll">
        <div className="status-bar">
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', minWidth: 44, display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={22} color="var(--text-1)" strokeWidth={1.8} />
          </button>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>合盘报告</span>
          <div style={{ width: 44 }} />
        </div>
        <div style={{ padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SkeletonLine h={90} />
          <SkeletonLine h={130} />
          <SkeletonLine h={64} />
          <SkeletonLine h={64} />
          <SkeletonLine h={64} />
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="screen-full" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--coral-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--coral-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--coral-deep)', fontWeight: 700 }}>!</span>
          </div>
        </div>
        <h2 className="serif" style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 600, color: 'var(--text-1)' }}>报告生成失败</h2>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--text-3)', lineHeight: 1.7 }}>{error}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onBack} className="btn btn-ghost" style={{ flex: 1 }}>返回</button>
          <button onClick={onGoHome} className="btn btn-primary" style={{ flex: 2 }}>返回首页</button>
        </div>
      </div>
    );
  }

  // ── Main report ──────────────────────────────────────────────────────────────
  return (
    <div className="screen-scroll">
      {/* Header */}
      <div className="status-bar">
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', minWidth: 44, display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={22} color="var(--text-1)" strokeWidth={1.8} />
        </button>
        <span className="serif" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>合盘报告</span>
        {/* Save button with confirmation state */}
        <button
          onClick={handleSave}
          style={{ background: 'none', border: 'none', cursor: 'pointer', minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}
        >
          {saved
            ? <><Check size={14} color="var(--mint-deep)" strokeWidth={2.5} /><span style={{ fontSize: 13, color: 'var(--mint-deep)', fontWeight: 600 }}>已保存</span></>
            : <span style={{ fontSize: 13, color: 'var(--lav-deep)', fontWeight: 600 }}>保存</span>
          }
        </button>
      </div>

      {/* Toast */}
      {saved && (
        <div className="a-up" style={{
          position: 'fixed', top: 54, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--text-1)', color: '#fff', borderRadius: 20, padding: '9px 18px',
          fontSize: 13, fontWeight: 500, zIndex: 200, whiteSpace: 'nowrap',
          boxShadow: '0 4px 18px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Check size={14} strokeWidth={2.5} />
          已保存到合盘记录
        </div>
      )}

      <div style={{ padding: '0 20px 36px' }}>

        {/* ── Hero — life-first, no score ── */}
        <div className="a-up" style={{ marginBottom: 18, paddingTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0, marginBottom: 16 }}>
            <Avatar name={record.person1.name} color={record.person1.avatarColor} size={60} char={record.person1.avatarChar} ring />
            <div style={{ width: 28, height: 28, borderRadius: '50%', zIndex: 1, marginLeft: -8, marginRight: -8, background: 'var(--lav-bg)', border: '2px solid rgba(255,255,255,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--lav-deep)' }} />
            </div>
            <Avatar name={record.person2.name} color={record.person2.avatarColor} size={60} char={record.person2.avatarChar} ring />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 13 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--lav-deep)', background: 'var(--lav-bg)', borderRadius: 20, padding: '5px 14px' }}>
              {record.person1.name} & {record.person2.name} · {RELATION_LABELS[record.relationshipType]}
            </span>
          </div>

          {/* heroTitle from api */}
          <h1 className="serif" style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-1)', textAlign: 'center', margin: '0 0 9px', lineHeight: 1.55 }}>
            {api.heroTitle}
          </h1>
          {/* heroSubtitle from api */}
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-3)', textAlign: 'center' }}>
            {api.heroSubtitle}
          </p>
        </div>

        {/* ── Summary — api.summary ── */}
        <div className="a-up d-100 glass-lav" style={{ borderRadius: 18, padding: '17px 17px', marginBottom: 13 }}>
          <p style={{ margin: '0 0 9px', fontSize: 13, fontWeight: 700, color: 'var(--lav-deep)', letterSpacing: '0.02em' }}>综合摘要</p>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.85 }}>{api.summary}</p>
          {api.tags.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {api.tags.map(t => (
                <span key={t} style={{ fontSize: 11, fontWeight: 500, color: 'var(--lav-deep)', background: 'rgba(123,101,196,0.12)', borderRadius: 8, padding: '3px 8px' }}>{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* ── Score ring + bars — compact, secondary ── */}
        <div className="a-up d-150 glass" style={{ borderRadius: 18, padding: '16px 17px', marginBottom: 13 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
            <ScoreRing score={api.overallScore} size={76} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 11px', fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>各维度参考</p>
              {SCORE_META.map((m, i) => (
                <ScoreBar key={m.key} label={m.label} score={api.scores[m.key]} color={m.color} delay={i * 70} />
              ))}
            </div>
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--text-4)', lineHeight: 1.5 }}>
            分数是辅助参考，不代表关系好坏。重点在下面的分析。
          </p>
        </div>

        {/* ── Sections — first DEFAULT_OPEN expanded, rest collapsed ── */}
        {api.sections.map((sec, i) => (
          <SectionCard key={sec.key} sec={sec} defaultOpen={i < DEFAULT_OPEN} />
        ))}

        {/* ── Today's step — api.todayStep ── */}
        {api.todayStep && (
          <RevealDiv style={{ borderRadius: 18, marginBottom: 12, overflow: 'hidden' }}>
            <div className="glass-gold" style={{ borderRadius: 18, padding: '17px 17px' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--gold-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sun size={16} color="var(--gold-deep)" strokeWidth={1.8} />
                </div>
                <div>
                  <p style={{ margin: '0 0 7px', fontSize: 13, fontWeight: 700, color: 'var(--gold-deep)' }}>今天可以做的一步</p>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.85 }}>{api.todayStep}</p>
                </div>
              </div>
            </div>
          </RevealDiv>
        )}

        {/* ── Questions — api.questions, each card is tappable ── */}
        {api.questions.length > 0 && (
          <RevealDiv style={{ marginBottom: 12 }}>
            <div className="glass" style={{ borderRadius: 18, padding: '17px 17px' }}>
              <p style={{ margin: '0 0 5px', fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>你还可以继续问</p>
              <p style={{ margin: '0 0 13px', fontSize: 12, color: 'var(--text-4)' }}>点击问题，看更具体的分析</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {api.questions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => onAskQuestion(q)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      border: '1px solid rgba(196,181,232,0.30)', borderRadius: 12, padding: '12px 13px',
                      background: 'rgba(255,255,255,0.52)', cursor: 'pointer', textAlign: 'left',
                      width: '100%', transition: 'all 0.15s', minHeight: 44,
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>{q}</span>
                    <ChevronRight size={14} color="var(--text-5)" strokeWidth={2} style={{ flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>
          </RevealDiv>
        )}

        {/* ── Bottom actions ── */}
        <RevealDiv style={{ marginBottom: 14 }}>
          {/* Share image + Save */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            {/* 生成分享图 → opens ShareModal */}
            <button onClick={onShare} className="btn btn-ghost" style={{ flex: 1, height: 50, gap: 6 }}>
              <Share2 size={16} strokeWidth={1.8} />
              生成分享图
            </button>
            {/* Save */}
            <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1, height: 50, gap: 6 }}>
              <Bookmark size={16} strokeWidth={1.8} />
              {saved ? '已保存' : '保存报告'}
            </button>
          </div>
          {/* Return home */}
          <button onClick={onGoHome} className="btn btn-ghost" style={{ width: '100%', height: 50, gap: 6 }}>
            <Home size={16} strokeWidth={1.8} />
            返回首页
          </button>
        </RevealDiv>

        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-5)', textAlign: 'center', lineHeight: 1.6 }}>
          报告依据双方出生信息生成，属参考性内容。<br />关系走向由当事人共同决定。
        </p>

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
