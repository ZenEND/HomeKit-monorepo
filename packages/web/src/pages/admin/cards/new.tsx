import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { motion } from 'motion/react';
import { Move, Plus, Trash01 } from '@untitledui/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { CardFace } from '@/components/game/CardFace';
import { AIAssistPanel } from '@/features/admin/cards/AIAssistPanel';
import { EffectBuilderModal } from '@/features/admin/cards/EffectBuilderModal';
import { ImageUploadField } from '@/features/admin/cards/ImageUploadField';
import {
  createCard,
  deleteCard,
  duplicateCard,
  fileViewUrl,
  getCard,
  getEffectDefinitions,
  updateCard,
  type Card,
  type CardFormData,
  type CardStats,
  type CardType,
  type EffectDefinition,
  type EffectInstance,
} from '@/api/cards';
import { cx } from '@/utils/cx';
import { useTooltipStore } from '@/store/useTooltipStore';

const CARD_TYPES: CardType[] = ['DOOR', 'TREASURE', 'PARTY', 'SITUATION', 'MINIGAME'];

const SUBTYPES: Record<CardType, string[]> = {
  DOOR: ['monster', 'curse', 'trap', 'blessing', 'other'],
  TREASURE: ['item', 'weapon', 'armor', 'headgear', 'footwear', 'accessory', 'one-shot', 'other'],
  PARTY: ['race', 'class', 'ally', 'other'],
  SITUATION: ['funny', 'challenge', 'social', 'penalty', 'reward', 'other'],
  MINIGAME: ['trivia', 'physical', 'creative', 'other'],
};

interface FormValues {
  game: string;
  type: CardType;
  subtype: string;
  name: string;
  description: string;
  flavorText: string;
  imageUrl: string;
  imageFileId: string;
  stats: CardStats;
  effects: EffectInstance[];
  tags: string[];
  enabled: boolean;
  status: 'draft' | 'published';
}

const EFFECT_ICONS: Record<string, string> = {
  progress: '⬆',
  inventory: '🎒',
  loot: '🃏',
  turn: '🔄',
  combat: '⚔',
  situation: '😂',
  quest: '📜',
  gm: '🎲',
};

function SortableEffectChip({
  id,
  instance,
  definitions,
  onRemove,
}: {
  id: string;
  instance: EffectInstance;
  definitions: EffectDefinition[];
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const def = definitions.find((d) => d.id === instance.definitionId);
  const icon = def ? (EFFECT_ICONS[def.category] ?? '•') : '•';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-xl border border-secondary/60 bg-primary/40 px-3 py-2"
    >
      <button type="button" {...listeners} {...attributes} className="cursor-grab text-quaternary hover:text-tertiary touch-none">
        <Move className="size-4" />
      </button>
      <span className="text-sm text-primary">
        {icon} {def?.label ?? instance.definitionId}
        {instance.condition && (
          <span className="ml-1 text-xs text-quaternary">
            (if {instance.condition.type})
          </span>
        )}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-auto rounded-lg p-1 text-quaternary hover:bg-error/10 hover:text-error transition-colors"
      >
        <Trash01 className="size-3.5" />
      </button>
    </div>
  );
}

function TagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full border border-secondary/60 bg-secondary/30 px-2.5 py-0.5 text-xs text-primary"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="text-quaternary hover:text-primary"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        className="rounded-lg border border-secondary/60 bg-primary/40 px-2 py-0.5 text-xs text-primary placeholder:text-quaternary focus:border-brand-primary focus:outline-none"
        placeholder="Add tag…"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(input);
          }
        }}
        onBlur={() => { if (input.trim()) addTag(input); }}
      />
    </div>
  );
}

export function CardNewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const showError = useTooltipStore((state) => state.showError);

  const [definitions, setDefinitions] = useState<EffectDefinition[]>([]);
  const [isEffectModalOpen, setIsEffectModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      game: 'Munchkin',
      type: 'DOOR',
      subtype: 'monster',
      name: '',
      description: '',
      flavorText: '',
      imageUrl: '',
      imageFileId: '',
      stats: {},
      effects: [],
      tags: [],
      enabled: true,
      status: 'draft',
    },
  });

  const { fields: effectFields, append, remove, move } = useFieldArray({
    control,
    name: 'effects',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const watchedType = watch('type');
  const watchedValues = watch();

  // Load effect definitions
  useEffect(() => {
    void getEffectDefinitions().then(setDefinitions);
  }, []);

  // Load card for editing
  useEffect(() => {
    if (id) {
      void getCard(id).then((card) => {
        setEditingCard(card);
        reset({
          game: card.game,
          type: card.type,
          subtype: card.subtype ?? '',
          name: card.name,
          description: card.description ?? '',
          flavorText: card.flavorText ?? '',
          imageUrl: card.imageUrl ?? '',
          imageFileId: (card as unknown as { imageFileId?: string }).imageFileId ?? '',
          stats: card.stats ?? {},
          effects: card.effects ?? [],
          tags: card.tags ?? [],
          enabled: card.enabled,
          status: card.status,
        });
      });
    }
  }, [id, reset]);

  const handleAIGenerated = useCallback((data: CardFormData) => {
    if (data.name) setValue('name', data.name);
    if (data.description) setValue('description', data.description.slice(0, 120));
    if (data.flavorText) setValue('flavorText', data.flavorText.slice(0, 60));
    if (data.tags) setValue('tags', data.tags);
    if (data.level != null) setValue('stats.monsterLevel', data.level);
    if (data.treasureCount != null) setValue('stats.treasureReward', data.treasureCount);
    if (data.badStuff) setValue('stats.badStuff', data.badStuff);
    if (data.itemBonus != null) setValue('stats.itemBonus', data.itemBonus);
    if (data.itemValue != null) setValue('stats.itemValue', data.itemValue);
  }, [setValue]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = effectFields.findIndex((f) => f.id === active.id);
      const newIndex = effectFields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  const onSubmit = async (data: FormValues, publishNow?: boolean) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        status: publishNow ? 'published' as const : data.status,
      };

      if (isEditing && id) {
        await updateCard(id, payload);
      } else {
        await createCard(payload);
      }

      navigate('/admin/cards');
    } catch {
      showError('Failed to save card. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Delete this card permanently?')) return;
    await deleteCard(id);
    navigate('/admin/cards');
  };

  const handleDuplicate = async () => {
    if (!id) return;
    const clone = await duplicateCard(id);
    navigate(`/admin/cards/${clone.id}`);
  };

  const descValue = watch('description') ?? '';
  const flavorValue = watch('flavorText') ?? '';

  const isMonster = watchedValues.type === 'DOOR' && watchedValues.subtype === 'monster';
  const isItem = watchedValues.type === 'TREASURE';

  return (
    <div className="flex flex-col gap-4">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-display-xs font-semibold text-primary">
            {isEditing ? `Edit: ${editingCard?.name ?? '…'}` : 'New Card'}
          </h1>
          <p className="mt-1 text-sm text-tertiary">
            {isEditing ? 'Update card fields, effects, and publish state.' : 'Create a new game card.'}
          </p>
        </div>
        <Button color="secondary" size="sm" onClick={() => navigate('/admin/cards')}>
          ← Back to Library
        </Button>
      </motion.header>

      <form onSubmit={(e) => { e.preventDefault(); }} className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_220px]">
        {/* ── Left: AI Assist ──────────────────────────────────────────── */}
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-5"
        >
          <AIAssistPanel onGenerated={handleAIGenerated} />
        </motion.aside>

        {/* ── Middle: Card Form ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-5"
        >
          {/* Section 1: Identity */}
          <div className="glass-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-primary">Identity</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label-xs">Game</label>
                <select {...register('game')} className="input-base">
                  <option value="Munchkin">Munchkin</option>
                </select>
              </div>
              <div>
                <label className="label-xs">Type</label>
                <select
                  {...register('type')}
                  className="input-base"
                  onChange={(e) => {
                    setValue('type', e.target.value as CardType);
                    setValue('subtype', SUBTYPES[e.target.value as CardType]?.[0] ?? '');
                  }}
                >
                  {CARD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-xs">Subtype</label>
                <select {...register('subtype')} className="input-base">
                  {(SUBTYPES[watchedType] ?? []).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label-xs">Name</label>
                <input
                  {...register('name', { required: true })}
                  className={cx('input-base', errors.name && 'border-error')}
                  placeholder="Card name"
                />
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="label-xs">Description</label>
                  <span className={cx('text-[11px]', descValue.length > 120 ? 'text-error' : 'text-quaternary')}>
                    {descValue.length}/120
                  </span>
                </div>
                <textarea
                  {...register('description', { maxLength: 120 })}
                  className="input-base min-h-[72px] resize-none"
                  placeholder="Rules text shown on the card…"
                  maxLength={120}
                />
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="label-xs">Flavor Text</label>
                  <span className={cx('text-[11px]', flavorValue.length > 60 ? 'text-error' : 'text-quaternary')}>
                    {flavorValue.length}/60
                  </span>
                </div>
                <input
                  {...register('flavorText', { maxLength: 60 })}
                  className="input-base italic"
                  placeholder="Funny one-liner…"
                  maxLength={60}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Image */}
          <div className="glass-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-primary">Image</h2>
            <Controller
              control={control}
              name="imageFileId"
              render={({ field }) => (
                <ImageUploadField
                  value={field.value || undefined}
                  onChange={(fileId) => field.onChange(fileId ?? '')}
                />
              )}
            />
          </div>

          {/* Section 3: Stats */}
          {(isMonster || isItem) && (
            <div className="glass-card p-5">
              <h2 className="mb-4 text-sm font-semibold text-primary">Stats</h2>
              {isMonster && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-xs">Monster Level (1–20)</label>
                    <input
                      type="number"
                      {...register('stats.monsterLevel', { min: 1, max: 20, valueAsNumber: true })}
                      className="input-base"
                      min={1} max={20}
                    />
                  </div>
                  <div>
                    <label className="label-xs">Treasure Reward (0–5)</label>
                    <input
                      type="number"
                      {...register('stats.treasureReward', { min: 0, max: 5, valueAsNumber: true })}
                      className="input-base"
                      min={0} max={5}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label-xs">Bad Stuff</label>
                    <textarea
                      {...register('stats.badStuff')}
                      className="input-base min-h-[56px] resize-none"
                      placeholder="What happens when player loses / fails to flee…"
                    />
                  </div>
                </div>
              )}
              {isItem && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-xs">Slot</label>
                    <select {...register('stats.slot')} className="input-base">
                      {['Head', 'Body', 'Feet', 'Hand', 'Accessory', 'None'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-xs">Combat Bonus</label>
                    <input
                      type="number"
                      {...register('stats.combatBonus', { min: -10, max: 10, valueAsNumber: true })}
                      className="input-base"
                      min={-10} max={10}
                    />
                  </div>
                  <div>
                    <label className="label-xs">Gold Value</label>
                    <input
                      type="number"
                      {...register('stats.goldValue', { min: 0, valueAsNumber: true })}
                      className="input-base"
                      min={0}
                    />
                  </div>
                  <div className="flex items-center gap-2 self-end pb-2">
                    <input type="checkbox" {...register('stats.bigItem')} id="bigItem" className="size-4 rounded" />
                    <label htmlFor="bigItem" className="text-sm text-primary cursor-pointer">Big Item</label>
                  </div>
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="label-xs">Race Restriction</label>
                  <Controller
                    control={control}
                    name="stats.raceRestriction"
                    render={({ field }) => (
                      <TagInput
                        value={field.value ?? []}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="label-xs">Class Restriction</label>
                  <Controller
                    control={control}
                    name="stats.classRestriction"
                    render={({ field }) => (
                      <TagInput
                        value={field.value ?? []}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Effects */}
          <div className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-primary">Effects</h2>
              <Button
                type="button"
                color="secondary"
                size="sm"
                iconLeading={Plus}
                onClick={() => setIsEffectModalOpen(true)}
              >
                Add Effect
              </Button>
            </div>

            {effectFields.length === 0 ? (
              <p className="text-sm text-quaternary">No effects added. Effects are applied in order.</p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={effectFields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-2">
                    {effectFields.map((field, index) => (
                      <SortableEffectChip
                        key={field.id}
                        id={field.id}
                        instance={field as EffectInstance}
                        definitions={definitions}
                        onRemove={() => remove(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Section 5: Tags */}
          <div className="glass-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-primary">Tags</h2>
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <TagInput value={field.value ?? []} onChange={field.onChange} />
              )}
            />
          </div>

          {/* Section 6: Status */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-primary">Status</h2>
                <p className="mt-0.5 text-xs text-tertiary">Disabled cards never enter the deck.</p>
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <Controller
                  control={control}
                  name="enabled"
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="size-5 rounded"
                    />
                  )}
                />
                <span className="text-sm font-medium text-primary">Enabled</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              color="secondary"
              size="md"
              isLoading={isSaving}
              onClick={() => void handleSubmit((d) => onSubmit(d, false))()}
            >
              Save as Draft
            </Button>
            <Button
              color="primary"
              size="md"
              isLoading={isSaving}
              onClick={() => void handleSubmit((d) => onSubmit(d, true))()}
            >
              Save & Publish
            </Button>
            {isEditing && (
              <>
                <Button color="secondary" size="md" onClick={() => void handleDuplicate()}>
                  Duplicate
                </Button>
                <Button color="primary-destructive" size="md" onClick={() => void handleDelete()}>
                  Delete
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* ── Right: Live Preview ───────────────────────────────────────── */}
        <motion.aside
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col gap-3"
        >
          <div className="glass-card p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-quaternary">
              Live Preview
            </h3>
            <div className="flex justify-center">
              <CardFace
                type={watchedValues.type}
                subtype={watchedValues.subtype}
                name={watchedValues.name}
                description={watchedValues.description}
                flavorText={watchedValues.flavorText}
                imageUrl={
                  watchedValues.imageFileId
                    ? fileViewUrl(watchedValues.imageFileId)
                    : watchedValues.imageUrl || undefined
                }
                stats={watchedValues.stats}
                effects={watchedValues.effects ?? []}
                effectDefinitions={definitions}
                enabled={watchedValues.enabled}
              />
            </div>
            <div className="mt-3 flex justify-center">
              <Badge color={watchedValues.status === 'published' ? 'success' : 'gray'} size="sm">
                {watchedValues.status}
              </Badge>
            </div>
          </div>
        </motion.aside>
      </form>

      {/* Effect Builder Modal */}
      <EffectBuilderModal
        isOpen={isEffectModalOpen}
        definitions={definitions}
        onClose={() => setIsEffectModalOpen(false)}
        onAdd={(effect) => append(effect)}
      />
    </div>
  );
}
