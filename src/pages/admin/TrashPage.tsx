import Header from "@/components/Header";
import Dropdown from "./components/Dropdown";
import { useEffect, useState } from "react";
import { CATEGORY_LABELS } from "./data/mockPlaces";
import PlacePreviewCard from "./components/PlacePreviewCard";
import { useNavigate } from "react-router-dom";
import type { StatusChipVariant } from "./components/StatusChip";
import { getPlaces, type Place } from "@/api/admin";
import { useInView } from "react-intersection-observer";
import BaseLoading from "@/components/BaseLoading";

type StatusOption = {
  label: string;
  value: "ALL" | StatusChipVariant;
};

const statusSortOptions: StatusOption[] = [
  { label: "전체", value: "ALL" },
  { label: "반려", value: "REJECTED" },
  { label: "삭제", value: "DELETED" },
];

const TRASH_STATUSES: StatusChipVariant[] = ["REJECTED", "DELETED"];

export default function TrashPage() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState<Place[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [isPlacesLoading, setIsPlacesLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);

  const [selectedStatusOption, setSelectedStatusOption] = useState<
    StatusOption["value"] | null
  >(null);

  useEffect(() => {
    const fetchInitialPlaces = async () => {
      try {
        const data = await getPlaces(
          undefined,
          undefined,
          undefined,
          selectedStatusOption && selectedStatusOption !== "ALL"
            ? [selectedStatusOption]
            : TRASH_STATUSES,
        );

        setPlaces(data.places);
        setNextCursor(data.nextCursor);
        setHasNext(data.hasNext);
      } catch (e) {
        console.error(e);
        setPlacesError("장소 목록을 불러오지 못했습니다.");
      } finally {
        setIsPlacesLoading(false);
      }
    };

    fetchInitialPlaces();
  }, [selectedStatusOption]);

  // 스크롤로 다음 페이지 불러오기
  const loadMorePlaces = async () => {
    if (!nextCursor) return;
    try {
      setIsLoadingMore(true);
      const data = await getPlaces(
        undefined,
        undefined,
        undefined,
        selectedStatusOption && selectedStatusOption !== "ALL"
          ? [selectedStatusOption]
          : TRASH_STATUSES,
        nextCursor,
      );
      setPlaces((prev) => [...prev, ...data.places]);
      setNextCursor(data.nextCursor);
      setHasNext(data.hasNext);
    } catch (e) {
      console.error(e);
      setPlacesError("장소 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const { ref } = useInView({
    threshold: 0.5,
    rootMargin: "200px",
    onChange: (inView) => {
      if (inView && hasNext && !isLoadingMore) {
        loadMorePlaces();
      }
    },
  });

  if (isPlacesLoading) return <BaseLoading />;
  if (placesError) return <p>{placesError}</p>;

  const sortedPlaces = places.filter(
    (place) =>
      !selectedStatusOption ||
      selectedStatusOption === "ALL" ||
      place.status === selectedStatusOption,
  );

  return (
    <main className="flex flex-col h-dvh  bg-gray-10 pt-[calc(var(--safe-top)+12px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* header */}
      <Header showBack />
      <section className="flex justify-center pb-2.5">
        <div className="flex flex-col w-[360px]">
          <span className="text-title-01 font-semibold leading-[1.4] tracking-[-0.5px] text-gray-100">
            휴지통
          </span>
        </div>
      </section>

      <section className="flex justify-center">
        <div className="flex flex-col w-[360px] gap-[25px]">
          {/* dropdown */}
          <div className="flex justify-end">
            <Dropdown
              options={statusSortOptions}
              value={selectedStatusOption ?? ""}
              onSelect={(value) => {
                const option = statusSortOptions.find(
                  (opt) => opt.value === value,
                );
                if (option) setSelectedStatusOption(option.value);
              }}
              placeholder="상태"
            />
          </div>

          {/* list */}
          <div className="flex flex-col gap-2">
            {sortedPlaces.map((place) => (
              <button
                key={place.placeId}
                type="button"
                className="w-full border-0 bg-transparent p-0 text-left"
                onClick={() => navigate(`/admin/trash/${place.placeId}`)}
              >
                <PlacePreviewCard
                  name={place.placeName}
                  station={place.stationName}
                  line={place.representativeLine}
                  imageUrl={place.imageUrl}
                  category={CATEGORY_LABELS[place.categoryCode]}
                  tags={place.tags}
                  description={place.description}
                  status={place.status}
                />
              </button>
            ))}
          </div>
        </div>
      </section>
      <div ref={ref} className="h-1 w-full"></div>
    </main>
  );
}
