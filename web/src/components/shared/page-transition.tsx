import { Suspense } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { motion } from 'motion/react';
import { ContentLoader } from './skeleton';

interface PageTransitionProps {
  variant?: 'slide' | 'slideHorizontal';
}

export function PageTransition({ variant = 'slide' }: PageTransitionProps) {
  const location = useLocation();
  const outlet = useOutlet();

  // Use only the first path segment as the animation key so that nested
  // route changes (e.g. /plans/racing → /plans/board-games) don't
  // trigger a full-page re-animation of shared layout shells.
  const animationKey = '/' + location.pathname.split('/')[1];

  const initial =
    variant === 'slideHorizontal' ? { x: 10 } : { y: 6 };

  return (
    <Suspense fallback={<ContentLoader />}>
      <motion.div
        key={animationKey}
        initial={initial}
        animate={{ x: 0, y: 0 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full"
      >
        {outlet}
      </motion.div>
    </Suspense>
  );
}

export function LazyRouteFallback() {
  return <ContentLoader />;
}
