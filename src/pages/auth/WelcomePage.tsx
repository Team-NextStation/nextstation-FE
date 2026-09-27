import { useNavigate } from 'react-router-dom';
import titleImage from '@/assets/splash.svg';
import archesImage from '@/assets/auth/welcome-arches.png';
import trainCarImage from '@/assets/auth/welcome-train-car.png';
import cloudFront from '@/assets/auth/welcome-cloud-front.svg';
import cloudTop from '@/assets/auth/welcome-cloud-top.svg';
import cloudLeft from '@/assets/auth/welcome-cloud-left.svg';
import cloudMiddle from '@/assets/auth/welcome-cloud-middle.svg';
import cloudSmall from '@/assets/auth/welcome-cloud-small.svg';
import cloudRight from '@/assets/auth/welcome-cloud-right.svg';
import appleImage from '@/assets/auth/welcome-apple.svg';
import kakaoImage from '@/assets/auth/welcome-kakao.svg';
import Header from '@/components/Header';
import CTAButton from '@/components/CTAButton';
import { Capacitor } from '@capacitor/core';
import { AppleSignIn } from '@/api/appleSignIn';
import {
  appleLogin,
  createAppleNonce,
  createKakaoOAuthState,
  saveAccessToken,
  saveAppleSignupToken,
  saveRole,
  saveSignupToken,
} from '@/api/auth';
import { getMyProfile } from '@/api/member';

export default function WelcomePage() {
  const navigate = useNavigate();
  const isNativeIOS = Capacitor.getPlatform() === 'ios';

  const handleKakaoLogin = () => {
    const restApiKey = import.meta.env.VITE_KAKAO_REST_API_KEY;
    const redirectUri =
      import.meta.env.VITE_KAKAO_REDIRECT_URI ??
      `${window.location.origin}/auth/kakao/callback`;

    if (!restApiKey) {
      window.alert('카카오 REST API 키가 설정되지 않았습니다.');
      return;
    }

    const params = new URLSearchParams({
      client_id: restApiKey,
      redirect_uri: redirectUri,
      response_type: 'code',
      state: createKakaoOAuthState(),
    });

    window.location.assign(
      `https://kauth.kakao.com/oauth/authorize?${params.toString()}`,
    );
  };

  const handleAppleLogin = async () => {
    if (Capacitor.getPlatform() !== 'ios') {
      window.alert('Apple 로그인은 iOS 앱에서만 사용할 수 있습니다.');
      return;
    }

    const nonce = createAppleNonce();

    try {
      const { identityToken } = await AppleSignIn.signIn({ nonce });
      const result = await appleLogin(identityToken, nonce);

      if (result.resultType === 'LOGIN_SUCCESS' && result.accessToken) {
        saveAccessToken(result.accessToken);
        if (result.role) {
          saveRole(result.role);
        }
        await getMyProfile();
        navigate('/', { replace: true });
        return;
      }

      if (result.resultType === 'PENDING_PROFILE' && result.signupToken) {
        saveSignupToken(result.signupToken);
        navigate('/auth/profile', { replace: true });
        return;
      }

      if (result.resultType === 'NEW_MEMBER' && result.appleSignupToken) {
        saveAppleSignupToken(result.appleSignupToken);
        navigate('/auth/terms?provider=apple', { replace: true });
        return;
      }

      window.alert('Apple 로그인 응답을 확인할 수 없습니다.');
    } catch (error) {
      if (error instanceof Error && error.message.includes('취소')) {
        return;
      }

      window.alert(
        error instanceof Error
          ? error.message
          : 'Apple 로그인 요청에 실패했습니다.',
      );
    }
  };

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-linear-to-b from-primary-10 to-secondary-20 pt-[calc(var(--safe-top)+12px)] gap-[28px] [--welcome-button-size:clamp(54px,7.11dvh,60px)] [--welcome-stack-gap:2.84dvh] [--welcome-track-top:63.27dvh]">
      <Header showBack />

      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <img
          src={cloudFront}
          alt=""
          className="absolute left-[-1.28%] top-[calc(var(--welcome-track-top)-50.36dvh)] aspect-[209/71] w-[min(53.59%,24.76dvh)] max-w-none"
        />

        <img
          src={titleImage}
          alt="환승여행"
          className="absolute left-1/2 top-[calc(var(--welcome-track-top)-37.44dvh)] z-10 aspect-[234/72] w-[min(44.1%,20.38dvh)] max-w-none -translate-x-1/2"
        />

        <img
          src={cloudTop}
          alt=""
          className="absolute left-[66.67%] top-[calc(var(--welcome-track-top)-36.14dvh)] z-0 aspect-[158/54] w-[min(40.51%,18.72dvh)] max-w-none"
        />

        <img
          src={cloudLeft}
          alt=""
          className="absolute left-[-26.46%] top-[calc(var(--welcome-track-top)-29.27dvh)] aspect-[210/71] w-[min(53.85%,24.88dvh)] max-w-none"
        />

        <img
          src={cloudMiddle}
          alt=""
          className="absolute left-[-13.57%] top-[calc(var(--welcome-track-top)-24.17dvh)] aspect-[246/124] w-[min(63.08%,29.15dvh)] max-w-none"
        />

        <img
          src={cloudSmall}
          alt=""
          className="absolute left-[32.87%] top-[calc(var(--welcome-track-top)-15.4dvh)] aspect-[116/55] w-[min(29.66%,13.74dvh)] max-w-none"
        />

        <img
          src={cloudRight}
          alt=""
          className="absolute left-[78.21%] top-[calc(var(--welcome-track-top)-16.35dvh)] aspect-[246/124] w-[min(63.08%,29.15dvh)] max-w-none"
        />

        <div className="absolute left-0 top-[var(--welcome-track-top)] aspect-[390/310] w-full">
          <img
            src={archesImage}
            alt=""
            className="absolute inset-0 size-full max-w-none"
          />

          <img
            src={trainCarImage}
            alt=""
            className="absolute bottom-[calc(100%+0.36dvh)] left-0 aspect-[295/75] w-[min(75.64%,34.95dvh)] max-w-none"
          />
        </div>
      </div>

      <section className="relative z-10 flex min-h-0 flex-1 flex-col items-center px-[15px] pb-[calc(var(--safe-bottom)+10px)]">
        <h1 className="sr-only">환승여행</h1>

        <p className="mt-[calc(var(--welcome-track-top)-28.67dvh-90px)] w-[min(184px,max(164px,42.05%))] text-center text-title-02 font-semibold leading-[1.35] tracking-[-0.025em] text-gray-80">
          매일 지나치던 역이,
          <br />
          오늘의 여행지가 됩니다.
        </p>

        <section className="mt-auto flex w-full flex-col items-center gap-[var(--welcome-stack-gap)]">
          <div className="flex w-full gap-5 items-center justify-center">
            {isNativeIOS && (
              <button
                type="button"
                onClick={handleAppleLogin}
                className="size-[var(--welcome-button-size)] rounded-full focus:outline-none focus:ring-2 focus:ring-primary-60"
                aria-label="애플로 로그인"
              >
                <img src={appleImage} alt="" className="size-full" />
              </button>
            )}
            <button
              type="button"
              onClick={handleKakaoLogin}
              className="size-[var(--welcome-button-size)] rounded-full focus:outline-none focus:ring-2 focus:ring-primary-60"
              aria-label="카카오로 로그인"
            >
              <img src={kakaoImage} alt="" className="size-full" />
            </button>
          </div>

          <div className="flex w-[234px] items-center gap-[23px]">
            <span className="h-px flex-1 bg-gray-40" />
            <span className="text-subtitle font-regular tracking-[-0.025em] text-gray-50">
              또는
            </span>
            <span className="h-px flex-1 bg-gray-40" />
          </div>

          <div className="w-full">
            <CTAButton
              submitOnEnter
              className="mx-auto shadow-[0_0_4px_var(--color-secondary-50)]"
              onClick={() => navigate('/auth/login')}
            >
              이메일로 이어가기
            </CTAButton>
          </div>
        </section>
      </section>
    </main>
  );
}
