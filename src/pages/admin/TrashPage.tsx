import Header from "@/components/Header";
import Dropdown from "./components/Dropdown";
import { useState } from "react";
import { CATEGORY_LABELS, mockPlaces } from "./data/mockPlaces";
import PlacePreviewCard from "./components/PlacePreviewCard";
import { useNavigate } from "react-router-dom";
import type { StatusChipVariant } from "./components/StatusChip";

type StatusOption = {
  label: string;
  value: "ALL" | StatusChipVariant;
};

const statusSortOptions: StatusOption[] = [
  { label: "전체", value: "ALL" },
  { label: "반려", value: "rejected" },
  { label: "삭제", value: "deleted" },
];
export default function TrashPage() {
  const navigate = useNavigate();
  const places = mockPlaces.filter(
    (place) => place.status === "deleted" || place.status === "rejected",
  );
  const [selectedStatusOption, setSelectedStatusOption] =
    useState<StatusOption>(statusSortOptions[0]);

  const sortedPlaces = places.filter(
    (place) =>
      selectedStatusOption.value === "ALL" ||
      selectedStatusOption.value === place.status,
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
              value={selectedStatusOption.value}
              onSelect={(value) => {
                const option = statusSortOptions.find(
                  (opt) => opt.value === value,
                );
                if (option) setSelectedStatusOption(option);
              }}
            />
          </div>

          {/* list */}
          <div className="flex flex-col gap-2">
            {sortedPlaces.map((place) => (
              <button
                key={place.id}
                type="button"
                className="w-full border-0 bg-transparent p-0 text-left"
                onClick={() => navigate(`/admin/trash/${place.id}`)}
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
        </div>
      </section>
    </main>
  );
}
