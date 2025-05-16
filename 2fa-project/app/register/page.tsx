"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Password validation
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordErrors([]);
      return;
    }

    let strength = 0;
    const errors: string[] = [];

    // Length check
    if (password.length >= 8) {
      strength += 25;
    } else {
      errors.push("Password must be at least 8 characters");
    }

    // Contains lowercase letter
    if (/[a-z]/.test(password)) {
      strength += 25;
    } else {
      errors.push("Password must contain a lowercase letter");
    }

    // Contains uppercase letter
    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else {
      errors.push("Password must contain an uppercase letter");
    }

    // Contains number or special char
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength += 25;
    } else {
      errors.push("Password must contain a number or special character");
    }

    setPasswordStrength(strength);
    setPasswordErrors(errors);
  }, [password]);

  // Get color based on password strength
  const getStrengthColor = () => {
    if (passwordStrength < 25) return "var(--error)";
    if (passwordStrength < 50) return "var(--warning)";
    if (passwordStrength < 75) return "var(--info)";
    return "var(--success)";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (passwordErrors.length > 0) {
      setError("Please fix the password requirements");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.register(email, password);
      if (response.backupCodes && response.backupCodes.length > 0) {
        setBackupCodes(response.backupCodes);
        setRegistrationComplete(true);
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToLogin = () => {
    router.push("/login");
  };

  // Copy all backup codes to clipboard
  const copyBackupCodes = () => {
    const codesText = backupCodes.join("\n");
    navigator.clipboard.writeText(codesText);
  };

  // Show backup codes after registration
  if (registrationComplete) {
    return (
      <AuthLayout>
        <div className="animate-fadeIn">
          <Card>
            <CardHeader bordered>
              <CardTitle as="h2">Save Your Backup Codes</CardTitle>
              <CardDescription>
                Keep these one-time backup codes in a safe place. You can use
                them if you lose access to your authenticator app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 py-4">
              <div className="bg-[var(--warning)] bg-opacity-10 border border-[var(--warning)] border-opacity-20 rounded-md p-3 mb-4 text-sm">
                <div className="flex items-center mb-2">
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
                  <span className="font-semibold text-[var(--warning)]">
                    Important
                  </span>
                </div>
                <p className="text-[var(--foreground)]">
                  You won't be able to see these codes again! Please store them
                  securely.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="font-mono text-center py-1 px-2 border border-gray-200 dark:border-gray-700 rounded"
                  >
                    {code}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                fullWidth
                onClick={copyBackupCodes}
                className="mt-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                  <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                </svg>
                Copy All Codes
              </Button>
            </CardContent>
            <CardFooter bordered alignment="center">
              <Button
                variant="default"
                size="lg"
                fullWidth
                onClick={handleContinueToLogin}
              >
                Continue to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="animate-fadeIn">
        <Card>
          <CardHeader bordered>
            <CardTitle as="h2">Create account</CardTitle>
            <CardDescription>Get started with SecureKey</CardDescription>
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

              <Input
                label="Email address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="default"
              />

              <div className="relative">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  variant="default"
                  onFocus={() => setShowTooltip(true)}
                  onBlur={() => setShowTooltip(false)}
                  error={
                    passwordErrors.length > 0 && password
                      ? passwordErrors[0]
                      : undefined
                  }
                />

                {/* Password strength indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[var(--neutral-500)]">
                        Password strength:
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: getStrengthColor() }}
                      >
                        {passwordStrength < 25
                          ? "Weak"
                          : passwordStrength < 50
                          ? "Fair"
                          : passwordStrength < 75
                          ? "Good"
                          : "Strong"}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)] rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${passwordStrength}%`,
                          backgroundColor: getStrengthColor(),
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Password requirements tooltip */}
                {showTooltip && (
                  <div className="absolute z-10 mt-2 p-3 bg-white dark:bg-[var(--neutral-800)] rounded-md shadow-lg border border-[var(--border-light)] dark:border-[var(--border-dark)] text-xs w-full">
                    <div className="font-medium mb-1.5">
                      Password requirements:
                    </div>
                    <ul className="space-y-1 pl-1">
                      <li className="flex items-center">
                        <span
                          className={`mr-1.5 ${
                            password.length >= 8
                              ? "text-[var(--success)]"
                              : "text-[var(--neutral-400)]"
                          }`}
                        >
                          {password.length >= 8 ? "✓" : "○"}
                        </span>
                        At least 8 characters
                      </li>
                      <li className="flex items-center">
                        <span
                          className={`mr-1.5 ${
                            /[a-z]/.test(password)
                              ? "text-[var(--success)]"
                              : "text-[var(--neutral-400)]"
                          }`}
                        >
                          {/[a-z]/.test(password) ? "✓" : "○"}
                        </span>
                        Lowercase letter
                      </li>
                      <li className="flex items-center">
                        <span
                          className={`mr-1.5 ${
                            /[A-Z]/.test(password)
                              ? "text-[var(--success)]"
                              : "text-[var(--neutral-400)]"
                          }`}
                        >
                          {/[A-Z]/.test(password) ? "✓" : "○"}
                        </span>
                        Uppercase letter
                      </li>
                      <li className="flex items-center">
                        <span
                          className={`mr-1.5 ${
                            /[0-9!@#$%^&*(),.?":{}|<>]/.test(password)
                              ? "text-[var(--success)]"
                              : "text-[var(--neutral-400)]"
                          }`}
                        >
                          {/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)
                            ? "✓"
                            : "○"}
                        </span>
                        Number or special character
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <Input
                label="Confirm password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                variant="default"
                error={
                  confirmPassword && password !== confirmPassword
                    ? "Passwords don't match"
                    : undefined
                }
              />
            </CardContent>

            <CardFooter bordered alignment="center" className="flex-col gap-4">
              <Button
                type="submit"
                variant="default"
                size="lg"
                fullWidth
                loading={isLoading}
                disabled={passwordErrors.length > 0}
              >
                Create account
              </Button>

              <p className="text-sm text-[var(--neutral-500)]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[var(--primary)] hover:text-[var(--primary-light)] font-medium"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AuthLayout>
  );
}
