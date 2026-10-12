import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { buildNativeKakaoCallback } from '@/utils/kakaoNative';
import {
  AuthApiError,
  clearKakaoOAuthState,
  clearSignupFlow,
  getKakaoRedirectUri,
  getKakaoOAuthState,
  kakaoLogin,
  saveAccessToken,
  saveKakaoProfile,
  saveRole,
  saveKakaoSignupToken,
  saveSignupToken,
} from '@/api/auth';
import { getMyProfile } from '@/api/member';

export default function KakaoCallbackPage() {
  const [searchParams] = useSearchParams();
  const nativeCallbackUrl = Capacitor.getPlatform() === 'web'
    ? buildNativeKakaoCallback(searchParams.toString())
    : null;

  return nativeCallbackUrl
    ? <NativeKakaoReturnPage url={nativeCallbackUrl} />
    : <KakaoLoginResultPage />;
}

function NativeKakaoReturnPage({ url }: { url: string }) {
  useEffect(() => {
    window.location.replace(url);
  }, [url]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-[15px] text-center text-gray-100">
      <p>앱으로 돌아가 로그인을 완료해주세요.</p>
      <a href={url} className="text-primary-60 underline">환승여행 앱으로 돌아가기</a>
    </main>
  );
}

function KakaoLoginResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const kakaoError = searchParams.get('error');
  const returnedState = searchParams.get('state');
  const [expectedState] = useState(getKakaoOAuthState);
  const redirectUri = getKakaoRedirectUri();
  const isValidState =
    Boolean(returnedState) && returnedState === expectedState;
  const [errorMessage, setErrorMessage] = useState(() =>
    !code || kakaoError || !isValidState
      ? '카카오 로그인이 취소되었거나 인가 코드를 받지 못했습니다.'
      : '',
  );

  useEffect(() => {
    if (!code || kakaoError || !isValidState) {
      return undefined;
    }

    const controller = new AbortController();

    const processKakaoLogin = async () => {
      // StrictMode의 첫 effect 정리가 끝난 뒤 코드를 한 번만 교환한다.
      await Promise.resolve();
      if (controller.signal.aborted) return;
      clearKakaoOAuthState();
      try {
        const result = await kakaoLogin(code, redirectUri, controller.signal);

        if (controller.signal.aborted) {
          return;
        }

        if (result.kakaoNickname || result.kakaoProfileImageUrl) {
          saveKakaoProfile({
            nickname: result.kakaoNickname ?? '',
            profileImageUrl: result.kakaoProfileImageUrl,
          });
        }

        if (result.resultType === 'LOGIN_SUCCESS' && result.accessToken) {
          saveAccessToken(result.accessToken);
          if (result.role) {
            saveRole(result.role);
          }
          await getMyProfile();
          clearSignupFlow();
          navigate('/', { replace: true });
          return;
        }

        if (result.resultType === 'PENDING_PROFILE' && result.signupToken) {
          saveSignupToken(result.signupToken);
          navigate('/auth/profile', { replace: true });
          return;
        }

        if (result.resultType === 'NEW_MEMBER' && result.kakaoSignupToken) {
          saveKakaoSignupToken(result.kakaoSignupToken);
          navigate('/auth/terms?provider=kakao', { replace: true });
          return;
        }

        setErrorMessage('카카오 로그인 응답을 확인할 수 없습니다.');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessage(
          error instanceof AuthApiError
            ? error.message
            : '카카오 로그인 요청에 실패했습니다.',
        );
      }
    };

    void processKakaoLogin();

    return () => controller.abort();
  }, [code, isValidState, kakaoError, navigate, redirectUri]);

  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-4 bg-white px-[15px] text-center tracking-[-0.025em] text-gray-100">
      {errorMessage ? (
        <>
          <p className="text-body-01 font-regular text-primary-60">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={() => navigate('/auth', { replace: true })}
            className="text-body-01 font-semibold text-primary-60 underline"
          >
            로그인 화면으로 돌아가기
          </button>
        </>
      ) : (
        <p className="text-body-01 font-regular text-gray-70">
          카카오 로그인 정보를 확인하고 있어요.
        </p>
      )}
    </main>
  );
}
