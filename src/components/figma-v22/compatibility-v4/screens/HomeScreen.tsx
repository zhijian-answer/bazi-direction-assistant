import { useState } from 'react';
import { ChevronRight, Star, Sunset } from 'lucide-react';
import Avatar from '../components/Avatar';
import type { AppScreen, NavTab, PersonFact, SynastryRecord } from '../types';
import { RELATION_LABELS } from '../types';

interface Props {
  me: PersonFact;
  onNavigate: (s: AppScreen) => void;
  onTabChange: (t: NavTab) => void;
  onViewRecord: (id: string) => void;
  records: SynastryRecord[];
}

const CHART_OPTS = [
  { id: 'synastry' as const, title: '星盘合盘', desc: '两人星图叠加', Icon: Star,   color: 'var(--lav-deep)',  bg: 'var(--lav-bg)',  border: 'rgba(123,101,196,0.40)' },
  { id: 'birth'    as const, title: '生辰合盘', desc: '天干地支五行', Icon: Sunset, color: 'var(--mint-deep)', bg: 'var(--mint-bg)', border: 'rgba(58,150,120,0.35)'  },
];

function timeAgo(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (diff === 0) return '今天';
  if (diff === 1) return '昨天';
  if (diff < 30) return `${diff} 天前`;
  const dt = new Date(d);
  return `${dt.getMonth() + 1}月${dt.getDate()}日`;
}

function RecordRow({ rec, onClick }: { rec: SynastryRecord; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="glass"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        border: 'none', cursor: 'pointer', borderRadius: 16,
        padding: '13px 15px', width: '100%', textAlign: 'left', marginBottom: 9,
      }}
    >
      {/* Avatar pair */}
      <div style={{ position: 'relative', width: 60, height: 40, flexShrink: 0 }}>
        <Avatar name={rec.person1.name} color={rec.person1.avatarColor} size={38} char={rec.person1.avatarChar} />
        <Avatar
          name={rec.person2.name} color={rec.person2.avatarColor} size={38} char={rec.person2.avatarChar}
          style={{ position: 'absolute', left: 22, top: 0, border: '2.5px solid rgba(255,255,255,0.92)' }}
        />
      </div>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>
            {rec.person1.name} & {rec.person2.name}
          </span>
          <span style={{ fontSize: 11, fontWeight: 500, borderRadius: 8, padding: '2px 7px', background: 'var(--lav-bg)', color: 'var(--lav-deep)', flexShrink: 0 }}>
            {RELATION_LABELS[rec.relationshipType]}
          </span>
        </div>
        {/* heroTitle from api — never hardcoded */}
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
          {rec.api.heroTitle}
        </p>
      </div>
      {/* Score + date — from api */}
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <div className="serif" style={{ fontSize: 18, fontWeight: 700, color: 'var(--lav-deep)', lineHeight: 1 }}>
          {rec.api.overallScore}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>{timeAgo(rec.createdAt)}</div>
      </div>
    </button>
  );
}

export default function HomeScreen({ me, onNavigate, onTabChange, onViewRecord, records }: Props) {
  const [chartType, setChartType] = useState<'synastry' | 'birth'>('synastry');
  const now = new Date();
  const dateLabel = `${now.getMonth() + 1}月${now.getDate()}日`;
  const recentRecords = records.slice(0, 3);

  return (
    <div className="screen-scroll">
      {/* Status bar */}
      <div className="status-bar">
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', fontFamily: "'Noto Sans SC', sans-serif" }}>
          {now.getHours().toString().padStart(2, '0')}:{now.getMinutes().toString().padStart(2, '0')}
        </span>
        <div style={{ display: 'flex', gap: 5 }}>
          <svg width="16" height="11" viewBox="0 0 16 11" fill="var(--text-2)">
            <rect x="0"    y="5" width="3"   height="6"  rx="0.8" opacity="0.35" />
            <rect x="4.5"  y="3" width="3"   height="8"  rx="0.8" opacity="0.6"  />
            <rect x="9"    y="1" width="3"   height="10" rx="0.8" opacity="0.85" />
            <rect x="13.5" y="0" width="2.5" height="11" rx="0.8"               />
          </svg>
          <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
            <rect x="0.5" y="0.5" width="18" height="10" rx="2" stroke="var(--text-2)" strokeWidth="1.1" />
            <rect x="1.5" y="1.5" width="13" height="8"  rx="1.5" fill="var(--text-2)" />
            <path d="M19.5 3.5v4a2 2 0 000-4z" fill="var(--text-2)" opacity="0.5" />
          </svg>
        </div>
      </div>

      <div style={{ padding: '2px 20px 28px' }}>
        {/* Header */}
        <div className="a-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <h1 className="serif" style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-1)', margin: 0, lineHeight: 1.2 }}>玄枢</h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-4)', letterSpacing: '0.04em' }}>{dateLabel} · 合盘</p>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
            aria-label="我的档案"
          >
            <Avatar name={me.name} color={me.avatarColor} size={40} char={me.avatarChar} ring />
          </button>
        </div>

        {/* My profile card */}
        <div className="glass a-up d-100" style={{ borderRadius: 18, padding: '15px 17px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <Avatar name={me.name} color={me.avatarColor} size={48} char={me.avatarChar} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{me.name}</p>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-3)' }}>
                {me.birthday || '还未填写出生日期'}{me.birthPlace ? ` · ${me.birthPlace}` : ''}
              </p>
            </div>
            <button
              onClick={() => onNavigate('profile')}
              style={{ fontSize: 11, fontWeight: 600, color: 'var(--lav-deep)', background: 'var(--lav-bg)', borderRadius: 9, padding: '5px 11px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 44 }}
            >
              我的档案
            </button>
          </div>
        </div>

        {/* CTA */}
        <button
          className="a-up d-150"
          onClick={() => onNavigate('create-1')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #9B80D8 0%, var(--lav-deep) 100%)',
            borderRadius: 18, padding: '17px 20px',
            boxShadow: '0 5px 20px rgba(123,101,196,0.30)', marginBottom: 13,
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <p className="serif" style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#fff' }}>开始新合盘</p>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.78)' }}>看懂这段关系</p>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={18} color="#fff" strokeWidth={2.5} />
          </div>
        </button>

        {/* Chart type */}
        <div className="a-up d-200" style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          {CHART_OPTS.map(({ id, title, desc, Icon, color, bg, border }) => (
            <button
              key={id}
              onClick={() => setChartType(id)}
              style={{
                flex: 1, border: `1.5px solid ${chartType === id ? border : 'rgba(196,181,232,0.25)'}`,
                borderRadius: 16, padding: '14px 13px',
                background: chartType === id ? bg : 'rgba(255,255,255,0.52)',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.18s', boxShadow: chartType === id ? `0 3px 12px ${color}22` : 'none',
              }}
            >
              <Icon size={18} color={chartType === id ? color : 'var(--text-4)'} strokeWidth={1.8} style={{ display: 'block', marginBottom: 8 }} />
              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600, color: chartType === id ? color : 'var(--text-2)' }}>{title}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-4)' }}>{desc}</p>
            </button>
          ))}
        </div>

        {/* Recent records */}
        {recentRecords.length > 0 && (
          <>
            <div className="a-up d-300" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}>最近合盘</h2>
              {/* "全部" navigates to HistoryScreen via tab change */}
              <button
                onClick={() => onTabChange('report')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, minHeight: 36, padding: '0 4px' }}
              >
                <span style={{ fontSize: 12, color: 'var(--lav-deep)', fontWeight: 500 }}>全部</span>
                <ChevronRight size={13} color="var(--lav-deep)" strokeWidth={2.2} />
              </button>
            </div>

            {recentRecords.map((rec, i) => (
              <div key={rec.id} className={`d-${(i + 4) * 100}`}>
                <RecordRow rec={rec} onClick={() => onViewRecord(rec.id)} />
              </div>
            ))}
          </>
        )}

        {recentRecords.length === 0 && (
          <div className="glass a-up d-300" style={{ borderRadius: 16, padding: '22px 20px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 12px', fontSize: 14, color: 'var(--text-3)', lineHeight: 1.7 }}>还没有合盘记录<br/>点击上方开始第一次</p>
          </div>
        )}

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
