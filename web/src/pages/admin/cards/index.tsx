import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Copy01, Edit01, Plus, Trash01 } from '@untitledui/icons';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import {
  Card,
  CardStatus,
  CardType,
  deleteCard,
  duplicateCard,
  EffectDefinition,
  getCards,
  getEffectDefinitions,
} from '@/api/cards';
import { cx } from '@/utils/cx';

const TYPE_COLORS: Record<CardType, 'brand' | 'warning' | 'success' | 'sky' | 'indigo'> = {
  DOOR: 'brand',
  TREASURE: 'warning',
  PARTY: 'success',
  SITUATION: 'sky',
  MINIGAME: 'indigo',
};

const STATUS_COLORS: Record<CardStatus, 'gray' | 'success'> = {
  draft: 'gray',
  published: 'success',
};

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

export function CardLibraryPage() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [definitions, setDefinitions] = useState<EffectDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    type: '' as CardType | '',
    status: '' as CardStatus | '',
    effectId: '',
    tag: '',
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedCards, fetchedDefs] = await Promise.all([
        getCards({
          type: filters.type || undefined,
          status: filters.status || undefined,
          effectId: filters.effectId || undefined,
          tag: filters.tag || undefined,
        }),
        definitions.length === 0 ? getEffectDefinitions() : Promise.resolve(definitions),
      ]);
      setCards(fetchedCards);
      if (definitions.length === 0) setDefinitions(fetchedDefs);
    } finally {
      setIsLoading(false);
    }
  }, [filters, definitions]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this card?')) return;
    await deleteCard(id);
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleDuplicate = async (id: string) => {
    const clone = await duplicateCard(id);
    setCards((prev) => [clone, ...prev]);
  };

  return (
    <section className="flex flex-col gap-6">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-display-xs font-semibold text-primary">Card Library</h1>
          <p className="mt-1 text-sm text-tertiary">Manage all game cards and their effects.</p>
        </div>
        <Button color="primary" size="sm" iconLeading={Plus} onClick={() => navigate('/admin/cards/new')}>
          New Card
        </Button>
      </motion.header>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-4"
      >
        <div className="flex flex-wrap gap-3">
          <select
            className="rounded-lg border border-secondary/60 bg-primary/40 px-3 py-2 text-sm text-primary"
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value as CardType | '' }))}
          >
            <option value="">All Types</option>
            {(['DOOR', 'TREASURE', 'PARTY', 'SITUATION', 'MINIGAME'] as CardType[]).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            className="rounded-lg border border-secondary/60 bg-primary/40 px-3 py-2 text-sm text-primary"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as CardStatus | '' }))}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          <select
            className="rounded-lg border border-secondary/60 bg-primary/40 px-3 py-2 text-sm text-primary"
            value={filters.effectId}
            onChange={(e) => setFilters((f) => ({ ...f, effectId: e.target.value }))}
          >
            <option value="">All Effect Types</option>
            {definitions.map((d) => (
              <option key={d.id} value={d.id}>
                {EFFECT_ICONS[d.category] ?? '•'} {d.label}
              </option>
            ))}
          </select>

          <input
            className="rounded-lg border border-secondary/60 bg-primary/40 px-3 py-2 text-sm text-primary placeholder:text-quaternary"
            placeholder="Filter by tag…"
            value={filters.tag}
            onChange={(e) => setFilters((f) => ({ ...f, tag: e.target.value }))}
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-tertiary">Loading…</div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <p className="text-sm text-tertiary">No cards found.</p>
            <Button color="secondary" size="sm" iconLeading={Plus} onClick={() => navigate('/admin/cards/new')}>
              Create first card
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary/60 text-left">
                  <th className="px-4 py-3 font-medium text-tertiary">Name</th>
                  <th className="px-4 py-3 font-medium text-tertiary">Type</th>
                  <th className="px-4 py-3 font-medium text-tertiary">Subtype</th>
                  <th className="px-4 py-3 font-medium text-tertiary">Effects</th>
                  <th className="px-4 py-3 font-medium text-tertiary">Tags</th>
                  <th className="px-4 py-3 font-medium text-tertiary">Status</th>
                  <th className="px-4 py-3 font-medium text-tertiary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card, i) => (
                  <tr
                    key={card.id}
                    className={cx(
                      'border-b border-secondary/40 transition-colors hover:bg-primary_hover',
                      i % 2 === 0 ? 'bg-transparent' : 'bg-primary/20',
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-primary">{card.name}</div>
                      {card.description && (
                        <div className="mt-0.5 truncate max-w-[200px] text-xs text-tertiary">
                          {card.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={TYPE_COLORS[card.type]} size="sm">
                        {card.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-tertiary">{card.subtype ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {card.effects.slice(0, 3).map((eff) => {
                          const def = definitions.find((d) => d.id === eff.definitionId);
                          return (
                            <span
                              key={eff.definitionId}
                              className="inline-flex items-center gap-1 rounded-md bg-secondary/40 px-1.5 py-0.5 text-xs text-primary"
                            >
                              {def ? `${EFFECT_ICONS[def.category] ?? '•'} ${def.label}` : eff.definitionId}
                            </span>
                          );
                        })}
                        {card.effects.length > 3 && (
                          <span className="text-xs text-quaternary">+{card.effects.length - 3}</span>
                        )}
                        {card.effects.length === 0 && <span className="text-xs text-quaternary">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(card.tags ?? []).slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-md bg-secondary/30 px-1.5 py-0.5 text-xs text-tertiary">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={STATUS_COLORS[card.status]} size="sm">
                        {card.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/admin/cards/${card.id}`)}
                          className="rounded-lg p-1.5 text-tertiary hover:bg-secondary/40 hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Edit01 className="size-4" />
                        </button>
                        <button
                          onClick={() => void handleDuplicate(card.id)}
                          className="rounded-lg p-1.5 text-tertiary hover:bg-secondary/40 hover:text-primary transition-colors"
                          title="Duplicate"
                        >
                          <Copy01 className="size-4" />
                        </button>
                        <button
                          onClick={() => void handleDelete(card.id)}
                          className="rounded-lg p-1.5 text-tertiary hover:bg-error/10 hover:text-error transition-colors"
                          title="Delete"
                        >
                          <Trash01 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </section>
  );
}
