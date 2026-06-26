import { motion } from 'motion/react';
import { LoadingSpinner } from '@/components/shared/animated-icon';
import { cx } from '@/utils/cx';

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cx('skeleton-shimmer rounded-lg bg-tertiary', className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ className }: { className?: string }) {
  return <Shimmer className={cx('h-4 w-full', className)} />;
}

export function ReleaseCardSkeleton() {
  return (
    <div
      className="h-full overflow-hidden rounded-2xl border border-secondary bg-secondary"
      aria-hidden="true"
    >
      {/* poster */}
      <Shimmer className="aspect-[2/3] w-full rounded-none" />
      {/* content */}
      <div className="flex flex-col gap-2.5 p-3">
        <div className="flex flex-col gap-1.5">
          <Shimmer className="h-3.5 w-full" />
          <Shimmer className="h-3.5 w-3/4" />
        </div>
        <Shimmer className="h-3 w-1/2" />
        <div className="flex gap-1.5">
          <Shimmer className="h-5 w-14 rounded-full" />
          <Shimmer className="h-5 w-12 rounded-full" />
        </div>
        <Shimmer className="h-3 w-2/3" />
        <Shimmer className="h-7 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function ContentLoader({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        'flex min-h-[min(50vh,20rem)] w-full items-center justify-center',
        className,
      )}
      role="status"
      aria-label="Loading"
    >
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <LoadingSpinner size={32} className="text-brand-secondary" />
      </motion.div>
    </div>
  );
}

/** @deprecated Use ContentLoader for route and page loading states */
export function PageSkeleton() {
  return <ContentLoader />;
}
