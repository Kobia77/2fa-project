"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardBadge,
} from "@/components/ui/Card";
import * as api from "@/lib/api";

export default function Setup2FAPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCodeUrl: string;
  } | null>(null);
  const [token, setToken] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        const data = await api.getSetup2FAData();
        setSetupData(data);
      } catch (error) {
        console.error("Failed to fetch 2FA setup data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSetupData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError("");
    setIsSubmitting(true);

    try {
      await api.enableTOTP(token);
      // Redirect to dashboard after successful setup
      router.push("/dashboard");
    } catch (error: any) {
      setVerificationError(error.message || "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Top navbar */}
      <header className="fixed top-0 left-0 right-0 bg-[var(--background)] border-b border-[var(--border-light)] dark:border-[var(--border-dark)]">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-white"
              >
                <path
                  fillRule="evenodd"
                  d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-bold text-xl">SecureKey</span>
          </div>

          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-16 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-[var(--neutral-500)] mb-1">
              <Link href="/dashboard" className="hover:text-[var(--primary)]">
                Dashboard
              </Link>
              <span>/</span>
              <span>Set Up Two-Factor Authentication</span>
            </div>
            <h1 className="text-2xl font-bold">
              Set Up Two-Factor Authentication
            </h1>
            <p className="text-[var(--neutral-500)]">
              Secure your account with an additional layer of protection
            </p>
          </div>

          <div className="animate-fadeIn">
            <Card variant="default">
              {isLoading ? (
                <CardContent className="flex items-center justify-center h-48">
                  <svg
                    className="animate-spin h-8 w-8 text-[var(--primary)]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </CardContent>
              ) : setupData ? (
                <>
                  <CardHeader>
                    <div className="flex justify-between items-center mb-4">
                      <CardTitle>Authenticator App Setup</CardTitle>
                      <CardBadge variant="info">
                        Step {currentStep} of 3
                      </CardBadge>
                    </div>
                    <div className="w-full bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[var(--primary)] h-full rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                      ></div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Step 1: Instructions */}
                    <div className={currentStep === 1 ? "block" : "hidden"}>
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg mb-2">
                          Instructions
                        </h3>
                        <ol className="list-decimal list-inside space-y-4 text-[var(--foreground)] opacity-80">
                          <li className="flex items-start">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-[var(--primary)] bg-opacity-10 rounded-full text-[var(--primary)] text-xs mr-2">
                              1
                            </span>
                            <span>
                              Install an authenticator app:
                              <br />
                              <span className="text-sm text-[var(--neutral-500)] ml-8">
                                Google Authenticator, Microsoft Authenticator,
                                Authy, etc.
                              </span>
                            </span>
                          </li>
                          <li className="flex items-start mt-3">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-[var(--primary)] bg-opacity-10 rounded-full text-[var(--primary)] text-xs mr-2">
                              2
                            </span>
                            <span>Scan the QR code with your app</span>
                          </li>
                          <li className="flex items-start mt-3">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-[var(--primary)] bg-opacity-10 rounded-full text-[var(--primary)] text-xs mr-2">
                              3
                            </span>
                            <span>
                              Enter the 6-digit verification code shown in your
                              app
                            </span>
                          </li>
                        </ol>

                        <Button
                          className="mt-6"
                          onClick={() => setCurrentStep(2)}
                        >
                          Continue
                        </Button>
                      </div>
                    </div>

                    {/* Step 2: Scan QR Code */}
                    <div className={currentStep === 2 ? "block" : "hidden"}>
                      <div className="text-center">
                        <h3 className="font-medium text-lg mb-4">
                          Scan QR Code
                        </h3>
                        <p className="text-[var(--neutral-500)] mb-6">
                          Open your authenticator app and scan this QR code to
                          set up your account.
                        </p>

                        <div className="bg-white p-4 rounded-lg inline-flex border border-[var(--border-light)] dark:border-[var(--border-dark)] mx-auto mb-6">
                          <img
                            src={setupData.qrCodeUrl}
                            alt="QR Code for 2FA setup"
                            className="max-w-full h-auto"
                          />
                        </div>

                        <div className="bg-[var(--info)] bg-opacity-10 border border-[var(--info)] border-opacity-20 rounded-lg p-4 mb-6 max-w-md mx-auto text-left">
                          <div className="flex">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-5 h-5 text-[var(--info)] flex-shrink-0 mr-2"
                            >
                              <path
                                fillRule="evenodd"
                                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <p className="text-[var(--info)] font-medium">
                              Can't scan the code?
                            </p>
                          </div>
                          <p className="text-[var(--neutral-700)] dark:text-[var(--neutral-300)] text-sm mt-2">
                            You can manually enter this secret key in your
                            authenticator app:
                          </p>
                          <div className="mt-2 bg-white dark:bg-[var(--neutral-800)] rounded border border-[var(--border-light)] dark:border-[var(--border-dark)] px-3 py-2 font-mono text-sm select-all">
                            {setupData.secret}
                          </div>
                        </div>

                        <div className="flex justify-center space-x-3">
                          <Button
                            variant="outline"
                            onClick={() => setCurrentStep(1)}
                          >
                            Back
                          </Button>
                          <Button onClick={() => setCurrentStep(3)}>
                            Continue
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Verification */}
                    <div className={currentStep === 3 ? "block" : "hidden"}>
                      <div className="max-w-md mx-auto">
                        <h3 className="font-medium text-lg mb-4 text-center">
                          Verify Setup
                        </h3>
                        <p className="text-[var(--neutral-500)] mb-6 text-center">
                          Enter the 6-digit verification code from your
                          authenticator app to complete setup.
                        </p>

                        <form onSubmit={handleSubmit}>
                          <Input
                            label="Verification Code"
                            variant="default"
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            pattern="[0-9]*"
                            inputMode="numeric"
                            className="text-center text-lg font-mono tracking-widest"
                            error={verificationError}
                            required
                          />

                          <div className="mt-6 flex justify-center space-x-3">
                            <Button
                              variant="outline"
                              type="button"
                              onClick={() => setCurrentStep(2)}
                            >
                              Back
                            </Button>
                            <Button type="submit" loading={isSubmitting}>
                              Verify & Enable 2FA
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--error)] bg-opacity-10 flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-8 h-8 text-[var(--error)]"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    Failed to load setup data
                  </h3>
                  <p className="text-[var(--neutral-500)] mb-6">
                    We couldn't load the 2FA setup data. Please try again later.
                  </p>
                  <Button onClick={handleCancel}>Back to Dashboard</Button>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
