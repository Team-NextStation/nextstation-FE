import TagChip from "@/pages/place/components/TagChip";
import StatusChip, { type StatusChipVariant } from "./StatusChip";
import LineBadge from "@/components/LineBadge";
import type { SubwayLine, SubwayLineInfo } from "@/types/subway";
import EmptyImage from "@/assets/admin/empty-image.svg?react";

interface PlacePreviewCardProps {
  name?: string;
  station?: string;
  line?: SubwayLineInfo;
  imageUrl?: string | null;
  category?: string;
  tags?: string[];
  description?: string;
  status?: StatusChipVariant;
}

export default function PlacePreviewCard({
  name,
  station,
  line,
  imageUrl,
  category,
  tags,
  description,
  status,
}: PlacePreviewCardProps) {
  const isImageEmpty = imageUrl === null;

  return (
    <div className="bg-white rounded-lg flex p-3 gap-3">
      {isImageEmpty ? (
        <div className="flex items-center justify-center w-[90px] h-30 shrink-0 rounded-md bg-[#AEAEB2]">
          <EmptyImage />
        </div>
      ) : (
        <div className="flex w-[90px] h-30 shrink-0 rounded-md overflow-hidden">
          <img src={imageUrl} className="w-full h-full object-cover" />
        </div>
      )}

      {/* info */}
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <LineBadge line={line?.id as SubwayLine} />
              <span className="flex items-center text-gray-100 text-body-02 leading-[1.4] tracking-[-0.3px]">
                {station}
              </span>
            </div>
            <StatusChip variant={status} />
          </div>
          <span className="text-gray-100 text-body-01 font-semibold leading-[1.4] tracking-[-0.35px]">
            {name}
          </span>
          <p className="text-gray-100 text-body-02 leading-[1.4] tracking-[-0.3px]">
            {description}
          </p>
        </div>

        {/* tag */}
        <div className="flex gap-1">
          <span className="flex px-2 py-1 items-center justify-center rounded-lg bg-gray-20 text-gray-80 text-caption leading-normal tracking-[-0.25px]">
            {category}
          </span>
          {tags.map((tag) => (
            <TagChip key={tag} content={tag} />
          ))}
        </div>
      </div>
    </div>
  );
}
