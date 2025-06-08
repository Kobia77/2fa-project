/**
 * Simple utility functions for testing
 */

// Function to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to check password strength
export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

// Function to generate a random string
export function generateRandomString(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

// Function to format date for display
export function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

describe("Utility Functions Tests", () => {
  // Email validation tests
  describe("isValidEmail", () => {
    test("should return true for valid email addresses", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("name.lastname@domain.co.uk")).toBe(true);
      expect(isValidEmail("user-name@domain.com")).toBe(true);
    });

    test("should return false for invalid email addresses", () => {
      expect(isValidEmail("user@domain")).toBe(false);
      expect(isValidEmail("user@.com")).toBe(false);
      expect(isValidEmail("user@domain.")).toBe(false);
      expect(isValidEmail("user@domain@com")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });
  });

  // Password strength tests
  describe("isStrongPassword", () => {
    test("should return true for strong passwords", () => {
      expect(isStrongPassword("Password123")).toBe(true);
      expect(isStrongPassword("Secure987Pass")).toBe(true);
    });

    test("should return false for weak passwords", () => {
      expect(isStrongPassword("password")).toBe(false); // No uppercase or numbers
      expect(isStrongPassword("PASSWORD123")).toBe(false); // No lowercase
      expect(isStrongPassword("Password")).toBe(false); // No numbers
      expect(isStrongPassword("Pass1")).toBe(false); // Too short
    });
  });

  // Random string generation tests
  describe("generateRandomString", () => {
    test("should generate a string of the specified length", () => {
      const length = 10;
      const randomString = generateRandomString(length);
      expect(randomString.length).toBe(length);
    });

    test("should generate different strings on subsequent calls", () => {
      const string1 = generateRandomString(20);
      const string2 = generateRandomString(20);
      expect(string1).not.toBe(string2);
    });
  });

  // Date formatting tests
  describe("formatDate", () => {
    test("should format date correctly", () => {
      const testDate = new Date(2023, 0, 15); // January 15, 2023
      expect(formatDate(testDate)).toBe("15/01/2023");
    });

    test("should pad single digits with leading zeros", () => {
      const testDate = new Date(2023, 5, 5); // June 5, 2023
      expect(formatDate(testDate)).toBe("05/06/2023");
    });
  });
});
