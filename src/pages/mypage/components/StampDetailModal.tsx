import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import Close from "@/assets/close.svg?react";
import StationTitle from "@/components/StationTitle";
import Download from "@/assets/download.svg?react";
import CTAButton from "@/components/CTAButton";
import { STATION_STAMP_MAP } from "@/data/stampMaps";
import type { StampDetail } from "@/api/stamp";
import type { SubwayLine } from "@/types/subway";
import { useRef } from "react";
import { toBlob, toPng } from "html-to-image";
import Star1 from "@/assets/Star1.svg?react";
import Star2 from "@/assets/Star2.svg?react";
import Star3 from "@/assets/Star3.svg?react";
import { formatAcquiredAtToDisplayDate } from "@/utils/logDate";
import { useNavigate } from "react-router-dom";

export default function StampDetailModal({
  onClose,
  stamp,
  onWriteJournal,
}: {
  onClose: () => void;
  stamp: StampDetail;
  onWriteJournal: () => void;
}) {
  const navigate = useNavigate();
  const StampIcon = STATION_STAMP_MAP[stamp.stationName] ?? null;
  const targetRef = useRef<HTMLDivElement>(null);

  const handleGoToJournal = () => {
    if (stamp.journalId) {
      navigate(`/course/${stamp.journalId}`);
      return;
    }

    onWriteJournal();
  };

  const handleSaveImage = async () => {
    if (!targetRef.current) return;

    try {
      // Android 앱인 경우 - 캐시에 파일로 저장한 뒤 공유 시트로 넘김
      if (Capacitor.getPlatform() === "android") {
        const dataUrl = await toPng(targetRef.current);
        const base64 = dataUrl.split(",")[1];
        const { uri } = await Filesystem.writeFile({
          path: `stamp_${Date.now()}.png`,
          data: base64,
          directory: Directory.Cache,
        });
        await Share.share({
          title: `${stamp.stationName} 스탬프`,
          files: [uri],
        });

        return;
      }

      // iOS 또는 웹인 경우 - 기존 코드 그대로
      const blob = await toBlob(targetRef.current);

      if (blob) {
        const file = new File([blob], `${stamp.stationName}_스탬프.png`, {
          type: "image/png",
        });

        if (
          typeof navigator.share === "function" &&
          (!navigator.canShare || navigator.canShare({ files: [file] }))
        ) {
          await navigator.share({
            files: [file],
            title: `${stamp.stationName} 스탬프`,
          });
          return;
        }
      }

      const dataUrl = await toPng(targetRef.current);
      const link = document.createElement("a");
      link.download = `${stamp.stationName}_스탬프.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      if (
        e instanceof Error &&
        (e.name === "AbortError" || e.message === "Share canceled")
      ) {
        return;
      }
      console.error(e);
    }
  };

  const cardImage = (
    <div
      ref={targetRef}
      className="relative flex justify-center w-[336px] h-[444px] bg-linear-to-b from-primary-10 to-secondary-20 to-[70%] pt-10 pb-9"
    >
      <Star1 className="flex absolute top-[2px] left-[27px]" />
      <Star2 className="flex absolute top-[240px] left-[32px]" />
      <Star3 className="flex absolute bottom-[17px] right-[19px]" />
      <div className="relative flex flex-col items-center gap-8">
        <StationTitle
          line={stamp.line.id as SubwayLine}
          stationName={stamp.stationName}
          className="w-[286px] shadow-none"
        />
        {StampIcon && <StampIcon className="size-[208px]" />}
        <span className="text-body-01 text-gray-80 leading-[1.4] tracking-[-0.35px]">
          {formatAcquiredAtToDisplayDate(stamp.acquiredAt)} 획득
        </span>
      </div>
    </div>
  );

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-99 flex w-full h-full items-center justify-center bg-black/30"
    >
      <section
        role="dialog"
        className="flex relative flex-col gap-8 items-center pt-7 px-7 pb-9 bg-linear-to-b from-primary-10 to-secondary-20 to-[70%] rounded-[36px]"
      >
        {/* close button + station title */}
        <div className="flex flex-col gap-5">
          <button type="button" onClick={onClose} className="self-end">
            <Close className="size-6" />
          </button>
          <StationTitle
            line={stamp.line.id as SubwayLine}
            stationName={stamp.stationName}
          />
        </div>

        {/* stamp */}
        <div className="flex">
          {StampIcon && <StampIcon className="size-[208px]" />}
        </div>

        {/* date */}
        <div className="flex">
          <span className="text-body-01 text-gray-80 leading-[1.4] tracking-[-0.35px]">
            {formatAcquiredAtToDisplayDate(stamp.acquiredAt)} 획득
          </span>
        </div>

        {/* button */}
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            className="flex gap-[5px] items-center justify-center"
            onClick={handleSaveImage}
          >
            <Download />
            <span className="text-body-01 text-gray-60 leading-[1.4] tracking-[-0.35px]">
              이미지로 저장하기
            </span>
          </button>
          <CTAButton variant="primary" width={316} onClick={handleGoToJournal}>
            {stamp.stationName} 여행일지 보러가기
          </CTAButton>
        </div>
      </section>

      {/* 이미지로 저장 전용 */}
      <div className="fixed -top-[9999px] -left-[9999px]">{cardImage}</div>
    </div>
  );
}
