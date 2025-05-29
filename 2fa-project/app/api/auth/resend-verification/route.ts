import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { verifySession } from "@/lib/auth";
import {
  generateVerificationToken,
  sendEmail,
  generateVerificationEmailHtml,
} from "@/lib/email";

export async function POST(request: Request) {
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

    // אם המייל כבר מאומת, אין צורך לשלוח שוב
    if (user.isEmailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // יצירת טוקן אימות חדש
    const emailVerificationToken = generateVerificationToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // תוקף של 24 שעות

    // עדכון הטוקן בפרופיל המשתמש
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    // שליחת מייל אימות
    const verificationHtml = generateVerificationEmailHtml(
      emailVerificationToken
    );
    const emailResult = await sendEmail({
      to: user.email,
      subject: "Verify your email address",
      html: verificationHtml,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification email error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
