"use client";

import React from "react";
import IdleSessionManager from "@/components/IdleSessionManager";

// Default settings for inactive session management
// You can change the values here to adjust the timeout duration
const IDLE_TIMEOUT_MINUTES = 5; // Inactivity time in minutes before automatic logout

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
