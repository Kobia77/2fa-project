import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    // קבלת טוקן האימות מפרמטר ה-URL
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // בדיקת תקינות בסיסית
    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // התחברות למסד נתונים
    await connectToDatabase();

    // חיפוש משתמש עם טוקן האימות
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }, // בדיקה שהטוקן עדיין בתוקף
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // עדכון סטטוס אימות המייל של המשתמש
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
