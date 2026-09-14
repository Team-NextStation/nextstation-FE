import BackIcon from "@/assets/back.svg?react";
import Plus from "@/assets/admin/plus.svg?react";
import Close from "@/assets/admin/close.svg?react";
import PlacePreviewCard from "./components/PlacePreviewCard";
import CategoryTabs from "../course/components/CategoryTabs";
import { LINES, stationsByLine } from "@/data/stationsByLine";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Dropdown from "../admin/components/Dropdown";
import Search from "@/assets/admin/search.svg?react";
import ArrowDown from "@/assets/arrow-down.svg?react";
import { CATEGORY_LABELS, mockPlaces } from "./data/mockPlaces";
import type { StatusChipVariant } from "./components/StatusChip";

type CategoryOption = {
  label: string;
  value: "ALL" | "CULTURE" | "CAFE" | "FOOD" | "WALK";
};

const categorySortOptions: CategoryOption[] = [
  { label: "전체", value: "ALL" },
  { label: "문화공간", value: "CULTURE" },
  { label: "카페", value: "CAFE" },
  { label: "식당", value: "FOOD" },
  { label: "산책포인트", value: "WALK" },
];

type StatusOption = {
  label: string;
  value: "ALL" | StatusChipVariant;
};

const statusSortOptions: StatusOption[] = [
  { label: "전체", value: "ALL" },
  { label: "등록", value: "approved" },
  { label: "대기", value: "pending" },
];

export default function PlaceListPage() {
  const navigate = useNavigate();
  // const placeId = 1; // placeId 하드코딩
  const places = mockPlaces.filter(
    (place) => place.status === "approved" || place.status === "pending",
  );
  const [selectedLine, setSelectedLine] = useState("전체");
  const [station, setStation] = useState<string | null>(null);
  const [isStationMenuOpen, setIsStationMenuOpen] = useState(false);
  const [selectedcategoryOption, setSelectedCategoryOption] =
    useState<CategoryOption>(categorySortOptions[0]);
  const [selectedStatusOption, setSelectedStatusOption] =
    useState<StatusOption>(statusSortOptions[0]);

  const sortedPlaces = places.filter(
    (place) =>
      (selectedLine === "전체" || place.line.name === selectedLine) &&
      (!station || place.station === station) &&
      (selectedcategoryOption.value === "ALL" ||
        place.category === selectedcategoryOption.value) &&
      (selectedStatusOption.value === "ALL" ||
        place.status === selectedStatusOption.value),
  );

  return (
    <main className="flex flex-col h-dvh bg-gray-10 pt-[calc(var(--safe-top)+12px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* header */}
      <section className="flex flex-col gap-4 pb-2.5">
        <header className="flex w-full h-6 items-center px-[15px] justify-between">
          <div className="flex items-center justify-start">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              aria-label="뒤로가기"
              className="flex size-6 items-center justify-center outline-none"
            >
              <BackIcon className="size-6" />
            </button>
          </div>

          <div className="flex relative items-center justify-end">
            <button
              type="button"
              aria-label="추가하기"
              onClick={() => navigate("/admin/place/create")}
              className="flex size-6 items-center justify-center outline-none"
            >
              <Plus className="size-6" />
            </button>
          </div>
        </header>

        <div className="flex justify-center">
          <div className="flex justify-between w-[360px]">
            <span className="text-title-01 font-semibold leading-[1.4] tracking-[-0.5px] text-gray-100">
              역별 장소 조회
            </span>
            <button
              className="flex items-center justify-center"
              onClick={() => navigate("/admin/place/search")}
            >
              <Search />
            </button>
          </div>
        </div>
      </section>

      <section className="flex justify-center">
        <div className="flex flex-col w-[360px]">
          <div className="flex py-2">
            <CategoryTabs
              categories={LINES}
              selected={selectedLine}
              onSelect={setSelectedLine}
            />
          </div>
          <div className="flex justify-between py-2">
            <button
              type="button"
              className="inline-flex items-end px-5 py-2 gap-3 rounded-lg border border-white bg-white/50 focus:outline-none"
              onClick={() => setIsStationMenuOpen(true)}
            >
              <span className="text-gray-70 text-body-01 font-semibold leading-[1.4] tracking-[-0.35px]">
                {station ? station.replace(/역$/, "") : "역 선택"}
              </span>
              <ArrowDown
                className={`flex w-5 h-5 items-center justify-center ${isStationMenuOpen ? "rotate-180" : ""}`}
              />
            </button>
            <Dropdown
              options={categorySortOptions}
              value={selectedcategoryOption.value}
              onSelect={(value) => {
                const option = categorySortOptions.find(
                  (opt) => opt.value === value,
                );
                if (option) setSelectedCategoryOption(option);
              }}
            />
            <Dropdown
              options={statusSortOptions}
              value={selectedStatusOption.value}
              onSelect={(value) => {
                const option = statusSortOptions.find(
                  (opt) => opt.value === value,
                );
                if (option) setSelectedStatusOption(option);
              }}
            />
          </div>
        </div>
      </section>

      {/* list */}
      <section className="flex justify-center pt-5">
        <div className="flex flex-col gap-2 w-[360px]">
          {sortedPlaces.map((place) => (
            <button
              key={place.id}
              type="button"
              className="w-full border-0 bg-transparent p-0 text-left"
              onClick={() => navigate(`/admin/place/${place.id}`)}
            >
              <PlacePreviewCard
                name={place.name}
                station={place.station}
                line={place.line}
                imageUrl={place.imageUrl}
                category={CATEGORY_LABELS[place.category]}
                tags={place.tags}
                description={place.description}
                status={place.status}
              />
            </button>
          ))}
        </div>
      </section>

      {isStationMenuOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-gray-100/20 px-[15px] pb-[50px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsStationMenuOpen(false);
            }
          }}
        >
          <section
            className="flex max-h-[calc(100dvh-48px)] w-[360px] max-w-full flex-col items-center justify-start gap-3 rounded-lg bg-white px-6 pb-8 pt-6 shadow-[0_0_28px_rgb(118_118_118/25%)] outline outline-1 outline-offset-[-1px] outline-white"
            role="dialog"
            aria-modal="true"
            aria-labelledby="station-menu-title"
          >
            <div className="flex w-full items-center justify-between pb-3 pt-2">
              <h2
                className="text-subtitle font-semibold leading-[1.4] tracking-[-0.4px] text-gray-70"
                id="station-menu-title"
              >
                역 선택
              </h2>
              <button
                className="size-[23px] border-0 bg-transparent p-0"
                type="button"
                onClick={() => setIsStationMenuOpen(false)}
                aria-label="역 선택 닫기"
              >
                <Close aria-hidden="true" />
              </button>
            </div>
            <div className="flex max-h-[250px] w-full flex-col items-start gap-4 overflow-y-auto [scrollbar-width:none]">
              <button
                type="button"
                aria-pressed={station === null}
                className={`w-full border-0 bg-transparent p-0 text-left text-subtitle font-semibold leading-[1.4] tracking-[-0.4px] ${station === null ? "text-gray-100" : "text-gray-60"}`}
                onClick={() => {
                  setStation(null);
                  setIsStationMenuOpen(false);
                }}
              >
                전체
              </button>
              {(stationsByLine[selectedLine] ?? []).map((stationName) => (
                <button
                  type="button"
                  aria-pressed={station === stationName}
                  className={`w-full border-0 bg-transparent p-0 text-left text-subtitle font-semibold leading-[1.4] tracking-[-0.4px] ${station === stationName ? "text-gray-100" : "text-gray-60"}`}
                  onClick={() => {
                    setStation(stationName);
                    setIsStationMenuOpen(false);
                  }}
                  key={stationName}
                >
                  {stationName.replace(/역$/, "")}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
