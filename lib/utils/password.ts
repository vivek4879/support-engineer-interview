const COMMON_PASSWORDS = new Set([
  "password",
  "password123",
  "password123!",
  "12345678",
  "qwerty",
  "letmein",
  "admin123",
]);

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 12) {
    return "Password must be at least 12 characters";
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return "Password is too common";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must include a lowercase letter";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must include an uppercase letter";
  }

  if (!/\d/.test(password)) {
    return "Password must include a number";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include a special character";
  }

  return null;
}
