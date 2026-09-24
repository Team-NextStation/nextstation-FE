import CheckIcon from "@/assets/check-gray.svg?react";

interface BlockedUserCardProps {
  name: string;
  imageUrl: string;
  isBlocked: boolean;
  onToggle: () => void;
}

export default function BlockedUserCard({
  name,
  imageUrl,
  isBlocked,
  onToggle,
}: BlockedUserCardProps) {
  return (
    <div className="flex w-[360px] items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img src={imageUrl} className="w-full h-full object-cover" />
        </div>
        <span className="text-title-02 font-semibold leading-1.4 tracking-[-0.45px] text-gray-100">
          {name}
        </span>
      </div>

      {isBlocked ? (
        <button
          onClick={onToggle}
          className="flex gap-2 px-2 py-1 items-center bg-gray-40 rounded-lg text-body-01 font-semibold leading-1.4 trakcing-[-0.35px] text-gray-80 outline-none"
        >
          <CheckIcon />
          차단 중
        </button>
      ) : (
        <button
          onClick={onToggle}
          className="flex px-2 py-1 items-center bg-gray-100 text-gray-10 text-body-01 font-semibold leading-1.4 tracking-[-0.35px] rounded-lg outline-none"
        >
          차단하기
        </button>
      )}
    </div>
  );
}
