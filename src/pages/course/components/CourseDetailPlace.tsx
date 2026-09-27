import ArrowNext from "@/assets/arrow-next(gray).svg?react";
import JournalDefault from "@/assets/journal-default.svg?react";
import type { CourseDetailPlaceData } from "@/api/courseDetail";
import { useNavigate } from "react-router-dom";

export default function CourseDetailPlace({
  place,
}: {
  place: CourseDetailPlaceData;
}) {
  const navigate = useNavigate();
  const isImageEmpty = place.imageUrl === null;

  return (
    <div
      className={`flex items-center gap-6 px-8 py-4 ${place.imagePosition === "left" ? "flex-row" : "flex-row-reverse"}`}
    >
      {isImageEmpty ? (
        <JournalDefault />
      ) : (
        <img
          className="size-[100px] shrink-0 bg-secondary-20 object-cover"
          src={place.imageUrl!}
          alt=""
          width={100}
          height={100}
          loading="lazy"
          decoding="async"
        />
      )}

      <div className="flex min-w-0 flex-col flex-1 gap-2">
        <div className="flex items-center justify-between">
          <span className="truncate text-subtitle font-semibold leading-[1.4] tracking-[-0.4px]">
            {place.name}
          </span>
          <button onClick={() => navigate(`/place/${place.id}`)}>
            <ArrowNext className="size-5 shrink-0" aria-hidden="true" />
          </button>
        </div>
        <p className="whitespace-pre-line text-body-02 leading-[1.4] tracking-[-0.3px] text-gray-80">
          {place.description}
        </p>
      </div>
    </div>
  );
}
