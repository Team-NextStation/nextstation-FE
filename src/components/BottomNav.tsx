import { useState } from "react";
import { useNavigate } from "react-router-dom"
import DrawIcon from '@/assets/bottomNav/draw.svg?react';
import CourseIcon from '@/assets/bottomNav/course.svg?react';
import GoToMainIcon from '@/assets/bottomNav/goToMain.svg?react';
import SaveIcon from '@/assets/bottomNav/save.svg?react';
import SelectedSaveIcon from '@/assets/bottomNav/selectedSave.svg?react';
import ExploreIcon from '@/assets/bottomNav/explore.svg?react';
import SelectedExploreIcon from '@/assets/bottomNav/selectedExplore.svg?react';
import MypageIcon from '@/assets/bottomNav/mypage.svg?react';
import SelectedMypageIcon from '@/assets/bottomNav/selectedMypage.svg?react';
import LeadToLoginModal from "@/components/LeadToLoginModal";
import { useAuth } from "@/contexts/useAuth";

type BottomNavProps = {
  mode: 'main' | 'course'
  activeTab?: 'save' | 'explore' | 'profile'
}
export default function BottomNav({ mode, activeTab = 'save' }: BottomNavProps) {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isChecking, isLoggedIn } = useAuth();
  const glassPillClassName = "relative flex items-center rounded-[42px] border border-white/70 bg-linear-to-b from-white/30 to-white/10 shadow-[0_0_28px_rgba(118,118,118,0.14),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-[22px]";
  const activeTabClassName = "border border-white/70 bg-linear-to-r from-gray-10/95 via-white/52 to-white/14 text-gray-90 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_18px_rgba(255,255,255,0.12)]";
  const inactiveTabClassName = "text-gray-60";

  return (
    <>
      <nav className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--safe-bottom)+0px)] z-50 flex justify-center">
        {mode === 'main' ? (
        <div className={`${glassPillClassName} pointer-events-auto gap-1 p-1`}>
          <div className="pointer-events-none absolute inset-x-3 top-1 h-[16px] rounded-full bg-white/25 blur-md" />
          <button className={`relative flex flex-col items-center gap-1 rounded-[38px] px-10 py-2 text-body-02 font-semibold leading-none whitespace-nowrap tracking-[-0.025em] text-center outline-none ${activeTabClassName}`}>
            <DrawIcon className="size-[30px]"/>
            뽑기
          </button>
          <button
            onClick={() => {
              if (isChecking) return;
              navigate("/explore");
            }}
            className={`relative flex flex-col items-center gap-1 rounded-[38px] px-10 py-2 text-body-02 font-semibold leading-none whitespace-nowrap tracking-[-0.025em] text-center outline-none ${inactiveTabClassName}`}
          >
            <CourseIcon className="size-[30px]"/>
            코스
          </button>
        </div>
        ) : (
        // 코스 Nav
        <div className="pointer-events-auto flex items-center gap-4">

          <button 
            onClick={() => navigate(`/main`)}
            className="relative flex h-[64px] w-[64px] items-center justify-center rounded-[38px] border border-white/70 bg-linear-to-b from-white/30 to-white/10 shadow-[0_0_28px_rgba(118,118,118,0.14),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-[22px]"
          >
            <div className="pointer-events-none absolute inset-x-2 top-1 h-[12px] rounded-full bg-white/25 blur-md" />
            <GoToMainIcon className="size-9"/>
          </button>

          <div className={`${glassPillClassName} gap-2 px-1 py-[5px]`}>
            <div className="pointer-events-none absolute inset-x-3 top-1 h-[16px] rounded-full bg-white/25 blur-md" />
            <button
              onClick={() => {
                if (isChecking) return;

                if (!isLoggedIn) {
                  setIsLoginModalOpen(true);
                  return;
                }

                navigate("/course");
              }}
              className={`relative flex flex-col items-center rounded-[38px] px-6 py-2 gap-1 text-body-02 font-semibold leading-none whitespace-nowrap tracking-[-0.025em] text-center outline-none
                ${activeTab === 'save'
                  ? activeTabClassName
                  : inactiveTabClassName
                }`}
            >
              {activeTab === 'save' ? (
                <SelectedSaveIcon className="size-[30px]"/>
              ): (
                 <SaveIcon className="size-[30px]"/>
              )}
              저장
            </button>

            <button
              onClick={() => navigate(`/explore`)}
              className={`relative flex flex-col items-center rounded-[38px] px-6 py-2 gap-1 text-body-02 font-semibold leading-none whitespace-nowrap tracking-[-0.025em] text-center outline-none
                ${activeTab === 'explore'
                  ? activeTabClassName
                  : inactiveTabClassName
                }`}
            >
              {activeTab === 'explore' ? (
                <SelectedExploreIcon className="size-[30px]"/>
              ) : (
                <ExploreIcon className="size-[30px]"/>
              )}
              둘러보기
            </button>
            <button
              onClick={() => {
                if (isChecking) {
                  return;
                }

                if (!isLoggedIn) {
                  setIsLoginModalOpen(true);
                  return;
                }

                navigate(`/mypage`);
              }}
              className={`relative flex flex-col items-center rounded-[38px] px-6 py-2 gap-1 text-body-02 font-semibold leading-none whitespace-nowrap tracking-[-0.025em] text-center outline-none
                ${activeTab === 'profile'
                  ? activeTabClassName
                  : inactiveTabClassName
                }`}
            >
              {activeTab === 'profile' ? (
                <SelectedMypageIcon className="size-[30px]"/>
              ) : (
                <MypageIcon className="size-[30px]"/>
              )}
              프로필
            </button>
          </div>
        </div>
        )}
      </nav>

      {isLoginModalOpen && (
        <LeadToLoginModal
          message={"코스를 이용하려면\n로그인이 필요해요!"}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
    </>
  )
}
