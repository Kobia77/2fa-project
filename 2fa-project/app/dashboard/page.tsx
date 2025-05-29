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
    isEmailVerified: boolean;
  } | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);

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
    if (!userData?.isEmailVerified) {
      setNotification("Please verify your email before setting up 2FA.");
      return;
    }
    router.push("/dashboard/setup-2fa");
  };

  const handleDisable2FA = async () => {
    if (!userData?.isTotpEnabled) return;

    const isConfirmed = window.confirm(
      "Are you sure you want to disable two-factor authentication? This will make your account less secure."
    );

    if (!isConfirmed) return;

    setIsDisabling2FA(true);

    try {
      await api.disable2FA();

      // עדכון הנתונים המקומיים של המשתמש
      setUserData((prevData) =>
        prevData ? { ...prevData, isTotpEnabled: false } : null
      );

      setNotification(
        "Two-factor authentication has been disabled successfully."
      );
    } catch (error) {
      setNotification(
        error instanceof Error
          ? `Failed to disable 2FA: ${error.message}`
          : "Failed to disable two-factor authentication."
      );
    } finally {
      setIsDisabling2FA(false);
    }
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

  const handleResendVerification = async () => {
    if (isResendingVerification) return;
    setIsResendingVerification(true);

    try {
      await api.resendVerificationEmail();
      setNotification("Verification email sent. Please check your inbox.");
    } catch (error) {
      setNotification(
        error instanceof Error
          ? `Failed to send verification email: ${error.message}`
          : "Failed to send verification email."
      );
    } finally {
      setIsResendingVerification(false);
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
            <p className="text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
              Manage your account security settings
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Email Verification */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle as="h2">Email Verification</CardTitle>
                  {userData?.isEmailVerified ? (
                    <CardBadge color="success">Verified</CardBadge>
                  ) : (
                    <CardBadge color="warning">Not Verified</CardBadge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-sm text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
                    {userData?.isEmailVerified ? (
                      <p>Your email has been verified.</p>
                    ) : (
                      <>
                        <p>
                          Your email address has not been verified. Please check
                          your inbox for a verification email, or click the
                          button below to send a new verification link to:{" "}
                          <span className="font-semibold">
                            {userData?.email}
                          </span>
                        </p>
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            onClick={handleResendVerification}
                            loading={isResendingVerification}
                          >
                            Resend Verification Email
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle as="h2">Two-Factor Authentication</CardTitle>
                  {userData?.isTotpEnabled ? (
                    <CardBadge color="success">Enabled</CardBadge>
                  ) : (
                    <CardBadge color="neutral">Disabled</CardBadge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-sm text-[var(--neutral-600)] dark:text-[var(--neutral-400)]">
                    {userData?.isTotpEnabled ? (
                      <p>
                        Two-factor authentication is currently enabled for your
                        account. This adds an extra layer of security by
                        requiring a verification code from your authenticator
                        app.
                      </p>
                    ) : (
                      <p>
                        Add an extra layer of security to your account by
                        enabling two-factor authentication. When enabled, you'll
                        be required to provide a verification code from your
                        authenticator app.
                        {!userData?.isEmailVerified && (
                          <span className="block mt-2 text-[var(--warning)]">
                            You need to verify your email address before
                            enabling 2FA.
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* 2FA Actions */}
                <div className="mt-2">
                  {userData?.isTotpEnabled ? (
                    <div className="flex items-center gap-3">
                      <Button variant="outline" disabled>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 mr-1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                          />
                        </svg>
                        2FA Enabled
                      </Button>
                      <Button
                        variant="danger"
                        onClick={handleDisable2FA}
                        loading={isDisabling2FA}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 mr-1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                          />
                        </svg>
                        Disable 2FA
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="default"
                      onClick={handle2FASetup}
                      disabled={isDataLoading || !userData?.isEmailVerified}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mr-1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Setup 2FA
                    </Button>
                  )}
                </div>
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
