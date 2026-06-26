import { AnimatePresence, motion } from 'motion/react';
import { useTooltipStore } from '@/store/useTooltipStore';

export function ErrorTooltips() {
  const errors = useTooltipStore((state) => state.errors);
  const dismissError = useTooltipStore((state) => state.dismissError);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
    >
      <AnimatePresence initial={false}>
        {errors.map((error) => (
          <motion.div
            key={error.id}
            initial={{ opacity: 0, x: 16, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-auto rounded-xl border border-error-secondary bg-primary px-4 py-3 shadow-lg"
            role="status"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 size-2 shrink-0 rounded-full bg-error-solid" />
              <p className="flex-1 text-sm font-medium text-error-primary">{error.message}</p>
              <button
                type="button"
                className="shrink-0 text-xs font-semibold text-tertiary outline-hidden hover:text-primary focus-visible:text-primary"
                onClick={() => dismissError(error.id)}
              >
                Close
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
