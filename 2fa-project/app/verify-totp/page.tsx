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

    if (useBackupCode) {
      if (!backupCode) {
        setError("Backup code is required");
        return;
      }

      setIsLoading(true);

      try {
        await api.verifyBackupCode(backupCode);
        router.push("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed");
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
        setError(err instanceof Error ? err.message : "Verification failed");
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
                <div className="bg-[var(--error)] bg-opacity-10 border border-[var(--error)] border-opacity-20 rounded-md p-3 text-sm text-[var(--foreground)]">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5 mr-2 flex-shrink-0 text-[var(--error)]"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              {useBackupCode ? (
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
