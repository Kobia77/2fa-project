"use client";

import React, { useState } from "react";
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
      setError(err instanceof Error ? err.message : "Login failed");
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
