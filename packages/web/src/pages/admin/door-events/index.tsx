import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import type { DiceOutcomeKey, DiceOutcomeTier, DiceRollConfig } from '@homekit/engine';
import { cx } from '@/utils/cx';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000' });

// ── Default tier template ─────────────────────────────────────────────────────

const DEFAULT_TIERS: DiceOutcomeTier[] = [
  { key: 'critical_success', label: '🎉 Critical Success (12)', minRoll: 12, maxRoll: null, description: '', effects: [{ type: 'gain_level', amount: 1, target: 'active_player' }, { type: 'draw_treasure', amount: 2, target: 'active_player' }], animationType: 'celebrate' },
  { key: 'success', label: '✅ Success (9–11)', minRoll: 9, maxRoll: 11, description: '', effects: [{ type: 'draw_treasure', amount: 1, target: 'active_player' }], animationType: 'celebrate' },
  { key: 'partial', label: '⚠ Partial (6–8)', minRoll: 6, maxRoll: 8, description: '', effects: [], animationType: 'neutral' },
  { key: 'fail', label: '❌ Fail (3–5)', minRoll: 3, maxRoll: 5, description: '', effects: [{ type: 'lose_level', amount: 1, target: 'active_player' }], animationType: 'curse' },
  { key: 'critical_fail', label: '💀 Critical Fail (2)', minRoll: 2, maxRoll: 2, description: '', effects: [{ type: 'lose_level', amount: 2, target: 'active_player' }], animationType: 'death' },
];

const OUTCOME_COLORS: Record<DiceOutcomeKey, string> = {
  critical_success: 'border-amber-500/40 bg-amber-900/20',
  success: 'border-green-500/40 bg-green-900/20',
  partial: 'border-gray-500/40 bg-gray-800/20',
  fail: 'border-orange-500/40 bg-orange-900/20',
  critical_fail: 'border-red-500/40 bg-red-950/30',
};

const EFFECT_TYPES = [
  { value: 'gain_level', label: '+Level' },
  { value: 'lose_level', label: '-Level' },
  { value: 'draw_treasure', label: 'Draw Treasure' },
  { value: 'draw_door', label: 'Draw Door' },
  { value: 'gain_gold', label: '+Gold' },
  { value: 'lose_gold', label: '-Gold' },
  { value: 'discard_item', label: 'Discard Item' },
  { value: 'skip_turn', label: 'Skip Turn' },
  { value: 'custom_text', label: 'Custom Text' },
];

const TARGETS = ['active_player', 'all', 'left', 'right'];

// ── Effect row editor ─────────────────────────────────────────────────────────

interface EffectRowProps {
  effect: DiceOutcomeTier['effects'][number];
  onChange: (eff: DiceOutcomeTier['effects'][number]) => void;
  onRemove: () => void;
}

function EffectRow({ effect, onChange, onRemove }: EffectRowProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={effect.type}
        onChange={(e) => onChange({ ...effect, type: e.target.value as typeof effect.type })}
        className="flex-1 rounded-lg border border-secondary/40 bg-primary px-2 py-1.5 text-xs text-primary"
      >
        {EFFECT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      {['gain_level', 'lose_level', 'draw_treasure', 'draw_door', 'gain_gold', 'lose_gold'].includes(effect.type) && (
        <input
          type="number"
          value={effect.amount ?? 1}
          min={1}
          max={20}
          onChange={(e) => onChange({ ...effect, amount: parseInt(e.target.value, 10) })}
          className="w-14 rounded-lg border border-secondary/40 bg-primary px-2 py-1.5 text-xs text-center text-primary"
        />
      )}
      {effect.type === 'custom_text' && (
        <input
          type="text"
          value={effect.customText ?? ''}
          onChange={(e) => onChange({ ...effect, customText: e.target.value })}
          placeholder="Custom effect text"
          className="flex-1 rounded-lg border border-secondary/40 bg-primary px-2 py-1.5 text-xs text-primary"
        />
      )}
      <select
        value={effect.target ?? 'active_player'}
        onChange={(e) => onChange({ ...effect, target: e.target.value as typeof effect.target })}
        className="rounded-lg border border-secondary/40 bg-primary px-2 py-1.5 text-xs text-primary"
      >
        {TARGETS.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
      </select>
      <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-300">✕</button>
    </div>
  );
}

// ── Tier editor ───────────────────────────────────────────────────────────────

interface TierEditorProps {
  tier: DiceOutcomeTier;
  onChange: (t: DiceOutcomeTier) => void;
}

function TierEditor({ tier, onChange }: TierEditorProps) {
  const colorCls = OUTCOME_COLORS[tier.key] ?? OUTCOME_COLORS.partial;

  const addEffect = () =>
    onChange({ ...tier, effects: [...tier.effects, { type: 'gain_level', amount: 1, target: 'active_player' }] });

  return (
    <div className={cx('rounded-xl border p-3 flex flex-col gap-2', colorCls)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">{tier.label}</span>
        <span className="text-xs text-tertiary">
          Roll {tier.minRoll}{tier.maxRoll ? `–${tier.maxRoll}` : '+'}
        </span>
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          value={tier.minRoll}
          onChange={(e) => onChange({ ...tier, minRoll: parseInt(e.target.value, 10) })}
          className="w-16 rounded border border-secondary/40 bg-primary px-2 py-1 text-xs text-center text-primary"
          placeholder="min"
        />
        <span className="text-xs text-tertiary self-center">–</span>
        <input
          type="number"
          value={tier.maxRoll ?? ''}
          onChange={(e) => onChange({ ...tier, maxRoll: e.target.value ? parseInt(e.target.value, 10) : null })}
          className="w-16 rounded border border-secondary/40 bg-primary px-2 py-1 text-xs text-center text-primary"
          placeholder="max"
        />
        <select
          value={tier.animationType ?? 'neutral'}
          onChange={(e) => onChange({ ...tier, animationType: e.target.value as typeof tier.animationType })}
          className="flex-1 rounded border border-secondary/40 bg-primary px-2 py-1 text-xs text-primary"
        >
          {['celebrate', 'neutral', 'curse', 'death'].map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <textarea
        value={tier.description}
        onChange={(e) => onChange({ ...tier, description: e.target.value })}
        placeholder="What happens to the player..."
        rows={2}
        className="w-full rounded border border-secondary/40 bg-primary/60 px-2 py-1.5 text-xs text-primary resize-none"
      />

      <div className="flex flex-col gap-1.5">
        {tier.effects.map((eff, i) => (
          <EffectRow
            key={i}
            effect={eff}
            onChange={(updated) => {
              const effects = [...tier.effects];
              effects[i] = updated;
              onChange({ ...tier, effects });
            }}
            onRemove={() => onChange({ ...tier, effects: tier.effects.filter((_, j) => j !== i) })}
          />
        ))}
        <button
          onClick={addEffect}
          className="text-xs text-brand-secondary hover:text-brand-primary text-left"
        >
          + Add Effect
        </button>
      </div>
    </div>
  );
}

// ── Preview panel ─────────────────────────────────────────────────────────────

function PreviewPanel({ name, situationText, tiers }: { name: string; situationText: string; tiers: DiceOutcomeTier[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-secondary/40 bg-secondary/20 p-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🚪</span>
        <div>
          <p className="text-xs text-tertiary uppercase tracking-wider">Door Event</p>
          <p className="font-bold text-primary">{name || 'Untitled Event'}</p>
        </div>
      </div>
      <p className="whitespace-pre-line text-xs text-secondary leading-relaxed">
        {situationText || 'No situation text yet...'}
      </p>
      <div className="flex flex-col gap-1">
        {tiers.map((t) => (
          <div key={t.key} className={cx('rounded-lg border px-2 py-1.5', OUTCOME_COLORS[t.key])}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary">{t.label}</span>
            </div>
            {t.description && <p className="text-xs text-tertiary mt-0.5">{t.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function DoorEventCreator() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [flavorText, setFlavorText] = useState('');
  const [situationText, setSituationText] = useState('');
  const [tiers, setTiers] = useState<DiceOutcomeTier[]>(DEFAULT_TIERS);
  const [diceCount, setDiceCount] = useState(2);
  const [diceType, setDiceType] = useState<'d6'>('d6');

  const [aiSeed, setAiSeed] = useState('');
  const [aiTone, setAiTone] = useState('funny');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!aiSeed.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const { data } = await api.post('/ai/generate-door-event', { seed: aiSeed, tone: aiTone });
      if (data.name) setName(data.name as string);
      if (data.description) setDescription(data.description as string);
      if (data.flavorText) setFlavorText(data.flavorText as string);
      if (data.situationText) setSituationText(data.situationText as string);
      if (Array.isArray(data.tiers)) setTiers(data.tiers as DiceOutcomeTier[]);
    } catch (err) {
      setAiError((err as Error).message);
    } finally {
      setAiLoading(false);
    }
  }, [aiSeed, aiTone]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const config: DiceRollConfig = { diceCount, diceType, revealBeforeApply: true, tiers };
      await api.post('/admin/cards', {
        game: 'Munchkin',
        type: 'DOOR_EVENT',
        subtype: 'door_event',
        name,
        description,
        flavorText,
        situationText,
        diceRollConfig: config,
        enabled: true,
        status: 'published',
        tags: ['door_event'],
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setAiError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }, [name, description, flavorText, situationText, tiers, diceCount, diceType]);

  return (
    <div className="flex h-full gap-0">
      {/* Left: Form */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 border-r border-secondary/40">
        <div>
          <h1 className="text-lg font-bold text-primary">Door Event Creator</h1>
          <p className="text-xs text-tertiary mt-0.5">Create situation cards with 2d6 dice roll outcomes</p>
        </div>

        {/* AI Assist */}
        <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-brand-secondary">✨ AI Generate</p>
          <div className="flex gap-2">
            <input
              value={aiSeed}
              onChange={(e) => setAiSeed(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate(); }}
              placeholder="Seed idea (e.g. 'zombie ate your horse')"
              className="flex-1 rounded-xl border border-brand-primary/30 bg-primary px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <select
              value={aiTone}
              onChange={(e) => setAiTone(e.target.value)}
              className="rounded-xl border border-secondary/40 bg-primary px-3 py-2 text-sm text-primary"
            >
              {['funny', 'dark', 'chaotic', 'dramatic', 'wholesome'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={aiLoading || !aiSeed.trim()}
            className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-secondary disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {aiLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-secondary border-t-transparent" />
                Generating...
              </>
            ) : '🎲 Generate Door Event'}
          </button>
          {aiError && <p className="text-xs text-red-400">{aiError}</p>}
        </div>

        {/* Card Identity */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-tertiary">Card Info</h2>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Event name *"
            className="rounded-xl border border-secondary/40 bg-primary px-3 py-2 text-sm text-primary"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (shown on card)"
            className="rounded-xl border border-secondary/40 bg-primary px-3 py-2 text-sm text-primary"
          />
          <input
            value={flavorText}
            onChange={(e) => setFlavorText(e.target.value)}
            placeholder='Flavor text ("funny one-liner")'
            className="rounded-xl border border-secondary/40 bg-primary px-3 py-2 text-sm text-primary italic"
          />
        </div>

        {/* Situation Text */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-tertiary">Situation Text</h2>
          <p className="text-xs text-tertiary">This is read aloud to players. Be descriptive and funny. Include what they need to do.</p>
          <textarea
            value={situationText}
            onChange={(e) => setSituationText(e.target.value)}
            placeholder="You walk into the tavern and see... (tell the full story here)"
            rows={6}
            className="w-full rounded-xl border border-secondary/40 bg-primary px-3 py-2 text-sm text-primary leading-relaxed resize-none"
          />
        </div>

        {/* Dice Config */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-tertiary">Dice Configuration</h2>
          <div className="flex items-center gap-3">
            <label className="text-xs text-secondary">Dice Count</label>
            <input
              type="number"
              value={diceCount}
              min={1}
              max={4}
              onChange={(e) => setDiceCount(parseInt(e.target.value, 10))}
              className="w-16 rounded-lg border border-secondary/40 bg-primary px-2 py-1.5 text-sm text-center text-primary"
            />
            <label className="text-xs text-secondary">Type</label>
            <select
              value={diceType}
              onChange={(e) => setDiceType(e.target.value as 'd6')}
              className="rounded-lg border border-secondary/40 bg-primary px-3 py-1.5 text-sm text-primary"
            >
              {['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <span className="text-sm font-bold text-brand-secondary">
              Roll {diceCount}{diceType} (total {diceCount}–{diceCount * parseInt(diceType.slice(1), 10)})
            </span>
          </div>
        </div>

        {/* Outcome Tiers */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-tertiary">Outcome Tiers</h2>
          <div className="flex flex-col gap-2">
            {tiers.map((tier, i) => (
              <TierEditor
                key={tier.key}
                tier={tier}
                onChange={(updated) => {
                  const next = [...tiers];
                  next[i] = updated;
                  setTiers(next);
                }}
              />
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pb-4">
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex-1 rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-brand-secondary disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Door Event Card'}
          </button>
          <AnimatePresence>
            {saveSuccess && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-green-400"
              >
                ✓ Saved!
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="w-80 overflow-y-auto p-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-tertiary">Live Preview</h2>
        <PreviewPanel name={name} situationText={situationText} tiers={tiers} />
      </div>
    </div>
  );
}
