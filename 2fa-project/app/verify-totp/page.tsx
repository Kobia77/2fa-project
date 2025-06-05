"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import * as api from "@/lib/api";

export default function VerifyTOTPPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [accountLockTimeLeft, setAccountLockTimeLeft] = useState<number | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on input when component loads
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [useBackupCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsAccountLocked(false);
    setAccountLockTimeLeft(null);

    if (useBackupCode) {
      if (!backupCode) {
        setError("Backup code is required");
        return;
      }

      setIsLoading(true);

      try {
        const response = await api.verifyBackupCode(backupCode);
        // If 2FA was disabled due to backup code use, redirect with notification flag
        if (response.totpDisabled) {
          router.push("/dashboard?notification=2fa-reset");
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        // Check for account lockout error
        if (err instanceof Error) {
          // Access the error details from the cause property
          const errorDetails = err.cause as any;

          if (errorDetails && errorDetails.accountLocked) {
            setIsAccountLocked(true);
            if (errorDetails.timeLeft) {
              setAccountLockTimeLeft(errorDetails.timeLeft);
            }
            setError(
              errorDetails.error ||
                "Account is temporarily locked due to too many failed attempts"
            );
          } else {
            setError(err.message);
          }
        } else {
          setError("Verification failed");
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!token) {
        setError("Verification code is required");
        return;
      }

      if (token.length !== 6 || !/^\d+$/.test(token)) {
        setError("Verification code must be 6 digits");
        return;
      }

      setIsLoading(true);

      try {
        await api.verifyTOTP(token);
        router.push("/dashboard");
      } catch (err) {
        // Check for account lockout error
        if (err instanceof Error) {
          // Access the error details from the cause property
          const errorDetails = err.cause as any;

          if (errorDetails && errorDetails.accountLocked) {
            setIsAccountLocked(true);
            if (errorDetails.timeLeft) {
              setAccountLockTimeLeft(errorDetails.timeLeft);
            }
            setError(
              errorDetails.error ||
                "Account is temporarily locked due to too many failed attempts"
            );
          } else {
            setError(err.message);
          }
        } else {
          setError("Verification failed");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleBackupCode = () => {
    setUseBackupCode(!useBackupCode);
    setError("");
  };

  return (
    <AuthLayout>
      <div className="animate-fadeIn">
        <Card>
          <CardHeader bordered>
            <CardTitle as="h2">
              {useBackupCode
                ? "Enter Backup Code"
                : "Two-Factor Authentication"}
            </CardTitle>
            <CardDescription>
              {useBackupCode
                ? "Enter one of your backup codes to verify your identity"
                : "Enter the 6-digit code from your authenticator app"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 py-4">
              {error && (
                <div
                  className={`bg-opacity-10 border border-opacity-20 rounded-md p-3 text-sm ${
                    isAccountLocked
                      ? "bg-[var(--warning)] border-[var(--warning)]"
                      : "bg-[var(--error)] border-[var(--error)]"
                  }`}
                >
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`w-5 h-5 mr-2 flex-shrink-0 mt-0.5 ${
                        isAccountLocked
                          ? "text-[var(--warning)]"
                          : "text-[var(--error)]"
                      }`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <div className="text-[var(--foreground)]">{error}</div>

                      {isAccountLocked && (
                        <div className="mt-2 text-[var(--neutral-600)]">
                          {accountLockTimeLeft ? (
                            <p>
                              Your account will automatically unlock in
                              approximately {accountLockTimeLeft}{" "}
                              {accountLockTimeLeft === 1 ? "minute" : "minutes"}
                              .
                            </p>
                          ) : (
                            <p>
                              Please check your email for instructions to unlock
                              your account.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {useBackupCode ? (
                <>
                  <Input
                    label="Backup Code"
                    type="text"
                    placeholder="Enter your backup code"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value)}
                    ref={inputRef}
                    autoFocus
                    required
                    autoComplete="one-time-code"
                  />
                  <div className="mt-2 bg-[var(--warning)] bg-opacity-10 border border-[var(--warning)] border-opacity-20 rounded-md p-3 text-sm text-sm">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5 mr-2 flex-shrink-0 text-[var(--warning)]"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-[var(--foreground)]">
                        Using a backup code will disable your 2FA for security
                        reasons. You'll need to set it up again.
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <Input
                  label="Authentication Code"
                  type="text"
                  placeholder="6-digit code"
                  value={token}
                  maxLength={6}
                  onChange={(e) =>
                    setToken(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  ref={inputRef}
                  autoFocus
                  required
                  autoComplete="one-time-code"
                />
              )}

              <div className="pt-3">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-[var(--neutral-500)] hover:text-[var(--primary)]"
                  onClick={toggleBackupCode}
                >
                  {useBackupCode
                    ? "Use authenticator app instead"
                    : "Lost your authenticator app? Use a backup code"}
                </Button>
              </div>
            </CardContent>
            <CardFooter bordered alignment="center">
              <Button
                type="submit"
                variant="default"
                size="lg"
                fullWidth
                loading={isLoading}
              >
                Verify
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AuthLayout>
  );
}
