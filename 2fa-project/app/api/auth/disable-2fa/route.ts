import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { verifySession } from "@/lib/auth";
import { createSessionResponse } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if 2FA is already disabled
    if (!user.isTotpEnabled) {
      return NextResponse.json(
        { error: "Two-factor authentication is already disabled" },
        { status: 400 }
      );
    }

    // Disable 2FA
    user.isTotpEnabled = false;
    user.totpSecret = undefined; // Delete the secret used to generate codes
    await user.save();

    // Update the session
    const updatedSession = {
      ...session,
      isTotpEnabled: false,
      isTotpVerified: true, // User doesn't need to verify TOTP because it's disabled
    };

    // Create a response
    const response = NextResponse.json({
      success: true,
      message: "Two-factor authentication has been disabled successfully",
    });

    // Add the updated session and return the response
    return await createSessionResponse(updatedSession, response);
  } catch (error) {
    console.error("Disable 2FA error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
