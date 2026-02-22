const CARD_MIN_DIGITS = 13;
const CARD_MAX_DIGITS = 19;

export function normalizeCardNumber(input: string): string {
  return input.replace(/[\s-]/g, "");
}

export type CardType = "visa" | "mastercard" | "amex" | "discover" | "jcb" | "diners" | "unionpay";

function hasPrefixInRange(cardNumber: string, prefixLength: number, min: number, max: number): boolean {
  if (cardNumber.length < prefixLength) {
    return false;
  }

  const prefix = Number(cardNumber.slice(0, prefixLength));
  return prefix >= min && prefix <= max;
}

export function detectCardType(input: string): CardType | null {
  const cardNumber = normalizeCardNumber(input);

  if (!/^\d+$/.test(cardNumber)) {
    return null;
  }

  const length = cardNumber.length;

  if ((length === 13 || length === 16 || length === 19) && cardNumber.startsWith("4")) {
    return "visa";
  }

  if (length === 15 && (cardNumber.startsWith("34") || cardNumber.startsWith("37"))) {
    return "amex";
  }

  if (length === 16) {
    if (hasPrefixInRange(cardNumber, 2, 51, 55) || hasPrefixInRange(cardNumber, 4, 2221, 2720)) {
      return "mastercard";
    }

    if (
      cardNumber.startsWith("6011") ||
      cardNumber.startsWith("65") ||
      hasPrefixInRange(cardNumber, 3, 644, 649) ||
      hasPrefixInRange(cardNumber, 6, 622126, 622925)
    ) {
      return "discover";
    }
  }

  if (length === 19) {
    if (cardNumber.startsWith("6011") || cardNumber.startsWith("65") || hasPrefixInRange(cardNumber, 3, 644, 649)) {
      return "discover";
    }
  }

  if (length >= 16 && length <= 19 && hasPrefixInRange(cardNumber, 4, 3528, 3589)) {
    return "jcb";
  }

  if (length === 14 && (hasPrefixInRange(cardNumber, 3, 300, 305) || cardNumber.startsWith("36") || cardNumber.startsWith("38") || cardNumber.startsWith("39"))) {
    return "diners";
  }

  if (length >= 16 && length <= 19 && cardNumber.startsWith("62")) {
    return "unionpay";
  }

  return null;
}

export function isValidCardNumber(input: string): boolean {
  if (!/^[\d\s-]+$/.test(input)) {
    return false;
  }

  const cardNumber = normalizeCardNumber(input);
  if (!/^\d+$/.test(cardNumber)) {
    return false;
  }

  if (cardNumber.length < CARD_MIN_DIGITS || cardNumber.length > CARD_MAX_DIGITS) {
    return false;
  }

  if (!detectCardType(cardNumber)) {
    return false;
  }

  // Reject trivially repeated digits (e.g., 0000000000000000) even if Luhn would pass.
  if (/^(\d)\1+$/.test(cardNumber)) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = cardNumber.length - 1; i >= 0; i -= 1) {
    let digit = Number(cardNumber[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}
