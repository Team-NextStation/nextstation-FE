import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import CTAButton from '@/components/CTAButton';
import Header from '@/components/Header';
import {
  AuthApiError,
  clearSignupFlow,
  getKakaoProfile,
  getProfileImagePresignedUrl,
  getSignupToken,
  ProfileImageUploadError,
  saveAccessToken,
  setupProfile,
  uploadProfileImage,
} from '@/api/auth';
import AuthInput from './components/AuthInput';
import AuthProgressBar from './components/AuthProgressBar';

type Gender = 'male' | 'female' | 'none';

const genderOptions: Array<{ label: string; value: Gender }> = [
  { label: '남성', value: 'male' },
  { label: '여성', value: 'female' },
  { label: '선택 안함', value: 'none' },
];

const validateNickname = (value: string, shouldRequire = false) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return shouldRequire ? '닉네임은 2자 이상 입력해주세요.' : '';
  }

  if (trimmedValue.length < 2) {
    return '닉네임은 2자 이상 입력해주세요.';
  }

  if (trimmedValue.length > 10) {
    return '닉네임은 최대 10자까지 입력할 수 있어요.';
  }

  if (!/^[가-힣A-Za-z0-9]+$/.test(trimmedValue)) {
    return '한글, 영문, 숫자만 사용할 수 있어요.';
  }

  if (/admin|관리자|운영자/i.test(trimmedValue)) {
    return '사용할 수 없는 단어가 포함되어 있어요.';
  }

  return '';
};

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const [kakaoProfile] = useState(() => getKakaoProfile());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState(
    () => kakaoProfile?.profileImageUrl ?? '',
  );
  const [nickname, setNickname] = useState(() => kakaoProfile?.nickname ?? '');
  const [gender, setGender] = useState<Gender | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState({
    nickname: '',
  });

  useEffect(() => {
    return () => {
      if (profileImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  const handleProfileImageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!/\.(jpe?g|png|webp|gif)$/i.test(file.name)) {
      setSubmitError('JPG, PNG, WEBP, GIF 형식의 이미지만 선택할 수 있어요.');
      event.target.value = '';
      return;
    }

    setSubmitError('');
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const isNextDisabled =
    !nickname.trim() ||
    Boolean(validateNickname(nickname)) ||
    !gender ||
    isSubmitting;

  const handleNext = async () => {
    setSubmitError('');
    const nextErrors = {
      nickname: validateNickname(nickname, true),
    };

    setErrors(nextErrors);

    if (!gender || Object.values(nextErrors).some(Boolean)) {
      return;
    }

    const signupToken = getSignupToken();

    if (!signupToken) {
      navigate('/auth/terms');
      return;
    }

    const genderByApi: Record<Gender, 'MALE' | 'FEMALE' | 'UNSPECIFIED'> = {
      male: 'MALE',
      female: 'FEMALE',
      none: 'UNSPECIFIED',
    };

    try {
      setIsSubmitting(true);
      let profileImageUrl = kakaoProfile?.profileImageUrl;

      if (profileImageFile) {
        const uploadInfo = await getProfileImagePresignedUrl(
          signupToken,
          profileImageFile.name,
        );
        await uploadProfileImage(
          uploadInfo.presignedUrl,
          profileImageFile,
          uploadInfo.contentType,
        );
        profileImageUrl = uploadInfo.imageUrl;
      }

      const { accessToken } = await setupProfile(signupToken, {
        nickname: nickname.trim(),
        ...(profileImageUrl ? { profileImageUrl } : {}),
        gender: genderByApi[gender],
      });
      saveAccessToken(accessToken);
      clearSignupFlow();
      navigate('/auth/finish', { replace: true });
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 401) {
        clearSignupFlow();
        navigate('/auth/terms');
        return;
      }

      if (error instanceof AuthApiError) {
        const nicknameError = error.reasons?.nickname ?? '';
        if (nicknameError) {
          setErrors((value) => ({
            ...value,
            nickname: nicknameError,
          }));
        } else {
          setSubmitError(error.message);
        }
      } else if (error instanceof ProfileImageUploadError) {
        setSubmitError(error.message);
      } else {
        setSubmitError('프로필 설정 요청에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex h-dvh flex-col bg-white pt-[calc(var(--safe-top)+12px)] tracking-[-0.025em] text-gray-100">
      <Header showBack title="프로필 설정" />
      <div className="-mt-[3px] px-[15px] pb-[27px]">
        <AuthProgressBar step={2} />
      </div>

      <section className="flex flex-col gap-[40px] px-[15px] pt-[23px]">
        <section className="flex flex-col gap-[30px]">
          <div className="flex flex-col gap-4">
            <h2 className="text-subtitle font-semibold leading-[1.4] text-gray-100">
              프로필 사진 (선택)
            </h2>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className={`flex size-[100px] items-center justify-center rounded-lg border bg-secondary-10 text-[28px] font-light leading-none text-secondary-50 ${
                profileImagePreview
                  ? 'border-solid border-transparent'
                  : 'border-dashed border-secondary-40'
              }`}
              aria-label="프로필 사진 추가"
            >
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  alt="선택한 프로필"
                  className="size-full rounded-lg object-cover"
                />
              ) : (
                '+'
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
              disabled={isSubmitting}
              onChange={handleProfileImageChange}
              className="sr-only"
              aria-label="프로필 사진 파일 선택"
            />
          </div>

          <AuthInput
            label="닉네임"
            value={nickname}
            onChange={(event) => {
              const nextNickname = event.target.value;
              setNickname(nextNickname);
              setErrors((value) => ({
                ...value,
                nickname: validateNickname(nextNickname),
              }));
            }}
            placeholder="닉네임을 입력해주세요"
            autoComplete="nickname"
            errorMessage={errors.nickname}
          />

          <div className="flex flex-col gap-4">
            <h2 className="text-subtitle font-semibold leading-[1.4] text-gray-100">
              성별
            </h2>
            <div className="grid grid-cols-3 gap-[15px]">
              {genderOptions.map((option) => {
                const isSelected = gender === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setGender(option.value)}
                    className={`flex h-11 items-center justify-center rounded-lg border px-2 text-body-01 font-regular leading-[1.4] ${
                      isSelected
                        ? 'border-secondary-40 bg-secondary-10 text-primary-80'
                        : 'border-gray-40 bg-gray-20 text-gray-70'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

        </section>

      </section>

      <section className="mt-auto flex justify-center px-[15px] pb-[calc(var(--safe-bottom)+10px)]">
        <div className="flex w-full flex-col items-center gap-2">
          {submitError && (
            <p className="text-body-02 font-regular leading-[1.4] text-primary-60">
              {submitError}
            </p>
          )}
          <CTAButton
            submitOnEnter
            disabled={isNextDisabled}
            onClick={handleNext}
          >
            {isSubmitting ? '저장 중' : '다음'}
          </CTAButton>
        </div>
      </section>
    </main>
  );
}
