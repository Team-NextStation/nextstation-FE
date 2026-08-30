import { useLocation, useNavigate } from 'react-router-dom';
import type { RandomDrawResponseData } from '@/api/random';
import type {
  CustomRecommendationRequest,
  CustomRecommendationResponseData,
} from '@/api/recommendation';
import Header from '@/components/Header';
import Button from '@/components/Button';
import StationTitle from '@/components/StationTitle';
import SubwayLineChip from '@/components/SubwayLineChip';

type ResultPageState = (RandomDrawResponseData | CustomRecommendationResponseData) & {
  source?: "random" | "recommend";
  recommendationRequest?: CustomRecommendationRequest;
  recommendationSessionId?: string;
};

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state as ResultPageState | undefined;

  if (!result) {
    navigate(`/draw/loading`);
    return null;
  }

  const {
    station,
    source = "random",
    recommendationRequest,
    recommendationSessionId,
  } = result;
  const primaryLine = station.lines[0];
  const formattedDescription = station.description.replace(/,\s*/g, ",\n");
  const isRecommendResult = source === "recommend";
  const randomCourse = "course" in result ? result.course : undefined;

  return (
    <main className="relative flex flex-col h-dvh overflow-hidden bg-gray-10 gap-8 pt-[calc(var(--safe-top)+12px)]">
      <Header showClose onCloseClick={() => navigate('/')}/>

      {/* title */}
      <section className='flex justify-center'>
        <StationTitle
          line={primaryLine.id}
          stationName={station.stationName}
        />
      </section>

      {/* Description */}
      <section className='flex flex-1 justify-center'>
        <div className='flex flex-col w-[355px] self-stretch rounded-t-[48px] px-3 pt-6 gap-6 bg-white'>
          <div className='flex flex-col gap-4 items-center'>
            
            {/* 호선 칩 */}
            <div className='w-full flex px-20 gap-2 items-center justify-center'>
              {station.lines.map((line) => (
                <SubwayLineChip key={line.code} label={line.name} />
              ))}
            </div>

            <div className='w-[330px] rounded-lg px-4 py-5 gap-[10px] bg-primary-10'>
              <p className='whitespace-pre-line text-body-01 text-gray-100 leading-[1.4] tracking-[-0.025em] text-start'>
                {formattedDescription}
              </p>
            </div>
          </div>

          <div className='w-[330px] flex flex-col gap-2 items-start'>
            <h3 className='text-title-02 font-semibold text-gray-80 leading-none tracking-[-0.025em]'>
              {station.stationName}에선!
            </h3>
            <div className='w-full rounded-lg px-4 py-5 gap-[10px] border-2 border-gray-30'>
              <p className='whitespace-pre-line text-body-01 text-gray-100 leading-[1.4] tracking-[-0.025em] text-start'>
                {station.todos.map((todo, index) => `${index+1}. ${todo}`).join("\n")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 버튼 */}
      <section className='absolute bottom-[calc(var(--safe-bottom)+10px)] z-10 flex w-full items-center justify-between px-6'>
        <Button
          direction="left"
          onClick={() =>
            navigate('/draw/loading', {
              state: {
                source,
                recommendationRequest,
                recommendationSessionId,
              },
            })
          }
        >
          다시 뽑기
        </Button>
        <Button
          direction="right"
          onClick={() =>
            isRecommendResult
              ? navigate(`/course/${station.stationId}/create`, {
                  state: {
                    stationId: station.stationId,
                    stationName: station.stationName,
                    lineId: primaryLine.id,
                    recommendationRequest,
                  },
                })
              : navigate('/course/verify?from=draw', {
                  state: {
                    course: randomCourse,
                    stationId: station.stationId,
                    stationName: station.stationName,
                    lineId: primaryLine.id,
                  },
                })
          }
        >
          {isRecommendResult ? "코스 만들기" : "코스 확인"}
        </Button>
      </section>     
    </main>
  )
}
export default ResultPage
