import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Unlock token is required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find user with the given unlock token
    const user = await User.findOne({ unlockToken: token });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired unlock token" },
        { status: 400 }
      );
    }

    // Check if account is still locked
    if (!user.accountLocked) {
      return NextResponse.json(
        { message: "Account is already unlocked" },
        { status: 200 }
      );
    }

    // Unlock the account
    user.accountLocked = false;
    user.accountLockedUntil = undefined;
    user.failedLoginAttempts = 0;
    user.unlockToken = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Account unlocked successfully. You may now log in.",
    });
  } catch (error) {
    console.error("Account unlock error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
