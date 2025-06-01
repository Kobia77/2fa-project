"use client";

import React from "react";
import IdleSessionManager from "@/components/IdleSessionManager";

// הגדרות ברירת המחדל לניהול סשן לא פעיל
// ניתן לשנות את הערכים כאן כדי להתאים את זמן הטיימאאוט
const IDLE_TIMEOUT_MINUTES = 5; // זמן אי-פעילות בדקות לפני ניתוק

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <IdleSessionManager timeoutMinutes={IDLE_TIMEOUT_MINUTES} />
      {children}
    </>
  );
}
