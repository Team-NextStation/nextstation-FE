import { useLocation, useNavigate } from "react-router-dom";
import { useBackSwipe, useSwipeBackOverride } from "./useBackSwipe";

interface BackNavigationOptions {
  onBack?: () => void;
  onSwipeBack?: () => void;
  swipeEnabled?: boolean;
  registerSwipe?: boolean;
}

function hasPreviousAppEntry() {
  // BrowserRouter's index starts at zero on the first app history entry.
  const index = window.history.state?.idx;
  return typeof index === "number" && index > 0;
}

export function useAppBackSwipe() {
  const navigate = useNavigate();
  const { key } = useLocation();
  useBackSwipe(() => {
    if (hasPreviousAppEntry()) navigate(-1);
  }, key);
}

export function useBackNavigation(
  fallbackPath: string,
  {
    onBack,
    onSwipeBack,
    swipeEnabled = true,
    registerSwipe = true,
  }: BackNavigationOptions = {},
) {
  const navigate = useNavigate();

  const goBack = onBack ?? (() => {
    if (hasPreviousAppEntry()) {
      navigate(-1);
      return;
    }

    navigate(fallbackPath, { replace: true });
  });

  const swipeHandler = swipeEnabled ? (onSwipeBack ?? goBack) : null;
  useSwipeBackOverride(
    registerSwipe ? swipeHandler : undefined,
    registerSwipe && Boolean(onSwipeBack),
  );
  return goBack;
}
