import LineBadge from "@/components/LineBadge";
import type { SubwayLine } from "@/types/subway";
import DetailTagChip from "./DetailTagChip";
import { CATEGORY_LABELS, type MockPlace } from "../data/mockPlaces";

export default function PlaceDetailContent({ place }: { place: MockPlace }) {
  return (
    <div className="flex flex-col w-[360px] gap-6">
      {/* text-info */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1">
          <LineBadge line={place.line.id as SubwayLine} />
          <span className="text-body-01 leading-[1.4] tracking-[-0.35px] text-gray-100">
            {place.station}
          </span>
        </div>

        <span className="text-headline font-semibold leading-[1.4] tracking-[-0.6px] text-gray-100">
          {place.name}
        </span>

        <div className="flex flex-col">
          <span className="text-body-01 leading-[1.4] tracking-[-0.35px] text-gray-80">
            {place.address}
          </span>
          <span className="text-body-01 leading-[1.4] tracking-[-0.35px] text-gray-80">
            X {place.coordinate.x} ∙ Y {place.coordinate.y}
          </span>
          <a
            href={place.link}
            target="_blank"
            rel="noreferrer"
            className="text-body-01 leading-[1.4] tracking-[-0.35px] text-gray-80 underline"
          >
            {place.link}
          </a>
        </div>

        {/* tag + description */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <DetailTagChip
              content={CATEGORY_LABELS[place.category]}
              variant="secondary"
            />
            {place.tags.map((tag) => (
              <DetailTagChip
                key={tag}
                content={`#${tag}`}
                variant="secondary"
              />
            ))}
          </div>
          <p className="text-body-01 leading-[1.4] tracking-[-0.35px] text-gray-100">
            {place.description}
          </p>
        </div>
      </div>

      {/* image-info */}
      <div className="flex w-[360px]">
        <div className="grid grid-cols-3 gap-4">
          {place.images.map((image, index) => (
            <div
              key={index}
              className="aspect-square overflow-hidden rounded-lg"
            >
              <img src={image} className="h-full w-full object-cover" alt="" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
