import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CTAButton from "@/components/CTAButton";
import Header from "@/components/Header";
import { AuthApiError, login, saveAccessToken, saveRole } from "@/api/auth";
import { getMyProfile } from "@/api/member";
import AuthInput from "./components/AuthInput";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEmailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordFormatValid = password.length >= 8;
  const isLoginDisabled =
    !isEmailFormatValid || !isPasswordFormatValid || isSubmitting;

  const validateEmail = () => {
    const nextError = isEmailFormatValid
      ? ""
      : "이메일 형식이 올바르지 않습니다.";

    setEmailError(nextError);
    return !nextError;
  };

  const validatePassword = () => {
    const nextError = isPasswordFormatValid
      ? ""
      : "비밀번호는 8자 이상 입력해주세요.";

    setPasswordError(nextError);
    return !nextError;
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      setIsSubmitting(true);
      const { accessToken, role } = await login(email, password);
      saveAccessToken(accessToken);
      saveRole(role);
      await getMyProfile();
      navigate("/");
    } catch (error) {
      const message =
        error instanceof AuthApiError
          ? error.message
          : "로그인 요청에 실패했습니다.";
      setPasswordError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex h-dvh flex-col bg-white pt-[calc(var(--safe-top)+12px)] tracking-[-0.025em] text-gray-100">
      <Header showBack title="이메일로 로그인" />

      <section className="mt-10 flex flex-col px-[15px]">
        <div className="flex flex-col gap-[30px]">
          <AuthInput
            label="이메일"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setEmailError("");
            }}
            onBlur={validateEmail}
            autoComplete="email"
            errorMessage={emailError}
          />

          <div className="flex w-full flex-col gap-2">
            <AuthInput
              type="password"
              label="비밀번호"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError("");
              }}
              onBlur={validatePassword}
              autoComplete="current-password"
              errorMessage={passwordError}
            />
            <button
              type="button"
              onClick={() => navigate("/auth/reset-password")}
              className="self-end text-body-02 font-regular leading-[1.4] tracking-[-0.025em] text-gray-80 underline underline-offset-2"
            >
              비밀번호 찾기
            </button>
          </div>
        </div>

        <div className="mt-[80px] flex w-full flex-col items-center gap-2 text-center">
          <p className="text-body-01 font-regular leading-[1.4] tracking-[-0.025em] text-gray-60">
            아직 계정이 없나요?
          </p>
          <button
            type="button"
            onClick={() => navigate("/auth/terms")}
            className="text-title-02 font-semibold leading-[1.4] tracking-[-0.025em] text-primary-60 underline underline-offset-4"
          >
            이메일로 회원가입
          </button>
        </div>
      </section>

      <div className="mt-auto flex justify-center px-[15px] pb-[calc(var(--safe-bottom)+10px)]">
        <CTAButton
          submitOnEnter
          disabled={isLoginDisabled}
          onClick={handleLogin}
        >
          {isSubmitting ? "로그인 중" : "로그인하기"}
        </CTAButton>
      </div>
    </main>
  );
}
