import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { clearSession } from "@/lib/session";

export async function DELETE(request: Request) {
  try {
    // Verify user is authenticated
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to delete your account" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Delete user from database
    const result = await User.deleteOne({ email: session.email });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Clear user session
    const response = NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });

    return await clearSession(response);
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
