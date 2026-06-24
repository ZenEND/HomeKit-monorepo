import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const RELOAD_COUNT_KEY = 'app_chunk_reload_count';
const MAX_AUTO_RELOADS = 3;

export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message;
  return (
    msg.includes('does not provide an export named') ||
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('Loading chunk') ||
    (error instanceof SyntaxError && msg.includes('import'))
  );
}

function handleChunkReload() {
  const raw = sessionStorage.getItem(RELOAD_COUNT_KEY);
  const count = raw ? parseInt(raw, 10) : 0;

  if (count < MAX_AUTO_RELOADS) {
    sessionStorage.setItem(RELOAD_COUNT_KEY, String(count + 1));
    window.location.reload();
    return true;
  }

  sessionStorage.removeItem(RELOAD_COUNT_KEY);
  return false;
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ? error.stack : `${error.name}: ${error.message}`;
  }
  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
}

function ErrorCodeBlock({ error }: { error: unknown }) {
  const [copied, setCopied] = useState(false);
  const text = formatError(error);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="w-full overflow-hidden rounded-xl border border-error-secondary/40 bg-error-subtle/30"
    >
      <div className="flex items-center justify-between border-b border-error-secondary/30 px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-error-primary">
          <span className="size-1.5 rounded-full bg-error-solid" />
          Error details
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs text-tertiary transition-colors hover:bg-secondary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-solid"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="text-success-primary"
              >
                ✓ Copied
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                Copy
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      <pre className="max-h-36 overflow-auto px-3 py-3 text-left font-mono text-[11px] leading-relaxed text-error-primary/80 scrollbar-hide">
        {text}
      </pre>
    </motion.div>
  );
}

export function ChunkErrorScreen({
  error,
  onRefresh,
}: {
  error?: unknown;
  onRefresh: () => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-secondary p-6">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        className="glass-card flex w-full max-w-md flex-col items-center gap-5 p-8 text-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -8, 8, 0] }}
          transition={{ delay: 0.4, duration: 0.6, ease: 'easeInOut' }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-subtle text-3xl"
        >
          🔄
        </motion.div>

        <div className="flex flex-col gap-2">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-lg font-semibold text-primary"
          >
            App updated
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-sm text-tertiary"
          >
            A new version was deployed. Please reload to get the latest&nbsp;files.
          </motion.p>
        </div>

        {error !== undefined && <ErrorCodeBlock error={error} />}

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRefresh}
          className="w-full rounded-xl bg-brand-solid px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-brand-solid/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-solid"
        >
          Reload app
        </motion.button>
      </motion.div>
    </div>
  );
}

/** Drop-in element for react-router's errorElement prop. */
export function RouteChunkError({ error }: { error: unknown }) {
  useEffect(() => {
    if (isChunkLoadError(error)) {
      handleChunkReload();
    }
  }, [error]);

  const handleRefresh = () => {
    sessionStorage.removeItem(RELOAD_COUNT_KEY);
    window.location.reload();
  };

  return <ChunkErrorScreen error={error} onRefresh={handleRefresh} />;
}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: unknown;
}

export class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    if (isChunkLoadError(error)) {
      handleChunkReload();
    }
  }

  handleRefresh = () => {
    sessionStorage.removeItem(RELOAD_COUNT_KEY);
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return <ChunkErrorScreen error={this.state.error} onRefresh={this.handleRefresh} />;
    }
    return this.props.children;
  }
}
