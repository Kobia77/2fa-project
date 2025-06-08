import * as accountLockout from "../lib/accountLockout";
import User from "../models/User";

// Define a mock user type that includes all properties we need
interface MockUser {
  email: string;
  failedLoginAttempts?: number;
  accountLocked?: boolean;
  accountLockedUntil?: Date;
  unlockToken?: string;
  save: jest.Mock;
}

// Mock the User model
jest.mock("../models/User", () => ({
  findOne: jest.fn(),
  updateOne: jest.fn(),
}));

describe("Account Lockout Functions Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("handleFailedAttempt", () => {
    test("should increment failed login attempts for a user", async () => {
      // Mock data
      const mockUser: MockUser = {
        email: "test@example.com",
        failedLoginAttempts: 1,
        save: jest.fn().mockResolvedValue(true),
      };

      // Call the function
      await accountLockout.handleFailedAttempt(mockUser);

      // Assertions
      expect(mockUser.failedLoginAttempts).toBe(2);
      expect(mockUser.save).toHaveBeenCalled();
    });

    test("should lock account after max failed attempts", async () => {
      // Mock data - user at max attempts threshold
      const mockUser: MockUser = {
        email: "test@example.com",
        failedLoginAttempts:
          accountLockout.accountLockoutConfig.maxFailedAttempts - 1,
        save: jest.fn().mockResolvedValue(true),
      };

      // Call the function
      const result = await accountLockout.handleFailedAttempt(mockUser);

      // Assertions
      expect(result).toBe(true);
      expect(mockUser.accountLocked).toBe(true);
      expect(mockUser.accountLockedUntil).toBeInstanceOf(Date);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe("resetFailedAttempts", () => {
    test("should reset failed login attempts for a user", async () => {
      // Mock data
      const mockUser: MockUser = {
        email: "test@example.com",
        failedLoginAttempts: 3,
        save: jest.fn().mockResolvedValue(true),
      };

      // Call the function
      await accountLockout.resetFailedAttempts(mockUser);

      // Assertions
      expect(mockUser.failedLoginAttempts).toBe(0);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe("isAccountLocked", () => {
    test("should return true when account is locked", async () => {
      // Mock a locked account
      const mockUser: MockUser = {
        email: "test@example.com",
        accountLocked: true,
        accountLockedUntil: new Date(Date.now() + 60000), // 1 minute in the future
        save: jest.fn().mockResolvedValue(true),
      };

      // Call the function
      const result = await accountLockout.isAccountLocked(mockUser);

      // Assertions
      expect(result).toBe(true);
    });

    test("should return false when account is not locked", async () => {
      // Mock an unlocked account
      const mockUser: MockUser = {
        email: "test@example.com",
        accountLocked: false,
        save: jest.fn().mockResolvedValue(true),
      };

      // Call the function
      const result = await accountLockout.isAccountLocked(mockUser);

      // Assertions
      expect(result).toBe(false);
    });

    test("should auto-unlock when lock period has expired", async () => {
      // Mock an account with expired lock
      const mockUser: MockUser = {
        email: "test@example.com",
        accountLocked: true,
        accountLockedUntil: new Date(Date.now() - 60000), // 1 minute in the past
        failedLoginAttempts: 5,
        save: jest.fn().mockResolvedValue(true),
      };

      // Call the function
      const result = await accountLockout.isAccountLocked(mockUser);

      // Assertions
      expect(result).toBe(false);
      expect(mockUser.accountLocked).toBe(false);
      expect(mockUser.accountLockedUntil).toBeUndefined();
      expect(mockUser.failedLoginAttempts).toBe(0);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });
});
