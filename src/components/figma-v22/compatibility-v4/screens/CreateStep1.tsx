import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, Heart, Users, HelpCircle, Briefcase, Home, Sparkles, UserCheck } from 'lucide-react';
import Avatar from '../components/Avatar';
import type { CreateFlowData, RelationType, ChartType, PersonFact } from '../types';
import { RELATION_LABELS } from '../types';
import { Star, Sunset } from 'lucide-react';

interface Props {
  me: PersonFact;
  knownOthers: PersonFact[];
  data: Partial<CreateFlowData>;
  onChange: (d: Partial<CreateFlowData>) => void;
  onNext: () => void;
  onBack: () => void;
}

type RelationMeta = { type: RelationType; Icon: typeof Heart; label: string };

const RELATIONS: RelationMeta[] = [
  { type: 'lover',     Icon: Heart,      label: '恋人' },
  { type: 'partner',   Icon: UserCheck,  label: '伴侣' },
  { type: 'ambiguous', Icon: Sparkles,   label: '暧昧' },
  { type: 'friend',    Icon: Users,      label: '朋友' },
  { type: 'family',    Icon: Home,       label: '家人' },
  { type: 'colleague', Icon: Briefcase,  label: '同事' },
  { type: 'other',     Icon: HelpCircle, label: '其他' },
];

const CHART_OPTS: { id: ChartType; Icon: typeof Star; title: string; desc: string }[] = [
  { id: 'synastry', Icon: Star,   title: '星盘合盘', desc: '看两人星图如何交织' },
  { id: 'birth',    Icon: Sunset, title: '生辰合盘', desc: '天干地支五行关系' },
];

function ValidationHint({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="glass-coral a-up" style={{ borderRadius: 13, padding: '11px 14px', marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 9 }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
        <circle cx="8" cy="8" r="7" stroke="var(--coral-deep)" strokeWidth="1.4"/>
        <path d="M8 4.5v4M8 10.5v1" stroke="var(--coral-deep)" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--coral-deep)', lineHeight: 1.55 }}>
        还需要：{items.join('、')}，才能继续
      </p>
    </div>
  );
}

export default function CreateStep1({ me, knownOthers, data, onChange, onNext, onBack }: Props) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');

  const person2 = data.person2 as PersonFact | undefined;
  const relType = data.relationshipType;
  const chartType = data.chartType ?? 'synastry';

  const missing: string[] = [];
  if (!person2?.id) missing.push('选择对方');
  if (!relType) missing.push('关系类型');

  const canNext = missing.length === 0;

  function selectPerson(p: PersonFact) {
    onChange({ ...data, person2: p });
    setShowNewForm(false);
  }

  function addNew() {
    if (!newName.trim()) return;
    const p: PersonFact = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      birthday: '', birthTime: '',
      birthTimeAccuracy: 'unknown',
      birthPlace: '',
      avatarColor: '#C9A040',
    };
    onChange({ ...data, person2: p });
    setShowNewForm(false);
    setNewName('');
  }

  return (
    <div className="screen-scroll">
      {/* Header */}
      <div className="status-bar">
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', minWidth: 44, display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={22} color="var(--text-1)" strokeWidth={1.8} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', fontFamily: "'Noto Sans SC', sans-serif" }}>
          新合盘
        </span>
        <div style={{ width: 44 }} />
      </div>

      <div style={{ padding: '0 20px 28px' }}>
        {/* Progress */}
        <div className="a-up" style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--lav-deep)' }}>第 1 步 / 2</span>
            <span style={{ fontSize: 12, color: 'var(--text-4)' }}>选择双方与类型</span>
          </div>
          <div style={{ height: 5, background: 'rgba(196,181,232,0.22)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: '50%', height: '100%', background: 'linear-gradient(90deg, #C4B5E8, var(--lav-deep))', borderRadius: 3, transition: 'width 0.4s' }} />
          </div>
        </div>

        {/* Pair preview */}
        <div className="a-up d-100" style={{ marginBottom: 20 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.02em' }}>合盘双方</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Me */}
            <div className="glass" style={{ flex: 1, borderRadius: 16, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={me.name} color={me.avatarColor} size={40} char={me.avatarChar} />
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{me.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-4)' }}>我</p>
              </div>
            </div>

            <span style={{ color: 'var(--lavender)', fontSize: 16, flexShrink: 0 }}>×</span>

            {/* Person 2 */}
            {person2?.id ? (
              <button
                onClick={() => onChange({ ...data, person2: undefined })}
                style={{
                  flex: 1, border: '1.5px solid rgba(123,101,196,0.40)', borderRadius: 16,
                  padding: '13px 14px', background: 'var(--lav-bg)',
                  display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left',
                }}
              >
                <Avatar name={person2.name} color={person2.avatarColor} size={40} char={person2.avatarChar} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{person2.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--lav-deep)' }}>点击更换</p>
                </div>
                <Check size={16} color="var(--lav-deep)" strokeWidth={2.4} />
              </button>
            ) : (
              <div style={{
                flex: 1, border: '1.5px dashed rgba(196,181,232,0.50)', borderRadius: 16,
                padding: '13px 14px', background: 'rgba(255,255,255,0.42)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-4)', textAlign: 'center' }}>请选择对方</p>
              </div>
            )}
          </div>
        </div>

        {/* Select person */}
        <div className="a-up d-200" style={{ marginBottom: 20 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>选择对方</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {knownOthers.map((p) => {
              const sel = person2?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => selectPerson(p)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    border: sel ? '1.5px solid rgba(123,101,196,0.50)' : '1px solid rgba(196,181,232,0.28)',
                    borderRadius: 14, padding: '12px 14px',
                    background: sel ? 'var(--lav-bg)' : 'rgba(255,255,255,0.52)',
                    cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.16s',
                  }}
                >
                  <Avatar name={p.name} color={p.avatarColor} size={38} char={p.avatarChar} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{p.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-3)' }}>
                      {p.birthday || '未填日期'} · {p.birthPlace || '未填地点'}
                    </p>
                  </div>
                  {sel && <Check size={18} color="var(--lav-deep)" strokeWidth={2.3} />}
                </button>
              );
            })}

            {/* New person form */}
            {showNewForm ? (
              <div className="glass a-up" style={{ borderRadius: 14, padding: '14px' }}>
                <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>新建档案</p>
                <input
                  autoFocus
                  className="input"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addNew()}
                  placeholder="对方的名字"
                  style={{ marginBottom: 10 }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { setShowNewForm(false); setNewName(''); }}
                    className="btn btn-ghost btn-sm"
                    style={{ flex: 1 }}
                  >取消</button>
                  <button
                    onClick={addNew}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 2 }}
                    disabled={!newName.trim()}
                  >确认添加</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewForm(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  border: '1.5px dashed rgba(196,181,232,0.42)', borderRadius: 14,
                  padding: '12px 14px', background: 'transparent', cursor: 'pointer', width: '100%',
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', background: 'var(--lav-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Plus size={18} color="var(--lav-deep)" strokeWidth={2} />
                </div>
                <span style={{ fontSize: 14, color: 'var(--lav-deep)', fontWeight: 500 }}>新建对方档案</span>
              </button>
            )}
          </div>
        </div>

        {/* Relationship type */}
        <div className="a-up d-300" style={{ marginBottom: 20 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>你们的关系</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {RELATIONS.map(({ type, Icon, label }) => {
              const active = relType === type;
              return (
                <button
                  key={type}
                  onClick={() => onChange({ ...data, relationshipType: type })}
                  className={`chip${active ? ' active' : ''}`}
                >
                  <Icon size={14} strokeWidth={active ? 2.2 : 1.8} />
                  {label}
                </button>
              );
            })}
          </div>
          {relType && (
            <p className="a-up" style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--text-3)' }}>
              已选择：<strong style={{ color: 'var(--lav-deep)', fontWeight: 600 }}>{RELATION_LABELS[relType]}</strong>
            </p>
          )}
        </div>

        {/* Chart type */}
        <div className="a-up d-400" style={{ marginBottom: 24 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>合盘方式</p>
          <div style={{ display: 'flex', gap: 10 }}>
            {CHART_OPTS.map(({ id, Icon, title, desc }) => {
              const active = chartType === id;
              return (
                <button
                  key={id}
                  onClick={() => onChange({ ...data, chartType: id })}
                  style={{
                    flex: 1, border: active ? '1.5px solid rgba(123,101,196,0.45)' : '1.5px solid rgba(196,181,232,0.26)',
                    borderRadius: 14, padding: '14px 12px',
                    background: active ? 'var(--lav-bg)' : 'rgba(255,255,255,0.52)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.17s',
                  }}
                >
                  <Icon size={18} color={active ? 'var(--lav-deep)' : 'var(--text-4)'} strokeWidth={1.8} style={{ display: 'block', marginBottom: 8 }} />
                  <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: active ? 'var(--lav-deep)' : 'var(--text-2)' }}>{title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-4)' }}>{desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Validation */}
        {!canNext && (person2?.id || relType) && (
          <ValidationHint items={missing} />
        )}

        {/* CTA */}
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={!canNext}
          style={{ width: '100%', height: 52 }}
        >
          {canNext ? '填写出生信息' : '选择后继续'}
          {canNext && <ChevronRight size={18} strokeWidth={2.3} />}
        </button>

        <div style={{ height: 12 }} />
      </div>
    </div>
  );
}
