import {
  TRAVEL_STYLE_LABELS,
  type RecommendationTravelStyle,
} from "@/api/recommendation";

export default function TagChip({ content }: { content: string }) {
  return (
    <div className="flex px-2 py-1 bg-gray-20 items-center justify-center rounded-lg whitespace-nowrap">
      <span className="text-gray-80 text-caption leading-none tracking-[-0.25px]">
        #{TRAVEL_STYLE_LABELS[content as RecommendationTravelStyle]}
      </span>
    </div>
  );
}
