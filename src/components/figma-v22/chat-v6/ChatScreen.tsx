import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, Clock, Copy, RefreshCw, Send, Square, Lightbulb, AlertCircle } from 'lucide-react';
import type { PersonFact, ChatMsg, ChatReply } from './types';

interface Props {
  userProfile: PersonFact;
  onSendMessage: (text: string) => Promise<ChatReply>;
  onBack: () => void;
  initialMessages?: ChatMsg[];
  onMessagesChange?: (messages: ChatMsg[]) => void;
  onOpenHistory?: () => void;
}

const CATEGORIES = [
  { label: '感情', prompt: '最近的感情让我有些困惑，想理一理', color: 'var(--coral-deep)', bg: 'var(--coral-bg)', border: 'rgba(200,88,64,0.26)' },
  { label: '工作', prompt: '工作上遇到一些事，想听听看法', color: 'var(--lav-deep)', bg: 'var(--lav-bg)', border: 'rgba(123,101,196,0.28)' },
  { label: '财富', prompt: '最近财务状态让我有些焦虑，想聊聊', color: 'var(--gold-deep)', bg: 'var(--gold-bg)', border: 'rgba(160,120,32,0.26)' },
  { label: '状态', prompt: '最近整个人状态不太对，想梳理一下', color: 'var(--sky-deep)', bg: 'var(--sky-bg)', border: 'rgba(62,143,176,0.26)' },
  { label: '家庭', prompt: '家里有些关系需要捋清', color: 'var(--mint-deep)', bg: 'var(--mint-bg)', border: 'rgba(58,150,120,0.26)' },
  { label: '时机', prompt: '我在纠结一件事要不要现在做', color: 'var(--text-3)', bg: 'rgba(196,181,232,0.18)', border: 'rgba(196,181,232,0.38)' },
];

function XuanAvatar({ size = 36 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: 'linear-gradient(135deg, #9B80D8, var(--lav-deep))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 2px 8px rgba(123,101,196,0.28)',
    }}>
      <span style={{ color: '#fff', fontSize: size * 0.44, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, lineHeight: 1 }}>玄</span>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '3px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} className="a-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lav-deep)', opacity: 0.55, animationDelay: `${i * 0.22}s` }} />
      ))}
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
      <div style={{
        maxWidth: '76%', background: 'linear-gradient(135deg, #9B80D8, var(--lav-deep))',
        borderRadius: '16px 4px 16px 16px',
        padding: '11px 14px',
        boxShadow: '0 2px 10px rgba(123,101,196,0.22)',
      }}>
        <p style={{ margin: 0, fontSize: 14, color: '#fff', lineHeight: 1.75 }}>{text}</p>
      </div>
    </div>
  );
}

function AssistantBubble({
  msg,
  isLast,
  onRegenerate,
  onFollowUp,
}: {
  msg: ChatMsg;
  isLast: boolean;
  onRegenerate: () => void;
  onFollowUp: (text: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!msg.reply) return;
    const parts = [
      msg.reply.title,
      msg.reply.summary,
      ...(msg.reply.observations ?? []),
      msg.reply.action ? `建议：${msg.reply.action}` : '',
    ].filter(Boolean);
    await navigator.clipboard.writeText(parts.join('\n\n')).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 16 }}>
      <XuanAvatar size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Loading */}
        {msg.status === 'loading' && (
          <div className="glass" style={{ borderRadius: '4px 16px 16px 16px', padding: '13px 15px', display: 'inline-block' }}>
            <ThinkingDots />
          </div>
        )}

        {/* Error */}
        {msg.status === 'error' && (
          <div style={{ borderRadius: '4px 16px 16px 16px', padding: '13px 15px', background: 'var(--coral-bg)', border: '1px solid rgba(200,88,64,0.22)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
              <AlertCircle size={14} color="var(--coral-deep)" strokeWidth={1.8} />
              <p style={{ margin: 0, fontSize: 13, color: 'var(--coral-deep)' }}>网络有点不稳，可以重试</p>
            </div>
            <button
              onClick={onRegenerate}
              style={{ fontSize: 12, color: 'var(--coral-deep)', border: '1px solid rgba(200,88,64,0.30)', borderRadius: 9, padding: '5px 13px', background: 'transparent', cursor: 'pointer', minHeight: 32, display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <RefreshCw size={11} strokeWidth={2} />
              重试
            </button>
          </div>
        )}

        {/* Done */}
        {msg.status === 'done' && msg.reply && (
          <>
            <div className="glass" style={{ borderRadius: '4px 16px 16px 16px', padding: '14px 16px' }}>
              {msg.reply.title && (
                <p className="serif" style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.4 }}>
                  {msg.reply.title}
                </p>
              )}
              <p style={{ margin: (msg.reply.observations?.length || msg.reply.action) ? '0 0 11px' : 0, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.82 }}>
                {msg.reply.summary}
              </p>

              {(msg.reply.observations ?? []).length > 0 && (
                <div style={{ marginBottom: msg.reply.action ? 11 : 0 }}>
                  {(msg.reply.observations ?? []).map((obs, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: i < (msg.reply!.observations!.length - 1) ? 7 : 0 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--lav-deep)', marginTop: 8, flexShrink: 0, opacity: 0.7 }} />
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-3)', lineHeight: 1.75 }}>{obs}</p>
                    </div>
                  ))}
                </div>
              )}

              {msg.reply.action && (
                <div style={{ marginTop: 10, borderRadius: 10, padding: '9px 12px', background: 'var(--mint-bg)', border: '1px solid rgba(58,150,120,0.20)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Lightbulb size={13} color="var(--mint-deep)" strokeWidth={1.8} style={{ marginTop: 2, flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--mint-deep)', lineHeight: 1.68 }}>{msg.reply.action}</p>
                </div>
              )}
            </div>

            {/* Action row */}
            {isLast && (
              <div className="a-up" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                <button
                  onClick={copy}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: copied ? 'var(--mint-deep)' : 'var(--text-4)', border: `1px solid ${copied ? 'rgba(58,150,120,0.30)' : 'rgba(196,181,232,0.32)'}`, borderRadius: 9, padding: '5px 11px', background: copied ? 'var(--mint-bg)' : 'transparent', cursor: 'pointer', minHeight: 30, transition: 'all 0.2s' }}
                >
                  <Copy size={11} strokeWidth={1.8} />
                  {copied ? '已复制' : '复制'}
                </button>
                <button
                  onClick={onRegenerate}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-4)', border: '1px solid rgba(196,181,232,0.32)', borderRadius: 9, padding: '5px 11px', background: 'transparent', cursor: 'pointer', minHeight: 30 }}
                >
                  <RefreshCw size={11} strokeWidth={1.8} />
                  换个角度
                </button>

                {(msg.reply.suggestions ?? []).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => onFollowUp(s)}
                    style={{ display: 'flex', alignItems: 'center', fontSize: 11, color: 'var(--lav-deep)', border: '1px solid rgba(123,101,196,0.26)', borderRadius: 9, padding: '5px 11px', background: 'var(--lav-bg)', cursor: 'pointer', minHeight: 30 }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function WelcomeView({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px 20px' }}>
      <div className="a-scale" style={{ marginBottom: 18 }}>
        <XuanAvatar size={64} />
      </div>
      <p className="serif a-up" style={{ margin: '0 0 5px', fontSize: 20, fontWeight: 700, color: 'var(--text-1)', textAlign: 'center' }}>玄枢在这里</p>
      <p className="a-up d-100" style={{ margin: '0 0 28px', fontSize: 14, color: 'var(--text-4)', textAlign: 'center', lineHeight: 1.65 }}>
        现在最想理清哪件事？
      </p>

      <div className="a-up d-200" style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {CATEGORIES.map(({ label, prompt, color, bg, border }) => (
          <button
            key={label}
            onClick={() => onSelect(prompt)}
            style={{
              border: `1.5px solid ${border}`, borderRadius: 14,
              padding: '13px 8px',
              background: bg, cursor: 'pointer', textAlign: 'center',
              transition: 'transform 0.12s, box-shadow 0.12s',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color, fontFamily: "'Noto Serif SC', serif" }}>{label}</p>
          </button>
        ))}
      </div>

      <p className="a-up d-400" style={{ margin: '26px 0 0', fontSize: 12, color: 'var(--text-5)', textAlign: 'center', lineHeight: 1.65 }}>
        或者直接说说你在想什么
      </p>
    </div>
  );
}

export default function ChatScreen({ userProfile, onSendMessage, onBack, initialMessages = [], onMessagesChange, onOpenHistory }: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const abortRef = useRef<{ aborted: boolean } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function scrollToBottom() {
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }, 50);
  }

  useEffect(scrollToBottom, [messages]);
  useEffect(() => onMessagesChange?.(messages), [messages, onMessagesChange]);

  const handleSend = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isGenerating) return;

    setInputText('');
    if (inputRef.current) inputRef.current.style.height = 'auto';

    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: 'user', text: trimmed, status: 'sent', ts: Date.now() };
    const assistantId = `a-${Date.now() + 1}`;
    const loadingMsg: ChatMsg = { id: assistantId, role: 'assistant', questionText: trimmed, status: 'loading', ts: Date.now() + 1 };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setIsGenerating(true);

    const token = { aborted: false };
    abortRef.current = token;

    try {
      const reply = await onSendMessage(trimmed);
      if (token.aborted) return;
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, reply, status: 'done' } : m));
    } catch {
      if (token.aborted) return;
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, status: 'error' } : m));
    } finally {
      if (!token.aborted) {
        setIsGenerating(false);
        abortRef.current = null;
      }
    }
  }, [isGenerating, onSendMessage]);

  function handleStop() {
    if (abortRef.current) {
      abortRef.current.aborted = true;
      abortRef.current = null;
    }
    setIsGenerating(false);
    setMessages(prev => prev.map((m, i) =>
      i === prev.length - 1 && m.status === 'loading' ? { ...m, status: 'error' } : m,
    ));
  }

  function handleRegenerate(msg: ChatMsg) {
    if (isGenerating) return;
    const q = msg.questionText ?? '';
    if (!q) return;
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'loading', reply: undefined } : m));
    setIsGenerating(true);

    const token = { aborted: false };
    abortRef.current = token;
    onSendMessage(q).then(reply => {
      if (token.aborted) return;
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, reply, status: 'done' } : m));
      setIsGenerating(false);
      abortRef.current = null;
    }).catch(() => {
      if (token.aborted) return;
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'error' } : m));
      setIsGenerating(false);
      abortRef.current = null;
    });
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 90) + 'px';
  }

  const canSend = inputText.trim().length > 0 && !isGenerating;

  return (
    <div style={{ position: 'absolute', inset: 0, bottom: 70, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, background: 'rgba(250,248,245,0.95)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(196,181,232,0.20)', zIndex: 10 }}>
        {/* Status bar row */}
        <div className="status-bar" style={{ paddingBottom: 0 }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', minWidth: 44, display: 'flex', alignItems: 'center' }}
            aria-label="返回"
          >
            <ChevronLeft size={22} color="var(--text-1)" strokeWidth={1.8} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <XuanAvatar size={26} />
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1 }}>玄枢问答</p>
            </div>
          </div>
          <button
            onClick={onOpenHistory}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
            aria-label="历史记录"
            title="查看历史记录"
          >
            <Clock size={18} color="var(--text-3)" strokeWidth={1.8} />
          </button>
        </div>
        {/* User profile strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 18px 10px' }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: userProfile.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: "'Noto Sans SC', sans-serif" }}>
              {userProfile.avatarChar ?? userProfile.name[0]}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-3)' }}>
            以 <strong style={{ fontWeight: 600, color: 'var(--text-2)' }}>{userProfile.name}</strong> 的视角在聊
          </p>
        </div>
      </div>

      {/* Message list / welcome */}
      <div
        ref={listRef}
        style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: messages.length === 0 ? 0 : '14px 16px 6px' }}
      >
        {messages.length === 0 ? (
          <WelcomeView onSelect={handleSend} />
        ) : (
          <>
            {messages.map((msg, i) => {
              if (msg.role === 'user') return <UserBubble key={msg.id} text={msg.text ?? ''} />;
              const isLast = i === messages.length - 1;
              return (
                <AssistantBubble
                  key={msg.id}
                  msg={msg}
                  isLast={isLast}
                  onRegenerate={() => handleRegenerate(msg)}
                  onFollowUp={handleSend}
                />
              );
            })}
            <div style={{ height: 6 }} />
          </>
        )}
      </div>

      {/* Input bar */}
      <div style={{
        flexShrink: 0,
        background: 'rgba(250,248,245,0.97)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(196,181,232,0.20)',
        padding: '10px 14px 12px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 9,
          background: 'rgba(255,255,255,0.68)', border: '1.5px solid rgba(196,181,232,0.35)',
          borderRadius: 18, padding: '8px 8px 8px 14px',
          boxShadow: '0 1px 6px rgba(123,101,196,0.07)',
        }}>
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={e => {
              setInputText(e.target.value);
              autoResize(e.target);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (canSend) handleSend(inputText);
              }
            }}
            placeholder="说说你在想什么…"
            aria-label="输入你想了解的问题"
            rows={1}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              resize: 'none', fontSize: 15, color: 'var(--text-1)', lineHeight: 1.6,
              fontFamily: "'Noto Sans SC', sans-serif",
              maxHeight: 90,
              overflowY: 'auto',
              scrollbarWidth: 'none',
              paddingTop: 2,
            }}
          />

          {isGenerating ? (
            <button
              onClick={handleStop}
              style={{
                width: 44, height: 44, borderRadius: 14, border: 'none', cursor: 'pointer', flexShrink: 0,
                background: 'var(--coral-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'opacity 0.15s',
              }}
              aria-label="停止生成"
            >
              <Square size={14} color="var(--coral-deep)" strokeWidth={2.2} />
            </button>
          ) : (
            <button
              onClick={() => canSend && handleSend(inputText)}
              disabled={!canSend}
              style={{
                width: 44, height: 44, borderRadius: 14, border: 'none', cursor: canSend ? 'pointer' : 'default', flexShrink: 0,
                background: canSend ? 'linear-gradient(135deg, #9B80D8, var(--lav-deep))' : 'rgba(196,181,232,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s',
                boxShadow: canSend ? '0 2px 10px rgba(123,101,196,0.30)' : 'none',
              }}
              aria-label="发送"
            >
              <Send size={15} color={canSend ? '#fff' : 'var(--text-5)'} strokeWidth={2} />
            </button>
          )}
        </div>

        <p style={{ margin: '7px 2px 0', fontSize: 11, color: 'var(--text-5)', textAlign: 'center', lineHeight: 1.5 }}>
          玄枢提供思路参考，不替代专业建议
        </p>
      </div>
    </div>
  );
}
