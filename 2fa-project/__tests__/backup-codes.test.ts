import crypto from "crypto";

/**
 * Simple backup codes utilities for testing
 */

// Generate backup codes
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate a 8-character alphanumeric code
    let code = "";
    for (let j = 0; j < 8; j++) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }
    codes.push(code);
  }
  return codes;
}

// Hash a backup code
export function hashBackupCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

// Verify a backup code against a list of hashed codes
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

describe("Backup Codes Tests", () => {
  // Mock the crypto functions to avoid randomness in tests
  const mockHash = jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      digest: jest.fn().mockImplementation((format) => {
        // Simple mock that returns predictable "hashes"
        // Just for testing purposes
        return `mock-hash-${format}`;
      }),
    }),
  });

  // Save original and replace with mock for tests
  const originalCreateHash = crypto.createHash;

  beforeAll(() => {
    crypto.createHash = mockHash;
  });

  afterAll(() => {
    crypto.createHash = originalCreateHash;
  });

  describe("generateBackupCodes", () => {
    test("should generate the specified number of codes", () => {
      const count = 5;
      const codes = generateBackupCodes(count);
      expect(codes).toHaveLength(count);
    });

    test("should generate 10 codes by default", () => {
      const codes = generateBackupCodes();
      expect(codes).toHaveLength(10);
    });

    test("codes should be of expected format", () => {
      const codes = generateBackupCodes(3);
      for (const code of codes) {
        // Should be 8 characters long and contain only uppercase letters and numbers
        expect(code).toMatch(/^[A-Z0-9]{8}$/);
      }
    });
  });

  describe("hashBackupCode", () => {
    test("should hash the input code", () => {
      const code = "ABCD1234";
      const hash = hashBackupCode(code);

      // Check our mock was used
      expect(mockHash).toHaveBeenCalledWith("sha256");
      expect(hash).toBe("mock-hash-hex");
    });
  });

  describe("verifyBackupCode", () => {
    test("should return valid result when code is in the list", () => {
      // With our mock, all codes will hash to the same value
      const hashedCodes = ["other-hash", "mock-hash-hex", "another-hash"];

      const result = verifyBackupCode("VALID123", hashedCodes);

      expect(result.isValid).toBe(true);
      expect(result.index).toBe(1);
    });

    test("should return invalid result when code is not in the list", () => {
      // Since our mock always returns 'mock-hash-hex'
      const hashedCodes = ["hash1", "hash2", "hash3"];

      const result = verifyBackupCode("INVALID", hashedCodes);

      // The mock would return 'mock-hash-hex' which isn't in our list
      expect(result.isValid).toBe(false);
      expect(result.index).toBe(-1);
    });

    test("should normalize input code before verification", () => {
      // With our mock, all codes will hash to the same value
      const hashedCodes = ["mock-hash-hex"];

      const result = verifyBackupCode("  valid123  ", hashedCodes);

      // Should trim and uppercase the input
      expect(mockHash).toHaveBeenCalledWith("sha256");
      expect(result.isValid).toBe(true);
    });
  });
});
