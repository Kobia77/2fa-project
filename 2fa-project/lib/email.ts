import nodemailer from "nodemailer";

// In development environment - using Ethereal for testing emails
// In production environment - a real email service should be used
export async function createTestAccount() {
  const testAccount = await nodemailer.createTestAccount();

  return {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  };
}

// Function to create a transporter for sending emails
export async function getEmailTransporter() {
  // In production environment use real credentials
  if (
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  ) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // In development environment we'll use Ethereal (allows viewing sent emails in a virtual mailbox)
    const testConfig = await createTestAccount();
    return nodemailer.createTransport(testConfig);
  }
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: EmailData) {
  try {
    const transporter = await getEmailTransporter();

    const senderEmail =
      from || process.env.EMAIL_FROM || "noreply@securekey.com";

    const info = await transporter.sendMail({
      from: senderEmail,
      to,
      subject,
      html,
    });

    console.log("Email sent: %s", info.messageId);

    // In development environment with Ethereal, print link to view the sent email
    if (info.messageId && info.response.includes("ethereal")) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info),
      };
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export function generateVerificationEmailHtml(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const verificationLink = `${baseUrl}/verify-email?token=${token}`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Verify Your Email Address</h2>
      <p>Thank you for signing up! Please verify your email address by clicking the button below.</p>
      <div style="margin: 30px 0;">
        <a href="${verificationLink}" 
           style="background-color: #0070f3; color: white; padding: 12px 20px; 
                  text-decoration: none; border-radius: 5px; font-weight: bold;">
          Verify Email
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #666;">
        <a href="${verificationLink}">${verificationLink}</a>
      </p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create an account, you can safely ignore this email.</p>
    </div>
  `;
}

export function generateVerificationToken(): string {
  // Generate a random string of 32 characters
  return require("crypto").randomBytes(16).toString("hex");
}
