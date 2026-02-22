const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MINIMUM_AGE_YEARS = 18;

function toUtcDateParts(date: Date): { year: number; month: number; day: number } {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

export function validateDateOfBirth(dateOfBirth: string, now: Date = new Date()): string | null {
  if (!DATE_ONLY_REGEX.test(dateOfBirth)) {
    return "Date of birth must be in YYYY-MM-DD format";
  }

  const [yearString, monthString, dayString] = dateOfBirth.split("-");
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);

  const dob = new Date(Date.UTC(year, month - 1, day));
  const dobParts = toUtcDateParts(dob);

  if (dobParts.year !== year || dobParts.month !== month || dobParts.day !== day) {
    return "Date of birth is invalid";
  }

  const nowParts = toUtcDateParts(now);

  const dobStamp = Date.UTC(year, month - 1, day);
  const todayStamp = Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day);
  if (dobStamp > todayStamp) {
    return "Date of birth cannot be in the future";
  }

  let age = nowParts.year - year;
  if (nowParts.month < month || (nowParts.month === month && nowParts.day < day)) {
    age -= 1;
  }

  if (age < MINIMUM_AGE_YEARS) {
    return "You must be at least 18 years old";
  }

  return null;
}
