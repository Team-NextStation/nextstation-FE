import { Capacitor } from "@capacitor/core";
import { useEffectEvent, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { captureBackPreview } from "./useBackSwipe";

const MAX_SAVED_LISTS = 40;
const PREVIEW_CAPTURE_DELAY_MS = 180;
const RESTORE_IDLE_TIMEOUT_MS = 3000;
const MAX_RESTORE_WAIT_MS = 8000;

type SavedList = {
  scrollTop: number;
  values: Map<string, unknown>;
};

const listHistory = new Map<string, SavedList>();

function saveEntry(key: string) {
  const entry = listHistory.get(key) ?? { scrollTop: 0, values: new Map() };
  listHistory.delete(key);
  listHistory.set(key, entry);
  if (listHistory.size > MAX_SAVED_LISTS) {
    const oldestKey = listHistory.keys().next().value;
    if (oldestKey !== undefined) listHistory.delete(oldestKey);
  }
  return entry;
}

export function useListHistoryValue<T>(name: string, initialValue: T) {
  const { key } = useLocation();
  const [value, setValue] = useState(() => {
    const saved = listHistory.get(key)?.values;
    return saved?.has(name) ? (saved.get(name) as T) : initialValue;
  });

  useLayoutEffect(() => {
    saveEntry(key).values.set(name, value);
  }, [key, name, value]);

  return [value, setValue] as const;
}

export interface ListRestorationPagination {
  cursor: string | null;
  loadMore: () => void | Promise<void>;
}

export function useListScrollRestoration(pagination?: ListRestorationPagination) {
  const { key } = useLocation();
  const navigationType = useNavigationType();
  const [element, setElement] = useState<HTMLElement | null>(null);
  const pendingPosition = useRef<number | null>(null);
  const requestedCursor = useRef<string | null>(null);
  const loadNextPage = useEffectEvent(() => {
    const cursor = pagination?.cursor;
    if (!cursor || requestedCursor.current === cursor) return;
    requestedCursor.current = cursor;
    void pagination.loadMore();
  });

  useLayoutEffect(() => {
    if (!element) return;

    const target = navigationType === "POP" ? listHistory.get(key)?.scrollTop ?? 0 : 0;
    pendingPosition.current = target > 0 ? target : null;
    requestedCursor.current = null;
    if (target === 0) element.scrollTo({ top: 0, behavior: "instant" });

    let resizeObserver: ResizeObserver | undefined;
    let mutationObserver: MutationObserver | undefined;
    let previewTimer: ReturnType<typeof setTimeout> | undefined;
    let restoreTimer: ReturnType<typeof setTimeout> | undefined;
    let lastCapturedPosition = 0;
    let lastReachablePosition = -1;
    const restoreDeadline = Date.now() + MAX_RESTORE_WAIT_MS;
    const usesNativePreview = Capacitor.getPlatform() === "ios";

    const captureCurrentPosition = () => {
      clearTimeout(previewTimer);
      if (!usesNativePreview || pendingPosition.current !== null || element.clientHeight === 0) return;
      const position = Math.round(Math.max(0, element.scrollTop));
      if (position === lastCapturedPosition) return;
      lastCapturedPosition = position;
      void captureBackPreview(key);
    };

    const finishRestoring = () => {
      pendingPosition.current = null;
      clearTimeout(restoreTimer);
      element.removeAttribute("data-restoring-list-scroll");
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };

    const restore = () => {
      const position = pendingPosition.current;
      if (position === null) return;

      const maxScrollTop = Math.max(0, element.scrollHeight - element.clientHeight);
      element.scrollTo({ top: Math.min(position, maxScrollTop), behavior: "instant" });
      if (maxScrollTop + 1 >= position) {
        finishRestoring();
        captureCurrentPosition();
      } else if (lastReachablePosition !== maxScrollTop) {
        lastReachablePosition = maxScrollTop;
        clearTimeout(restoreTimer);
        // If the list shrank or a request failed, reveal the closest available position.
        const remaining = Math.max(0, restoreDeadline - Date.now());
        restoreTimer = setTimeout(finishRestoring, Math.min(RESTORE_IDLE_TIMEOUT_MS, remaining));
      }
    };

    const savePosition = () => {
      if (pendingPosition.current === null && element.clientHeight > 0) {
        saveEntry(key).scrollTop = Math.max(0, element.scrollTop);
      }
    };

    const handleScroll = () => {
      savePosition();
      if (!usesNativePreview || pendingPosition.current !== null) return;
      clearTimeout(previewTimer);
      previewTimer = setTimeout(captureCurrentPosition, PREVIEW_CAPTURE_DELAY_MS);
    };

    const handleUserScroll = () => {
      if (pendingPosition.current !== null) finishRestoring();
      savePosition();
    };
    const handleTouchStart = (event: TouchEvent) => {
      handleUserScroll();
      if (event.target instanceof Element && event.target.closest("a, button, [role='link']")) {
        captureCurrentPosition();
      }
    };

    element.addEventListener("scroll", handleScroll, { passive: true });
    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("wheel", handleUserScroll, { passive: true });

    restore();
    if (pendingPosition.current !== null) {
      element.setAttribute("data-restoring-list-scroll", "");
      const observer = new ResizeObserver(restore);
      resizeObserver = observer;
      const observeSize = () => {
        observer.disconnect();
        observer.observe(element);
        for (const child of element.children) observer.observe(child);
      };
      mutationObserver = new MutationObserver(() => {
        observeSize();
        restore();
      });
      mutationObserver.observe(element, { childList: true, subtree: true });
      observeSize();
    }

    return () => {
      savePosition();
      clearTimeout(previewTimer);
      clearTimeout(restoreTimer);
      element.removeAttribute("data-restoring-list-scroll");
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      element.removeEventListener("scroll", handleScroll);
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("wheel", handleUserScroll);
    };
  }, [element, key, navigationType]);

  const nextCursor = pagination?.cursor;
  useLayoutEffect(() => {
    if (!element || !nextCursor || pendingPosition.current === null) return;

    const maxScrollTop = Math.max(0, element.scrollHeight - element.clientHeight);
    if (maxScrollTop + 1 < pendingPosition.current) loadNextPage();
  }, [element, key, nextCursor]);

  return setElement;
}
