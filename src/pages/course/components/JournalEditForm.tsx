import { useState } from "react";
import JournalEditFormChip from "./JournalEditFormChip";
import {
  TRAVEL_STYLE_LABELS,
  type RecommendationTravelStyle,
} from "@/api/recommendation";
import CalendarIcon from "@/assets/calendar.svg?react";
import LogDatePickerModal from "./date-picker/LogDatePickerModal";
import JournalEditPhotoUploader from "./JournalEditPhotoUploader";
import JournalEditPlaceItem from "./JournalEditPlaceItem";

export interface JournalEditPlaceValue {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
}

export interface EditPhoto {
  photoId?: number; // 있으면 기존 사진, 없으면 새로 업로드한 사진
  imageUrl: string;
}

export default function JournalEditForm({
  title,
  onTitleChange,
  timeOptions,
  selectedTime,
  onTimeChange,
  tags,
  defaultDate,
  selectedDate,
  onDateChange,
  publicOptions,
  selectedPublic,
  onPublicChange,
  photos,
  onPhotosChange,
  review,
  onReviewChange,
  places,
  onPlaceChange,
}: {
  title: string;
  onTitleChange: (value: string) => void;
  timeOptions: string[];
  selectedTime: string | null;
  onTimeChange: (value: string) => void;
  tags: string[];
  defaultDate: string;
  selectedDate: string | null;
  onDateChange: (value: string) => void;
  publicOptions: string[];
  selectedPublic: string | null;
  onPublicChange: (value: string) => void;
  photos: EditPhoto[];
  onPhotosChange: (photos: EditPhoto[]) => void;
  review: string;
  onReviewChange: (value: string) => void;
  places: JournalEditPlaceValue[];
  onPlaceChange: (
    placeId: number,
    updates: Partial<Pick<JournalEditPlaceValue, "description" | "imageUrl">>,
  ) => void;
}) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col">
        {/* title */}
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-subtitle font-semibold leading-[1.4] tracking-[-0.5px] text-gray-100 caret-primary-50 outline-none text-center px-[15px] py-2"
        />

        {/* time */}
        <div className="flex items-center gap-2 px-[15px] py-2">
          <span className="w-12 text-body-02 leading-[1.4] tracking-[-0.3px] text-gray-80 text-start">
            코스 시간
          </span>
          <div className="flex gap-2">
            {timeOptions.map((option) => (
              <JournalEditFormChip
                key={option}
                label={option}
                selected={selectedTime === option}
                onClick={() => onTimeChange(option)}
              />
            ))}
          </div>
        </div>

        {/* tags */}
        <div className="flex items-center gap-2 px-[15px] py-2">
          <span className="w-12 text-body-02 leading-[1.4] tracking-[-0.3px] text-gray-80 text-start">
            태그
          </span>
          <div className="flex gap-2">
            {tags.map((tag) => (
              <div
                key={tag}
                className="flex px-3 py-2 items-center justify-center bg-gray-30 rounded-lg"
              >
                <span className="text-body-02 leading-[1.4] tracking-[-0.3px] text-gray-70">
                  #{TRAVEL_STYLE_LABELS[tag as RecommendationTravelStyle] ?? tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* date */}
        <div className="flex flex-col justify-center gap-2 px-[15px] py-2">
          <div className="flex gap-2 items-center">
            <span className="w-12 text-body-02 leading-[1.4] tracking-[-0.3px] text-gray-80 shrink-0 text-start">
              방문 날짜
            </span>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen((prev) => !prev)}
              className="flex w-full rounded-lg items-center justify-between px-[10px] py-2 outline-none border border-primary-50"
            >
              <span className="text-body-01 leading-[1.4] tracking-[-0.35px] text-gray-70">
                {selectedDate}
              </span>
              <CalendarIcon className="size-6" />
            </button>
          </div>

          {isDatePickerOpen && (
            <LogDatePickerModal
              defaultDate={defaultDate}
              selectedDate={selectedDate}
              onClose={() => setIsDatePickerOpen(false)}
              onConfirm={(date) => {
                onDateChange(date);
                setIsDatePickerOpen(false);
              }}
            />
          )}
        </div>

        {/* public */}
        <div className="flex items-center gap-2 px-[15px] py-2">
          <span className="w-12 text-body-02 leading-[1.4] tracking-[-0.3px] text-gray-80 text-start">
            공개 범위
          </span>
          <div className="flex gap-2">
            {publicOptions.map((option) => (
              <JournalEditFormChip
                key={option}
                label={option}
                selected={selectedPublic === option}
                onClick={() => onPublicChange(option)}
              />
            ))}
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-4 px-[15px]">
        <JournalEditPhotoUploader photos={photos} onChange={onPhotosChange} />
      </section>

      <section className="flex items-start px-[15px]">
        <textarea
          value={review}
          onChange={(e) => onReviewChange(e.target.value)}
          placeholder="여행 후기를 남겨보세요."
          className="w-full resize-none rounded-md border border-gray-40 p-3 text-subtitle leading-[1.4] tracking-[-0.025em] text-gray-100 caret-primary-50 outline-none placeholder:text-gray-50"
        />
      </section>

      <section className="flex flex-col w-full gap-4 px-[15px] pb-5 items-start">
        <h2 className="text-title-02 font-semibold leading-[1.4] tracking-[-0.025em]">
          다녀온 곳
        </h2>
        <div className="flex flex-col w-full gap-4">
          {places.map((place) => (
            <JournalEditPlaceItem
              key={place.id}
              id={place.id}
              name={place.name}
              description={place.description}
              imageUrl={place.imageUrl}
              onChangeDescription={(value) =>
                onPlaceChange(place.id, { description: value })
              }
              onChangeImage={(value) =>
                onPlaceChange(place.id, { imageUrl: value })
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
