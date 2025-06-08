"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface IdleSessionManagerProps {
  /**
   * זמן אי-פעילות בדקות לפני ניתוק אוטומטי
   * @default 10
   */
  timeoutMinutes?: number;

  /**
   * ניתן לכבות את הפיצ'ר באופן זמני
   * @default false
   */
  disabled?: boolean;

  /**
   * זמן בשניות לבדיקה תקופתית של אי-פעילות
   * @default 30
   */
  checkIntervalSeconds?: number;
}

/**
 * קומפוננטת מעקב אחר אי-פעילות משתמש וניתוק אוטומטי
 */
export default function IdleSessionManager({
  timeoutMinutes = 10,
  disabled = false,
  checkIntervalSeconds = 30,
}: IdleSessionManagerProps) {
  const router = useRouter();
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // פונקציה לאיפוס טיימר הפעילות
  const resetActivityTimer = () => {
    setLastActivity(Date.now());
  };

  // פונקציית התנתקות
  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // ניווט לעמוד התחברות עם הודעה
      router.push("/login?timeout=true");
    } catch (error) {
      console.error("Auto-logout failed:", error);
      // במקרה של כשל, עדיין ננווט לדף הכניסה
      router.push("/login");
    }
  }, [router]);

  // מעקב אחר פעילות משתמש
  useEffect(() => {
    if (disabled) return;

    // אירועים שנחשבים לפעילות משתמש
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // הוספת מאזיני אירועים
    const resetTimer = () => resetActivityTimer();
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // ניקוי מאזיני אירועים
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [disabled]);

  // בדיקה תקופתית של אי-פעילות
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
  }, [
    timeoutMinutes,
    checkIntervalSeconds,
    lastActivity,
    disabled,
    handleLogout,
  ]);

  // קומפוננטה זו לא מציגה UI
  return null;
}
