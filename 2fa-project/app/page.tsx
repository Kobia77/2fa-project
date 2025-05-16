"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-pulse">
          <h1 className="text-2xl font-bold text-blue-600">2FA App</h1>
          <p className="text-gray-500 mt-2">Redirecting...</p>
        </div>
      </div>
    </div>
  );
}
