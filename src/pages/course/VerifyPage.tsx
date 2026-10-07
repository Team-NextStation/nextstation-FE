import MapIcon from "@/assets/map-icon.svg?react";
import MapCloseIcon from "@/assets/map-close.svg?react";
import BaseLoading from "@/components/BaseLoading";
import CourseCard from "@/pages/course/components/CourseCard";
import CourseNumber from "@/pages/course/components/CourseNumber";
import Header from "@/components/Header";
import StationTitle from "@/components/StationTitle";
import type { SubwayLine } from "@/types/subway";
import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import CourseMap from "./components/CourseMap";
import { Reorder } from "motion/react";
import NameEditInput from "./components/NameEditInput";
import ConfirmModal from "@/components/ConfirmModal";
import LeadToLoginModal from "@/components/LeadToLoginModal";
import {
  copyCourse,
  getCopyPreviewCourse,
  getCourseDetail,
  getSharedCourseDetail,
  patchCourseDetail,
  type Place,
} from "@/api/courseDetail";
import { createCourse } from "@/api/courseRecommendation";
import { rerollRandomCourse, type RandomCourseResponse } from "@/api/random";
import Button from "@/components/Button";
import CTAButton from "@/components/CTAButton";
import { buildSharedCourseUrl } from "@/utils/courseShare";
import share from "@/utils/share";
import { showToast } from "./components/ShowToast";
import { getAccessToken } from "@/api/auth";

interface DraftCourseState {
  course: RandomCourseResponse;
  stationId: number;
  stationName: string;
  lineId: number;
}

interface VerifyCourse {
  courseId: number | null; // null --> 아직 저장되지 않은 draft (랜덤 뽑기 결과)
  sourceCourseId: number | null;
  shareToken: string | null;
  stationId: number;
  stationName: string;
  lineId: number;
}

interface VerifySyncedState {
  // 장소 상세 페이지로 이동했다가 돌아와도 순서/이름이 유지되도록 저장해두는 최신 스냅샷
  course: VerifyCourse;
  places: Place[];
  courseName: string;
  hasUnSavedChanged: boolean;
}

interface VerifyLocationState extends Partial<DraftCourseState> {
  synced?: VerifySyncedState;
}

function ensureCopyCourseName(name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return "(사본)";
  }

  return trimmedName.endsWith("(사본)") ? trimmedName : `${trimmedName} (사본)`;
}

function draftToPlaces(draft: DraftCourseState): Place[] {
  return draft.course.places.map((place, index) => ({
    placeId: place.placeId,
    placeName: place.placeName,
    description: place.description,
    categoryCode: place.categoryCode,
    categoryName: place.categoryName,
    imageUrl: place.imageUrl,
    xCoordinate: place.xCoordinate,
    yCoordinate: place.yCoordinate,
    orderNum: index + 1,
  }));
}

export default function VerifyPage() {
  const { courseId, shareToken } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as VerifyLocationState | null;
  const synced = locationState?.synced; // 장소 상세 등을 다녀온 뒤 복원할 최신 스냅샷
  const draft = !synced ? (locationState as DraftCourseState | null) : null; // Result Page에서 넘겨주는 랜덤 뽑기 결과
  const isSharedView = Boolean(shareToken);
  const [course, setCourse] = useState<VerifyCourse | null>(() => {
    if (synced) return synced.course;

    return !courseId && !shareToken && draft
      ? {
          // 랜덤 뽑기 결과
          courseId: null,
          sourceCourseId: null,
          shareToken: null,
          stationId: draft.stationId,
          stationName: draft.stationName,
          lineId: draft.lineId,
        }
      : null;
  });
  const [places, setPlaces] = useState<Place[]>(() => {
    if (synced) return synced.places;

    return !courseId && !shareToken && draft ? draftToPlaces(draft) : [];
  });
  const [isPlacesLoading, setIsPlacesLoading] = useState(
    !synced && (!!courseId || isSharedView),
  );
  const [placesError, setPlacesError] = useState<string | null>(() =>
    !synced && !courseId && !shareToken && !draft
      ? "코스 정보를 찾을 수 없습니다."
      : null,
  );
  const [courseName, setCourseName] = useState(() => {
    if (synced) return synced.courseName;

    return !courseId && !shareToken && draft ? draft.course.name : "";
  });
  const courseListRef = useRef<HTMLUListElement>(null);
  const [pressedId, setPressedId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(
    () => synced?.hasUnSavedChanged ?? false,
  ); // 순서/이름을 바꾸고 아직 저장 안 한 상태인지
  const [searchParams] = useSearchParams(); // 어떤 페이지로부터 진입했는지를 알기 위함
  const from = searchParams.get("from"); // draw (랜덤 뽑기) | recommend (맞춤 추천)
  const isLoggedIn = Boolean(getAccessToken());
  const isRandomDraft = from === "draw" && course?.courseId === null;
  const isRecommendDraft = from === "recommend" && course?.courseId === null;
  const isCopyPreviewDraft =
    from === "copy" && course?.courseId === null && !isSharedView;

  useEffect(() => {
    if ((!courseId && !shareToken) || synced) return;

    const fetchCourseData = async () => {
      try {
        setIsPlacesLoading(true);
        setPlacesError(null);

        if (isSharedView && shareToken) {
          const data = await getSharedCourseDetail(shareToken);
          setCourse({
            courseId: null,
            sourceCourseId: null,
            shareToken: data.shareToken,
            stationId: data.stationId,
            stationName: data.stationName,
            lineId: data.lineId,
          });
          setCourseName(data.courseName);
          setPlaces(data.places);
          return;
        }

        if (from === "copy") {
          const data = await getCopyPreviewCourse(Number(courseId));
          setCourse({
            courseId: null,
            sourceCourseId: data.courseId,
            shareToken: null,
            stationId: data.stationId,
            stationName: data.stationName,
            lineId: data.lineId,
          });
          setCourseName(ensureCopyCourseName(data.courseName));
          setPlaces(data.places);
          return;
        }

        const data = await getCourseDetail(Number(courseId));
        setCourse({
          courseId: data.courseId,
          sourceCourseId: null,
          shareToken: data.shareToken,
          stationId: data.stationId,
          stationName: data.stationName,
          lineId: data.lineId,
        });
        setCourseName(data.courseName);
        setPlaces(data.places);
      } catch (e) {
        console.error(e);
        setPlacesError(
          isSharedView
            ? "공유 코스 정보를 불러오지 못했습니다."
            : from === "copy"
            ? "코스 미리보기를 불러오지 못했습니다."
            : "코스 상세 정보를 불러오지 못했습니다.",
        );
      } finally {
        setIsPlacesLoading(false);
      }
    };
    void fetchCourseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, from, isSharedView, shareToken]);

  // 장소 상세 페이지로 이동했다가 돌아왔을 때 순서/이름이 유지되도록 현재 히스토리 항목에 최신 상태 동기화
  // isLeavingRef가 켜져 있으면 건너뜀
  const isLeavingRef = useRef(false);

  useEffect(() => {
    if (!course || isLeavingRef.current) return;

    navigate(location.pathname + location.search, {
      replace: true,
      state: { synced: { course, places, courseName, hasUnsavedChanges } },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course, places, courseName, hasUnsavedChanges]);

  const handleSave = async (): Promise<{
    courseId: number;
    shareToken: string | null;
  } | null> => {
    if (!course) return null;

    if (course.courseId) {
      const updated = await patchCourseDetail(course.courseId, {
        name: courseName,
        placeIds: places.map((place) => place.placeId),
      });
      setCourseName(updated.name);
      setHasUnsavedChanges(false);
      return { courseId: course.courseId, shareToken: course.shareToken };
    }

    if (course.sourceCourseId) {
      const copiedCourseName = ensureCopyCourseName(courseName);
      const copied = await copyCourse(
        course.sourceCourseId,
        copiedCourseName,
        places.map((place) => place.placeId),
      );
      const copiedDetail = await getCourseDetail(copied.courseId);
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              courseId: copied.courseId,
              shareToken: copiedDetail.shareToken,
            }
          : prev,
      );
      setCourseName(ensureCopyCourseName(copied.name));
      setHasUnsavedChanges(false);
      return {
        courseId: copied.courseId,
        shareToken: copiedDetail.shareToken,
      };
    }

    const created = await createCourse(
      course.stationId,
      courseName,
      places.map((place) => place.placeId),
    );
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            courseId: created.courseId,
            shareToken: created.shareToken,
          }
        : prev,
    );
    setHasUnsavedChanges(false);
    return {
      courseId: created.courseId,
      shareToken: created.shareToken,
    };
  };

  const [isSaving, setIsSaving] = useState(false);
  const [isRerolling, setIsRerolling] = useState(false);

  const handleSaveAndGo = async () => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }

    if (isSaving || isRerolling) return;

    setIsSaving(true);

    try {
      const savedCourse = await handleSave();

      if (savedCourse === null) {
        showToast({ message: "코스 저장에 실패했습니다." });
        return;
      }

      isLeavingRef.current = true;
      navigate("/course/saved", {
        state: {
          courseId: savedCourse.courseId,
          shareToken: savedCourse.shareToken,
        },
      });
    } catch (e) {
      showToast({
        message: e instanceof Error ? e.message : "코스 저장에 실패했습니다.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveOnly = async () => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }

    if (isSaving || isRerolling) return;

    setIsSaving(true);

    try {
      const savedCourse = await handleSave();

      if (savedCourse === null) {
        showToast({ message: "코스 저장에 실패했습니다." });
        return;
      }

      navigate("/course");
    } catch (e) {
      showToast({
        message: e instanceof Error ? e.message : "코스 저장에 실패했습니다.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRerollCourse = async () => {
    if (!isRandomDraft || isSaving || isRerolling || !course) return;

    try {
      setIsRerolling(true);
      const rerolledCourse = await rerollRandomCourse(course.stationId);
      setCourseName(rerolledCourse.name);
      setPlaces(
        rerolledCourse.places.map((place, index) => ({
          placeId: place.placeId,
          placeName: place.placeName,
          description: place.description,
          categoryCode: place.categoryCode,
          categoryName: place.categoryName,
          imageUrl: place.imageUrl,
          xCoordinate: place.xCoordinate,
          yCoordinate: place.yCoordinate,
          orderNum: index + 1,
        })),
      );
      setHasUnsavedChanges(false);
    } catch (e) {
      console.error(e);
      showToast({ message: "코스를 다시 불러오지 못했습니다." });
    } finally {
      setIsRerolling(false);
    }
  };

  const toggleModal = () => setIsModalOpen((prev) => !prev);
  const handleConfirm = () => {
    navigate("/");
  };

  if (isPlacesLoading) return <BaseLoading />;
  if (placesError) {
    return (
      <main className="flex h-dvh items-center justify-center bg-gray-10 text-body-01 text-gray-70">
        {placesError}
      </main>
    );
  }
  if (!course) return null;

  const handleShareClick = async () => {
    const currentShareToken = course.shareToken ?? shareToken ?? null;

    if (!currentShareToken) {
      showToast({ message: "공유 링크를 만들지 못했습니다." });
      return;
    }

    const shareUrl = buildSharedCourseUrl(currentShareToken);

    await share({
      url: shareUrl,
    });
  };

  const handleCloseClick = () => {
    if (isSharedView) {
      navigate("/");
      return;
    }

    if (
      !isRandomDraft &&
      !isRecommendDraft &&
      !isCopyPreviewDraft &&
      !hasUnsavedChanges
    ) {
      // 내가 만든 코스 목록에서 진입하는 경우, close --> 대문 페이지로 이동
      navigate("/course");
      return;
    }

    if (course.courseId !== null && !hasUnsavedChanges) {
      navigate("/");
      return;
    }
    toggleModal();
  };

  const handleCourseNameChange = (value: string) => {
    if (isSharedView) return;
    setCourseName(value);
    setHasUnsavedChanges(true);
  };

  const handleReorder = (newPlaces: Place[]) => {
    if (isRerolling || isSharedView) return;

    setPlaces(newPlaces);
    setHasUnsavedChanges(true);
  };

  return (
    <main className="flex flex-col h-dvh  bg-gray-10 gap-8 pt-[calc(var(--safe-top)+12px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Header showBack showClose onCloseClick={handleCloseClick} />

      {/* 경고 모달 */}
      {isModalOpen && (
        <ConfirmModal
          message={
            "해당 코스는 저장되지 않습니다.\n저장하지 않고 나가시겠습니까?"
          }
          onClose={toggleModal}
          onConfirm={handleConfirm}
        />
      )}

      {isLoginModalOpen && (
        <LeadToLoginModal
          message={"코스를 저장하고 싶다면\n로그인이 필요해요!"}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      {/* 역명 */}
      <section className="flex justify-center">
        <StationTitle
          line={course.lineId as SubwayLine}
          stationName={course.stationName}
        />
      </section>

      {/* 지도 */}
      <section className="flex justify-center">
        <div className="flex flex-col gap-2.5 w-[360px]">
          <NameEditInput
            value={courseName}
            onChange={handleCourseNameChange}
            disabled={isRerolling || isSharedView}
          />

          {isMapOpen ? (
            <div className="flex flex-col h-[357px] overflow-hidden rounded-lg border border-gray-40 bg-white">
              <div className="flex items-center justify-between px-4 py-4">
                <p className="text-title-02 font-semibold leading-[1.4] tracking-[-0.45px]">
                  내 코스 지도
                </p>
                <button
                  type="button"
                  onClick={() => setIsMapOpen(false)}
                  aria-label="내 코스 지도 접기"
                >
                  <MapIcon className="h-6 w-6 cursor-pointer text-gray-70" />
                </button>
              </div>
              <div className="h-[300px] w-full">
                {Capacitor.getPlatform() === "ios" ? (
                  <iframe
                    title="내 코스 지도"
                    src={`https://www.nextstation.kr/map.html?points=${encodeURIComponent(
                      JSON.stringify(
                        places.map((place) => ({
                          lat: place.yCoordinate,
                          lng: place.xCoordinate,
                        })),
                      ),
                    )}`}
                    className="h-full w-full border-0"
                  />
                ) : (
                  <CourseMap
                    points={places.map((place) => ({
                      lat: place.yCoordinate,
                      lng: place.xCoordinate,
                    }))}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-gray-40 bg-white p-4">
              <p className="text-title-02 font-semibold leading-[1.4] tracking-[-0.45px]">
                내 코스 지도
              </p>
              <button
                type="button"
                onClick={() => setIsMapOpen(true)}
                aria-label="내 코스 지도 펼치기"
              >
                <MapCloseIcon className="h-6 w-6 cursor-pointer text-gray-70" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 코스 순서 */}
      <section className="flex flex-col gap-4 items-center">
        <div className="flex flex-col gap-1 w-[360px]">
          <p className="text-title-02 font-semibold text-gray-100 leading-[1.4] tracking-[-0.45px]">
            내 코스 순서
          </p>
          <p className="text-body-02 text-gray-70 leading-[1.4] tracking-[-0.3px]">
            {isSharedView
              ? "공유받은 코스를 순서대로 확인해 보세요!"
              : "장소를 길게 누르면 순서를 변경할 수 있어요!"}
          </p>
        </div>

        {/* 번호 + 카드 하나 */}
        <Reorder.Group
          as="ul"
          ref={courseListRef}
          axis="y"
          values={places}
          onReorder={handleReorder}
          className="flex flex-col gap-[13px] "
        >
          {places.map((place, index) => (
            <Reorder.Item
              key={place.placeId}
              value={place}
              drag={!isRerolling && !isSharedView}
              dragConstraints={courseListRef}
              dragElastic={0.05}
              className="flex items-center gap-[13px]"
              onPointerDown={() =>
                !isRerolling && !isSharedView && setPressedId(place.placeId)
              }
              onPointerUp={() => setPressedId(null)}
              onPointerLeave={() => setPressedId(null)}
            >
              <CourseNumber number={index + 1} />
              <CourseCard
                placeId={place.placeId}
                name={place.placeName}
                imageUrl={place.imageUrl ?? ""}
                description={place.description}
                category={place.categoryCode}
                isActive={pressedId === place.placeId}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </section>

      {/* 하단 버튼 */}
      <section className="flex justify-center pb-[calc(var(--safe-bottom)+10px)]">
        {isSharedView ? (
          <div className="flex w-[360px]">
            <CTAButton onClick={handleShareClick}>공유하기</CTAButton>
          </div>
        ) : isRandomDraft ? ( // 랜덤 뽑기로부터 진입한 미저장 draft
          <div className="flex w-[360px] justify-between">
            <Button
              direction="left"
              disabled={isSaving || isRerolling}
              onClick={handleRerollCourse}
            >
              다시 뽑기
            </Button>
            <Button
              direction="right"
              disabled={isSaving || isRerolling}
              onClick={handleSaveAndGo}
            >
              저장하기
            </Button>
          </div>
        ) : isRecommendDraft ? ( // 맞춤 추천으로부터 진입한 미저장 draft
          <div className="flex w-[360px]">
            <CTAButton
              disabled={isSaving || isRerolling}
              onClick={handleSaveAndGo}
            >
              코스 저장하기
            </CTAButton>
          </div>
        ) : isCopyPreviewDraft ? (
          <div className="flex w-[360px]">
            <CTAButton
              disabled={isSaving || isRerolling}
              onClick={handleSaveAndGo}
            >
              코스 저장하기
            </CTAButton>
          </div>
        ) : (
          // 내가 만든 코스로부터 진입
          <div className="flex w-[360px] justify-between">
            <Button direction="left" mode="share" onClick={handleShareClick}>
              공유하기
            </Button>
            <Button
              direction="right"
              disabled={isSaving}
              onClick={handleSaveOnly}
            >
              저장하기
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
