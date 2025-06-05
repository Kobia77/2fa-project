import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { setCookie, deleteCookie } from "cookies-next";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import type { NextApiResponse } from "next";
import { getSessionData } from "./session";
//test
import { randomBytes, createHash } from "crypto";
import { base32 } from "@scure/base";

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Compare password with hash
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate backup codes for 2FA recovery
export function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate a 8-character alphanumeric code
    const code = randomBytes(4).toString("hex").toUpperCase();
    codes.push(code);
  }
  return codes;
}

// Hash a backup code for storage
export function hashBackupCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

// Verify a backup code
export function verifyBackupCode(
  inputCode: string,
  hashedCodes: string[]
): { isValid: boolean; index: number } {
  const normalizedCode = inputCode.trim().toUpperCase();
  const hashedInput = hashBackupCode(normalizedCode);

  const index = hashedCodes.findIndex((code) => code === hashedInput);
  return {
    isValid: index !== -1,
    index,
  };
}

// JWT Helper Functions
export async function createToken(payload: any, expiresIn = "1d") {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);

  return token;
}

export function setTokenCookie(token: string, res: NextApiResponse) {
  setCookie("token", token, {
    req: res.req,
    res: res,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  });
}

export async function verifyToken(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function verifyJWT(token: string) {
  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

// Verify a session from a request
export async function verifySession(request: Request) {
  const session = await getSessionData(request);
  if (!session.isLoggedIn) {
    return null;
  }
  return session;
}

// TOTP Helper Functions
export function generateTOTPSecret(email: string) {
  try {
    // 1) 160 bits of randomness
    const buf = randomBytes(20);

    // 2) Base32 encode for authenticator apps
    const base32Secret = base32.encode(buf);

    // 3) Build the Key-URI
    const label = encodeURIComponent(`2FA App:${email}`);
    const issuer = encodeURIComponent("SecureKey");
    const otpauth_url =
      `otpauth://totp/${label}` + `?secret=${base32Secret}&issuer=${issuer}`;

    return {
      ascii: buf.toString("ascii"),
      hex: buf.toString("hex"),
      base32: base32Secret,
      otpauth_url, // same name, shorthand property
    };
  } catch (err) {
    console.error("Error generating TOTP secret:", err);
    throw new Error("Failed to generate TOTP secret");
  }
}

export async function generateQRCode(otpauthUrl: string) {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (error) {
    throw new Error("Error generating QR code");
  }
}

export function verifyTOTP(token: string, secret: string) {
  try {
    // Standard TOTP parameters
    const digits = 6;
    const timeStep = 30; // seconds
    const window = 1; // Allow 1 step before and after for clock drift

    // Current time in seconds
    const now = Math.floor(Date.now() / 1000);

    // Check current time window and adjacent windows
    for (let i = -window; i <= window; i++) {
      const timeCounter = Math.floor(now / timeStep + i);
      const generatedToken = generateTOTPToken(secret, timeCounter, digits);

      if (generatedToken === token) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("TOTP verification error:", error);
    return false;
  }
}

// Helper function to generate TOTP token for verification
function generateTOTPToken(
  secret: string,
  counter: number,
  digits: number = 6
): string {
  try {
    // Convert counter to buffer
    const counterBuffer = Buffer.alloc(8);
    for (let i = 0; i < 8; i++) {
      counterBuffer[7 - i] = counter & 0xff;
      counter = counter >> 8;
    }

    // Decode base32 secret
    const secretBytes = base32.decode(secret);

    // Generate HMAC-SHA1
    const hmac = require("crypto").createHmac("sha1", Buffer.from(secretBytes));
    const digest = hmac.update(counterBuffer).digest();

    // Dynamic truncation
    const offset = digest[digest.length - 1] & 0xf;
    const binary =
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff);

    // Generate TOTP code
    const otp = binary % Math.pow(10, digits);

    // Pad with leading zeros if necessary
    return otp.toString().padStart(digits, "0");
  } catch (error) {
    console.error("Error generating TOTP token:", error);
    throw error;
  }
}

// Function to clear the authentication cookie
export function clearTokenCookie(res: NextApiResponse) {
  deleteCookie("token", {
    req: res.req,
    res: res,
    path: "/",
  });
}
