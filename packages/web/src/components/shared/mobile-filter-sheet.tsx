import { useState } from 'react';
import { FilterLines, X } from '@untitledui/icons';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/components/base/buttons/button';
import { useTranslation } from '@/lib/i18n/use-translation';
import { cx } from '@/utils/cx';

interface MobileFilterSheetProps {
  title?: string;
  activeCount?: number;
  children: React.ReactNode;
  className?: string;
}

export function MobileFilterSheet({
  title,
  activeCount = 0,
  children,
  className,
}: MobileFilterSheetProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop filters */}
      <div className={cx('hidden md:block', className)}>{children}</div>

      {/* Mobile trigger */}
      <div className="sticky top-0 z-10 -mx-4 border-b border-secondary bg-secondary/80 px-4 py-2 backdrop-blur-md md:hidden">
        <Button
          color="secondary"
          size="sm"
          iconLeading={FilterLines}
          onClick={() => setIsOpen(true)}
          className="w-full justify-center"
        >
          {title ?? t('common.filters')}
          {activeCount > 0 && (
            <span className="ml-2 rounded-full bg-brand-solid px-1.5 py-0.5 text-xs text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-secondary bg-primary p-5 pb-8 shadow-2xl md:hidden"
              role="dialog"
              aria-modal="true"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-md font-semibold text-primary">
                  {title ?? t('common.filters')}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-tertiary hover:bg-primary_hover"
                  aria-label={t('common.close')}
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex flex-col gap-4">{children}</div>
              <Button
                color="primary"
                size="md"
                className="mt-6 w-full"
                onClick={() => setIsOpen(false)}
              >
                {t('common.apply')}
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
