import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { comparePassword } from "@/lib/auth";
import { createSessionResponse } from "@/lib/session";

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

    // Create session data
    const sessionData = {
      userId: user._id.toString(),
      email: user.email,
      isTotpEnabled: user.isTotpEnabled,
      // Only mark as verified if TOTP is not enabled yet
      isTotpVerified: !user.isTotpEnabled,
      isLoggedIn: true,
    };

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      isTotpEnabled: user.isTotpEnabled,
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
