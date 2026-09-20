import { type ReactNode, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import termsAgreementImage from '@/assets/auth/terms-agreement.svg';
import {
  AuthApiError,
  type AuthTerm,
  type AuthTermType,
  appleSignup,
  getAppleSignupToken,
  getTerms,
  getKakaoSignupToken,
  kakaoSignup,
  saveAgreedTermsIds,
  saveSignupToken,
} from '@/api/auth';
import CTAButton from '@/components/CTAButton';
import Header from '@/components/Header';
import AuthProgressBar from './components/AuthProgressBar';

interface CheckItemProps {
  checked: boolean;
  children: ReactNode;
  onChange: () => void;
}

function CheckItem({ checked, children, onChange }: CheckItemProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className="flex items-center gap-[10px] text-left"
    >
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-[4px] border ${
          checked ? 'border-primary-50 bg-primary-50' : 'border-primary-50 bg-white'
        }`}
      >
        {checked && (
          <span className="text-body-02 font-semibold leading-none text-white">✓</span>
        )}
      </span>
      {children}
    </button>
  );
}

interface AgreementItemProps {
  checked: boolean;
  label: string;
  required?: boolean;
  termType?: AuthTermType;
  onChange: () => void;
  onOpen: (termType: AuthTermType) => void;
}

function AgreementItem({
  checked,
  label,
  required = false,
  termType,
  onChange,
  onOpen,
}: AgreementItemProps) {
  const agreementType = required ? '필수' : '선택';
  const agreementLabel = label.endsWith('동의') ? label : `${label} 동의`;

  return (
    <div className="flex items-start gap-[10px]">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={agreementLabel}
        onClick={onChange}
        className={`mt-px flex size-5 shrink-0 items-center justify-center rounded-[4px] border ${
          checked ? 'border-primary-50 bg-primary-50' : 'border-primary-50 bg-white'
        }`}
      >
        {checked && (
          <span
            className="text-body-02 font-semibold leading-none text-white"
            aria-hidden="true"
          >
            ✓
          </span>
        )}
      </button>

      <button
        type="button"
        disabled={termType === undefined}
        onClick={() => termType !== undefined && onOpen(termType)}
        className="min-w-0 flex-1 text-left text-body-01 font-regular leading-[1.4] text-gray-80 underline underline-offset-2 outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary-50 disabled:cursor-default"
      >
        {agreementLabel} ({agreementType})
      </button>
    </div>
  );
}

export default function TermsAgreementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [serviceAgreed, setServiceAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [terms, setTerms] = useState<AuthTerm[]>([]);

  useEffect(() => {
    let isCancelled = false;

    const loadTerms = async () => {
      try {
        const response = await getTerms();
        if (!isCancelled) {
          setTerms(response);
        }
      } catch (error) {
        if (!isCancelled) {
          setSubmitError(
            error instanceof AuthApiError
              ? error.message
              : '약관 정보를 불러오지 못했습니다.',
          );
        }
      }
    };

    void loadTerms();
    return () => {
      isCancelled = true;
    };
  }, []);

  const serviceTerm = terms.find(({ type }) => type === 'SERVICE');
  const privacyTerm = terms.find(({ type }) => type === 'PRIVACY');
  const marketingTerm = terms.find(({ type }) => type === 'MARKETING');

  const isAllAgreed = serviceAgreed && privacyAgreed && marketingAgreed;
  const isRequiredAgreed = serviceAgreed && privacyAgreed;
  const showServiceError = hasInteracted && !serviceAgreed;
  const showPrivacyError = hasInteracted && !privacyAgreed;

  const handleAllAgree = () => {
    const nextValue = !isAllAgreed;
    setServiceAgreed(nextValue);
    setPrivacyAgreed(nextValue);
    setMarketingAgreed(nextValue);
    setHasInteracted(true);
  };

  const handleOpenTerm = (termType: AuthTermType) => {
    navigate(`/auth/terms/${termType}`);
  };

  const handleNext = async () => {
    if (!isRequiredAgreed) {
      setHasInteracted(true);
      return;
    }

    if (!serviceTerm || !privacyTerm) {
      setSubmitError('필수 약관 정보를 불러오지 못했습니다.');
      return;
    }

    const agreedTermsIds = [
      serviceTerm.id,
      privacyTerm.id,
      ...(marketingAgreed && marketingTerm ? [marketingTerm.id] : []),
    ];
    saveAgreedTermsIds(agreedTermsIds, true);

    if (searchParams.get('provider') === 'kakao') {
      const kakaoSignupToken = getKakaoSignupToken();

      if (!kakaoSignupToken) {
        setSubmitError('카카오 회원가입 정보가 만료되었습니다. 다시 로그인해주세요.');
        return;
      }

      try {
        setIsSubmitting(true);
        setSubmitError('');
        const { signupToken } = await kakaoSignup(
          kakaoSignupToken,
          agreedTermsIds,
        );
        saveSignupToken(signupToken);
        navigate('/auth/profile');
      } catch (error) {
        setSubmitError(
          error instanceof AuthApiError
            ? error.message
            : '카카오 회원가입 요청에 실패했습니다.',
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (searchParams.get('provider') === 'apple') {
      const appleSignupToken = getAppleSignupToken();

      if (!appleSignupToken) {
        setSubmitError('Apple 회원가입 정보가 만료되었습니다. 다시 로그인해주세요.');
        return;
      }

      try {
        setIsSubmitting(true);
        setSubmitError('');
        const { signupToken } = await appleSignup(
          appleSignupToken,
          agreedTermsIds,
        );
        saveSignupToken(signupToken);
        navigate('/auth/profile');
      } catch (error) {
        setSubmitError(
          error instanceof AuthApiError
            ? error.message
            : 'Apple 회원가입 요청에 실패했습니다.',
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    navigate('/auth/sign-up');
  };

  return (
    <main className="flex h-dvh flex-col bg-white pt-[calc(var(--safe-top)+12px)] tracking-[-0.025em] text-gray-100">
      <Header showBack title="약관동의" />

      <div className="-mt-[3px] px-[15px]">
        <AuthProgressBar step={0} edgeToEdge />
      </div>

      <section className="mt-[27px] px-[15px]">
        <h2 className="text-headline font-semibold leading-[1.4] text-gray-100">
          환승여행을 떠나기 전
          <br />
          약관에 동의해주세요!
        </h2>

        <img
          src={termsAgreementImage}
          alt=""
          className="ml-auto mt-[36px] block h-[225.44px] w-[244px] -scale-x-100"
        />

        <section className="mt-[41px]">
          <div className="py-4">
            <CheckItem checked={isAllAgreed} onChange={handleAllAgree}>
              <span className="text-body-01 font-semibold leading-[1.4] text-gray-100">
                전체 동의
              </span>
            </CheckItem>
          </div>

          <div className="mx-[15px] h-px bg-gray-30" />

          <div className="flex flex-col gap-3 pb-10 pt-4">
            <div>
              <AgreementItem
                checked={serviceAgreed}
                label="서비스 이용약관"
                required
                termType="SERVICE"
                onOpen={handleOpenTerm}
                onChange={() => {
                  setServiceAgreed((value) => !value);
                  setHasInteracted(true);
                }}
              />
              {showServiceError && (
                <p className="mt-1 flex items-center gap-1 pl-[30px] text-body-02 font-regular leading-[1.4] text-primary-60">
                  <span
                    className="flex size-3 items-center justify-center rounded-full border border-primary-60 text-[9px] leading-none"
                    aria-hidden="true"
                  >
                    !
                  </span>
                  필수 이용약관에 동의해주세요.
                </p>
              )}
            </div>

            <div>
              <AgreementItem
                checked={privacyAgreed}
                label="개인정보 취급 방침"
                required
                termType="PRIVACY"
                onOpen={handleOpenTerm}
                onChange={() => {
                  setPrivacyAgreed((value) => !value);
                  setHasInteracted(true);
                }}
              />
              {showPrivacyError && (
                <p className="mt-1 flex items-center gap-1 pl-[30px] text-body-02 font-regular leading-[1.4] text-primary-60">
                  <span
                    className="flex size-3 items-center justify-center rounded-full border border-primary-60 text-[9px] leading-none"
                    aria-hidden="true"
                  >
                    !
                  </span>
                  필수 이용약관에 동의해주세요.
                </p>
              )}
            </div>

            <AgreementItem
              checked={marketingAgreed}
              label="마케팅 정보 수신 동의"
              termType="MARKETING"
              onOpen={handleOpenTerm}
              onChange={() => {
                setMarketingAgreed((value) => !value);
                setHasInteracted(true);
              }}
            />
          </div>
        </section>
      </section>

      <section className="mt-auto flex flex-col items-center gap-2 px-[15px] pb-[calc(var(--safe-bottom)+10px)]">
        {submitError && (
          <p className="text-body-02 font-regular text-primary-60">
            {submitError}
          </p>
        )}
        <CTAButton
          submitOnEnter
          disabled={!isRequiredAgreed || isSubmitting}
          className="disabled:!bg-gray-40 disabled:!text-gray-10"
          onClick={handleNext}
        >
          {isSubmitting ? '처리 중' : '다음'}
        </CTAButton>
      </section>
    </main>
  );
}
