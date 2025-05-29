import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { verifySession } from "@/lib/auth";
import { createSessionResponse } from "@/lib/session";

export async function POST(request: Request) {
  try {
    // בדיקת המשתמש מהסשן
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // התחברות למסד הנתונים
    await connectToDatabase();

    // מציאת המשתמש
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // בדיקה אם ה-2FA כבר כבוי
    if (!user.isTotpEnabled) {
      return NextResponse.json(
        { error: "Two-factor authentication is already disabled" },
        { status: 400 }
      );
    }

    // ביטול ה-2FA
    user.isTotpEnabled = false;
    user.totpSecret = undefined; // מחיקת הסוד המשמש ליצירת קודים
    await user.save();

    // עדכון הסשן
    const updatedSession = {
      ...session,
      isTotpEnabled: false,
      isTotpVerified: true, // משתמש לא צריך לאמת TOTP כי הוא כבוי
    };

    // יצירת תשובה
    const response = NextResponse.json({
      success: true,
      message: "Two-factor authentication has been disabled successfully",
    });

    // הוספת הסשן המעודכן ומחזר את התשובה
    return await createSessionResponse(updatedSession, response);
  } catch (error) {
    console.error("Disable 2FA error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
