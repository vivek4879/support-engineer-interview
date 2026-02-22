export function isValidRoutingNumber(routingNumber: string | undefined): boolean {
  if (!routingNumber) {
    return false;
  }

  const trimmed = routingNumber.trim();
  return /^\d{9}$/.test(trimmed);
}
