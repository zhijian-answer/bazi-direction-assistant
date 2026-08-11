import { useState } from 'react';
import { ChevronLeft, ChevronDown, Info } from 'lucide-react';
import Avatar from '../components/Avatar';
import type { CreateFlowData, PersonFact } from '../types';

interface Props {
  me: PersonFact;
  data: Partial<CreateFlowData>;
  onChange: (d: Partial<CreateFlowData>) => void;
  onGenerate: () => void;
  onBack: () => void;
}

type TimeAcc = 'exact' | 'approximate' | 'unknown';

const SHICHEN = [
  '子时 23–1时', '丑时 1–3时', '寅时 3–5时', '卯时 5–7时',
  '辰时 7–9时', '巳时 9–11时', '午时 11–13时', '未时 13–15时',
  '申时 15–17时', '酉时 17–19时', '戌时 19–21时', '亥时 21–23时',
];

function completeness(p: Partial<PersonFact>): number {
  let s = 0;
  if (p.birthday) s += 40;
  if (p.birthTimeAccuracy === 'exact' && p.birthTime) s += 35;
  else if (p.birthTimeAccuracy === 'approximate' && p.birthTime) s += 18;
  if (p.birthPlace) s += 25;
  return s;
}

function MeterBar({ score }: { score: number }) {
  const color = score >= 80 ? 'var(--mint-deep)' : score >= 50 ? 'var(--gold-deep)' : 'var(--coral-deep)';
  const label = score >= 80 ? '资料充分' : score >= 50 ? '基本够用' : '资料较少';
  return (
    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{ flex: 1, height: 5, background: 'rgba(196,181,232,0.22)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontSize: 12, color, fontWeight: 600, flexShrink: 0 }}>{label}</span>
    </div>
  );
}

function PersonForm({
  person, label, color, onChange: onPChange, readOnly,
}: {
  person: Partial<PersonFact>;
  label: string;
  color: string;
  onChange?: (p: Partial<PersonFact>) => void;
  readOnly?: boolean;
}) {
  const [timeAcc, setTimeAcc] = useState<TimeAcc>(person.birthTimeAccuracy ?? 'unknown');
  const [showShichen, setShowShichen] = useState(false);
  const [showTimeInfo, setShowTimeInfo] = useState(false);

  function upd(fields: Partial<PersonFact>) {
    if (!onPChange) return;
    onPChange({ ...person, ...fields });
  }
  function setAcc(acc: TimeAcc) {
    setTimeAcc(acc);
    upd({ birthTimeAccuracy: acc, birthTime: acc === 'unknown' ? '' : person.birthTime });
  }

  const score = completeness(person);

  return (
    <div className="glass" style={{ borderRadius: 18, padding: '16px 16px', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Avatar name={person.name ?? label} color={color} size={36} char={person.name?.[0]} />
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{person.name ?? label}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-4)' }}>{label}</p>
        </div>
        {readOnly && (
          <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: 'var(--mint-deep)', background: 'var(--mint-bg)', borderRadius: 8, padding: '3px 9px' }}>
            资料已有
          </span>
        )}
      </div>

      {readOnly ? (
        <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>
          <span>{person.birthday}</span>
          {person.birthTime && <span> · {person.birthTime}</span>}
          {person.birthPlace && <span> · {person.birthPlace}</span>}
        </div>
      ) : (
        <>
          {/* Birthday */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
              出生日期 <span style={{ color: 'var(--coral-deep)' }}>*</span>
            </label>
            <input
              type="date"
              value={person.birthday ?? ''}
              onChange={e => upd({ birthday: e.target.value })}
              className="input"
            />
          </div>

          {/* Time accuracy */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
              <label style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>出生时间</label>
              <button
                onClick={() => setShowTimeInfo(!showTimeInfo)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, padding: 0 }}
              >
                <Info size={13} color="var(--lav-deep)" />
                <span style={{ fontSize: 11, color: 'var(--lav-deep)' }}>时辰影响</span>
              </button>
            </div>

            {showTimeInfo && (
              <div className="glass-lav a-up" style={{ borderRadius: 11, padding: '10px 12px', marginBottom: 10 }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>
                  出生时间影响上升星座，改变性格外显与人际方式。时间不准时，“外在表现”部分可信度会低一些，核心吸引与情绪模式仍有效。
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 6, marginBottom: timeAcc !== 'unknown' ? 10 : 0 }}>
              {(['exact','approximate','unknown'] as TimeAcc[]).map(acc => {
                const labels = { exact: '准确时间', approximate: '大概时辰', unknown: '不知道' };
                const active = timeAcc === acc;
                return (
                  <button
                    key={acc}
                    onClick={() => setAcc(acc)}
                    style={{
                      flex: 1, border: active ? '1.5px solid rgba(123,101,196,0.45)' : '1px solid rgba(196,181,232,0.30)',
                      borderRadius: 10, padding: '8px 4px',
                      background: active ? 'var(--lav-bg)' : 'rgba(255,255,255,0.55)',
                      color: active ? 'var(--lav-deep)' : 'var(--text-3)',
                      fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s',
                      minHeight: 36,
                    }}
                  >
                    {labels[acc]}
                  </button>
                );
              })}
            </div>

            {timeAcc === 'exact' && (
              <input type="time" value={person.birthTime ?? ''} onChange={e => upd({ birthTime: e.target.value })} className="input" />
            )}

            {timeAcc === 'approximate' && (
              <div>
                <button
                  onClick={() => setShowShichen(!showShichen)}
                  style={{
                    width: '100%', border: '1.5px solid rgba(196,181,232,0.35)', borderRadius: 12,
                    padding: '11px 13px', fontSize: 14,
                    color: person.birthTime ? 'var(--text-1)' : 'var(--text-5)',
                    background: 'rgba(255,255,255,0.72)', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    minHeight: 44,
                  }}
                >
                  <span>{person.birthTime || '选择大概时辰'}</span>
                  <ChevronDown size={16} color="var(--text-4)" style={{ transform: showShichen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {showShichen && (
                  <div className="glass-deep a-scale" style={{ borderRadius: 12, marginTop: 4, maxHeight: 170, overflowY: 'auto', padding: '5px' }}>
                    {SHICHEN.map(s => (
                      <button
                        key={s}
                        onClick={() => { upd({ birthTime: s }); setShowShichen(false); }}
                        style={{
                          display: 'block', width: '100%', border: 'none', borderRadius: 8,
                          padding: '9px 12px', textAlign: 'left', cursor: 'pointer',
                          background: person.birthTime === s ? 'var(--lav-bg)' : 'transparent',
                          color: person.birthTime === s ? 'var(--lav-deep)' : 'var(--text-2)',
                          fontSize: 13, fontWeight: person.birthTime === s ? 600 : 400, minHeight: 38,
                        }}
                      >{s}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Birth place */}
          <div style={{ marginBottom: 6 }}>
            <label style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
              出生地
            </label>
            <input
              type="text"
              value={person.birthPlace ?? ''}
              onChange={e => upd({ birthPlace: e.target.value })}
              placeholder={'城市名，如「上海市」'}
              className="input"
            />
          </div>
        </>
      )}

      <MeterBar score={score} />
    </div>
  );
}

export default function CreateStep2({ me, data, onChange, onGenerate, onBack }: Props) {
  const person2 = data.person2 as Partial<PersonFact> ?? {};
  const p2Score = completeness(person2);
  const p1Score = completeness(me);
  const avgScore = Math.round((p1Score + p2Score) / 2);
  const canGo = !!person2.birthday;

  function updateP2(p: Partial<PersonFact>) {
    onChange({ ...data, person2: p });
  }

  return (
    <div className="screen-scroll">
      <div className="status-bar">
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', minWidth: 44, display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={22} color="var(--text-1)" strokeWidth={1.8} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', fontFamily: "'Noto Sans SC', sans-serif" }}>出生信息</span>
        <div style={{ width: 44 }} />
      </div>

      <div style={{ padding: '0 20px 28px' }}>
        {/* Progress */}
        <div className="a-up" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--lav-deep)' }}>第 2 步 / 2</span>
            <span style={{ fontSize: 12, color: 'var(--text-4)' }}>填写出生信息</span>
          </div>
          <div style={{ height: 5, background: 'rgba(196,181,232,0.22)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #C4B5E8, var(--lav-deep))', borderRadius: 3 }} />
          </div>
        </div>

        {/* Me (readonly) */}
        <div className="a-up d-100">
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>我的信息</p>
          <PersonForm person={me} label="我" color={me.avatarColor} readOnly />
        </div>

        {/* Person 2 */}
        <div className="a-up d-200">
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>
            {person2.name ?? '对方'}的信息
          </p>
          <PersonForm
            person={person2}
            label="对方"
            color={(data.person2 as PersonFact)?.avatarColor ?? 'var(--sky-deep)'}
            onChange={updateP2}
          />
        </div>

        {/* Overall meter */}
        {canGo && (
          <div className="glass-lav a-scale" style={{ borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>整体完整度</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--lav-deep)' }}>{avgScore}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(196,181,232,0.22)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${avgScore}%`, height: '100%', background: 'linear-gradient(90deg, #C4B5E8, var(--lav-deep))', borderRadius: 3, transition: 'width 0.5s' }} />
            </div>
            {avgScore < 55 && (
              <p style={{ margin: '9px 0 0', fontSize: 13, color: 'var(--text-3)', lineHeight: 1.55 }}>
                出生时间越准确，合盘细节越丰富。不知道可以选“不知道”继续。
              </p>
            )}
          </div>
        )}

        {/* Missing data warning */}
        {!canGo && person2.name && (
          <div className="glass-coral a-up" style={{ borderRadius: 13, padding: '13px 15px', marginBottom: 18 }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--coral-deep)', lineHeight: 1.55 }}>
              <strong>还缺出生日期</strong> — 这是合盘的必要条件，补全后才能生成报告。
            </p>
          </div>
        )}

        {/* CTA */}
        <button
          className="btn btn-primary"
          onClick={onGenerate}
          disabled={!canGo}
          style={{ width: '100%', height: 52 }}
        >
          {canGo ? '生成合盘报告' : '补全出生信息'}
        </button>

        <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--text-4)', textAlign: 'center' }}>
          出生资料仅用于本次分析，不对外分享
        </p>
        <div style={{ height: 12 }} />
      </div>
    </div>
  );
}
