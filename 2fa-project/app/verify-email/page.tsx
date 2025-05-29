"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "invalid"
  >("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verifyEmailToken() {
      if (!token) {
        setStatus("invalid");
        setMessage("No verification token provided.");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to verify email. Please try again.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again later.");
      }
    }

    verifyEmailToken();
  }, [token]);

  return (
    <AuthLayout>
      <div className="animate-fadeIn">
        <Card>
          <CardHeader bordered>
            <CardTitle as="h2">Email Verification</CardTitle>
            <CardDescription>Verify your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 py-4">
            {status === "loading" && (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-[var(--neutral-500)]">
                  Verifying your email...
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-[var(--success)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Success!</h3>
                <p className="text-[var(--neutral-500)]">{message}</p>
              </div>
            )}

            {status === "error" && (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-[var(--error)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Verification Failed</h3>
                <p className="text-[var(--neutral-500)]">{message}</p>
              </div>
            )}

            {status === "invalid" && (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-[var(--warning)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Invalid Request</h3>
                <p className="text-[var(--neutral-500)]">{message}</p>
              </div>
            )}
          </CardContent>
          <CardFooter bordered alignment="center">
            <div className="w-full flex justify-center">
              {(status === "success" || status === "error") && (
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => router.push("/login")}
                >
                  Go to Login
                </Button>
              )}
              {status === "invalid" && (
                <Link href="/login">
                  <Button variant="default" size="lg">
                    Back to Login
                  </Button>
                </Link>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </AuthLayout>
  );
}
