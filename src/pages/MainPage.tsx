import Badge from '@/assets/badge.svg?react';
import ArrowLeft from '@/assets/title-L.svg?react';
import ArrowRight from '@/assets/title-R.svg?react';
import DoorLeft from '@/assets/door_L.svg?react';
import DoorRight from '@/assets/door_R.svg?react';
import ProfileIcon from '@/components/ProfileIcon';
import { useAuth } from '@/contexts/useAuth';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import BottomNav from '@/components/BottomNav';

function MainPage() {
  const navigate = useNavigate();
  const { isChecking, isLoggedIn } = useAuth();

  return (
    <main className="relative flex flex-col h-dvh overflow-hidden bg-gray-10 gap-8 pt-[calc(var(--safe-top)+12px)] [@media(max-height:800px)]:grid [@media(max-height:800px)]:grid-rows-[45px_80px_minmax(0,1fr)_auto] [@media(max-height:800px)]:gap-3 [@media(max-height:800px)]:min-h-[calc(480px+var(--safe-top)+var(--safe-bottom))] [@media(max-height:800px)]:[&>nav]:relative [@media(max-height:800px)]:[&>nav]:inset-auto [@media(max-height:800px)]:[&>nav]:pb-[var(--safe-bottom)]">
      {/* 프로필 아이콘 */}
      <div className='relative flex justify-end px-5'>
        <ProfileIcon isLoggedIn={isLoggedIn} disabled={isChecking} />
      </div>

      {/* title */}
      <section className='relative flex justify-center'>
        <div className="h-[95px] w-[calc(100vw-40px)] max-w-[350px] rounded-full bg-linear-to-r from-secondary-30 to-primary-10 p-[10px] shadow-[0_0_20px_var(--color-primary-30)] [@media(max-height:800px)]:w-[min(280px,calc(100%-40px))] [@media(max-height:800px)]:h-20 [@media(max-height:800px)]:p-2">
          <div className="h-full w-full rounded-full bg-white flex items-center justify-center gap-[26px] [@media(max-height:800px)]:gap-4">
            <Badge className="size-[52px] [@media(max-height:800px)]:size-11 [@media(max-height:800px)]:shrink-0"/>
            <ArrowLeft className='h-[12.35px] w-[31px]'/>
            <div className='flex w-[106px] flex-col items-center gap-[5px]'>
              <p className='whitespace-nowrap text-body-02 text-gray-80 leading-none tracking-[-0.025em]'>Next Station</p>
              <h2 className='whitespace-nowrap text-title-01 font-semibold text-gray-90 leading-none tracking-[-0.025em] [@media(max-height:800px)]:text-[18px]'>오늘의 환승역</h2>
            </div>
            <ArrowRight className='h-[12.35px] w-[31px]'/>
          </div>
        </div>
      </section>

    {/* Door */}
    <section className="relative flex justify-center [@media(max-height:800px)]:min-h-0 [@media(max-height:800px)]:before:pointer-events-none [@media(max-height:800px)]:before:absolute [@media(max-height:800px)]:before:inset-x-0 [@media(max-height:800px)]:before:top-0 [@media(max-height:800px)]:before:h-[10px] [@media(max-height:800px)]:before:bg-[#F0F0F0] [@media(max-height:800px)]:after:pointer-events-none [@media(max-height:800px)]:after:absolute [@media(max-height:800px)]:after:left-1/2 [@media(max-height:800px)]:after:top-0 [@media(max-height:800px)]:after:bottom-[calc(-86px-var(--safe-bottom))] [@media(max-height:800px)]:after:w-[10px] [@media(max-height:800px)]:after:-translate-x-1/2 [@media(max-height:800px)]:after:bg-[#F0F0F0]">
      <div className='flex w-full'>
        {/* 왼쪽 문 */}
        <div className="relative h-full w-1/2">
          <DoorLeft preserveAspectRatio="xMaxYMin meet" className="h-full w-full [@media(max-height:800px)]:h-[min(600px,calc(100%/0.72))]" />
          <Button
            direction="left"
            onClick={() =>
              navigate('/draw/loading', {
                state: { recommendationSessionId: crypto.randomUUID() },
              })
            }
            className="absolute left-5 top-[56%] z-10 [@media(max-height:800px)]:top-[min(78%,calc(100%-76px))] [@media(max-height:800px)]:px-4 [@media(max-height:800px)]:py-3"
          >
            랜덤뽑기
          </Button>
        </div>
        {/* 오른쪽 문 */}
        <div className="relative h-full w-1/2">
          <DoorRight preserveAspectRatio="xMinYMin meet" className="h-full w-full [@media(max-height:800px)]:h-[min(600px,calc(100%/0.72))]" />
          <Button
            direction="right"
            onClick={() => navigate('/draw/recommend')}
            className="absolute right-5 top-[56%] z-10 [@media(max-height:800px)]:top-[min(78%,calc(100%-76px))] [@media(max-height:800px)]:px-4 [@media(max-height:800px)]:py-3"
          >
            맞춤추천
          </Button>
        </div>
      </div>      
    </section>

    <BottomNav mode="main"/>
    </main>
  )
}

export default MainPage
