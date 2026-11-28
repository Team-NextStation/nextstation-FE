import { useId, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import EyeClose from '@/assets/auth/eye-close.svg?react';
import EyeOpen from '@/assets/auth/eye-open.svg?react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
  timer?: string;
  actionLabel?: string;
  actionTone?: 'default' | 'active';
  actionDisabled?: boolean;
  onActionClick?: () => void;
}

export default function AuthInput({
  label,
  errorMessage,
  timer,
  actionLabel,
  actionTone = 'default',
  actionDisabled = false,
  onActionClick,
  className = '',
  ...props
}: AuthInputProps) {
  const generatedId = useId();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const hasValue = props.value !== undefined && String(props.value).length > 0;
  const hasTrailingContent = Boolean(timer || actionLabel);
  const isPassword = props.type === 'password';
  const inputId = props.id ?? generatedId;

  const error = errorMessage && (
    <span
      className={`flex items-start gap-[5px] font-regular leading-[1.4] text-primary-60 ${
        isPassword ? 'text-body-02' : 'text-body-01'
      }`}
    >
      <span className="mt-[1px] flex size-4 shrink-0 items-center justify-center rounded-full border border-primary-60 text-caption font-regular leading-none">
        !
      </span>
      <span>{errorMessage}</span>
    </span>
  );

  if (isPassword) {
    return (
      <div className="flex w-full flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-subtitle font-semibold leading-[1.4] text-gray-100"
          >
            {label}
          </label>
        )}
        <span className="relative block h-[50px] w-full">
          <input
            {...props}
            id={inputId}
            type={isPasswordVisible ? 'text' : 'password'}
            aria-invalid={Boolean(errorMessage)}
            className={`h-full w-full rounded-lg border px-4 py-3 pr-12 text-subtitle font-regular text-gray-70 placeholder:text-gray-70 focus:border-primary-50 focus:bg-white focus:outline-none ${
              hasValue || errorMessage
                ? 'border-primary-50 bg-white'
                : 'border-transparent bg-gray-20'
            } ${className}`}
          />
          <button
            type="button"
            onClick={() => setIsPasswordVisible((value) => !value)}
            className="absolute right-4 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center"
            aria-label={
              isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'
            }
          >
            {isPasswordVisible ? (
              <EyeOpen className="size-5 text-gray-60" aria-hidden="true" />
            ) : (
              <EyeClose
                className="size-5 [--fill-0:var(--color-gray-60)]"
                aria-hidden="true"
              />
            )}
          </button>
        </span>
        {error}
      </div>
    );
  }

  if (hasTrailingContent) {
    return (
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-start gap-[10px]">
          <div
            className={`flex h-[50px] min-w-0 flex-1 items-center rounded-lg border px-4 py-3 focus-within:border-primary-50 focus-within:bg-white ${
              hasValue || errorMessage
                ? 'border-primary-50 bg-white'
                : 'border-transparent bg-gray-20'
            } ${className}`}
          >
            <input
              {...props}
              aria-invalid={Boolean(errorMessage)}
              className="min-w-0 flex-1 bg-transparent text-subtitle font-regular leading-[1.4] text-gray-70 placeholder:text-gray-70 focus:outline-none"
            />
            {timer && (
              <span className="ml-3 shrink-0 text-body-02 font-regular leading-none text-primary-60">
                {timer}
              </span>
            )}
          </div>
          {actionLabel && (
            <button
              type="button"
              disabled={actionDisabled}
              onClick={onActionClick}
              className={`flex h-[50px] w-[60px] shrink-0 items-center justify-center rounded-lg px-2 text-body-02 font-regular leading-[1.4] tracking-[-0.025em] disabled:cursor-not-allowed ${
                actionTone === 'active'
                  ? 'bg-primary-50 text-gray-10'
                  : 'bg-gray-30 text-gray-70'
              }`}
            >
              {actionLabel}
            </button>
          )}
        </div>
        {error}
      </div>
    );
  }

  return (
    <label className="flex w-full flex-col gap-2">
      {label && (
        <span className="text-subtitle font-semibold leading-[1.4] text-gray-100">
          {label}
        </span>
      )}
      <input
        {...props}
        aria-invalid={Boolean(errorMessage)}
        className={`h-[50px] w-full rounded-lg border px-4 py-3 text-subtitle font-regular text-gray-70 placeholder:text-gray-70 focus:border-primary-50 focus:bg-white focus:outline-none ${
          hasValue || errorMessage
            ? 'border-primary-50 bg-white'
            : 'border-transparent bg-gray-20'
        } ${className}`}
      />
      {error}
    </label>
  );
}
