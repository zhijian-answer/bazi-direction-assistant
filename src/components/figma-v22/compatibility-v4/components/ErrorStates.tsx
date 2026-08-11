import { WifiOff, RefreshCw, Save, AlertCircle } from 'lucide-react';

type ErrorType = 'network' | 'generate' | 'save' | 'data';

const CFG: Record<ErrorType, { Icon: typeof WifiOff; title: string; desc: string; action: string; color: string; bg: string }> = {
  network:  { Icon: WifiOff,      title: '网络连接中断',    desc: '检查网络后重试，已填写的内容不会丢失。',   action: '重新连接',   color: 'var(--coral-deep)', bg: 'var(--coral-bg)' },
  generate: { Icon: RefreshCw,    title: '分析过程遇到问题', desc: '出生信息已保存，可以直接重试。',           action: '重新生成',   color: 'var(--gold-deep)',  bg: 'var(--gold-bg)' },
  save:     { Icon: Save,         title: '保存失败了',       desc: '报告内容完好，稍后再试。',                 action: '重新保存',   color: 'var(--sky-deep)',   bg: 'var(--sky-bg)' },
  data:     { Icon: AlertCircle,  title: '出生信息不够完整', desc: '至少需要对方的出生日期才能生成报告。',     action: '补全出生信息', color: 'var(--mint-deep)', bg: 'var(--mint-bg)' },
};

interface BannerProps { type: ErrorType; onRetry?: () => void; onDismiss?: () => void; }

export function ErrorBanner({ type, onRetry, onDismiss }: BannerProps) {
  const { Icon, title, desc, action, color, bg } = CFG[type];
  return (
    <div className="a-up" style={{ borderRadius:14, padding:'13px 15px', background:bg, border:`1px solid ${color}44`, marginBottom:12 }}>
      <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
        <Icon size={17} color={color} strokeWidth={1.8} style={{ marginTop:1, flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <p style={{ margin:'0 0 3px', fontSize:13, fontWeight:700, color }}>{title}</p>
          <p style={{ margin:0, fontSize:13, color:'var(--text-3)', lineHeight:1.55 }}>{desc}</p>
          {onRetry && (
            <button onClick={onRetry} style={{ marginTop:10, border:'none', borderRadius:9, padding:'7px 15px', background:color, color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              {action}
            </button>
          )}
        </div>
        {onDismiss && (
          <button onClick={onDismiss} style={{ border:'none', background:'none', cursor:'pointer', color:'var(--text-4)', fontSize:18, lineHeight:1, padding:0 }}>×</button>
        )}
      </div>
    </div>
  );
}

interface FullProps { type: ErrorType; onRetry?: () => void; onBack?: () => void; }

export function ErrorFullScreen({ type, onRetry, onBack }: FullProps) {
  const { Icon, title, desc, action, color, bg } = CFG[type];
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', padding:'40px 32px', textAlign:'center' }}>
      <div style={{ width:72, height:72, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
        <Icon size={28} color={color} strokeWidth={1.6} />
      </div>
      <h2 className="serif" style={{ margin:'0 0 9px', fontSize:18, fontWeight:600, color:'var(--text-1)' }}>{title}</h2>
      <p style={{ margin:'0 0 26px', fontSize:14, color:'var(--text-3)', lineHeight:1.7 }}>{desc}</p>
      <div style={{ display:'flex', gap:10 }}>
        {onBack && <button onClick={onBack} className="btn btn-ghost" style={{ flex:1 }}>返回</button>}
        {onRetry && <button onClick={onRetry} className="btn btn-primary" style={{ flex:2 }}>{action}</button>}
      </div>
    </div>
  );
}
