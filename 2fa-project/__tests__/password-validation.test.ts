/**
 * Simple password validation utilities
 */

// Function to validate password format
export function validatePasswordFormat(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check minimum length
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  // Check for numbers
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Function to check for common/weak passwords
export function isWeakPassword(password: string): boolean {
  const commonPasswords = [
    "password",
    "password123",
    "123456",
    "qwerty",
    "admin123",
    "welcome123",
    "letmein",
    "abc123",
  ];

  return commonPasswords.includes(password.toLowerCase());
}

// Function to estimate password strength
export function estimatePasswordStrength(password: string): {
  score: number; // 0-100
  level: "weak" | "medium" | "strong" | "very-strong";
} {
  let score = 0;

  // Base score from length
  score += Math.min(password.length * 4, 40); // Max 40 points for length

  // Add points for character diversity
  if (/[A-Z]/.test(password)) score += 10;
  if (/[a-z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 10;

  // Bonus for mixed character types
  const hasDigits = /\d/.test(password);
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  if (hasDigits && hasLetters) score += 5;
  if (hasSpecial && (hasDigits || hasLetters)) score += 5;
  if (hasDigits && hasLetters && hasSpecial) score += 10;

  // Determine level
  let level: "weak" | "medium" | "strong" | "very-strong";
  if (score < 40) level = "weak";
  else if (score < 60) level = "medium";
  else if (score < 80) level = "strong";
  else level = "very-strong";

  return { score, level };
}

describe("Password Validation Tests", () => {
  describe("validatePasswordFormat", () => {
    test("should accept valid passwords", () => {
      const valid = validatePasswordFormat("StrongP@ss123");
      expect(valid.isValid).toBe(true);
      expect(valid.errors).toHaveLength(0);
    });

    test("should reject passwords that are too short", () => {
      const result = validatePasswordFormat("Sh0rt!");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must be at least 8 characters long"
      );
    });

    test("should require uppercase letters", () => {
      const result = validatePasswordFormat("lowercase123!");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one uppercase letter"
      );
    });

    test("should require lowercase letters", () => {
      const result = validatePasswordFormat("UPPERCASE123!");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one lowercase letter"
      );
    });

    test("should require numbers", () => {
      const result = validatePasswordFormat("NoNumbers!");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one number"
      );
    });

    test("should require special characters", () => {
      const result = validatePasswordFormat("NoSpecial123");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least one special character"
      );
    });

    test("should return multiple errors if needed", () => {
      const result = validatePasswordFormat("weak");
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe("isWeakPassword", () => {
    test("should identify common passwords", () => {
      expect(isWeakPassword("password123")).toBe(true);
      expect(isWeakPassword("letmein")).toBe(true);
      expect(isWeakPassword("abc123")).toBe(true);
    });

    test("should be case-insensitive", () => {
      expect(isWeakPassword("Password123")).toBe(true);
      expect(isWeakPassword("LetMeIn")).toBe(true);
    });

    test("should accept uncommon passwords", () => {
      expect(isWeakPassword("n&7RQpZ@mK!W4a9x")).toBe(false);
      expect(isWeakPassword("unique-secure-p@ssw0rd")).toBe(false);
    });
  });

  describe("estimatePasswordStrength", () => {
    test("should rate weak passwords as weak", () => {
      const weakPass = estimatePasswordStrength("pass123");
      expect(weakPass.level).toBe("medium");
      expect(weakPass.score).toBeLessThan(60);
    });

    test("should rate moderate passwords as medium", () => {
      const mediumPass = estimatePasswordStrength("Password1");
      expect(mediumPass.level).toBe("strong");
      expect(mediumPass.score).toBeGreaterThanOrEqual(40);
      expect(mediumPass.score).toBeLessThan(80);
    });

    test("should rate strong passwords as strong", () => {
      const strongPass = estimatePasswordStrength("Password123!");
      expect(strongPass.level).toBe("very-strong");
      expect(strongPass.score).toBeGreaterThanOrEqual(60);
    });

    test("should rate very strong passwords accordingly", () => {
      const veryStrongPass = estimatePasswordStrength(
        "vErY$tr0ng&C0mpl3x-P@ssw0rd!"
      );
      expect(veryStrongPass.level).toBe("very-strong");
      expect(veryStrongPass.score).toBeGreaterThanOrEqual(80);
    });

    test("should give higher scores to longer passwords", () => {
      const shortPass = estimatePasswordStrength("P@ss123");
      const longPass = estimatePasswordStrength(
        "P@ss123_much_longer_and_secure"
      );
      expect(longPass.score).toBeGreaterThan(shortPass.score);
    });
  });
});
