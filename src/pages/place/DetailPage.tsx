import Header from "@/components/Header";
import BaseLoading from "@/components/BaseLoading";
import Marker from "@/assets/marker.svg?react";
import Phone from "@/assets/phone.svg?react";
import Link from "@/assets/link.svg?react";
import Arrow from "@/assets/arrow-next(gray).svg?react";
import EmptyCard from "./components/EmptyCard";
import CulturalSpace from "@/assets/category/cultural-space.svg?react";
import Cafe from "@/assets/category/cafe.svg?react";
import Restaurant from "@/assets/category/restaurant.svg?react";
import Walk from "@/assets/category/walk.svg?react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ReviewPreviewCard from "./components/ReviewPreviewCard";
import CoursePreviewCard from "./components/CoursePreviewCard";
import { showToast } from "../course/components/ShowToast";
import copyToClipboard from "@/utils/clipboard";
import {
  getPlaceCourses,
  getPlaceDetail,
  type Course,
  type Place,
} from "@/api/place";
import { useAuth } from "@/contexts/useAuth";

export default function DetailPage() {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [place, setPlace] = useState<Place | null>(null); // place
  const [isPlaceLoading, setIsPlaceLoading] = useState(true);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]); // 장소를 포함한 코스
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPlaceDetail = async () => {
      if (!placeId) {
        setPlaceError("잘못된 장소입니다.");
        setIsPlaceLoading(false);
        return;
      }

      try {
        setIsPlaceLoading(true);
        const data = await getPlaceDetail(Number(placeId));
        setPlace(data);
      } catch (e) {
        console.error(e);
        setPlaceError("장소 정보를 불러오지 못했습니다.");
      } finally {
        setIsPlaceLoading(false);
      }
    };
    fetchPlaceDetail();
  }, [placeId]);

  useEffect(() => {
    if (!placeId || !isLoggedIn) return;

    const fetchPlaceCourses = async () => {
      try {
        setIsCoursesLoading(true);
        const data = await getPlaceCourses(Number(placeId));
        setCourses(data);
      } catch (e) {
        console.error(e);
        setCoursesError("장소를 포함한 코스 목록을 불러오지 못했습니다.");
      } finally {
        setIsCoursesLoading(false);
      }
    };
    fetchPlaceCourses();
  }, [isLoggedIn, placeId]);

  const fallback = (content: string) => (
    <main className="flex h-dvh items-center justify-center bg-gray-10 text-body-01 text-gray-70">
      {content}
    </main>
  );

  if (isPlaceLoading) return <BaseLoading />;
  if (placeError) return fallback(placeError);
  if (!place) return null;
  if (isLoggedIn && isCoursesLoading) return <BaseLoading />;
  if (isLoggedIn && coursesError) return fallback(coursesError);

  const slideImages = place.images;
  const isImageEmpty = slideImages.length < 1;
  const contactNumber = place.contactNumber;
  const reviews = place.reviews;
  const isReviewEmpty = reviews.length < 1;
  const previewReviewCount = reviews.length < 3 ? reviews.length : 3;
  const placeCourses = courses;
  const isCourseEmpty = placeCourses.length < 1;

  const handleDotClick = (idx: number) => {
    setIndex(idx);
    sliderRef.current?.scrollTo({
      left: idx * sliderRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  const handleSliderScroll = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    setIndex(Math.round(slider.scrollLeft / slider.clientWidth));
  };

  const handleNavigate = () => {
    window.open(`${place.kakaoPlaceUrl}`, "_blank", "noopener,noreferrer");
  };

  const handleCopy = async (text: string) => {
    const succeeded = await copyToClipboard(text);
    if (succeeded) {
      showToast({ message: "클립보드에 복사되었습니다!" });
    } else {
      showToast({ message: "복사에 실패했습니다." });
    }
  };

  return (
    <main className="flex flex-col h-dvh overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-gray-10 pt-[calc(var(--safe-top)+12px)] pb-[calc(var(--safe-bottom)+12px)]">
      <Header showBack />

      {/* basic info */}
      <section className="flex justify-center">
        <div className="flex flex-col gap-2.5 w-[360px]">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex self-start px-3 py-1.5 bg-primary-50 text-gray-10 text-body-02 rounded-lg leading-none tracking-[-0.25px]">
                {place.category}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-headline font-semibold leading-[1.4] tracking-[-0.5px]">
                  {place.placeName}
                </span>
                <span className="text-body-01 text-gray-70 leading-[1.4] tracking-[-0.3px] break-keep">
                  {place.description}
                </span>
              </div>
            </div>
          </div>

          {/* image */}
          {isImageEmpty ? (
            // 기본 이미지
            <div className="flex justify-center w-[360px] rounded-lg bg-gray-30 h-[240px]">
              <div className="flex items-center">
                {place.category === "문화공간" ? (
                  <CulturalSpace />
                ) : place.category === "카페" ? (
                  <Cafe />
                ) : place.category === "식당" ? (
                  <Restaurant />
                ) : (
                  <Walk />
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div
                ref={sliderRef}
                onScroll={handleSliderScroll}
                className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {slideImages.map((image, i) => (
                  <div
                    className="relative shrink-0 snap-start h-[240px] w-full"
                    key={i}
                  >
                    <img
                      src={image}
                      alt={`${place.placeName} 사진 ${i + 1}`}
                      className="rounded-lg w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-center items-center">
                {slideImages.map((_, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className={`inline-block h-[6px] rounded-full transition-all duration-300 ${
                      index === idx
                        ? "bg-primary-50 w-[18px]"
                        : "bg-gray-40 w-[6px]"
                    }`}
                    onClick={() => handleDotClick(idx)}
                  ></button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* detail info */}
      <section className="flex justify-center pt-3">
        <div className="flex flex-col gap-3 w-[360px]">
          <div className="flex flex-col bg-white px-4 py-2 gap-1 rounded-lg">
            <div className="flex py-1 gap-2 items-center">
              <Marker className="size-6" />
              <div className="flex gap-1">
                <span className="text-body-01 leading-[1.4] tracking-[-0.35px]">
                  {place.address}
                </span>
                <button
                  className="flex text-body-01 text-primary-70 leading-[1.4] tracking-[-0.35px]"
                  onClick={() => handleCopy(place.address)}
                >
                  복사
                </button>
              </div>
            </div>

            {contactNumber === null ? (
              <></>
            ) : (
              <div className="flex py-1 gap-2 items-center">
                <Phone className="w-size-6" />
                <div className="flex gap-1">
                  <span className="text-body-01 leading-[1.4] tracking-[-0.35px]">
                    {contactNumber}
                  </span>
                  <button
                    className="flex text-body-01 text-primary-70 leading-[1.4] tracking-[-0.35px]"
                    onClick={() => handleCopy(contactNumber)}
                  >
                    복사
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            className="flex items-center justify-end gap-0.5 text-body-02 font-semibold text-gray-60 leading-none tracking-[-0.3px]"
            onClick={handleNavigate}
          >
            카카오맵에서 확인하기
            <Link className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* review */}
      <section
        className={`flex justify-center pt-7 ${!isLoggedIn ? "pb-[calc(var(--safe-bottom)+10px)]" : ""}`}
      >
        <div className="flex flex-col w-[360px] gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-0.5">
              <span className="flex font-semibold text-title-02 leading-[1.4] tracking-[-0.45px]">
                다른 사람들이 남긴 리뷰
              </span>
              <span className="flex text-subtitle text-gray-70 leading-[1.4] tracking-[-0.4px]">
                {isReviewEmpty ? "" : `(${place.totalReviewCount})`}
              </span>
            </div>

            <button
              className="flex gap-0.5 items-center text-gray-60 font-semibold text-body-02 leading-none tracking-[-0.3px]"
              onClick={() => navigate(`/place/${place.placeId}/reviews`)}
            >
              더보기
              <Arrow className="w-4 h-4" />
            </button>
          </div>
          {isReviewEmpty ? (
            <EmptyCard variant="review" />
          ) : (
            <div className="flex flex-col w-[360px] rounded-lg bg-white">
              {reviews.slice(0, previewReviewCount).map((review, index) => (
                <div key={review.reviewId} className="flex flex-col w-full">
                  <ReviewPreviewCard
                    writerProfileImageUrl={review.writerProfileImageUrl}
                    writerNickname={review.writerNickname}
                    content={review.content}
                  />
                  {/* 구분선 */}
                  {index < previewReviewCount - 1 && (
                    <div className="border-b border-gray-20 mx-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* other courses */}
      {isLoggedIn && (
        <section className="flex justify-center pt-7">
          <div className="flex flex-col w-[360px]">
            <div className="flex py-3">
              <span className="flex font-semibold text-title-02 leading-[1.4] tracking-[-0.45px]">
                이 장소를 포함한 코스
              </span>
            </div>
            {isCourseEmpty ? (
              <EmptyCard variant="course" />
            ) : (
              <div className="flex w-full overflow-x-auto overflow-y-hidden list-none font-semibold [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-3">
                {placeCourses.map((placeCourse) => (
                  <button
                    key={placeCourse.journalId}
                    type="button"
                    className="flex shrink-0 border-0 bg-transparent p-0 text-left"
                    onClick={() => navigate(`/course/${placeCourse.journalId}`)}
                  >
                    <CoursePreviewCard
                      line={placeCourse.lineId}
                      name={placeCourse.courseName}
                      placeCount={placeCourse.placeCount}
                      travelDuration={placeCourse.travelDuration}
                      imageUrl={placeCourse.imageUrl}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
