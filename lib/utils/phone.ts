export function normalizePhoneNumber(value: string): string {
  const trimmed = value.trim();
  const compact = trimmed.replace(/[\s().-]/g, "");

  if (compact.startsWith("00")) {
    return `+${compact.slice(2)}`;
  }

  return compact;
}

export function isValidInternationalPhoneNumber(value: string): boolean {
  const normalized = normalizePhoneNumber(value);
  // E.164-like format: "+" + country code/non-zero start + subscriber digits (max 15 total digits).
  return /^\+[1-9]\d{7,14}$/.test(normalized);
}

export function validateInternationalPhoneNumber(value: string): string | null {
  if (isValidInternationalPhoneNumber(value)) {
    return null;
  }

  return "Use a valid international phone number in +countrycode format (for example, +14155552671)";
}
