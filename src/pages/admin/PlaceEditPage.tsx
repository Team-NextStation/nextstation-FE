import Header from "@/components/Header";
import DetailTagChip from "./components/DetailTagChip";
import LineBadge from "@/components/LineBadge";
import EditDropdown from "./components/EditDropdown";
import { useState } from "react";
import CTAButton from "@/components/CTAButton";
import { useNavigate, useParams } from "react-router-dom";
import PlacePhotoUploader from "./components/PlacePhotoUploader";
import ConfirmModal from "@/components/ConfirmModal";
import { CATEGORY_LABELS, mockPlaces } from "./data/mockPlaces";
import type { SubwayLine } from "@/types/subway";

type HastagOption = {
  label: string;
  value:
    | "NATURE"
    | "ALLEY_TRIP"
    | "MARKET"
    | "HOTPLACE"
    | "PHOTO_SPOT"
    | "SHOPPING"
    | "EXPERIENCE"
    | "BUDGET"
    | "INDOOR";
};

const hashtagSortOptions: HastagOption[] = [
  { label: "자연과함께", value: "NATURE" },
  { label: "골목여행", value: "ALLEY_TRIP" },
  { label: "시장구경", value: "MARKET" },
  { label: "핫플레이스", value: "HOTPLACE" },
  { label: "사진찍기좋은", value: "PHOTO_SPOT" },
  { label: "쇼핑", value: "SHOPPING" },
  { label: "체험", value: "EXPERIENCE" },
  { label: "가성비", value: "BUDGET" },
  { label: "실내위주", value: "INDOOR" },
];

export default function PlaceEditPage() {
  const navigate = useNavigate();
  const { placeId } = useParams();
  const place = mockPlaces.find((place) => place.id === placeId);

  const isDirty = true; // TODO : 추후 setIsDirty 추가
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [selectedHastagOption1, setSelectedHastagOption1] =
    useState<HastagOption>(
      hashtagSortOptions.find((opt) => opt.label === place?.tags[0]) ??
        hashtagSortOptions[0],
    );
  const [selectedHastagOption2, setSelectedHastagOption2] =
    useState<HastagOption>(
      hashtagSortOptions.find((opt) => opt.label === place?.tags[1]) ??
        hashtagSortOptions[1],
    );
  const [description, setDescription] = useState(place?.description);
  const [existingImages] = useState<string[]>([
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeNUqNW8AKMUzUTRJGr8xOny5UVwFRuDaCeZ66Mp9Uog&s",
  ]);
  const [newImages, setNewImages] = useState<string[]>([]);

  if (!place) {
    return <main>...장소를 찾을 수 없어요...</main>;
  }

  return (
    <main className="flex flex-col h-dvh gap-5  bg-gray-10 pt-[calc(var(--safe-top)+12px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Header
        showClose
        onCloseClick={() => {
          if (isDirty) {
            setIsConfirmModalOpen(true);
            return;
          }
        }}
      />

      {isConfirmModalOpen && (
        <ConfirmModal
          message={
            "해당 내용은 저장되지 않습니다.\n저장하지 않고 나가시겠습니까?"
          }
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={() => navigate(`/admin/place/${placeId}`)}
        />
      )}

      {/* basic info */}
      <section className="flex justify-center">
        <div className="flex flex-col w-[360px] px-2.5 py-5 gap-2.5 bg-white rounded-lg">
          <div className="flex gap-1 items-center">
            <LineBadge line={place?.line.id as SubwayLine} />
            <span className="text-body-01 leading-[1.4] tracking-[-0.35px] text-gray-100">
              {place.station}
            </span>
          </div>
          <span className="text-headline font-semibold leading-[1.4] tracking-[-0.6px] text-gray-100">
            {place.name}
          </span>
          <DetailTagChip
            content={CATEGORY_LABELS[place.category]}
            variant="secondary"
          />
        </div>
      </section>

      {/* editable info */}
      <div className="flex justify-center">
        <div className="flex flex-col gap-8 w-[360px]">
          <section className="flex flex-col gap-4">
            <span className="text-subtitle font-semibold leading-[1.4] tracking-[-0.4px] text-gray-100">
              해시태그
            </span>
            <div className="flex gap-2">
              <EditDropdown
                variant="primary"
                mode="tag"
                options={hashtagSortOptions}
                value={selectedHastagOption1.value}
                onSelect={(value) => {
                  const option = hashtagSortOptions.find(
                    (opt) => opt.value === value,
                  );
                  if (option) setSelectedHastagOption1(option);
                }}
                disabledValues={[selectedHastagOption2.value]}
              />
              <EditDropdown
                variant="primary"
                mode="tag"
                options={hashtagSortOptions}
                value={selectedHastagOption2.value}
                onSelect={(value) => {
                  const option = hashtagSortOptions.find(
                    (opt) => opt.value === value,
                  );
                  if (option) setSelectedHastagOption2(option);
                }}
                disabledValues={[selectedHastagOption1.value]}
              />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <span className="text-subtitle font-semibold leading-[1.4] tracking-[-0.4px] text-gray-100">
              한 줄 소개
            </span>
            <textarea
              placeholder={place.description}
              value={description}
              className="p-4 rounded-lg bg-white outline-none min-h-[90px] resize-none caret-primary-50"
              onChange={(e) => setDescription(e.target.value)}
            />
          </section>

          <section className="flex flex-col gap-4">
            <span className="text-subtitle font-semibold leading-[1.4] tracking-[-0.4px] text-gray-100">
              장소 사진 추가
            </span>
            <div className="grid grid-cols-3 gap-4">
              <PlacePhotoUploader photos={newImages} onChange={setNewImages} />
              {existingImages.map((image, index) => (
                <div
                  className="flex w-[108px] h-[108px] rounded-lg overflow-hidden"
                  key={index}
                >
                  <img
                    src={image}
                    className="flex w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <section className="fixed inset-x-0 bottom-[calc(var(--safe-bottom)+10px)] z-10 flex items-center justify-center">
        <CTAButton onClick={() => navigate(`/admin/place/${placeId}`)}>
          수정 완료
        </CTAButton>
      </section>
    </main>
  );
}
