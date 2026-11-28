import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";
import { showToast } from "@/pages/course/components/ShowToast";
import {
  useListScrollRestoration,
  type ListRestorationPagination,
} from "@/hooks/useListScrollRestoration";

const PULL_THRESHOLD = 60;
const BACK_SWIPE_EDGE = 24;

interface PullToRefreshProps extends ComponentPropsWithoutRef<"main"> {
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  restorationPagination?: ListRestorationPagination;
}

export default function PullToRefresh({
  onRefresh,
  disabled = false,
  restorationPagination,
  children,
  className,
  ...props
}: PullToRefreshProps) {
  const scrollRef = useRef<HTMLElement>(null);
  const restoreScroll = useListScrollRestoration(restorationPagination);
  const setScrollElement = useCallback((element: HTMLElement | null) => {
    scrollRef.current = element;
    restoreScroll(element);
  }, [restoreScroll]);
  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const refresh = useEffectEvent(onRefresh);
  const isDisabled = useEffectEvent(() =>
    disabled || Boolean(document.querySelector('[role="dialog"], [aria-modal="true"]')),
  );

  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;

    let start: Touch | undefined;
    let pull = 0;
    let inFlight = false;
    let isMounted = true;

    const reset = () => {
      start = undefined;
      pull = 0;
      setDistance(0);
    };

    const handleStart = (event: TouchEvent) => {
      reset();
      if (inFlight || isDisabled() || scroll.scrollTop > 0 || event.touches.length !== 1) return;
      if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable]")) return;

      const touch = event.touches[0];
      if (touch.clientX > BACK_SWIPE_EDGE) start = touch;
    };

    const handleMove = (event: TouchEvent) => {
      if (!start) return;
      const touch = event.touches[0];
      if (event.touches.length !== 1 || touch.identifier !== start.identifier) {
        reset();
        return;
      }

      const dx = Math.abs(touch.clientX - start.clientX);
      const dy = touch.clientY - start.clientY;
      if (dy < -8 || (dx > 8 && dx > dy) || isDisabled()) {
        reset();
        return;
      }
      if (dy > 8 && event.cancelable) event.preventDefault();
      pull = dy > 8 ? Math.min(dy * 0.65, 90) : 0;
      setDistance(pull);
    };

    const handleEnd = async () => {
      const shouldRefresh = pull >= PULL_THRESHOLD && !isDisabled();
      reset();
      if (!shouldRefresh || inFlight) return;

      inFlight = true;
      setRefreshing(true);
      try {
        await refresh();
      } catch {
        if (isMounted) showToast({ message: "새로고침에 실패했습니다. 다시 시도해 주세요." });
      } finally {
        inFlight = false;
        if (isMounted) setRefreshing(false);
      }
    };

    scroll.addEventListener("touchstart", handleStart, { passive: true });
    scroll.addEventListener("touchmove", handleMove, { passive: false });
    scroll.addEventListener("touchend", handleEnd);
    scroll.addEventListener("touchcancel", reset);
    return () => {
      isMounted = false;
      scroll.removeEventListener("touchstart", handleStart);
      scroll.removeEventListener("touchmove", handleMove);
      scroll.removeEventListener("touchend", handleEnd);
      scroll.removeEventListener("touchcancel", reset);
    };
  }, []);

  return (
    <main ref={setScrollElement} className={`overscroll-y-contain ${className ?? ""}`} {...props}>
      {(distance > 0 || refreshing) && (
        <div
          className="pointer-events-none fixed left-1/2 top-[var(--safe-top)] z-40 grid size-9 -translate-x-1/2 place-items-center rounded-full bg-white text-primary-90 shadow-md"
          style={{
            top: `calc(var(--safe-top) + ${refreshing ? 14 : Math.max(distance - 45, 0)}px)`,
            opacity: refreshing ? 1 : Math.min(distance / PULL_THRESHOLD, 1),
          }}
        >
          {refreshing ? (
            <span className="size-4 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin" aria-hidden="true" />
          ) : (
            <span className={distance >= PULL_THRESHOLD ? "rotate-180" : undefined} aria-hidden="true">↓</span>
          )}
        </div>
      )}
      <span className="sr-only" role="status">{refreshing ? "새로고침 중" : ""}</span>
      {children}
    </main>
  );
}
