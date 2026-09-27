import Header from "@/components/Header";
import DetailTagChip from "./components/DetailTagChip";
import LineBadge from "@/components/LineBadge";
import EditDropdown from "./components/EditDropdown";
import { useEffect, useState } from "react";
import CTAButton from "@/components/CTAButton";
import { useNavigate, useParams } from "react-router-dom";
import PlacePhotoUploader from "./components/PlacePhotoUploader";
import ConfirmModal from "@/components/ConfirmModal";
import { CATEGORY_LABELS } from "./data/mockPlaces";
import type { placeDetail } from "@/api/admin";
import { getPlaceDetail, patchPlaceInfo } from "@/api/admin";
import BaseLoading from "@/components/BaseLoading";

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
  const [place, setPlace] = useState<placeDetail>();
  const [isLoading, setIsLoading] = useState(true);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [selectedHastagOption1, setSelectedHastagOption1] =
    useState<HastagOption>(hashtagSortOptions[0]);
  const [selectedHastagOption2, setSelectedHastagOption2] =
    useState<HastagOption>(hashtagSortOptions[1]);
  const [description, setDescription] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchPlaceDetail = async () => {
      try {
        const data = await getPlaceDetail(Number(placeId));
        setPlace(data);
        setDescription(data.description);
        setExistingImages(data.images.map((image) => image.imageUrl));
        setSelectedHastagOption1(
          hashtagSortOptions.find((opt) => opt.value === data.tags[0]) ??
            hashtagSortOptions[0],
        );
        setSelectedHastagOption2(
          hashtagSortOptions.find((opt) => opt.value === data.tags[1]) ??
            hashtagSortOptions[1],
        );
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaceDetail();
  }, [placeId]);

  if (isLoading) return <BaseLoading />;

  if (!place) {
    return (
      <main className="flex h-dvh items-center justify-center bg-gray-10">
        <p className="text-body-01 text-gray-70">장소를 찾을 수 없어요.</p>
      </main>
    );
  }

  const handleSave = async (): Promise<{
    placeId: number;
  } | null> => {
    if (!place) return null;

    const updated = await patchPlaceInfo(
      place.placeId,
      [selectedHastagOption1.value, selectedHastagOption2.value],
      description,
      newImages,
    );
    setDescription(updated.description);

    return { placeId: place.placeId };
  };

  // kakaoPlaceUrl 끝의 숫자가 kakaoPlaceId (placeDetail 응답엔 별도 필드로 안 내려옴)
  const kakaoPlaceId = place.kakaoPlaceUrl?.split("/").pop() ?? "";

  const isDirty =
    description !== place.description ||
    selectedHastagOption1.value !== place.tags[0] ||
    selectedHastagOption2.value !== place.tags[1] ||
    newImages.length > 0;

  return (
    <main className="flex flex-col h-dvh gap-5  bg-gray-10 pt-[calc(var(--safe-top)+12px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Header
        showClose
        onCloseClick={() => {
          if (isDirty) {
            setIsConfirmModalOpen(true);
            return;
          }
          navigate(`/admin/place/${placeId}`);
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
            {place.representativeLine && (
              <LineBadge line={place.representativeLine.id} />
            )}
            <span className="text-body-01 leading-[1.4] tracking-[-0.35px] text-gray-100">
              {place.stationName}
            </span>
          </div>
          <span className="text-headline font-semibold leading-[1.4] tracking-[-0.6px] text-gray-100">
            {place.placeName}
          </span>
          <DetailTagChip
            content={CATEGORY_LABELS[place.categoryCode]}
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
              placeholder={description}
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
              <PlacePhotoUploader
                photos={newImages}
                onChange={setNewImages}
                kakaoPlaceId={kakaoPlaceId}
              />
              {existingImages.map((image) => (
                <div
                  className="flex w-[108px] h-[108px] rounded-lg overflow-hidden"
                  key={image}
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
        <CTAButton
          onClick={async () => {
            try {
              const result = await handleSave();
              if (result) {
                navigate(`/admin/place/${result.placeId}`, { replace: true });
              }
            } catch (e) {
              console.error(e);
            }
          }}
        >
          수정 완료
        </CTAButton>
      </section>
    </main>
  );
}
