const CARD_MIN_DIGITS = 13;
const CARD_MAX_DIGITS = 19;

export function normalizeCardNumber(input: string): string {
  return input.replace(/[\s-]/g, "");
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
