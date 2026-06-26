import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, PuzzlePiece01 } from '@untitledui/icons';
import { Controller, useForm } from 'react-hook-form';
import { MunchkinPlugin } from '@homekit/engine';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { ImageUploadField } from '@/features/admin/cards/ImageUploadField';
import { fileViewUrl, getCards } from '@/api/cards';
import { createGame, getGame, updateGame, type GameRecord } from '@/api/games';
import { useTooltipStore } from '@/store/useTooltipStore';
import { cx } from '@/utils/cx';
import type { Card } from '@homekit/types';
import type { BuilderTab } from '@homekit/engine';

// ── Available plugins (could be dynamic later) ────────────────────────────────
const AVAILABLE_PLUGINS = [
  { id: 'munchkin', label: 'Munchkin Party', plugin: MunchkinPlugin },
];

interface WizardStep1 {
  name: string;
  description: string;
  imageFileId: string;
  pluginId: string;
}

// ── Step 1: Identity ──────────────────────────────────────────────────────────

function Step1({
  defaultValues,
  imageFolderId,
  onNext,
}: {
  defaultValues: WizardStep1;
  imageFolderId?: string;
  onNext: (data: WizardStep1) => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WizardStep1>({ defaultValues });

  const selectedPluginId = watch('pluginId');

  return (
    <form onSubmit={handleSubmit(onNext)} className="flex flex-col gap-5">
      <div className="glass-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-primary">Identity</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="label-xs">Game Name *</label>
            <input
              {...register('name', { required: true })}
              className={cx('input-base', errors.name && 'border-error')}
              placeholder="e.g. Munchkin Party Night"
            />
          </div>
          <div>
            <label className="label-xs">Description</label>
            <textarea
              {...register('description')}
              className="input-base min-h-[80px] resize-none"
              placeholder="Short description shown in the game hub…"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-primary">Cover Image</h2>
        <Controller
          control={control}
          name="imageFileId"
          render={({ field }) => (
            <ImageUploadField
              value={field.value || undefined}
              onChange={(id) => field.onChange(id ?? '')}
              folderId={imageFolderId}
            />
          )}
        />
        {watch('imageFileId') && (
          <div className="mt-3 overflow-hidden rounded-xl border border-secondary/60" style={{ aspectRatio: '16/9', maxWidth: 240 }}>
            <img
              src={fileViewUrl(watch('imageFileId'))}
              alt="Cover preview"
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="glass-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-primary">Plugin</h2>
        <p className="mb-3 text-xs text-tertiary">Select one plugin that powers this game.</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_PLUGINS.map((p) => {
            const isSelected = selectedPluginId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setValue('pluginId', p.id)}
                className={cx(
                  'rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                  isSelected
                    ? 'border-brand-primary bg-brand-primary/20 text-brand-secondary'
                    : 'border-secondary/60 bg-primary/30 text-tertiary hover:border-brand-primary/60',
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          color="primary"
          size="md"
          type="submit"
          iconLeading={ArrowRight}
        >
          Next: Configure
        </Button>
      </div>
    </form>
  );
}

// ── Step 2: Plugin builder tabs ────────────────────────────────────────────────

function CardSelectorTab({
  tab,
  selectedIds,
  onToggle,
}: {
  tab: BuilderTab;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getCards({
      ...(tab.cardType ? { type: tab.cardType as Card['type'] } : {}),
      ...(tab.cardSubtype ? { subtype: tab.cardSubtype } : {}),
      status: 'published',
    })
      .then(setCards)
      .finally(() => setLoading(false));
  }, [tab.cardType, tab.cardSubtype]);

  if (loading) {
    return <div className="py-4 text-center text-sm text-quaternary">Loading cards…</div>;
  }

  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-secondary/60 bg-primary/20 p-4 text-center text-sm text-tertiary">
        No published cards found for this tab. Seed or create cards first.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-tertiary mb-2">
        {selectedIds.size} / {cards.length} selected
      </p>
      {cards.map((card) => {
        const isSelected = selectedIds.has(card.id);
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onToggle(card.id)}
            className={cx(
              'flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-colors',
              isSelected
                ? 'border-brand-primary/60 bg-brand-primary/10'
                : 'border-secondary/60 bg-primary/30 hover:border-secondary',
            )}
          >
            <span className="text-sm text-primary">{card.name}</span>
            <span className={cx(
              'text-xs',
              isSelected ? 'text-brand-secondary' : 'text-quaternary',
            )}>
              {isSelected ? '✓' : '○'}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SettingsTab({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}) {
  const defaults: Record<string, unknown> = MunchkinPlugin ? {
    maxLevel: 10,
    maxPlayers: 6,
    startingLevel: 1,
    minigamesEnabled: true,
    bossRaidsEnabled: true,
    auctionEnabled: true,
  } : {};

  const current = { ...defaults, ...config };

  const set = (key: string, value: unknown) => onChange({ ...current, [key]: value });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {[
        { key: 'maxLevel', label: 'Max Level', type: 'number', min: 5, max: 20 },
        { key: 'maxPlayers', label: 'Max Players', type: 'number', min: 2, max: 8 },
        { key: 'startingLevel', label: 'Starting Level', type: 'number', min: 1, max: 5 },
      ].map(({ key, label, type, min, max }) => (
        <div key={key}>
          <label className="label-xs">{label}</label>
          <input
            type={type}
            className="input-base"
            value={String(current[key] ?? '')}
            min={min}
            max={max}
            onChange={(e) => set(key, Number(e.target.value))}
          />
        </div>
      ))}
      {[
        { key: 'minigamesEnabled', label: 'Minigames Enabled' },
        { key: 'bossRaidsEnabled', label: 'Boss Raids Enabled' },
        { key: 'auctionEnabled', label: 'Auction Enabled' },
      ].map(({ key, label }) => (
        <div key={key} className="flex items-center gap-2">
          <input
            type="checkbox"
            id={key}
            className="size-4 rounded"
            checked={Boolean(current[key] ?? true)}
            onChange={(e) => set(key, e.target.checked)}
          />
          <label htmlFor={key} className="text-sm text-primary cursor-pointer">{label}</label>
        </div>
      ))}
    </div>
  );
}

function Step2({
  step1Data,
  gameConfig,
  onConfigChange,
  onBack,
  onSave,
  isSaving,
}: {
  step1Data: WizardStep1;
  gameConfig: Record<string, unknown>;
  onConfigChange: (config: Record<string, unknown>) => void;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  const plugin = AVAILABLE_PLUGINS.find((p) => p.id === step1Data.pluginId)?.plugin;
  const tabs: BuilderTab[] = (plugin as { builderTabs?: BuilderTab[] })?.builderTabs ?? [];
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? '');
  const [selectedCards, setSelectedCards] = useState<Record<string, Set<string>>>({});

  const toggleCard = useCallback((tabId: string, cardId: string) => {
    setSelectedCards((prev) => {
      const set = new Set(prev[tabId] ?? []);
      if (set.has(cardId)) set.delete(cardId);
      else set.add(cardId);
      return { ...prev, [tabId]: set };
    });
  }, []);

  const activeTabDef = tabs.find((t) => t.id === activeTab);

  return (
    <div className="flex flex-col gap-5">
      <div className="glass-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-primary">
          {plugin?.name ?? step1Data.pluginId} — Configure
        </h2>

        {tabs.length === 0 ? (
          <p className="text-sm text-tertiary">This plugin has no builder tabs.</p>
        ) : (
          <>
            {/* Tab bar */}
            <div className="mb-4 flex flex-wrap gap-1 border-b border-secondary/40 pb-1">
              {tabs.map((tab: BuilderTab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cx(
                    'rounded-t-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    activeTab === tab.id
                      ? 'border-b-2 border-brand-primary text-brand-secondary'
                      : 'text-tertiary hover:text-secondary',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {activeTabDef?.isSettings ? (
                  <SettingsTab config={gameConfig} onChange={onConfigChange} />
                ) : activeTabDef ? (
                  <CardSelectorTab
                    tab={activeTabDef}
                    selectedIds={selectedCards[activeTab] ?? new Set()}
                    onToggle={(id) => toggleCard(activeTab, id)}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button color="secondary" size="md" iconLeading={ArrowLeft} onClick={onBack}>
          Back
        </Button>
        <Button color="primary" size="md" isLoading={isSaving} onClick={onSave}>
          Save Game
        </Button>
      </div>
    </div>
  );
}

// ── Main Wizard ────────────────────────────────────────────────────────────────

export function GameWizardPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const showError = useTooltipStore((s) => s.showError);

  const [step, setStep] = useState<1 | 2>(1);
  const [step1Data, setStep1Data] = useState<WizardStep1>({
    name: '',
    description: '',
    imageFileId: '',
    pluginId: 'munchkin',
  });
  const [gameConfig, setGameConfig] = useState<Record<string, unknown>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [existingGame, setExistingGame] = useState<GameRecord | null>(null);

  useEffect(() => {
    if (id) {
      void getGame(id).then((g) => {
        setExistingGame(g);
        setStep1Data({
          name: g.name,
          description: g.description ?? '',
          imageFileId: g.imageFileId ?? '',
          pluginId: g.pluginIds?.[0] ?? 'munchkin',
        });
        setGameConfig(g.config ?? {});
      });
    }
  }, [id]);

  const handleStep1 = (data: WizardStep1) => {
    setStep1Data(data);
    setStep(2);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: step1Data.name,
        description: step1Data.description || undefined,
        imageFileId: step1Data.imageFileId || undefined,
        pluginIds: step1Data.pluginId ? [step1Data.pluginId] : [],
        config: gameConfig,
      };

      if (isEditing && id) {
        await updateGame(id, payload);
      } else {
        await createGame(payload);
      }

      navigate('/admin/games');
    } catch {
      showError('Failed to save game. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <FeaturedIcon icon={PuzzlePiece01} color="brand" theme="gradient" size="md" />
          <div>
            <h1 className="text-display-xs font-semibold text-primary">
              {isEditing ? `Edit: ${existingGame?.name ?? '…'}` : 'New Game'}
            </h1>
            <p className="text-sm text-tertiary">
              {step === 1 ? 'Step 1 of 2 — Identity & Plugin' : 'Step 2 of 2 — Configure'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={step === 1 ? 'brand' : 'gray'} size="sm">1</Badge>
          <span className="text-xs text-quaternary">→</span>
          <Badge color={step === 2 ? 'brand' : 'gray'} size="sm">2</Badge>
        </div>
      </motion.header>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
          >
            <Step1
              defaultValues={step1Data}
              imageFolderId={existingGame?.imageFolderId ?? undefined}
              onNext={handleStep1}
            />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
          >
            <Step2
              step1Data={step1Data}
              gameConfig={gameConfig}
              onConfigChange={setGameConfig}
              onBack={() => setStep(1)}
              onSave={() => void handleSave()}
              isSaving={isSaving}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
