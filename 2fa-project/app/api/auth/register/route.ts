import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword, generateBackupCodes, hashBackupCode } from "@/lib/auth";
import {
  sendEmail,
  generateVerificationEmailHtml,
  generateVerificationToken,
} from "@/lib/email";

// Password validation function
function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  // Length check
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }

  // Contains lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must contain a lowercase letter" };
  }

  // Contains uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain an uppercase letter" };
  }

  // Contains number or special char
  if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain a number or special character",
    };
  }

  return { valid: true };
}

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

    // Password strength validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Check if user exists with case-insensitive search
    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate backup codes
    const backupCodes = generateBackupCodes(10);
    console.log("Generated backup codes:", backupCodes);

    // Store hashed backup codes in DB
    const hashedBackupCodes = backupCodes.map((code) => hashBackupCode(code));
    console.log("Hashed backup codes:", hashedBackupCodes);

    // יצירת טוקן לאימות המייל
    const emailVerificationToken = generateVerificationToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // תוקף של 24 שעות

    // Create user document with email verification data
    const userData = {
      email,
      password: hashedPassword,
      isTotpEnabled: false,
      backupCodes: hashedBackupCodes,
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationExpires,
    };

    console.log("Creating user with data:", {
      ...userData,
      password: "[REDACTED]",
      emailVerificationToken: "[REDACTED]",
    });

    // Create new user
    const newUser = await User.create(userData);

    // Verify the user was created with backup codes
    console.log("User created with ID:", newUser._id);
    console.log("User has backup codes:", newUser.backupCodes?.length || 0);

    // שליחת מייל אימות
    const verificationHtml = generateVerificationEmailHtml(
      emailVerificationToken
    );
    const emailResult = await sendEmail({
      to: email,
      subject: "Verify your email address",
      html: verificationHtml,
    });

    console.log("Email verification result:", emailResult);

    // Double check by fetching the user again
    const savedUser = await User.findById(newUser._id);
    console.log(
      "Fetched user has backup codes:",
      savedUser?.backupCodes?.length || 0
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "User registered successfully. Please check your email to verify your account.",
        backupCodes, // Return plain text backup codes to be shown once
        emailVerificationSent: emailResult.success,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
