import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, PuzzlePiece01, Trash01 } from '@untitledui/icons';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { fileViewUrl } from '@/api/cards';
import { deleteGame, getGames, type GameRecord } from '@/api/games';
import { useTooltipStore } from '@/store/useTooltipStore';

export function AdminGamesListPage() {
  const navigate = useNavigate();
  const showError = useTooltipStore((s) => s.showError);
  const [games, setGames] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getGames()
      .then(setGames)
      .catch(() => showError('Failed to load games'))
      .finally(() => setLoading(false));
  }, [showError]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this game?')) return;
    await deleteGame(id);
    setGames((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <FeaturedIcon icon={PuzzlePiece01} color="brand" theme="gradient" size="md" />
          <div>
            <h1 className="text-display-xs font-semibold text-primary">Games</h1>
            <p className="text-sm text-tertiary">Manage game configurations and plugins.</p>
          </div>
        </div>
        <Button
          color="primary"
          size="sm"
          iconLeading={Plus}
          onClick={() => navigate('/admin/games/new')}
        >
          New game
        </Button>
      </motion.header>

      {loading ? (
        <div className="glass-card p-6 text-center text-sm text-tertiary">Loading…</div>
      ) : games.length === 0 ? (
        <div className="glass-card p-6 text-center text-sm text-tertiary">
          No games yet. Create one to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.05 * index }}
                className="glass-card group flex flex-col gap-3 p-5"
              >
                {game.imageFileId && (
                  <div className="overflow-hidden rounded-xl" style={{ aspectRatio: '16/9' }}>
                    <img
                      src={fileViewUrl(game.imageFileId)}
                      alt={game.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-primary">{game.name}</p>
                  <Badge
                    color={game.status === 'published' ? 'success' : 'gray'}
                    size="sm"
                  >
                    {game.status}
                  </Badge>
                </div>
                {game.description && (
                  <p className="text-xs text-tertiary line-clamp-2">{game.description}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {(game.pluginIds ?? []).map((pid) => (
                    <span
                      key={pid}
                      className="rounded-full border border-brand-primary bg-brand-primary/20 px-2.5 py-0.5 text-xs text-brand-secondary"
                    >
                      {pid}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => navigate(`/admin/games/${game.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    color="primary-destructive"
                    size="sm"
                    iconLeading={Trash01}
                    onClick={() => void handleDelete(game.id)}
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
