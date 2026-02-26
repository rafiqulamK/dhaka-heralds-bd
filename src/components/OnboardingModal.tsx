import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X, Sparkles, Check } from 'lucide-react';

const INTEREST_OPTIONS = [
  { id: 'bangladesh', label: 'Bangladesh', emoji: '🇧🇩' },
  { id: 'world', label: 'World', emoji: '🌍' },
  { id: 'politics', label: 'Politics', emoji: '🏛️' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'culture', label: 'Culture', emoji: '🎭' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'climate', label: 'Climate', emoji: '🌿' },
  { id: 'health', label: 'Health', emoji: '🏥' },
];

const LOCAL_KEY = 'dh_user_interests';
const ONBOARDING_SEEN_KEY = 'dh_onboarding_seen';

export function getLocalInterests(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch { return []; }
}

export function setLocalInterests(interests: string[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(interests));
}

interface OnboardingModalProps {
  onComplete: (interests: string[]) => void;
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_SEEN_KEY);
    const existing = getLocalInterests();
    if (!seen && existing.length === 0) {
      setVisible(true);
    }
  }, []);

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleComplete = async () => {
    setSaving(true);
    const interests = selected.length > 0 ? selected : ['world', 'bangladesh'];
    setLocalInterests(interests);
    localStorage.setItem(ONBOARDING_SEEN_KEY, 'true');

    // Try to save to DB if logged in
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_preferences').upsert({
          user_id: user.id,
          interests,
        }, { onConflict: 'user_id' });
      }
    } catch {}

    setSaving(false);
    setVisible(false);
    onComplete(interests);
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    setLocalInterests(['world', 'bangladesh']);
    setVisible(false);
    onComplete(['world', 'bangladesh']);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl gold-border max-w-lg w-full p-8 relative shadow-2xl">
        <button onClick={handleSkip} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Dhaka Heralds</h2>
          <p className="text-muted-foreground text-sm">
            Pick your interests and we'll curate a personalized news feed powered by AI.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {INTEREST_OPTIONS.map(opt => {
            const isSelected = selected.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggle(opt.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-sm font-medium flex-1">{opt.label}</span>
                {isSelected && <Check size={16} className="text-primary" />}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleComplete}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : `Continue${selected.length > 0 ? ` (${selected.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
