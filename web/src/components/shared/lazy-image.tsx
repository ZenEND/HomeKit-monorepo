import { useEffect, useRef, useState } from 'react';
import { cx } from '@/utils/cx';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string;
}

// Shared singleton observer — avoids creating one IntersectionObserver per card.
const callbackMap = new Map<Element, () => void>();
const sharedObserver =
  typeof window !== 'undefined'
    ? new IntersectionObserver(
        (entries, observer) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const cb = callbackMap.get(entry.target);
              if (cb) {
                cb();
                observer.unobserve(entry.target);
                callbackMap.delete(entry.target);
              }
            }
          }
        },
        { rootMargin: '200px' },
      )
    : null;

export function LazyImage({
  src,
  alt,
  className,
  containerClassName,
  aspectRatio = 'aspect-[7/10]',
}: LazyImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || !sharedObserver) return;

    callbackMap.set(node, () => setIsInView(true));
    sharedObserver.observe(node);

    return () => {
      sharedObserver.unobserve(node);
      callbackMap.delete(node);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cx('relative overflow-hidden bg-tertiary', aspectRatio, containerClassName)}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-tertiary" aria-hidden="true" />
      )}

      {hasError ? (
        <div className="flex h-full items-center justify-center text-4xl">🎬</div>
      ) : (
        isInView && (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={cx(
              'h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105',
              isLoaded ? 'opacity-100' : 'opacity-0',
              className,
            )}
          />
        )
      )}
    </div>
  );
}
