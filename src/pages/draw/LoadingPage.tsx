import { useEffect, type ComponentType, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LottieModule, { type LottieRefCurrentProps } from "lottie-react";
import { getAccessToken } from "@/api/auth";
import { 
  getCachedMyProfile, 
  getMyProfile,
} from "@/api/member";
import {
  getCustomRecommendation,
  type CustomRecommendationRequest,
  type CustomRecommendationResponseData,
} from "@/api/recommendation";
import { drawRandomStation, RandomDrawNotFoundError } from "@/api/random";
import loadingComplete from "@/assets/lottie/loading-complete.json";
import loadingSearch from "@/assets/lottie/loading-search.json";

const SEARCH_MIN_LOADING_MS = 2500;
const SEARCH_ANIMATION_SPEED = 1.75;
const COMPLETE_ANIMATION_SPEED = 1.5;
const Lottie = (
  "default" in LottieModule && typeof LottieModule.default === "function"
    ? LottieModule.default
    : LottieModule
) as ComponentType<Record<string, unknown>>;
type LoadingPhase = "search" | "complete";
type DrawResult =
  | Awaited<ReturnType<typeof drawRandomStation>>
  | CustomRecommendationResponseData;
type LoadingPageState = {
  source?: "random" | "recommend";
  recommendationRequest?: CustomRecommendationRequest;
  recommendationSessionId?: string;
};

function LoadingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loadingState = location.state as LoadingPageState | null;
  const source = loadingState?.source ?? "random";
  const recommendationRequest = loadingState?.recommendationRequest;
  const [fallbackRecommendationSessionId] = useState(() => crypto.randomUUID());
  const recommendationSessionId =
    loadingState?.recommendationSessionId ??
    recommendationRequest?.recommendationSessionId ??
    fallbackRecommendationSessionId;
  const retryTimeoutRef = useRef<number | null>(null);
  const phaseTimeoutRef = useRef<number | null>(null);
  const searchLottieRef = useRef<LottieRefCurrentProps | null>(null);
  const completeLottieRef = useRef<LottieRefCurrentProps | null>(null);
  const pendingResultRef = useRef<DrawResult | null>(null);
  const searchStartedAtRef = useRef<number>(0);
  const [phase, setPhase] = useState<LoadingPhase>("search");
  const [loadingError, setLoadingError] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(() => {
    const cachedProfile = getCachedMyProfile();
    return cachedProfile?.nickname || null;
  });
  const [isProfileResolved, setIsProfileResolved] = useState(() =>
    Boolean(getCachedMyProfile()?.nickname),
  );
  const isLoggedIn = Boolean(getAccessToken());

  useEffect(() => {
    let isMounted = true;
    searchStartedAtRef.current = Date.now();
    pendingResultRef.current = null;

    const fetchMyProfile = async () => {
      if (!isLoggedIn) {
        setDisplayName(null);
        setIsProfileResolved(true);
        return;
      }

      try {
        const profile = await getMyProfile();

        if (!isMounted) return;

        setDisplayName(profile.nickname || "유저");
      } catch {
        if (!isMounted) return;

        setDisplayName("유저");
      } finally {
        if (isMounted) {
          setIsProfileResolved(true);
        }
      }
    };

    const moveToCompletePhase = () => {
      if (!isMounted || !pendingResultRef.current) return;

      setPhase("complete");
    };

    const scheduleCompletePhase = () => {
      if (!isMounted || !pendingResultRef.current) return;

      const elapsed = Date.now() - searchStartedAtRef.current;
      const remaining = Math.max(0, SEARCH_MIN_LOADING_MS - elapsed);

      if (phaseTimeoutRef.current !== null) {
        window.clearTimeout(phaseTimeoutRef.current);
      }

      if (remaining === 0) {
        moveToCompletePhase();
        return;
      }

      phaseTimeoutRef.current = window.setTimeout(() => {
        moveToCompletePhase();
      }, remaining);
    };

    const requestResult = async () => {
      try {
        if (source === "recommend" && !recommendationRequest) {
          throw new Error("추천 조건이 없어 다시 선택이 필요합니다.");
        }

        const result =
          source === "recommend" && recommendationRequest
            ? await getCustomRecommendation(recommendationRequest)
            : await drawRandomStation(recommendationSessionId);
        if (!isMounted) return;

        pendingResultRef.current = result;
        scheduleCompletePhase();
      } catch (error) {
        if (!isMounted) return;

        if (source === "random" && error instanceof RandomDrawNotFoundError) {
          retryTimeoutRef.current = window.setTimeout(() => {
            void requestResult();
          }, 1000);
          return;
        }

        console.error(error);
        setLoadingError(true);
      }
    };

    void fetchMyProfile();
    void requestResult();

    return () => {
      isMounted = false;

      if (retryTimeoutRef.current !== null) {
        window.clearTimeout(retryTimeoutRef.current);
      }

      if (phaseTimeoutRef.current !== null) {
        window.clearTimeout(phaseTimeoutRef.current);
      }
    };
  }, [
    isLoggedIn,
    navigate,
    recommendationRequest,
    recommendationSessionId,
    source,
  ]);

  const handleCompleteAnimationEnd = () => {
    const result = pendingResultRef.current;
    if (!result) return;

    navigate(`/draw/result`, {
      state: {
        ...result,
        recommendationRequest,
        recommendationSessionId,
        source,
      },
      replace: true,
    });
  };

  const isSearchPhase = phase === "search";

  if (loadingError) {
    return (
      <main className="flex h-dvh flex-col items-center justify-center gap-4 bg-gray-10 px-6 pt-[var(--safe-top)] text-center">
        <h1 className="text-title-02 font-semibold text-gray-90">
          결과를 불러오지 못했어요<br/>
          다시 시도해주세요
        </h1>
        <button
          type="button"
          onClick={() => navigate(`/`)}
          className="rounded-full bg-primary-60 px-5 py-3 text-body-01 font-semibold text-white"
        >
          홈으로 돌아가기
        </button>
      </main>
    );
  }

  return (
    <main className="relative flex h-dvh overflow-hidden bg-gray-10 px-8 pt-[var(--safe-top)]">
      <div className="pointer-events-none absolute left-1/2 top-1/2 w-[240px] -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-[184px] w-full">
          <div className="absolute bottom-full left-[-50px] mb-[100px] w-[262px]">
            <h1 className="text-title-01 font-semibold leading-[1.4] tracking-[-0.025em] text-gray-90 text-start">
              {isLoggedIn && isProfileResolved ? (
                <>
                  {displayName}님에게 어울리는 <br />
                  환승역을 지금 찾고 있어요!
                </>
              ) : (
                <>
                  어울리는 <br />
                  환승역을 지금 찾고 있어요!
                </>
              )}
            </h1>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <Lottie
              lottieRef={isSearchPhase ? searchLottieRef : completeLottieRef}
              animationData={isSearchPhase ? loadingSearch : loadingComplete}
              autoplay
              loop={isSearchPhase}
              className={isSearchPhase ? "h-auto w-full" : "h-auto w-[184px]"}
              onDOMLoaded={() => {
                if (isSearchPhase) {
                  searchLottieRef.current?.setSpeed(SEARCH_ANIMATION_SPEED);
                  return;
                }

                completeLottieRef.current?.setSpeed(COMPLETE_ANIMATION_SPEED);
              }}
              onComplete={isSearchPhase ? undefined : handleCompleteAnimationEnd}
              renderer="svg"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default LoadingPage;
