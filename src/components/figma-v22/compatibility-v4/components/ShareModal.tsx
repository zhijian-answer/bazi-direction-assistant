import { useState } from 'react';
import { MessageCircle, Image, Link, Download, X } from 'lucide-react';
import Avatar from './Avatar';
import type { SynastryRecord } from '../types';
import { RELATION_LABELS } from '../types';

interface Props {
  record: SynastryRecord;
  onClose: () => void;
}

// All displayed text sourced from record.api (no hardcoded copy)
const SHARE_OPTS = [
  { key: 'wechat',   Icon: MessageCircle, label: '微信好友' },
  { key: 'moments',  Icon: Image,         label: '朋友圈' },
  { key: 'link',     Icon: Link,          label: '复制链接' },
  { key: 'download', Icon: Download,      label: '保存图片' },
];

function Poster({ record }: { record: SynastryRecord }) {
  const api = record.api;
  return (
    <div style={{
      width: 300, borderRadius: 24, overflow: 'hidden',
      background: 'linear-gradient(165deg, var(--pearl) 0%, var(--lav-bg) 55%, var(--sky-bg) 100%)',
      boxShadow: '0 20px 56px rgba(30,26,48,0.32)',
    }}>
      {/* Header */}
      <div style={{ padding:'22px 22px 15px', textAlign:'center', borderBottom:'1px solid rgba(196,181,232,0.18)' }}>
        <p style={{ margin:'0 0 3px', fontSize:10, color:'var(--text-4)', letterSpacing:'0.08em' }}>玄枢 · 合盘报告</p>
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:7, margin:'11px 0' }}>
          <Avatar name={record.person1.name} color={record.person1.avatarColor} size={42} char={record.person1.avatarChar} />
          <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--lav-deep)', opacity:0.6 }} />
          <Avatar name={record.person2.name} color={record.person2.avatarColor} size={42} char={record.person2.avatarChar} />
        </div>
        <p style={{ margin:'0 0 2px', fontSize:13, fontWeight:600, color:'var(--text-1)' }}>
          {record.person1.name} & {record.person2.name}
        </p>
        <p style={{ margin:0, fontSize:11, color:'var(--text-4)' }}>
          {RELATION_LABELS[record.relationshipType]}
        </p>
      </div>

      {/* Quote — from api */}
      <div style={{ padding:'15px 22px' }}>
        <p className="serif" style={{ margin:'0 0 13px', fontSize:14, color:'var(--text-1)', lineHeight:1.7, textAlign:'center', fontWeight:500 }}>
          &ldquo;{api.heroTitle}&rdquo;
        </p>
        {/* Score */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
          <div style={{ textAlign:'center' }}>
            <div className="serif" style={{ fontSize:30, fontWeight:700, color:'var(--lav-deep)', lineHeight:1 }}>
              {api.overallScore}
            </div>
            <div style={{ fontSize:10, color:'var(--text-4)', marginTop:2 }}>综合评分</div>
          </div>
        </div>
        {/* Tags */}
        <div style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', gap:5 }}>
          {api.tags.map(t => (
            <span key={t} style={{ fontSize:11, color:'var(--lav-deep)', background:'var(--lav-bg)', borderRadius:8, padding:'3px 8px' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:'11px 22px 16px', borderTop:'1px solid rgba(196,181,232,0.18)', background:'rgba(255,255,255,0.45)', textAlign:'center' }}>
        <p style={{ margin:0, fontSize:11, color:'var(--text-4)' }}>在玄枢查看完整合盘报告</p>
        <div style={{ width:40, height:40, borderRadius:10, background:'var(--lav-bg)', margin:'8px auto 0', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width:14, height:14, borderRadius:'50%', background:'var(--lav-deep)' }} />
        </div>
      </div>
    </div>
  );
}

export default function ShareModal({ record, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [showPoster, setShowPoster] = useState(false);

  function handle(key: string) {
    setActive(key);
    if (key === 'link') {
      setCopied(true);
      setTimeout(() => { setCopied(false); setActive(null); }, 1800);
    } else if (key === 'download') {
      setShowPoster(true);
      setActive(null);
    } else {
      setTimeout(() => setActive(null), 1400);
    }
  }

  if (showPoster) {
    return (
      <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(30,26,48,0.78)', backdropFilter:'blur(8px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div className="a-scale">
          <Poster record={record} />
        </div>
        <button onClick={() => setShowPoster(false)} style={{ marginTop:18, border:'none', background:'rgba(255,255,255,0.14)', color:'#fff', borderRadius:12, padding:'10px 24px', fontSize:14, cursor:'pointer', backdropFilter:'blur(8px)' }}>
          关闭预览
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{ position:'fixed', inset:0, background:'rgba(30,26,48,0.48)', backdropFilter:'blur(4px)', zIndex:98 }} onClick={onClose} />
      <div className="a-modal" style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:99,
        background:'rgba(250,248,245,0.97)', backdropFilter:'blur(28px)',
        borderRadius:'22px 22px 0 0', padding:`0 0 calc(env(safe-area-inset-bottom,12px) + 12px)`,
        boxShadow:'0 -6px 36px rgba(30,26,48,0.12)',
      }}>
        {/* Handle */}
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 0' }}>
          <div style={{ width:34, height:4, borderRadius:2, background:'var(--text-5)' }} />
        </div>

        <div style={{ padding:'15px 22px 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'var(--text-1)' }}>分享报告</h3>
            <button onClick={onClose} style={{ border:'none', background:'none', cursor:'pointer', padding:'4px', display:'flex' }}>
              <X size={20} color="var(--text-4)" strokeWidth={1.8} />
            </button>
          </div>

          {/* Share options */}
          <div style={{ display:'flex', justifyContent:'space-around', marginBottom:22 }}>
            {SHARE_OPTS.map(({ key, Icon, label }) => (
              <button key={key} onClick={() => handle(key)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, border:'none', background:'none', cursor:'pointer', padding:'8px', minWidth:56 }}>
                <div style={{
                  width:52, height:52, borderRadius:15,
                  background: active === key ? 'var(--lav-bg)' : 'rgba(237,235,248,0.6)',
                  border: active === key ? '1.5px solid rgba(123,101,196,0.48)' : '1px solid rgba(196,181,232,0.28)',
                  display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
                }}>
                  <Icon size={20} color="var(--lav-deep)" strokeWidth={1.8} />
                </div>
                <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:500 }}>
                  {key === 'link' && copied ? '已复制' : label}
                </span>
              </button>
            ))}
          </div>

          {/* Poster preview row */}
          <button onClick={() => setShowPoster(true)} className="glass" style={{
            width:'100%', border:'none', borderRadius:15, padding:'13px 15px',
            cursor:'pointer', display:'flex', alignItems:'center', gap:13,
          }}>
            <div style={{ width:44, height:60, borderRadius:9, background:'linear-gradient(160deg, var(--lav-bg), var(--sky-bg))', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:14, height:14, borderRadius:'50%', background:'var(--lav-deep)', opacity:0.7 }} />
            </div>
            <div style={{ flex:1, textAlign:'left' }}>
              <p style={{ margin:'0 0 3px', fontSize:14, fontWeight:600, color:'var(--text-1)' }}>朋友圈海报</p>
              <p style={{ margin:0, fontSize:12, color:'var(--text-3)' }}>预览并保存分享图片</p>
            </div>
            <X size={15} color="var(--text-5)" style={{ transform:'rotate(45deg)' }} strokeWidth={2} />
          </button>

          <button onClick={onClose} className="btn btn-ghost" style={{ width:'100%', marginTop:10, height:46 }}>取消</button>
        </div>
      </div>
    </>
  );
}
