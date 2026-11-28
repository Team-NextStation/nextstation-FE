import { Capacitor, registerPlugin } from "@capacitor/core";
import { useEffect, useEffectEvent, useId } from "react";
import { useLocation } from "react-router-dom";

const IOS_BACK_SWIPE_EVENT = "nextstation:ios-back-swipe";
const SWIPE_BACK_EVENT = "nextstation:swipe-back";

const BackSwipe = registerPlugin<{
  routeChanged(entry: { index: number; key: string }): Promise<void>;
  captureBackPreview(entry: { key: string }): Promise<void>;
  setPreviewBlocked(entry: { key: string; id: string; blocked: boolean }): Promise<void>;
}>("BackSwipe");

export function captureBackPreview(key: string) {
  if (Capacitor.getPlatform() !== "ios" || !Capacitor.isPluginAvailable("BackSwipe")) return;

  return BackSwipe.captureBackPreview({ key }).catch(console.error);
}

function isDialogOpen() {
  return document.querySelector('[role="dialog"], [aria-modal="true"]') !== null;
}

export function useSwipeBackOverride(
  onBack: (() => void) | null | undefined,
  blockPreview = false,
) {
  const { key } = useLocation();
  const id = useId();
  const isRegistered = onBack !== undefined;
  const shouldBlockPreview = onBack === null || blockPreview;
  const triggerBack = useEffectEvent(() => onBack?.());

  useEffect(() => {
    if (
      !shouldBlockPreview ||
      Capacitor.getPlatform() !== "ios" ||
      !Capacitor.isPluginAvailable("BackSwipe")
    ) return;

    void BackSwipe.setPreviewBlocked({ key, id, blocked: true }).catch(console.error);
    return () => {
      void BackSwipe.setPreviewBlocked({ key, id, blocked: false }).catch(console.error);
    };
  }, [id, key, shouldBlockPreview]);

  useEffect(() => {
    if (!isRegistered || Capacitor.getPlatform() !== "ios") return;

    const handleSwipe = (event: Event) => {
      if (event.defaultPrevented) return;
      event.preventDefault();
      triggerBack();
    };

    window.addEventListener(SWIPE_BACK_EVENT, handleSwipe);
    return () => window.removeEventListener(SWIPE_BACK_EVENT, handleSwipe);
  }, [isRegistered]);
}

export function useBackSwipe(onBack: () => void, locationKey: string) {
  const triggerBack = useEffectEvent(onBack);

  useEffect(() => {
    if (Capacitor.getPlatform() !== "ios" || !Capacitor.isPluginAvailable("BackSwipe")) return;

    const index = window.history.state?.idx ?? 0;
    void BackSwipe.routeChanged({ index, key: locationKey }).catch(console.error);
  }, [locationKey]);

  useEffect(() => {
    if (Capacitor.getPlatform() !== "ios") return;

    const handleNativeSwipe = () => {
      if (isDialogOpen()) return;

      const shouldGoBack = window.dispatchEvent(
        new Event(SWIPE_BACK_EVENT, { cancelable: true }),
      );
      if (shouldGoBack) triggerBack();
    };

    window.addEventListener(IOS_BACK_SWIPE_EVENT, handleNativeSwipe);
    return () => window.removeEventListener(IOS_BACK_SWIPE_EVENT, handleNativeSwipe);
  }, []);
}
