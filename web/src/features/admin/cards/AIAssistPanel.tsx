import { useState } from 'react';
import { Stars01 as Sparkles } from '@untitledui/icons';
import { cx } from '@/utils/cx';
import { apiInstance } from '@/api/instance';
import type { CardFormData } from '@/api/cards';

const SUGGEST_TAGS = [
  'funny', 'scary', 'undead', 'animal', 'quest', 'chaos',
  'strong', 'weak', 'rare', 'common', 'party', 'boss',
  'real-life', 'penalty', 'reward', 'classic munchkin vibe',
];

interface AIAssistPanelProps {
  onGenerated: (data: CardFormData) => void;
}

export function AIAssistPanel({ onGenerated }: AIAssistPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);

    const tags = [...selectedTags];
    const systemPrompt = [
      'You are a card designer for a Munchkin-style party board game.',
      'Output ONLY valid JSON matching the CardFormData schema.',
      'Do not include effects — those are selected manually.',
      tags.length > 0 ? `Tags provided: ${tags.join(', ')}.` : '',
      'Schema: { name: string, description: string (max 120 chars), flavorText: string (max 60 chars, funny one-liner), level?: number, treasureCount?: number, badStuff?: string, itemBonus?: number, itemValue?: number, tags?: string[] }',
    ].filter(Boolean).join(' ');

    try {
      const { data } = await apiInstance.post('/ai/generate-card-fields', {
        systemPrompt,
        userPrompt: prompt,
      });

      // Parse the text response as JSON. The API endpoint may return { text: "..." } or already parsed data.
      let parsed: CardFormData;

      if (typeof data === 'string') {
        parsed = JSON.parse(data) as CardFormData;
      } else if (data?.text) {
        const raw = (data.text as string).replace(/```json\n?/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(raw) as CardFormData;
      } else {
        parsed = data as CardFormData;
      }

      onGenerated(parsed);
    } catch {
      setError('AI generation failed. Try again or edit fields manually.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-brand-secondary" />
        <h3 className="text-sm font-semibold text-primary">AI Assist</h3>
        <span className="rounded-md bg-brand-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-brand-secondary">
          Admin only
        </span>
      </div>

      <p className="text-xs text-tertiary">
        Describe the card idea. AI will fill in the text fields only — effects are always picked manually.
      </p>

      <textarea
        className="min-h-[80px] w-full resize-none rounded-xl border border-secondary/60 bg-primary/40 px-3 py-2 text-sm text-primary placeholder:text-quaternary focus:border-brand-primary focus:outline-none"
        placeholder="e.g. a cursed chicken that steals your boots"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            void handleGenerate();
          }
        }}
      />

      {/* Tag chips */}
      <div>
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-quaternary">
          Context tags (optional)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SUGGEST_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={cx(
                'rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all',
                selectedTags.has(tag)
                  ? 'border-brand-primary bg-brand-primary/20 text-brand-secondary'
                  : 'border-secondary/60 bg-primary/30 text-tertiary hover:border-brand-primary/50 hover:text-secondary',
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={!prompt.trim() || isGenerating}
        onClick={() => void handleGenerate()}
        className={cx(
          'flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
          prompt.trim() && !isGenerating
            ? 'bg-brand-solid text-white hover:bg-brand-solid_hover'
            : 'cursor-not-allowed bg-secondary/30 text-quaternary',
        )}
      >
        {isGenerating ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles className="size-4" />
            Generate Fields
          </>
        )}
      </button>

      <p className="text-[10px] text-quaternary">
        Tip: ⌘↵ to generate · Fields will be added to the form for review
      </p>
    </div>
  );
}
