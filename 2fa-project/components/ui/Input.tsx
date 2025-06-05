import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "filled" | "outlined" | "floating" | "minimal";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      variant = "default",
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(
      !!props.value || !!props.defaultValue
    );

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    // Default classes for all inputs
    const baseInputClasses =
      "w-full text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed";

    // Variant-specific classes
    const variantClasses = {
      default:
        "rounded-md border border-[var(--border-light)] dark:border-[var(--border-dark)] bg-white dark:bg-[var(--neutral-800)] px-3 py-2.5 shadow-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] focus:ring-opacity-20 focus:outline-none placeholder:text-[var(--neutral-400)]",
      filled:
        "rounded-md border-0 bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] px-3 py-2.5 focus:bg-white dark:focus:bg-[var(--neutral-700)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none placeholder:text-[var(--neutral-400)]",
      outlined:
        "rounded-md bg-transparent border border-[var(--border-light)] dark:border-[var(--border-dark)] px-3 py-2.5 focus:border-[var(--primary)] focus:outline-none placeholder:text-[var(--neutral-400)]",
      floating:
        "rounded-md border border-[var(--border-light)] dark:border-[var(--border-dark)] bg-white dark:bg-[var(--neutral-800)] px-3 pt-5 pb-2 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] focus:ring-opacity-20 focus:outline-none",
      minimal:
        "border-0 border-b border-[var(--border-light)] dark:border-[var(--border-dark)] bg-transparent rounded-none px-1 py-2.5 focus:border-[var(--primary)] focus:outline-none placeholder:text-[var(--neutral-400)]",
    };

    // Adjust for icons
    const iconClasses = {
      leftIcon: "pl-10",
      rightIcon: "pr-10",
    };

    // Combine all classes
    const inputClasses = cn(
      baseInputClasses,
      variantClasses[variant],
      leftIcon && iconClasses.leftIcon,
      rightIcon && iconClasses.rightIcon,
      error &&
        "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error-light)] dark:border-[var(--error)]",
      className
    );

    return (
      <div className="space-y-1.5">
        {label && variant !== "floating" && (
          <label
            className={cn(
              "block text-sm font-medium mb-1",
              error ? "text-[var(--error)]" : "text-[var(--foreground)]"
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neutral-400)]">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            className={inputClasses}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {variant === "floating" && label && (
            <label
              className={cn(
                "absolute left-3 pointer-events-none transition-all duration-200",
                isFocused || hasValue
                  ? "top-1.5 text-xs text-[var(--primary)]"
                  : "top-1/2 -translate-y-1/2 text-[var(--neutral-500)]",
                error && "text-[var(--error)]"
              )}
            >
              {label}
            </label>
          )}

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--neutral-400)]">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-[var(--error)] mt-1.5 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5 mr-1.5 flex-shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {!error && helper && (
          <p className="text-xs text-[var(--neutral-500)] mt-1">{helper}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
