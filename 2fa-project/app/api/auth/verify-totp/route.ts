import { NextResponse } from "next/server";
import { verifySession, verifyTOTP } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { createSessionResponse } from "@/lib/session";
import {
  isAccountLocked,
  handleFailedAttempt,
  resetFailedAttempts,
} from "@/lib/accountLockout";

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

    // Get the user to access their TOTP secret
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if account is locked
    if (await isAccountLocked(user)) {
      const lockedUntil = user.accountLockedUntil;
      const timeLeft = lockedUntil
        ? Math.ceil((lockedUntil.getTime() - Date.now()) / 60000)
        : 0;

      return NextResponse.json(
        {
          error: `Account is temporarily locked due to too many failed verification attempts. Please try again later or use the account unlock link sent to your email.`,
          accountLocked: true,
          timeLeft: timeLeft, // Minutes left until auto-unlock
        },
        { status: 403 }
      );
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
      // Handle failed verification attempt
      const isNowLocked = await handleFailedAttempt(user);

      return NextResponse.json(
        {
          error: isNowLocked
            ? "Account has been locked due to too many failed verification attempts. An unlock link has been sent to your email."
            : "Invalid verification code",
        },
        { status: 401 }
      );
    }

    // Reset failed attempts counter on successful verification
    await resetFailedAttempts(user);

    // Update session with TOTP verified
    const updatedSession = {
      ...session,
      isTotpVerified: true,
    };

    // Create successful response
    const response = NextResponse.json({
      success: true,
      message: "2FA verification successful",
    });

    // Add updated session cookie to response
    return await createSessionResponse(updatedSession, response);
  } catch (error) {
    console.error("TOTP verification error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
