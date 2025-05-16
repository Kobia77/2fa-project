import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export async function POST(request: Request) {
  // Create a success response
  const response = NextResponse.json({ success: true });

  // Clear the session cookie
  return await clearSession(response);
}
