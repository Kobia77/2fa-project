// Helper function for API requests
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || "Something went wrong");
    // Attach the full error response as cause so it can be accessed in catch blocks
    error.cause = data;
    throw error;
  }

  return data;
}

// Auth API functions
export async function register(email: string, password: string) {
  return fetchApi("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string) {
  return fetchApi("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  return fetchApi("/api/auth/logout", {
    method: "POST",
  });
}

export async function resendVerificationEmail() {
  return fetchApi("/api/auth/resend-verification", {
    method: "POST",
  });
}

export async function getUserData() {
  return fetchApi("/api/user/profile", {
    method: "GET",
  });
}

export async function getSetup2FAData() {
  return fetchApi("/api/auth/setup-2fa", {
    method: "GET",
  });
}

export async function enableTOTP(token: string) {
  return fetchApi("/api/auth/setup-2fa", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function disable2FA() {
  return fetchApi("/api/auth/disable-2fa", {
    method: "POST",
  });
}

export async function verifyTOTP(token: string) {
  return fetchApi("/api/auth/verify-totp", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

// Backup Code API functions
// Generate backup codes
export async function verifyBackupCode(backupCode: string) {
  return fetchApi("/api/auth/verify-backup-code", {
    method: "POST",
    body: JSON.stringify({ backupCode }),
  });
}

export async function deleteAccount() {
  return fetchApi("/api/user/delete-account", {
    method: "DELETE",
  });
}

// Account lockout API functions
export async function unlockAccount(token: string) {
  return fetchApi("/api/auth/unlock-account", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}
