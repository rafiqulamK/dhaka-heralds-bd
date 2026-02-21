import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Languages, FileText, Loader2, ShieldCheck, Newspaper } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function streamChat({ messages, action, onDelta, onDone, onError }: {
  messages: Msg[]; action?: string; onDelta: (t: string) => void; onDone: () => void; onError: (e: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
    body: JSON.stringify({ messages, action }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Connection error' }));
    onError(err.error || `Error ${resp.status}`);
    return;
  }
  if (!resp.body) { onError('No response stream'); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf('\n')) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') { onDone(); return; }
      try {
        const p = JSON.parse(json);
        const c = p.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch { /* partial */ }
    }
  }
  onDone();
}

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const send = async (text: string, action?: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    let soFar = '';
    const update = (chunk: string) => {
      soFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: soFar } : m);
        }
        return [...prev, { role: 'assistant', content: soFar }];
      });
    };

    await streamChat({
      messages: [...messages, userMsg],
      action,
      onDelta: update,
      onDone: () => setLoading(false),
      onError: (e) => {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${e}` }]);
        setLoading(false);
      },
    });
  };

  const quickActions = [
    { label: 'Latest News', icon: <Newspaper size={14} />, prompt: 'What are the latest major news headlines today, especially about Bangladesh and South Asia? Provide a comprehensive update.', action: undefined },
    { label: 'Summarize', icon: <FileText size={14} />, prompt: 'Please summarize the latest major news headlines for today.', action: 'summarize' },
    { label: 'Fact-Check', icon: <ShieldCheck size={14} />, prompt: 'I want to fact-check a claim. Please help me verify: ', action: 'factcheck' },
    { label: 'Translate', icon: <Languages size={14} />, prompt: 'Translate this to Bengali: Hello, welcome to Dhaka Heralds.', action: 'translate' },
  ];

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105"
          title="Dhaka Heralds AI Assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-4rem)] rounded-2xl shadow-2xl border border-border bg-card flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              <div>
                <div className="font-bold text-sm">Dhaka Heralds AI</div>
                <div className="text-xs opacity-80">News Analyst • Fact-Checker • Translator</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-primary-foreground/20 rounded">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-6">
                <MessageCircle size={32} className="mx-auto mb-3 text-primary/40" />
                <p className="font-medium">Welcome to Dhaka Heralds AI</p>
                <p className="text-xs mt-1">Get unbiased news analysis, fact-checks, summaries, and translations.</p>
                <p className="text-xs mt-1 text-primary/60">All responses include source citations & AI disclosure.</p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {quickActions.map(a => (
                    <button key={a.label} onClick={() => send(a.prompt, a.action)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-border bg-muted hover:bg-accent hover:text-accent-foreground transition-colors">
                      {a.icon} {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}>
                  {m.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:pl-2 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_hr]:my-2 [&_a]:text-primary [&_a]:underline">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">{m.content}</span>
                  )}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2 text-sm text-muted-foreground flex items-center gap-1">
                  <Loader2 size={14} className="animate-spin" /> Analyzing...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={e => { e.preventDefault(); send(input); }} className="p-3 border-t border-border flex gap-2 shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about news, fact-check, translate..."
              className="flex-1 bg-muted border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
