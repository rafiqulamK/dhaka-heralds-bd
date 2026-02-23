import { useState } from 'react';
import Navbar from '@/components/Navbar';
import CategoryTabs from '@/components/CategoryTabs';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ShieldCheck, AlertTriangle, XCircle, HelpCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FactCheckResult {
  id: string;
  claim: string;
  result: string;
  timestamp: string;
}

export default function FactCheckPage() {
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FactCheckResult[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('dh-factchecks') || '[]');
    } catch { return []; }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claim.trim() || loading) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [{ role: 'user', content: claim }],
          action: 'factcheck',
        },
      });

      if (error) throw error;

      // Handle streaming response
      let text = '';
      if (data instanceof ReadableStream) {
        const reader = data.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
          for (const line of lines) {
            const json = line.slice(6);
            if (json === '[DONE]') continue;
            try {
              const parsed = JSON.parse(json);
              text += parsed.choices?.[0]?.delta?.content || '';
            } catch {}
          }
        }
      } else if (typeof data === 'string') {
        text = data;
      } else {
        text = data?.choices?.[0]?.message?.content || JSON.stringify(data);
      }

      const newResult: FactCheckResult = {
        id: Date.now().toString(),
        claim: claim.trim(),
        result: text,
        timestamp: new Date().toISOString(),
      };
      const updated = [newResult, ...results].slice(0, 20);
      setResults(updated);
      localStorage.setItem('dh-factchecks', JSON.stringify(updated));
      setClaim('');
    } catch (err) {
      console.error('Fact-check error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryTabs />
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-10">
        <div className="text-center mb-8">
          <ShieldCheck size={48} className="mx-auto text-primary mb-3" />
          <h1 className="text-3xl font-bold gold-text">AI Fact-Check</h1>
          <p className="text-muted-foreground mt-2">Submit any claim for AI-powered verification and analysis</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl gold-border p-6 mb-8">
          <Textarea
            value={claim}
            onChange={e => setClaim(e.target.value)}
            placeholder="Enter a claim to fact-check... e.g., 'Bangladesh's GDP grew by 8% in 2025'"
            rows={3}
            className="mb-4 bg-background"
          />
          <Button type="submit" disabled={loading || !claim.trim()} className="w-full">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : 'Verify Claim'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            ⚠️ AI analysis — always verify with primary sources
          </p>
        </form>

        {results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-foreground">Recent Fact-Checks</h2>
            {results.map(r => (
              <div key={r.id} className="bg-card rounded-xl border border-border p-6">
                <div className="text-xs text-muted-foreground mb-2">
                  {new Date(r.timestamp).toLocaleString()}
                </div>
                <div className="text-sm font-medium text-foreground mb-3 bg-muted p-3 rounded">
                  "{r.claim}"
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{r.result}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
