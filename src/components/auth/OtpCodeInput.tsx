"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export function OtpCodeInput({
  id,
  name,
  defaultValue = "",
  length = 6,
  required = true,
  disabled = false,
  onComplete,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  length?: number;
  required?: boolean;
  disabled?: boolean;
  onComplete?: (value: string) => void;
}) {
  const initialDigits = useMemo(
    () =>
      Array.from({ length }, (_, index) =>
        (defaultValue[index] ?? "").replace(/\D/g, "").slice(0, 1),
      ),
    [defaultValue, length],
  );
  const [digits, setDigits] = useState<string[]>(initialDigits);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const setDigit = (index: number, nextValue: string) => {
    const cleaned = nextValue.replace(/\D/g, "");
    if (!cleaned) {
      setDigits((current) => {
        const next = [...current];
        next[index] = "";
        return next;
      });
      return;
    }

    setDigits((current) => {
      const next = [...current];
      for (let cursor = index; cursor < length && cursor - index < cleaned.length; cursor += 1) {
        next[cursor] = cleaned[cursor - index];
      }
      return next;
    });

    const nextIndex = Math.min(index + cleaned.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
    inputRefs.current[nextIndex]?.select();
  };

  const handleBackspace = (index: number, currentValue: string) => {
    if (currentValue) {
      setDigits((current) => {
        const next = [...current];
        next[index] = "";
        return next;
      });
      return;
    }
    const previousIndex = Math.max(0, index - 1);
    inputRefs.current[previousIndex]?.focus();
    setDigits((current) => {
      const next = [...current];
      next[previousIndex] = "";
      return next;
    });
  };

  const handlePaste = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      return;
    }
    setDigits((current) => {
      const next = [...current];
      for (let cursor = index; cursor < length && cursor - index < cleaned.length; cursor += 1) {
        next[cursor] = cleaned[cursor - index];
      }
      return next;
    });
    const nextIndex = Math.min(index + cleaned.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const otpValue = digits.join("");
  const submittedRef = useRef(false);

  useEffect(() => {
    if (disabled) {
      return;
    }
    if (otpValue.length === length && !submittedRef.current) {
      submittedRef.current = true;
      onComplete?.(otpValue);
      return;
    }
    if (otpValue.length !== length) {
      submittedRef.current = false;
    }
  }, [disabled, length, onComplete, otpValue]);

  return (
    <div>
      <input id={id} name={name} type="hidden" value={otpValue} required={required} readOnly />
      <div className="mt-1 grid grid-cols-6 gap-2" role="group" aria-label="One-time password input">
        {digits.map((digit, index) => (
          <input
            key={`${id}-${index}`}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            autoFocus={index === 0 && !disabled}
            value={digit}
            maxLength={1}
            disabled={disabled}
            aria-label={`OTP digit ${index + 1}`}
            className="h-12 w-full rounded-lg border border-zinc-300 bg-white text-center text-lg font-semibold text-zinc-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 disabled:cursor-wait disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-teal-400 dark:focus:ring-teal-900/40"
            onChange={(event) => setDigit(index, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Backspace") {
                event.preventDefault();
                handleBackspace(index, digits[index]);
              }
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                inputRefs.current[Math.max(0, index - 1)]?.focus();
              }
              if (event.key === "ArrowRight") {
                event.preventDefault();
                inputRefs.current[Math.min(length - 1, index + 1)]?.focus();
              }
            }}
            onFocus={(event) => event.currentTarget.select()}
            onPaste={(event) => {
              event.preventDefault();
              handlePaste(index, event.clipboardData.getData("text"));
            }}
          />
        ))}
      </div>
    </div>
  );
}
