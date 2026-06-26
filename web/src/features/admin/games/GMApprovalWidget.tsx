import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, XCircle } from '@untitledui/icons';
import { submitGmApproval, type GmApprovalPayload } from '@/api/cards';

export interface PendingGMApproval {
  gameId: string;
  cardId: string;
  cardName: string;
  playerId: string;
  playerName: string;
  challengeText: string;
  timeoutSeconds: number;
  startedAt: number;
}

interface GMApprovalWidgetProps {
  approval: PendingGMApproval;
  onResolved: (decision: 'success' | 'fail') => void;
}

export function GMApprovalWidget({ approval, onResolved }: GMApprovalWidgetProps) {
  const { gameId, cardId, cardName, playerId, playerName, challengeText, timeoutSeconds, startedAt } =
    approval;

  const [timeLeft, setTimeLeft] = useState(() => {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    return Math.max(0, timeoutSeconds - elapsed);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          void handleDecision('fail');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDecision = useCallback(
    async (decision: 'success' | 'fail') => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const payload: GmApprovalPayload = { decision, gameId, cardId, playerId };
      try {
        await submitGmApproval(payload);
      } finally {
        onResolved(decision);
      }
    },
    [isSubmitting, gameId, cardId, playerId, onResolved],
  );

  const percent = (timeLeft / timeoutSeconds) * 100;
  const isUrgent = timeLeft <= 10;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="overflow-hidden rounded-2xl border border-warning/40 bg-warning/10 shadow-lg"
      >
        {/* Timer bar */}
        <div className="h-1.5 bg-secondary/20">
          <motion.div
            className={cx('h-full transition-colors', isUrgent ? 'bg-error' : 'bg-warning')}
            style={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">🟡</span>
                <span className="text-sm font-bold uppercase tracking-wide text-warning-700 dark:text-warning">
                  GM Approval Required
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-secondary">
                <span>
                  <span className="font-medium text-primary">Player:</span> {playerName}
                </span>
                <span>
                  <span className="font-medium text-primary">Card:</span> "{cardName}"
                </span>
              </div>
              <p className="mt-2 rounded-lg border border-secondary/40 bg-primary/40 px-3 py-2 text-sm font-medium text-primary">
                {challengeText}
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div
                className={cx(
                  'text-2xl font-bold tabular-nums',
                  isUrgent ? 'text-error' : 'text-secondary',
                )}
              >
                {timeStr}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={isSubmitting}
                  onClick={() => void handleDecision('success')}
                  className="flex items-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Check className="size-4" />
                  Succeeded
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => void handleDecision('fail')}
                  className="flex items-center gap-2 rounded-xl bg-error px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <XCircle className="size-4" />
                  Failed
                </button>
              </div>
              {isSubmitting && (
                <p className="text-xs text-quaternary">Applying effect…</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Standalone demo page for /admin/games
export function AdminGamesPage() {
  const [pendingApproval] = useState<PendingGMApproval | null>(null);
  const [resolved, setResolved] = useState<{ decision: string } | null>(null);

  return (
    <section className="flex flex-col gap-6">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h1 className="text-display-xs font-semibold text-primary">Game Sessions</h1>
        <p className="mt-1 text-sm text-tertiary">Monitor active games and handle GM approvals.</p>
      </motion.header>

      {pendingApproval && !resolved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <GMApprovalWidget
            approval={pendingApproval}
            onResolved={(decision) => setResolved({ decision })}
          />
        </motion.div>
      )}

      {resolved && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${
          resolved.decision === 'success'
            ? 'border-success/30 bg-success/10 text-success'
            : 'border-error/30 bg-error/10 text-error'
        }`}>
          GM decision recorded: {resolved.decision === 'success' ? '✅ Player succeeded' : '❌ Player failed'}
        </div>
      )}

      {!pendingApproval && (
        <div className="glass-card flex items-center justify-center py-16">
          <p className="text-sm text-tertiary">No active game sessions.</p>
        </div>
      )}
    </section>
  );
}

function cx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
