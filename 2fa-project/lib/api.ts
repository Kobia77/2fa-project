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
    throw new Error(data.error || "Something went wrong");
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

export async function verifyTOTP(token: string) {
  return fetchApi("/api/auth/verify-totp", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

// Backup Code API functions
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
