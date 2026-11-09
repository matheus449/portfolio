import React, {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  const targetRef = useRef(refs);
  targetRef.current = refs;
  return useMemo(
    () => (value: T | null) => {
      targetRef.current.forEach((ref) => {
        if (typeof ref === 'function') {
          ref(value);
        } else if (ref != null) {
          (ref as React.MutableRefObject<T | null>).current = value;
        }
      });
    },
    []
  );
}

function useResponsiveRadius(baseRadius: number, mobileRadius: number) {
  const [radius, setRadius] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768
      ? mobileRadius
      : baseRadius
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => {
      setRadius(window.innerWidth < 768 ? mobileRadius : baseRadius);
    };
    update();
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(update, 100);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timer);
    };
  }, [baseRadius, mobileRadius]);

  return radius;
}

export interface RadialScrollGalleryProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: (hoveredIndex: number | null) => React.ReactNode;
  scrollDuration?: number;
  visiblePercentage?: number;
  baseRadius?: number;
  mobileRadius?: number;
  startTrigger?: string;
  onItemSelect?: (index: number) => void;
  direction?: 'ltr' | 'rtl';
  disabled?: boolean;
}

export const RadialScrollGallery = forwardRef<
  HTMLDivElement,
  RadialScrollGalleryProps
>(
  (
    {
      children,
      scrollDuration = 2500,
      visiblePercentage = 45,
      baseRadius = 550,
      mobileRadius = 220,
      className = '',
      startTrigger = 'center center',
      onItemSelect,
      direction = 'ltr',
      disabled = false,
      ...rest
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const listRef = useRef<HTMLUListElement | null>(null);
    const firstItemRef = useRef<HTMLLIElement | null>(null);
    const combinedRef = mergeRefs(ref, containerRef);

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [itemSize, setItemSize] = useState<{ w: number; h: number } | null>(
      null
    );
    const [mounted, setMounted] = useState(false);

    const radius = useResponsiveRadius(baseRadius, mobileRadius);
    const diameter = radius * 2;

    const { visibleDecimal, hiddenDecimal } = useMemo(() => {
      const clamped = Math.max(10, Math.min(100, visiblePercentage)) / 100;
      return { visibleDecimal: clamped, hiddenDecimal: 1 - clamped };
    }, [visiblePercentage]);

    const items = useMemo(
      () => React.Children.toArray(children(hoveredIndex)),
      [children, hoveredIndex]
    );
    const total = items.length;

    useEffect(() => {
      setMounted(true);
      if (!firstItemRef.current) return;
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setItemSize({
            w: entry.contentRect.width,
            h: entry.contentRect.height,
          });
        }
        // Refresh after React commits the measured stage dimensions.
      });
      ro.observe(firstItemRef.current);
      return () => ro.disconnect();
    }, [total]);

    useGSAP(
      () => {
        if (!containerRef.current || !listRef.current || total === 0 || !itemSize) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          return;
        }
        gsap.fromTo(
          listRef.current.children,
          { scale: 0, autoAlpha: 0 },
          {
            scale: 1,
            autoAlpha: 1,
            duration: 1.2,
            ease: 'back.out(1.2)',
            stagger: 0.05,
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
        gsap.to(listRef.current, {
          rotation: 360,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            pin: true,
            start: startTrigger,
            end: `+=${scrollDuration}`,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      },
      {
        scope: containerRef,
        dependencies: [scrollDuration, radius, startTrigger, total, itemSize?.w, itemSize?.h],
        revertOnUpdate: true,
      }
    );

    useEffect(() => {
      const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(frame);
    }, [radius, itemSize?.w, itemSize?.h]);

    if (total === 0) return null;

    const extraHeadroom = itemSize
      ? itemSize.h * 1.25 - itemSize.h + 60
      : 150;
    const stageHeight = itemSize
      ? diameter * visibleDecimal + itemSize.h / 2 + extraHeadroom
      : diameter * visibleDecimal + 200;

    return (
      <div
        ref={combinedRef}
        className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden ${className}`}
        {...rest}
      >
        <div
          className="relative w-full overflow-hidden"
          style={{
            height: `${stageHeight}px`,
            maskImage:
              'linear-gradient(to top, transparent 0%, black 40%, black 100%)',
            WebkitMaskImage:
              'linear-gradient(to top, transparent 0%, black 40%, black 100%)',
          }}
        >
          <ul
            ref={listRef}
            className={`absolute left-1/2 m-0 -translate-x-1/2 list-none p-0 will-change-transform transition-opacity duration-500 ease-out ${
              disabled ? 'pointer-events-none opacity-50 grayscale' : ''
            } ${mounted ? 'opacity-100' : 'opacity-0'}`}
            dir={direction}
            style={{
              width: diameter,
              height: diameter,
              bottom: -(diameter * hiddenDecimal),
            }}
          >
            {items.map((child, idx) => {
              const angleRad = (idx / total) * 2 * Math.PI;
              let x = radius * Math.cos(angleRad);
              const y = radius * Math.sin(angleRad);
              if (direction === 'rtl') x = -x;
              const angleDeg = (angleRad * 180) / Math.PI;
              const isHovered = hoveredIndex === idx;
              const anyHovered = hoveredIndex !== null;

              return (
                <li
                  key={idx}
                  ref={idx === 0 ? firstItemRef : null}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    zIndex: isHovered ? 100 : 10,
                    transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) rotate(${
                      angleDeg + 90
                    }deg)`,
                  }}
                >
                  <div
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    onClick={() => !disabled && onItemSelect?.(idx)}
                    onKeyDown={(e) => {
                      if (
                        !disabled &&
                        (e.key === 'Enter' || e.key === ' ')
                      ) {
                        e.preventDefault();
                        onItemSelect?.(idx);
                      }
                    }}
                    onMouseEnter={() => !disabled && setHoveredIndex(idx)}
                    onMouseLeave={() => !disabled && setHoveredIndex(null)}
                    onFocus={() => !disabled && setHoveredIndex(idx)}
                    onBlur={() => !disabled && setHoveredIndex(null)}
                    className={`block cursor-pointer rounded-xl text-left outline-none transition-all duration-500 ease-out will-change-transform focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                      isHovered ? 'scale-125 -translate-y-8' : 'scale-100'
                    } ${
                      anyHovered && !isHovered
                        ? 'opacity-40 blur-[2px] grayscale'
                        : 'opacity-100 blur-0'
                    }`}
                  >
                    {child}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
);

RadialScrollGallery.displayName = 'RadialScrollGallery';
