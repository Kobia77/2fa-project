"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";
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

// Component that uses useSearchParams
function UnlockAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isUnlocking, setIsUnlocking] = useState(false);
  const [status, setStatus] = useState<{
    type: "info" | "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus({
        type: "error",
        message: "Invalid unlock link. Please check your email and try again.",
      });
    }
  }, [token]);

  const handleUnlockAccount = async () => {
    if (!token) return;

    setIsUnlocking(true);
    try {
      const response = await fetch("/api/auth/unlock-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message:
            data.message ||
            "Account unlocked successfully. You may now log in.",
        });
      } else {
        setStatus({
          type: "error",
          message:
            data.error || "Failed to unlock account. Please try again later.",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <Card>
        <CardHeader bordered>
          <CardTitle as="h2">Unlock Your Account</CardTitle>
          <CardDescription>
            Your account was locked due to too many failed login attempts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 py-4">
          {status && (
            <div
              className={`bg-opacity-10 border border-opacity-20 rounded-md p-3 text-sm ${
                status.type === "success"
                  ? "bg-[var(--success)] border-[var(--success)]"
                  : status.type === "error"
                  ? "bg-[var(--error)] border-[var(--error)]"
                  : "bg-[var(--info)] border-[var(--info)]"
              }`}
            >
              <div className="flex items-center">
                {status.type === "success" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 flex-shrink-0 text-[var(--success)]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : status.type === "error" ? (
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
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 mr-2 flex-shrink-0 text-[var(--info)]"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span className="text-[var(--foreground)]">
                  {status.message}
                </span>
              </div>
            </div>
          )}

          <p className="text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
            {status?.type === "success"
              ? "Your account has been successfully unlocked. You can now log in to your account."
              : "Click the button below to unlock your account and reset your failed login attempts."}
          </p>
        </CardContent>
        <CardFooter bordered alignment="center">
          {status?.type === "success" ? (
            <Button
              type="button"
              variant="default"
              size="lg"
              fullWidth
              onClick={() => router.push("/login")}
            >
              Go to Login
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              size="lg"
              fullWidth
              loading={isUnlocking}
              disabled={!token || isUnlocking}
              onClick={handleUnlockAccount}
            >
              Unlock Account
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

// Main component that wraps UnlockAccountContent in a Suspense boundary
export default function UnlockAccountPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <UnlockAccountContent />
      </Suspense>
    </AuthLayout>
  );
}
