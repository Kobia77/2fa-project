import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { comparePassword } from "@/lib/auth";
import { createSessionResponse } from "@/lib/session";
import {
  generateVerificationToken,
  sendEmail,
  generateVerificationEmailHtml,
} from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find user with case-insensitive email search
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    let emailVerificationSent = false;
    if (!user.isEmailVerified) {
      if (
        !user.emailVerificationToken ||
        !user.emailVerificationExpires ||
        user.emailVerificationExpires < new Date()
      ) {
        const emailVerificationToken = generateVerificationToken();
        const emailVerificationExpires = new Date(
          Date.now() + 24 * 60 * 60 * 1000
        );

        user.emailVerificationToken = emailVerificationToken;
        user.emailVerificationExpires = emailVerificationExpires;
        await user.save();

        const verificationHtml = generateVerificationEmailHtml(
          emailVerificationToken
        );
        const emailResult = await sendEmail({
          to: email,
          subject: "Verify your email address",
          html: verificationHtml,
        });

        emailVerificationSent = emailResult.success;
      }
    }

    // Create session data
    const sessionData = {
      userId: user._id.toString(),
      email: user.email,
      isTotpEnabled: user.isTotpEnabled,
      isEmailVerified: user.isEmailVerified,
      // Only mark as verified if TOTP is not enabled yet
      isTotpVerified: !user.isTotpEnabled,
      isLoggedIn: true,
    };

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      isTotpEnabled: user.isTotpEnabled,
      isEmailVerified: user.isEmailVerified,
      emailVerificationSent: emailVerificationSent,
    });

    // Add session cookie to response
    return await createSessionResponse(sessionData, response);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
