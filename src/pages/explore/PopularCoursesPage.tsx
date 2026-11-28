import { useListScrollRestoration } from "@/hooks/useListScrollRestoration";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getExploreCourseDetailPath,
  getPopularExploreCourses,
  type ExploreCourse,
} from "@/api/explore";
import Header from "@/components/Header";
import ExploreCourseItem from "./components/ExploreCourseItem";

export default function PopularCoursesPage() {
  const navigate = useNavigate();
  const restoreScroll = useListScrollRestoration();
  const [courses, setCourses] = useState<ExploreCourse[]>([]);

  useEffect(() => {
    void getPopularExploreCourses()
      .then((data) => setCourses(data.courses))
      .catch(() => setCourses([]));
  }, []);

  return (
    <main ref={restoreScroll} className="flex h-dvh flex-col bg-gray-10 text-gray-100 pt-[calc(var(--safe-top)+12px)] text-gray-100 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Header showBack />
      <div className="px-[15px] pb-2.5">
        <h1 className="text-title-01 font-semibold tracking-[-0.025em]">
          사람들이 많이 찾는 코스
        </h1>
        <p className="mt-1 text-body-02 tracking-[-0.025em] text-gray-70">
          사람들이 나중에 가려고 가장 많이 담아둔 코스예요
        </p>
      </div>

      <section className="flex flex-col gap-3 px-[15px] py-4">
        {courses.map((course, index) => (
          <ExploreCourseItem
            key={course.courseId}
            courseId={course.courseId}
            rank={index + 1}
            line={course.line}
            stationName={course.stationName}
            name={course.name}
            tags={course.tags}
            likeCount={course.likeCount}
            isLiked={course.isLiked}
            imageUrl={course.imageUrl}
            onClick={() => navigate(getExploreCourseDetailPath(course))}
          />
        ))}
      </section>
    </main>
  );
}
