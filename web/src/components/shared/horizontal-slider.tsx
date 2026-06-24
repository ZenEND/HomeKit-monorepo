import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { useTranslation } from '@/lib/i18n/use-translation';
import { cx } from '@/utils/cx';

interface HorizontalSliderProps {
  title: string;
  subtitle?: string;
  /** Optional icon rendered before the title */
  icon?: ReactNode;
  /** When provided, renders a "See all →" link next to the nav arrows */
  seeAllHref?: string;
  children: ReactNode;
  className?: string;
}

export function HorizontalSlider({
  title,
  subtitle,
  icon,
  seeAllHref,
  children,
  className,
}: HorizontalSliderProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;

    setCanScrollLeft(node.scrollLeft > 4);
    setCanScrollRight(node.scrollLeft + node.clientWidth < node.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [updateScrollState, children]);

  const scrollBy = (direction: 'left' | 'right') => {
    const node = scrollRef.current;
    if (!node) return;

    const child = node.firstElementChild as HTMLElement | null;
    const amount = child ? child.offsetWidth + 12 : Math.max(node.clientWidth * 0.75, 200);
    node.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className={cx('flex flex-col gap-3', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {icon && <span className="shrink-0 text-brand-solid">{icon}</span>}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-primary">{title}</h3>
            {subtitle && <p className="mt-0.5 truncate text-xs text-tertiary">{subtitle}</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {seeAllHref && (
            <Link
              to={seeAllHref}
              className="text-xs font-medium text-brand-secondary hover:text-brand-solid transition-colors"
            >
              {t('plans.seeAll')} →
            </Link>
          )}
          <div className="hidden items-center gap-1 sm:flex">
            <Button
              size="sm"
              color="tertiary"
              iconLeading={ArrowLeft}
              aria-label="Scroll left"
              isDisabled={!canScrollLeft}
              onClick={() => scrollBy('left')}
            />
            <Button
              size="sm"
              color="tertiary"
              iconLeading={ArrowRight}
              aria-label="Scroll right"
              isDisabled={!canScrollRight}
              onClick={() => scrollBy('right')}
            />
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          role="list"
          className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory"
        >
          {children}
        </div>

        {canScrollLeft && (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[var(--color-bg-primary)] to-transparent"
            aria-hidden="true"
          />
        )}
        {canScrollRight && (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[var(--color-bg-primary)] to-transparent"
            aria-hidden="true"
          />
        )}
      </div>
    </section>
  );
}

export const sliderCardClassName = 'w-40 shrink-0 snap-start sm:w-44 lg:w-48';
