import { NextResponse } from "next/server";
import { verifySession, verifyBackupCode } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { createSessionResponse } from "@/lib/session";

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
      return NextResponse.json(
        { error: "Invalid backup code" },
        { status: 401 }
      );
    }

    // Remove the used backup code
    user.backupCodes.splice(index, 1);
    const saveResult = await user.save();
    console.log("User save result:", !!saveResult);
    console.log(
      "Remaining backup codes after removal:",
      user.backupCodes.length
    );

    // Update session with TOTP verified
    const updatedSession = {
      ...session,
      isTotpVerified: true,
    };

    // Create successful response
    const response = NextResponse.json({
      success: true,
      message: "Backup code verification successful",
      remainingCodes: user.backupCodes.length,
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
