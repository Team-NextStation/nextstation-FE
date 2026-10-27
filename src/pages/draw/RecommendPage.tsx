import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "@/api/auth";
import {
  getCachedMyProfile,
  getMyProfile,
} from "@/api/member";
import Header from "@/components/Header";
import CTAButton from "../../components/CTAButton";
import BackVector from '@/assets/BackVector.svg?react';
import StampGongneung from '@/assets/stamp/stamp-gongneung.svg?react';
import StampMajang from '@/assets/stamp/stamp-majang.svg?react';
import StampBomun from '@/assets/stamp/stamp-bomun.svg?react';

function RecommendPage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string | null>(() => {
    const cachedProfile = getCachedMyProfile();
    return cachedProfile?.nickname || null;
  });
  const [isProfileResolved, setIsProfileResolved] = useState(() =>
    Boolean(getCachedMyProfile()?.nickname),
  );
  const isLoggedIn = Boolean(getAccessToken());

  useEffect(() => {
    let isMounted = true;

    const fetchMyProfile = async () => {
      if (!isLoggedIn) {
        setDisplayName(null);
        setIsProfileResolved(true);
        return;
      }

      try {
        const profile = await getMyProfile();

        if (!isMounted) return;

        setDisplayName(profile.nickname || "유저");
      } catch {
        if (!isMounted) return;

        setDisplayName("유저");
      } finally {
        if (isMounted) {
          setIsProfileResolved(true);
        }
      }
    };

    void fetchMyProfile();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  return (
    <main className="flex flex-col h-dvh overflow-hidden bg-white items-center pt-[var(--safe-top)]">
      <Header showBack />
      <section className='flex h-full flex-col items-center justify-between pt-[40px] pb-[calc(var(--safe-bottom)+10px)]'>
        <div className='flex flex-col items-center gap-6'>
          <h1 className="text-headline font-semibold text-gray-100 leading-[1.4] tracking-[-0.025em] text-center">
            {isLoggedIn && isProfileResolved ? (
              <>
                {displayName}님에게 어울리는 역을 <br />
                추천해 드려요!
              </>
            ) : (
              <>
                어울리는 역을 <br />
                추천해 드려요!
              </>
            )}
          </h1>
          <div className="relative size-[390px]">
            <BackVector className="absolute inset-0 size-full"/>

            <div className="absolute left-[35px] top-[20px] size-[206px] rotate-[-3.97deg]">
              <StampGongneung className="size-full" />
            </div>

            <div className="absolute right-[25px] top-[150px] size-[148px] rotate-[13.88deg]">
              <StampMajang className="size-full" />
            </div>

            <div className="absolute left-[80px] bottom-[20px] size-[137px] rotate-[-1.36deg]">
              <StampBomun className="size-full" />
            </div>
          </div>
        </div>

        <section className='flex w-full items-center justify-center'>
          <CTAButton onClick={() => navigate('/draw/condition')}>
            1분 만에 여행 준비 완료!
          </CTAButton>
        </section>
      </section>
    </main>
  )
}

export default RecommendPage
