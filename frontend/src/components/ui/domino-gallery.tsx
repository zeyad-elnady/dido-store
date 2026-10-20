"use client";

import * as React from "react";

export interface DominoItem {
  src: string;
  alt?: string;
  title?: string;
  slug?: string;
}

export interface DominoGalleryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  items: DominoItem[];
  cardWidth?: number;
  cardHeight?: number;
  gap?: number;
  /** Scroll distance in pixels that topples the whole row. */
  scrollLength?: number;
  /** Angle the standing cards lean back, in degrees. */
  standAngle?: number;
  /** Topple and rise on their own while nobody scrolls. */
  autoplay?: boolean;
  /** Milliseconds for one autoplay topple (the rise takes the same). */
  autoplayDuration?: number;
  /** Externally driven progress from 0 (standing) to 1 (lying flat). Disables scroll and autoplay. */
  progress?: number;
  onSelect?: (index: number, item: DominoItem) => void;
  /** React 19 passes `ref` as a regular prop. */
  ref?: React.Ref<HTMLDivElement>;
}

const OVERLAP = 0.45;
const IDLE_BEFORE_AUTOPLAY_MS = 3500;
const AUTOPLAY_HOLD_MS = 1400;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function clamp01(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

// Gravity, then a short bounce off the floor: the card accelerates into the fall and
// overshoots flat by 6° before settling.
function topple(t: number) {
  if (t < 0.72) {
    const u = t / 0.72;
    return u * u;
  }
  const u = (t - 0.72) / 0.28;
  return 1 + 0.06 * Math.sin(u * Math.PI) * (1 - u);
}

function cardProgress(progress: number, index: number, count: number) {
  if (count <= 1) return clamp01(progress);
  const window = 1 / (1 + OVERLAP * (count - 1));
  const start = index * window * OVERLAP;
  return clamp01((progress - start) / window);
}

export function DominoGallery({
  items,
  cardWidth = 220,
  cardHeight = 590,
  gap = 18,
  scrollLength = 1600,
  standAngle = 94,
  autoplay = false,
  autoplayDuration = 2600,
  progress: controlledProgress,
  onSelect,
  ref,
  className,
  style,
  ...rest
}: DominoGalleryProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [fitWidth, setFitWidth] = React.useState(cardWidth);
  const live = React.useRef({ progress: 0, shown: -1, lastScrollAt: -Infinity, auto: { t: 0, dir: 1, hold: 0 }, raf: 0, last: 0 });
  const isControlled = controlledProgress !== undefined;

  const setRootRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const fit = () => {
      const padding = root.clientWidth < 640 ? 16 : 48;
      const effectiveGap = root.clientWidth < 640 ? Math.min(gap, 10) : gap;
      const available = root.clientWidth - padding;
      const perCard = (available - effectiveGap * (items.length - 1)) / Math.max(1, items.length);
      setFitWidth(Math.max(52, Math.min(cardWidth, Math.floor(perCard))));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(root);
    return () => observer.disconnect();
  }, [cardWidth, gap, items.length]);

  React.useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReducedMotion(motion.matches);
    onMotion();
    motion.addEventListener("change", onMotion);
    return () => motion.removeEventListener("change", onMotion);
  }, []);

  const paint = React.useCallback(
    (progress: number) => {
      const s = live.current;
      const rounded = Math.round(progress * 1000) / 1000;
      if (rounded === s.shown) return;
      s.shown = rounded;
      const root = rootRef.current;
      root?.style.setProperty("--progress", String(rounded));
      root?.setAttribute("data-progress", rounded.toFixed(3));
      for (let i = 0; i < items.length; i++) {
        const card = cardRefs.current[i];
        if (!card) continue;
        const t = reducedMotion ? 1 : topple(cardProgress(rounded, i, items.length));
        const angle = standAngle * (1 - t);
        card.style.setProperty("--fall", String(Math.round(t * 1000) / 1000));
        card.style.transform = `rotateX(${angle}deg)`;
      }
    },
    [items.length, standAngle, reducedMotion],
  );

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const s = live.current;
    s.shown = -1;

    const scrollProgress = () => {
      const rect = root.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      return travel <= 0 ? 0 : clamp01(-rect.top / travel);
    };

    const frame = (now: number) => {
      s.raf = 0;
      const dt = s.last ? Math.min(now - s.last, 80) : 16;
      s.last = now;
      let target = s.progress;
      let keepGoing = false;
      if (isControlled) {
        target = clamp01(controlledProgress);
      } else {
        const fromScroll = scrollProgress();
        const idle = now - s.lastScrollAt > IDLE_BEFORE_AUTOPLAY_MS;
        if (autoplay && idle && !reducedMotion) {
          const a = s.auto;
          if (a.hold > 0) a.hold -= dt;
          else {
            a.t = clamp01(a.t + (dt / autoplayDuration) * a.dir);
            if (a.t === 1 || a.t === 0) {
              a.dir *= -1;
              a.hold = AUTOPLAY_HOLD_MS;
            }
          }
          target = a.t;
          keepGoing = true;
        } else {
          target = fromScroll;
          s.auto.t = fromScroll;
          s.auto.dir = fromScroll >= 0.999 ? -1 : 1;
          keepGoing = autoplay && !reducedMotion;
        }
      }
      s.progress = target;
      paint(target);
      if (keepGoing && !document.hidden) s.raf = requestAnimationFrame(frame);
      else s.last = 0;
    };
    const kick = () => {
      if (!s.raf) s.raf = requestAnimationFrame(frame);
    };
    const onScroll = () => {
      s.lastScrollAt = performance.now();
      kick();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", kick);
    document.addEventListener("visibilitychange", kick);
    kick();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", kick);
      document.removeEventListener("visibilitychange", kick);
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.last = 0;
    };
  }, [paint, isControlled, controlledProgress, autoplay, autoplayDuration, reducedMotion]);

  const width = fitWidth;
  const height = Math.round((fitWidth / cardWidth) * cardHeight);
  const stageHeight = height + 96;

  return (
    <div
      ref={setRootRef}
      data-slot="domino-gallery"
      className={cx("relative w-full", className)}
      style={{ height: isControlled ? stageHeight : `calc(100vh + ${scrollLength}px)`, ...style }}
      {...rest}
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center" style={isControlled ? { height: stageHeight, position: "static" } : undefined}>
        <div
          role="list"
          className="flex max-w-full justify-center px-6 py-8"
          style={{ gap, perspective: 1500, perspectiveOrigin: "50% -45%" }}
        >
          {items.map((item, index) => {
            const isSelected = selected === index;
            return (
              <div key={`${item.src}-${index}`} role="listitem" className="relative shrink-0" style={{ width, height, transformStyle: "preserve-3d" }}>
                <button
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  type="button"
                  data-card
                  data-selected={isSelected || undefined}
                  aria-label={item.title ?? item.alt ?? `Image ${index + 1}`}
                  aria-pressed={isSelected}
                  onClick={() => {
                    const next = isSelected ? null : index;
                    setSelected(next);
                    if (next !== null) onSelect?.(index, item);
                  }}
                  className={cx(
                    "relative block size-full overflow-hidden rounded-xl border border-border bg-card text-left shadow-[0_18px_40px_-16px_rgba(0,0,0,0.6)] transition-[outline,box-shadow] duration-300",
                    "focus-visible:[outline:2px_solid_transparent] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isSelected && "ring-2 ring-primary",
                  )}
                  style={{ transformOrigin: "50% 100%", transform: `rotateX(${standAngle}deg)`, backfaceVisibility: "hidden", "--fall": 0 } as React.CSSProperties}
                >
                  <img
                    src={item.src}
                    alt={item.alt ?? ""}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="absolute inset-0 size-full object-cover"
                    style={{ filter: "brightness(calc(0.55 + var(--fall) * 0.45))" }}
                  />
                  {item.title && (
                    <span
                      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-8 text-xs font-semibold text-white tracking-wide"
                      style={{ opacity: "max(0.65, var(--fall))" }}
                    >
                      {item.title}
                    </span>
                  )}
                </button>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-2 -bottom-2 h-3 rounded-full bg-black/40 blur-md"
                  style={{ opacity: "calc(0.25 + var(--fall, 0) * 0.5)", transform: "scaleX(calc(0.6 + var(--fall, 0) * 0.4))" }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DominoGallery;
