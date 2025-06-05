"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [accountLockTimeLeft, setAccountLockTimeLeft] = useState<number | null>(
    null
  );

  // בדיקת פרמטרים בURL
  useEffect(() => {
    // בדיקה אם המשתמש הגיע לדף עקב ניתוק מאי פעילות
    if (searchParams.get("timeout") === "true") {
      setNotification("You've been logged out due to inactivity");
    }

    // Check if user was redirected after unlocking account
    if (searchParams.get("unlocked") === "true") {
      setNotification(
        "Your account has been successfully unlocked. You can now log in."
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotification("");
    setIsAccountLocked(false);
    setAccountLockTimeLeft(null);

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.login(email, password);

      // Check if 2FA is enabled for user
      if (response.isTotpEnabled) {
        router.push("/verify-totp");
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
        setError("Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="animate-fadeIn">
        <Card>
          <CardHeader bordered>
            <CardTitle as="h2">Sign in</CardTitle>
            <CardDescription>Access your secure account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 py-4">
              {notification && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800 mb-4">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5 mr-2 flex-shrink-0 text-blue-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {notification}
                  </div>
                </div>
              )}

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

              <Input
                label="Email address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="default"
                className="mb-4"
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant="default"
                className="mb-1"
              />
            </CardContent>

            <CardFooter bordered alignment="center" className="flex-col gap-4">
              <Button
                type="submit"
                variant="default"
                size="lg"
                fullWidth
                loading={isLoading}
              >
                Sign in
              </Button>

              <p className="text-sm text-[var(--neutral-500)]">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-[var(--primary)] hover:text-[var(--primary-light)] font-medium"
                >
                  Create an account
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AuthLayout>
  );
}
