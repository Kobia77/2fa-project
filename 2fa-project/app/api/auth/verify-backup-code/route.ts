import { NextResponse } from "next/server";
import { verifySession, verifyBackupCode } from "@/lib/auth";
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
    const { backupCode } = await request.json();
    console.log("Verifying backup code:", backupCode);

    if (!backupCode) {
      return NextResponse.json(
        { error: "Backup code is required" },
        { status: 400 }
      );
    }

    // Get session data
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("Session user ID:", session.userId);

    // Connect to database
    await connectToDatabase();

    // Get the user to access their backup codes
    const user = await User.findById(session.userId);
    console.log("User found:", !!user);

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

    // Ensure backupCodes is at least an empty array
    if (!user.backupCodes) {
      user.backupCodes = [];
      await user.save();
      console.log("Initialized empty backup codes array for user");
    }

    console.log("User backup codes array:", Array.isArray(user.backupCodes));
    console.log("User backup codes length:", user.backupCodes.length);

    // Verify backup code
    if (user.backupCodes.length === 0) {
      return NextResponse.json(
        { error: "No backup codes available for this user" },
        { status: 400 }
      );
    }

    const { isValid, index } = verifyBackupCode(backupCode, user.backupCodes);
    console.log("Backup code validation result:", { isValid, index });

    if (!isValid) {
      // Handle failed verification attempt
      const isNowLocked = await handleFailedAttempt(user);

      return NextResponse.json(
        {
          error: isNowLocked
            ? "Account has been locked due to too many failed verification attempts. An unlock link has been sent to your email."
            : "Invalid backup code",
        },
        { status: 401 }
      );
    }

    // Reset failed attempts counter on successful verification
    await resetFailedAttempts(user);

    // Remove the used backup code
    user.backupCodes.splice(index, 1);

    // Reset 2FA settings after backup code use
    user.isTotpEnabled = false;
    user.totpSecret = undefined;

    const saveResult = await user.save();
    console.log("User save result:", !!saveResult);
    console.log(
      "Remaining backup codes after removal:",
      user.backupCodes.length
    );
    console.log("2FA has been disabled for security reasons");

    // Update session with TOTP verified and disabled
    const updatedSession = {
      ...session,
      isTotpVerified: true,
      isTotpEnabled: false,
    };

    // Create successful response
    const response = NextResponse.json({
      success: true,
      message:
        "Backup code verification successful. 2FA has been disabled for security reasons.",
      remainingCodes: user.backupCodes.length,
      totpDisabled: true,
    });

    // Add updated session cookie to response
    return await createSessionResponse(updatedSession, response);
  } catch (error) {
    console.error("Backup code verification error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
