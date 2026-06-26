import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cx } from '@/utils/cx';

interface AnimatedLogoProps {
  className?: string;
  size?: number;
}

export function AnimatedLogo({ className, size = 32 }: AnimatedLogoProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={cx('shrink-0', className)}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="rgb(158 119 237)" />
          <stop offset="100%" stopColor="rgb(105 65 198)" />
        </linearGradient>
      </defs>
      <motion.circle
        cx="16"
        cy="16"
        r="15"
        fill="url(#logoGrad)"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      <motion.circle
        cx="16"
        cy="16"
        r="15"
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
        initial={{ scale: 1, opacity: 0.6 }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <path
        d="M10 14.5C10 12.0147 12.0147 10 14.5 10H17.5C19.9853 10 22 12.0147 22 14.5V20.5C22 21.3284 21.3284 22 20.5 22H11.5C10.6716 22 10 21.3284 10 20.5V14.5Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M16 10V7.5C16 6.67157 16.6716 6 17.5 6H19C19.5523 6 20 6.44772 20 7V10"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </motion.svg>
  );
}

export function LoadingSpinner({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

interface EmptyStateIllustrationProps {
  className?: string;
}

export function EmptyStateIllustration({ className }: EmptyStateIllustrationProps) {
  return (
    <motion.svg
      width="120"
      height="100"
      viewBox="0 0 120 100"
      fill="none"
      className={className}
      initial="hidden"
      animate="visible"
    >
      <motion.path
        d="M20 70 Q40 30 60 50 Q80 70 100 40"
        stroke="rgb(158 119 237)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 },
        }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="60"
        cy="50"
        r="18"
        stroke="rgb(214 187 251)"
        strokeWidth="2"
        fill="rgba(249 245 255 0.5)"
        variants={{
          hidden: { scale: 0, opacity: 0 },
          visible: { scale: 1, opacity: 1 },
        }}
        transition={{ delay: 0.6, duration: 0.5, type: 'spring' }}
      />
      <motion.path
        d="M54 50 L58 54 L66 44"
        stroke="rgb(127 86 217)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        variants={{
          hidden: { pathLength: 0 },
          visible: { pathLength: 1 },
        }}
        transition={{ delay: 1, duration: 0.4 }}
      />
    </motion.svg>
  );
}

interface NavIconProps {
  name: 'home' | 'storage' | 'games' | 'f1' | 'plans' | 'food' | 'parties' | 'invite' | 'admin' | 'development';
  isActive?: boolean;
  className?: string;
}

export function NavIcon({ name, isActive = false, className }: NavIconProps) {
  const stroke = isActive ? 'rgb(127 86 217)' : 'currentColor';
  const fill = isActive ? 'rgba(127, 86, 217, 0.12)' : 'none';

  const icons: Record<NavIconProps['name'], ReactNode> = {
    home: (
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke={stroke}
        strokeWidth="1.5"
        fill={fill}
        strokeLinejoin="round"
      />
    ),
    storage: (
      <path
        d="M4 6h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V6zm2 0V4a1 1 0 011-1h10a1 1 0 011 1v2M8 11h8M8 14h5"
        stroke={stroke}
        strokeWidth="1.5"
        fill={fill}
        strokeLinecap="round"
      />
    ),
    games: (
      <path
        d="M6 10h4v4M14 12h4M16 10v4M8 16v2M12 8v2"
        stroke={stroke}
        strokeWidth="1.5"
        fill={fill}
        strokeLinecap="round"
      />
    ),
    f1: (
      <path
        d="M4 14l3-6h10l3 6M6 14h12M8 14v2M16 14v2M10 8l2-2 2 2"
        stroke={stroke}
        strokeWidth="1.5"
        fill={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    plans: (
      <path
        d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.5 7.1 18.2l.9-5.5-4-3.9 5.5-.8L12 3z"
        stroke={stroke}
        strokeWidth="1.5"
        fill={isActive ? 'rgba(127, 86, 217, 0.2)' : fill}
        strokeLinejoin="round"
      />
    ),
    food: (
      <path
        d="M6 8v10M10 6v12M14 8c2 0 4 2 4 5v5H10V8h4z"
        stroke={stroke}
        strokeWidth="1.5"
        fill={fill}
        strokeLinecap="round"
      />
    ),
    parties: (
      <path
        d="M8 16c0-4 2-8 4-8s4 4 4 8M6 18h12M10 6l1-2M14 6l-1-2"
        stroke={stroke}
        strokeWidth="1.5"
        fill={fill}
        strokeLinecap="round"
      />
    ),
    invite: (
      <path
        d="M16 11c1.5 0 3 .5 4 1.5M8 11c-1.5 0-3 .5-4 1.5M12 14a3 3 0 100-6 3 3 0 000 6zM6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1"
        stroke={stroke}
        strokeWidth="1.5"
        fill={fill}
        strokeLinecap="round"
      />
    ),
    admin: (
      <path
        d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
        stroke={stroke}
        strokeWidth="1.5"
        fill={isActive ? 'rgba(127, 86, 217, 0.15)' : fill}
        strokeLinejoin="round"
      />
    ),
    development: (
      <path
        d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 6l-2 12"
        stroke={stroke}
        strokeWidth="1.5"
        fill={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  };

  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      className={className}
      animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {icons[name]}
    </motion.svg>
  );
}
