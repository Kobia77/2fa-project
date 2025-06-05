import { SessionOptions, sealData, unsealData } from "iron-session";

export interface SessionData {
  userId?: string;
  email?: string;
  isTotpEnabled?: boolean;
  isTotpVerified?: boolean;
  isLoggedIn: boolean;
}

// Create a secure password that is at least 32 characters long
if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is not set. This is required for secure session management."
  );
}

const SECURE_PASSWORD = process.env.JWT_SECRET;
// Validate that the secret is at least 32 characters long
if (SECURE_PASSWORD.length < 32) {
  throw new Error(
    "JWT_SECRET must be at least 32 characters long for security reasons."
  );
}

export const sessionOptions: SessionOptions = {
  password: SECURE_PASSWORD,
  cookieName: "2fa_app_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day in seconds
    path: "/",
  },
};

// This is where we get the session from the request
export async function getSessionData(req: Request): Promise<SessionData> {
  // Use a safer way to get cookies since Request.cookies is not standardized
  const cookieString = req.headers.get("cookie") || "";
  const cookies = parseCookies(cookieString);
  const sessionCookie = cookies[sessionOptions.cookieName];

  if (!sessionCookie) {
    return { isLoggedIn: false };
  }

  try {
    const unsealed = await unsealData<SessionData>(sessionCookie, {
      password: sessionOptions.password,
    });
    return unsealed;
  } catch (error) {
    console.error("Session error:", error);
    return { isLoggedIn: false };
  }
}

// This is where we create a session response
export async function createSessionResponse(
  data: SessionData,
  response: Response
): Promise<Response> {
  const sealed = await sealData(data, {
    password: sessionOptions.password,
  });

  const path = sessionOptions.cookieOptions?.path || "/";
  const httpOnly = sessionOptions.cookieOptions?.httpOnly || true;
  const maxAge = sessionOptions.cookieOptions?.maxAge || 60 * 60 * 24;
  const secure = sessionOptions.cookieOptions?.secure || false;

  response.headers.set(
    "Set-Cookie",
    `${
      sessionOptions.cookieName
    }=${sealed}; Path=${path}; HttpOnly=${httpOnly}; Max-Age=${maxAge}; ${
      secure ? "Secure;" : ""
    } SameSite=Lax`
  );

  return response;
}

// Clear the session cookie
export async function clearSession(response: Response): Promise<Response> {
  const path = sessionOptions.cookieOptions?.path || "/";
  const secure = sessionOptions.cookieOptions?.secure || false;

  response.headers.set(
    "Set-Cookie",
    `${sessionOptions.cookieName}=; Path=${path}; HttpOnly=true; Max-Age=0; ${
      secure ? "Secure;" : ""
    } SameSite=Lax`
  );

  return response;
}

// Helper function to parse cookies
function parseCookies(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  cookieString.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const value = parts.slice(1).join("=").trim();
      cookies[name] = value;
    }
  });

  return cookies;
}
