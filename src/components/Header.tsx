import BackIcon from '@/assets/back.svg?react';
import CloseIcon from '@/assets/close.svg?react';
import { useBackNavigation } from '@/hooks/useBackNavigation';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showClose?: boolean;
  backFallbackPath?: string;
  onBackClick?: () => void;
  onSwipeBack?: () => void;
  onCloseClick?: () => void;
}

export default function Header({
  title,
  showBack = false,
  showClose = false,
  backFallbackPath = '/',
  onBackClick,
  onSwipeBack,
  onCloseClick,
}: HeaderProps) {
  const goBack = useBackNavigation(backFallbackPath, {
    onBack: onBackClick,
    onSwipeBack,
    registerSwipe: showBack || Boolean(onSwipeBack),
  });

  return (
    <header className="grid h-[50px] w-full shrink-0 grid-cols-[40px_1fr_40px] items-center px-3">
      <div className="flex items-center justify-start">
        {showBack && (
          <button
            type="button"
            onClick={goBack}
            aria-label="뒤로가기"
            className="flex size-6 items-center justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:ring-offset-2"
          >
            <BackIcon className="size-6" />
          </button>
        )}
      </div>

      <div className="flex min-w-0 items-center justify-center">
        {title && (
          <h3 className="text-center text-title-02 font-semibold leading-none tracking-[-0.025em] text-gray-90">
            {title}
          </h3>
        )}
      </div>

      <div className="flex items-center justify-end">
        {showClose && (
          <button
            type="button"
            onClick={onCloseClick}
            aria-label="닫기"
            className="flex size-6 items-center justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary-50 focus-visible:ring-offset-2"
          >
            <CloseIcon className="size-6" />
          </button>
        )}
      </div>
    </header>
  );
}
