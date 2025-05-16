export const runtime = "nodejs";

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import {
  verifySession,
  generateTOTPSecret,
  generateQRCode,
  verifyTOTP,
} from "@/lib/auth";
import { createSessionResponse } from "@/lib/session";
console.log(
  "has crypto.randomBytes????????????????????",
  !!require("crypto").randomBytes
);

// Generate TOTP secret and QR code
export async function GET(request: Request) {
  try {
    // Get session data
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get user
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate TOTP secret
    const secret = generateTOTPSecret(user.email);

    // Generate QR code - ensure otpauth_url is not undefined
    if (!secret.otpauth_url) {
      return NextResponse.json(
        { error: "Failed to generate QR code" },
        { status: 500 }
      );
    }

    const qrCodeUrl = await generateQRCode(secret.otpauth_url);

    // Store secret temporarily (we'll save it permanently after verification)
    user.totpSecret = secret.base32;
    await user.save();

    return NextResponse.json({
      secret: secret.base32,
      qrCodeUrl,
    });
  } catch (error) {
    console.error("Setup 2FA error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// Verify and enable 2FA
export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    // Get session data
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get user
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify TOTP
    if (!user.totpSecret) {
      return NextResponse.json(
        { error: "TOTP not set up for this user" },
        { status: 400 }
      );
    }

    const isValid = verifyTOTP(token, user.totpSecret);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 401 }
      );
    }

    // Enable 2FA
    user.isTotpEnabled = true;
    await user.save();

    // Update the session to include 2FA status
    const updatedSession = {
      ...session,
      isTotpEnabled: true,
      isTotpVerified: true, // Mark as verified for this session
    };

    // Create a response
    const response = NextResponse.json({
      success: true,
      message: "2FA has been enabled successfully",
    });

    // Add the updated session (don't clear it)
    return await createSessionResponse(updatedSession, response);
  } catch (error) {
    console.error("Enable 2FA error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
