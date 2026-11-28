import { useEffect, useState } from "react";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import CTAButton from "@/components/CTAButton";
import Header from "@/components/Header";
import ProfileImageUploader from "./components/ProfileImageUploader";
import {
  getMyProfile,
  MemberApiError,
  updateMyProfile,
} from "@/api/member";
import { deleteImage } from "@/api/image";
import AuthInput from "../auth/components/AuthInput";

const validateNickname = (value: string) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "닉네임은 2자 이상 입력해주세요";
  }

  if (trimmedValue.length < 2) {
    return "닉네임은 2자 이상 입력해주세요";
  }

  if (trimmedValue.length > 10) {
    return "닉네임은 최대 10자까지 입력할 수 있어요";
  }

  if (!/^[가-힣A-Za-z0-9]+$/.test(trimmedValue)) {
    return "한글, 영문, 숫자만 사용할 수 있어요.";
  }

  if (/admin|관리자|운영자/i.test(trimmedValue)) {
    return "사용할 수 없는 단어가 포함되어 있어요.";
  }

  return "";
};

export default function ProfileEditPage() {
  const goBack = useBackNavigation("/mypage", { registerSwipe: false });
  const [memberId, setMemberId] = useState<number | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [originalNickname, setOriginalNickname] = useState("");
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getMyProfile();
        setMemberId(profile.memberId);
        setNickname(profile.nickname);
        setImage(profile.profileImageUrl);
        setOriginalNickname(profile.nickname);
        setOriginalImage(profile.profileImageUrl);
      } catch (e) {
        console.error(e);
        setProfileError("내 정보를 불러오지 못했습니다.");
      }
    };
    fetchProfile();
  }, []);

  const isNextDisabled =
    !nickname.trim() || Boolean(validateNickname(nickname));

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    setNicknameError(validateNickname(value));
    setProfileError(null);
  };

  const handleComplete = async () => {
    if (memberId === null) return;

    const updates: { nickname?: string; profileImageUrl?: string } = {};

    if (nickname.trim() !== originalNickname) {
      updates.nickname = nickname.trim();
    }

    if (image !== originalImage) {
      updates.profileImageUrl = image ?? "";
    }

    if (Object.keys(updates).length === 0) {
      goBack();
      return;
    }

    try {
      await updateMyProfile(updates);

      if (originalImage && originalImage !== image) {
        try {
          await deleteImage(originalImage);
        } catch (e) {
          console.error(e);
        }
      }

      goBack();
    } catch (e) {
      console.error(e);
      if (e instanceof MemberApiError && e.status === 409) {
        setNicknameError("이미 사용 중인 닉네임입니다.");
        setProfileError(null);
        return;
      }

      setProfileError("프로필 수정에 실패했습니다.");
    }
  };

  return (
    <main className="relative flex flex-col h-dvh overflow-hidden bg-white pt-[calc(var(--safe-top)+12px)]">
      <Header showBack backFallbackPath="/mypage" />

      <section className="flex justify-center pb-12">
        <div className="flex w-[360px]">
          <span className="text-title-01 text-gray-100 font-semibold leading-[1.4] tracking-[-0.5px]">
            프로필 수정
          </span>
        </div>
      </section>

      {/* profile image */}
      <section className="flex justify-center pb-12">
        <div className="flex flex-col w-[360px] gap-4">
          <span className="text-subtitle text-gray-100 font-semibold leading-[1.4] tracking-[-0.4px]">
            프로필 사진 (선택)
          </span>
          <ProfileImageUploader image={image} onChange={setImage} />
        </div>
      </section>

      {/* nickname */}
      <section className="flex justify-center">
        <div className="flex flex-col gap-4 w-[360px]">
          <span className="text-subtitle text-gray-100 font-semibold leading-[1.4] tracking-[-0.4px]">
            닉네임
          </span>

          <AuthInput
            value={nickname}
            onChange={handleNicknameChange}
            placeholder="닉네임을 입력해주세요"
            errorMessage={nicknameError}
          />
        </div>
      </section>

      {/* button */}
      <section className="mt-auto flex justify-center px-[15px] pb-[calc(var(--safe-bottom)+10px)]">
        <div className="flex flex-col items-center gap-2 w-[360px]">
          {profileError && (
            <p className="text-body-02 leading-[1.4] tracking-[-0.3px] text-primary-60">
              {profileError}
            </p>
          )}
          <CTAButton disabled={isNextDisabled} onClick={handleComplete}>
            저장
          </CTAButton>
        </div>
      </section>
    </main>
  );
}
