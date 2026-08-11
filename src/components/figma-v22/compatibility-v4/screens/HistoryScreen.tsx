import { Plus, ChevronRight } from 'lucide-react';
import Avatar from '../components/Avatar';
import type { SynastryRecord } from '../types';
import { RELATION_LABELS } from '../types';

interface Props {
  records: SynastryRecord[];
  onViewRecord: (id: string) => void;
  onStartNew: () => void;
}

function formatDate(d: string) {
  const dt = new Date(d);
  return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日`;
}

function RecordCard({ rec, onClick }: { rec: SynastryRecord; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="glass"
      style={{
        display: 'flex', flexDirection: 'column',
        border: 'none', cursor: 'pointer', borderRadius: 18,
        padding: '16px 17px', width: '100%', textAlign: 'left', marginBottom: 10,
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 11 }}>
        <div style={{ position: 'relative', width: 62, height: 42, flexShrink: 0 }}>
          <Avatar name={rec.person1.name} color={rec.person1.avatarColor} size={42} char={rec.person1.avatarChar} />
          <Avatar
            name={rec.person2.name} color={rec.person2.avatarColor} size={42} char={rec.person2.avatarChar}
            style={{ position: 'absolute', left: 21, top: 0, border: '2.5px solid rgba(255,255,255,0.9)' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>
              {rec.person1.name} & {rec.person2.name}
            </span>
            <span style={{ fontSize: 11, fontWeight: 500, borderRadius: 8, padding: '2px 8px', background: 'var(--lav-bg)', color: 'var(--lav-deep)', flexShrink: 0 }}>
              {RELATION_LABELS[rec.relationshipType]}
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-4)' }}>{formatDate(rec.createdAt)}</span>
        </div>
        {/* overallScore from api */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="serif" style={{ fontSize: 22, fontWeight: 700, color: 'var(--lav-deep)', lineHeight: 1 }}>
            {rec.api.overallScore}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 2 }}>综合</div>
        </div>
      </div>

      {/* heroTitle from api */}
      <p className="serif" style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', lineHeight: 1.65 }}>
        &ldquo;{rec.api.heroTitle}&rdquo;
      </p>

      {/* tags from api */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {rec.api.tags.map(t => (
          <span key={t} style={{ fontSize: 11, color: 'var(--lav-deep)', background: 'var(--lav-bg)', borderRadius: 8, padding: '3px 8px', fontWeight: 500 }}>
            {t}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 11 }}>
        <span style={{ fontSize: 12, color: 'var(--lav-deep)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
          继续看下去 <ChevronRight size={13} strokeWidth={2.2} />
        </span>
      </div>
    </button>
  );
}

function EmptyState({ onStartNew }: { onStartNew: () => void }) {
  return (
    <div className="a-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 32px', textAlign: 'center' }}>
      {/* Geometric illustration */}
      <div style={{ position: 'relative', width: 110, height: 110, marginBottom: 26 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--lav-bg)', position: 'absolute', top: 0, left: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--lav-deep)', opacity: 0.5 }} />
        </div>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--sky-bg)', position: 'absolute', bottom: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--sky-deep)', opacity: 0.5 }} />
        </div>
      </div>
      <h2 className="serif" style={{ margin: '0 0 9px', fontSize: 18, fontWeight: 600, color: 'var(--text-1)' }}>
        还没有合盘记录
      </h2>
      <p style={{ margin: '0 0 26px', fontSize: 14, color: 'var(--text-3)', lineHeight: 1.7 }}>
        生成第一份报告，<br />开始了解一段关系
      </p>
      <button onClick={onStartNew} className="btn btn-primary" style={{ paddingLeft: 28, paddingRight: 28 }}>
        <Plus size={16} strokeWidth={2.3} />
        开始第一次合盘
      </button>
    </div>
  );
}

export default function HistoryScreen({ records, onViewRecord, onStartNew }: Props) {
  return (
    <div className="screen-scroll">
      <div className="status-bar">
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>合盘记录</span>
      </div>

      {records.length === 0 ? (
        <EmptyState onStartNew={onStartNew} />
      ) : (
        <div style={{ padding: '0 20px 24px' }}>
          <div className="a-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}>
              共 {records.length} 份报告
            </h2>
            <button onClick={onStartNew} className="btn btn-primary btn-sm">
              <Plus size={14} strokeWidth={2.3} />
              新合盘
            </button>
          </div>

          {records.map((rec, i) => (
            <div key={rec.id} className={i < 5 ? `d-${i * 100}` : ''}>
              <RecordCard rec={rec} onClick={() => onViewRecord(rec.id)} />
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 12 }} />
    </div>
  );
}
