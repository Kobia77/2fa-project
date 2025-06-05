"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface IdleSessionManagerProps {
  /**
   * Inactivity time in minutes before automatic logout
   * @default 10
   */
  timeoutMinutes?: number;

  /**
   * Option to temporarily disable this feature
   * @default false
   */
  disabled?: boolean;

  /**
   * Time interval in seconds to check for inactivity
   * @default 30
   */
  checkIntervalSeconds?: number;
}

/**
 * Component for tracking user inactivity and automatic logout
 */
export default function IdleSessionManager({
  timeoutMinutes = 10,
  disabled = false,
  checkIntervalSeconds = 30,
}: IdleSessionManagerProps) {
  const router = useRouter();
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Function to reset the activity timer
  const resetActivityTimer = () => {
    setLastActivity(Date.now());
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Navigate to login page with message
      router.push("/login?timeout=true");
    } catch (error) {
      console.error("Auto-logout failed:", error);
      // In case of failure, still navigate to the login page
      router.push("/login");
    }
  };

  // Monitor user activity
  useEffect(() => {
    if (disabled) return;

    // Events that count as user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Add event listeners
    const resetTimer = () => resetActivityTimer();
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Clean up event listeners
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [disabled]);

  // Periodic check for inactivity
  useEffect(() => {
    if (disabled) return;

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const intervalMs = checkIntervalSeconds * 1000;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity >= timeoutMs) {
        handleLogout();
      }
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [timeoutMinutes, checkIntervalSeconds, lastActivity, disabled]);

  // This component doesn't render any UI
  return null;
}
