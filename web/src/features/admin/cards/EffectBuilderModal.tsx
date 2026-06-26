import { useState, useEffect } from 'react';
import { X } from '@untitledui/icons';
import type { EffectCategory, EffectCondition, EffectDefinition, EffectInstance, EffectParam } from '@/api/cards';

const CATEGORY_META: Record<EffectCategory, { label: string; icon: string; description: string }> = {
  progress: { label: 'Progress', icon: '⬆', description: 'Gain or lose levels' },
  inventory: { label: 'Inventory', icon: '🎒', description: 'Items and currency' },
  loot: { label: 'Loot', icon: '🃏', description: 'Draw or discard cards' },
  turn: { label: 'Turn', icon: '🔄', description: 'Turn order and skips' },
  combat: { label: 'Combat', icon: '⚔', description: 'Combat power modifiers' },
  situation: { label: 'Situation', icon: '😂', description: 'No mechanical effect' },
  quest: { label: 'Quest', icon: '📜', description: 'Assign quest objectives' },
  gm: { label: 'GM Approval', icon: '🎲', description: 'Requires game master' },
};

interface ParamFieldProps {
  param: EffectParam;
  value: unknown;
  onChange: (val: unknown) => void;
}

function ParamField({ param, value, onChange }: ParamFieldProps) {
  const base = 'rounded-lg border border-secondary/60 bg-primary/40 px-3 py-2 text-sm text-primary w-full';

  if (param.type === 'number') {
    return (
      <input
        type="number"
        className={base}
        value={String(value ?? param.defaultValue ?? '')}
        min={param.min}
        max={param.max}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    );
  }

  if (param.type === 'select' || param.type === 'player_target') {
    return (
      <select className={base} value={String(value ?? param.defaultValue ?? '')} onChange={(e) => onChange(e.target.value)}>
        {(param.options ?? []).map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  if (param.type === 'boolean') {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(value ?? param.defaultValue)}
          onChange={(e) => onChange(e.target.checked)}
          className="size-4 rounded"
        />
        <span className="text-sm text-primary">{param.label}</span>
      </label>
    );
  }

  return (
    <input
      type="text"
      className={base}
      value={String(value ?? param.defaultValue ?? '')}
      placeholder={param.label}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

interface EffectBuilderModalProps {
  isOpen: boolean;
  definitions: EffectDefinition[];
  onClose: () => void;
  onAdd: (effect: EffectInstance) => void;
}

type Step = 1 | 2 | 3 | 4;

const CONDITION_TYPES = ['phase', 'player_level', 'has_item', 'random_percent'] as const;

export function EffectBuilderModal({ isOpen, definitions, onClose, onAdd }: EffectBuilderModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedCategory, setSelectedCategory] = useState<EffectCategory | null>(null);
  const [selectedDef, setSelectedDef] = useState<EffectDefinition | null>(null);
  const [params, setParams] = useState<Record<string, unknown>>({});
  const [useCondition, setUseCondition] = useState(false);
  const [condition, setCondition] = useState<EffectCondition>({ type: 'phase', value: '' });

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedCategory(null);
      setSelectedDef(null);
      setParams({});
      setUseCondition(false);
      setCondition({ type: 'phase', value: '' });
    }
  }, [isOpen]);

  const categories = [...new Set(definitions.map((d) => d.category))] as EffectCategory[];

  const categoryDefs = selectedCategory
    ? definitions.filter((d) => d.category === selectedCategory)
    : [];

  const handleSelectCategory = (cat: EffectCategory) => {
    setSelectedCategory(cat);
    setStep(2);
  };

  const handleSelectDef = (def: EffectDefinition) => {
    setSelectedDef(def);
    const defaultParams: Record<string, unknown> = {};
    for (const p of def.params) {
      defaultParams[p.key] = p.defaultValue;
    }
    setParams(defaultParams);
    setStep(3);
  };

  const handleAdd = () => {
    if (!selectedDef) return;
    const instance: EffectInstance = {
      definitionId: selectedDef.id,
      params,
      condition: useCondition ? condition : undefined,
    };
    onAdd(instance);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-secondary/60 bg-primary shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-secondary/60 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-primary">Add Effect</h2>
            <p className="mt-0.5 text-xs text-tertiary">
              Step {step} of 4 —{' '}
              {step === 1 && 'Pick a category'}
              {step === 2 && 'Pick an effect'}
              {step === 3 && 'Configure parameters'}
              {step === 4 && 'Optional condition'}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-tertiary hover:bg-secondary/40 hover:text-primary transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Step 1: Category */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {categories.map((cat) => {
                const meta = CATEGORY_META[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => handleSelectCategory(cat)}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-secondary/60 bg-primary/40 px-3 py-4 text-center transition-all hover:border-brand-primary hover:bg-brand-primary/10"
                  >
                    <span className="text-2xl">{meta.icon}</span>
                    <span className="text-xs font-semibold text-primary">{meta.label}</span>
                    <span className="text-[10px] text-tertiary leading-tight">{meta.description}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2: Effect list */}
          {step === 2 && selectedCategory && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setStep(1)}
                className="mb-1 self-start text-xs text-tertiary hover:text-primary transition-colors"
              >
                ← Back
              </button>
              {categoryDefs.map((def) => (
                <button
                  key={def.id}
                  onClick={() => handleSelectDef(def)}
                  className="flex flex-col items-start gap-0.5 rounded-xl border border-secondary/60 bg-primary/40 px-4 py-3 text-left transition-all hover:border-brand-primary hover:bg-brand-primary/10"
                >
                  <span className="text-sm font-semibold text-primary">{def.label}</span>
                  <span className="text-xs text-tertiary">{def.description}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Params */}
          {step === 3 && selectedDef && (
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setStep(2)}
                className="self-start text-xs text-tertiary hover:text-primary transition-colors"
              >
                ← Back
              </button>
              <div>
                <p className="text-sm font-semibold text-primary">{selectedDef.label}</p>
                <p className="mt-0.5 text-xs text-tertiary">{selectedDef.description}</p>
              </div>
              {selectedDef.params.length === 0 ? (
                <p className="text-sm text-tertiary italic">No parameters required.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {selectedDef.params.map((param) => (
                    <div key={param.key}>
                      {param.type !== 'boolean' && (
                        <label className="mb-1 block text-xs font-medium text-secondary">
                          {param.label}
                          {param.min !== undefined && param.max !== undefined && (
                            <span className="ml-1 text-quaternary">({param.min}–{param.max})</span>
                          )}
                        </label>
                      )}
                      <ParamField
                        param={param}
                        value={params[param.key]}
                        onChange={(val) => setParams((p) => ({ ...p, [param.key]: val }))}
                      />
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setStep(4)}
                className="mt-2 self-end rounded-lg bg-brand-solid px-4 py-2 text-sm font-semibold text-white hover:bg-brand-solid_hover transition-colors"
              >
                Next: Condition →
              </button>
            </div>
          )}

          {/* Step 4: Condition */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setStep(3)}
                className="self-start text-xs text-tertiary hover:text-primary transition-colors"
              >
                ← Back
              </button>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCondition}
                  onChange={(e) => setUseCondition(e.target.checked)}
                  className="size-4 rounded"
                />
                <span className="text-sm font-medium text-primary">Only apply if condition is met</span>
              </label>

              {useCondition && (
                <div className="flex flex-col gap-3 rounded-xl border border-secondary/60 bg-primary/30 p-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-secondary">Condition Type</label>
                    <select
                      className="w-full rounded-lg border border-secondary/60 bg-primary/40 px-3 py-2 text-sm text-primary"
                      value={condition.type}
                      onChange={(e) =>
                        setCondition((c) => ({
                          ...c,
                          type: e.target.value as EffectCondition['type'],
                          value: '',
                        }))
                      }
                    >
                      {CONDITION_TYPES.map((t) => (
                        <option key={t} value={t}>{t.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-secondary">
                      {condition.type === 'random_percent' ? 'Percent (0–100)' : 'Value'}
                    </label>
                    <input
                      type={condition.type === 'random_percent' || condition.type === 'player_level' ? 'number' : 'text'}
                      className="w-full rounded-lg border border-secondary/60 bg-primary/40 px-3 py-2 text-sm text-primary"
                      value={String(condition.value ?? '')}
                      onChange={(e) =>
                        setCondition((c) => ({
                          ...c,
                          value: condition.type === 'random_percent' || condition.type === 'player_level'
                            ? Number(e.target.value)
                            : e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleAdd}
                className="mt-2 self-end rounded-lg bg-brand-solid px-4 py-2 text-sm font-semibold text-white hover:bg-brand-solid_hover transition-colors"
              >
                Add to Card
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
