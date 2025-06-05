import crypto from "crypto";
import User from "@/models/User";
import { sendEmail } from "./email";

// Account lockout configuration
export const accountLockoutConfig = {
  // Maximum number of failed attempts before lockout
  maxFailedAttempts: 5,

  // Lockout duration in minutes (default: 30 minutes)
  lockoutDuration: 30,

  // Whether to use email unlock functionality
  enableEmailUnlock: true,

  // Duration in hours for unlock token validity
  unlockTokenExpiryHours: 24,
};

/**
 * Check if an account is currently locked and handle auto-unlock if lockout period has expired
 * @param user User document to check
 * @returns Boolean indicating if account is locked
 */
export async function isAccountLocked(user: any): Promise<boolean> {
  // If account is not locked, return false immediately
  if (!user.accountLocked) {
    return false;
  }

  // Check if the lockout period has expired
  if (user.accountLockedUntil && new Date() > user.accountLockedUntil) {
    // Auto-unlock the account
    user.accountLocked = false;
    user.accountLockedUntil = undefined;
    user.failedLoginAttempts = 0;
    await user.save();
    return false;
  }

  // Account is still locked
  return true;
}

/**
 * Handle failed authentication attempt and lock account if needed
 * @param user User document to update
 * @returns Boolean indicating if account is now locked
 */
export async function handleFailedAttempt(user: any): Promise<boolean> {
  // Increment failed attempts
  user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

  // Check if account should be locked
  if (user.failedLoginAttempts >= accountLockoutConfig.maxFailedAttempts) {
    // Lock account
    user.accountLocked = true;

    // Set lock expiration
    const lockoutUntil = new Date();
    lockoutUntil.setMinutes(
      lockoutUntil.getMinutes() + accountLockoutConfig.lockoutDuration
    );
    user.accountLockedUntil = lockoutUntil;

    // Generate unlock token if email unlock is enabled
    if (accountLockoutConfig.enableEmailUnlock) {
      user.unlockToken = crypto.randomBytes(32).toString("hex");

      // Send unlock email (implement this part according to your email system)
      await sendUnlockEmail(user);
    }
  }

  await user.save();
  return user.accountLocked;
}

/**
 * Reset failed attempts counter after successful login
 * @param user User document to update
 */
export async function resetFailedAttempts(user: any): Promise<void> {
  if (user.failedLoginAttempts > 0) {
    user.failedLoginAttempts = 0;
    await user.save();
  }
}

/**
 * Send account unlock email to user
 * @param user User document with email and unlock token
 */
async function sendUnlockEmail(user: any): Promise<void> {
  // Create unlock URL
  const unlockUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/account/unlock?token=${user.unlockToken}`;

  // Generate email content
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Account Locked</h2>
      <p>Your account has been temporarily locked due to too many failed login attempts.</p>
      <p>The account will automatically unlock after ${accountLockoutConfig.lockoutDuration} minutes, or you can unlock it immediately by clicking the button below:</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${unlockUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Unlock My Account
        </a>
      </div>
      <p>If you did not attempt to log in, we recommend changing your password immediately after unlocking your account.</p>
      <p>This unlock link will expire in ${accountLockoutConfig.unlockTokenExpiryHours} hours.</p>
    </div>
  `;

  // Send email
  await sendEmail({
    to: user.email,
    subject: "Account Locked - Unlock Your Account",
    html,
  });
}
