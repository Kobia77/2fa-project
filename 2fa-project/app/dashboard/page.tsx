"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardBadge,
} from "@/components/ui/Card";
import * as api from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<{
    email: string;
    isTotpEnabled: boolean;
  } | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // Check for notifications from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const notificationParam = urlParams.get("notification");

    if (notificationParam === "2fa-reset") {
      setNotification(
        "Your two-factor authentication has been disabled for security reasons after using a backup code. You can set it up again."
      );

      // Remove the notification parameter from URL without refreshing
      const newUrl = `${window.location.pathname}${window.location.hash}`;
      window.history.replaceState({}, document.title, newUrl);
    }

    // Fetch user data when component mounts
    const fetchUserData = async () => {
      try {
        const data = await api.getUserData();
        setUserData(data);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASetup = () => {
    router.push("/dashboard/setup-2fa");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== userData?.email) {
      setDeleteError("Email doesn't match your account");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      await api.deleteAccount();
      router.push("/login");
    } catch (error) {
      console.error("Account deletion failed:", error);
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete account"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to dismiss notification
  const dismissNotification = () => {
    setNotification(null);
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

          <Button
            variant="ghost"
            onClick={handleLogout}
            loading={isLoading}
            size="sm"
            rightIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                />
              </svg>
            }
          >
            Log out
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-16 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Notification Banner */}
          {notification && (
            <div className="mb-6 bg-[var(--info)] bg-opacity-10 border border-[var(--info)] border-opacity-20 rounded-md p-4 text-[var(--foreground)] relative animate-fadeIn">
              <button
                className="absolute top-1 right-1 p-2 text-[var(--neutral-500)] hover:text-[var(--neutral-700)]"
                onClick={dismissNotification}
                aria-label="Dismiss"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 mr-3 text-[var(--info)] flex-shrink-0 mt-0.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
                <span>{notification}</span>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-[var(--neutral-500)]">
              Manage your account security
            </p>
          </div>

          <div className="space-y-6">
            {isDataLoading ? (
              <Card variant="default" className="animate-pulse">
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
              </Card>
            ) : (
              <>
                {/* Account Status Card */}
                <Card variant="default" className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Welcome, {userData?.email}</CardTitle>
                        <p className="text-[var(--neutral-500)] mt-1">
                          Here's your security status
                        </p>
                      </div>
                      <CardBadge
                        variant={
                          userData?.isTotpEnabled ? "success" : "warning"
                        }
                      >
                        {userData?.isTotpEnabled
                          ? "2FA Enabled"
                          : "2FA Disabled"}
                      </CardBadge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Card
                      variant="flat"
                      className="border border-[var(--border-light)] dark:border-[var(--border-dark)]"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start space-x-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              userData?.isTotpEnabled
                                ? "bg-[var(--success)] bg-opacity-10"
                                : "bg-[var(--warning)] bg-opacity-10"
                            }`}
                          >
                            {userData?.isTotpEnabled ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-6 h-6 text-[var(--success)]"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.674 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-6 h-6 text-[var(--warning)]"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>

                          <div className="flex-1">
                            <h3 className="font-medium text-lg">
                              {userData?.isTotpEnabled
                                ? "Two-Factor Authentication is Active"
                                : "Two-Factor Authentication is Not Enabled"}
                            </h3>
                            <p className="text-sm text-[var(--neutral-500)] mt-1">
                              {userData?.isTotpEnabled
                                ? "Your account is secured with two-factor authentication."
                                : "Your account is not protected with two-factor authentication. We recommend enabling 2FA for additional security."}
                            </p>

                            {!userData?.isTotpEnabled && (
                              <Button
                                variant="accent"
                                size="sm"
                                className="mt-4"
                                onClick={handle2FASetup}
                              >
                                Enable 2FA
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>

                {/* Danger Zone Card */}
                {userData && !isDataLoading && (
                  <Card
                    variant="default"
                    className="overflow-hidden mt-8 border-[var(--error)] border-opacity-40"
                  >
                    <CardHeader>
                      <CardTitle className="text-[var(--error)]">
                        Danger Zone
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Delete Account</h3>
                          <p className="text-sm text-[var(--neutral-500)]">
                            Permanently delete your account and all data
                          </p>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setShowDeleteModal(true)}
                        >
                          Delete Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[var(--neutral-900)] rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-[var(--error)]">
                Delete Account
              </h3>
              <p className="text-[var(--neutral-500)] mt-2">
                This action is permanent and cannot be undone. All your data
                will be deleted.
              </p>
            </div>

            {deleteError && (
              <div className="mb-4 bg-[var(--error)] bg-opacity-10 border border-[var(--error)] border-opacity-20 rounded-md p-3 text-sm text-[var(--error)]">
                {deleteError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                To confirm, type your email:
              </label>
              <input
                type="email"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={userData?.email}
                className="w-full px-3 py-2 border border-[var(--border-light)] dark:border-[var(--border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--error)] focus:ring-opacity-50"
              />
            </div>

            <div className="flex space-x-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation("");
                  setDeleteError("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={isDeleting}
                disabled={deleteConfirmation !== userData?.email}
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
