import Mailcheck from "mailcheck";

type MailcheckSuggestion = {
  address: string;
  domain: string;
  full: string;
};

// Curated provider list for stronger practical typo suggestions.
const SUGGESTION_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "yahoo.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
];

export function normalizeEmailForLookup(email: string): string {
  return email.trim().toLowerCase();
}

export function getCommonEmailTypoSuggestion(email: string): string | null {
  const trimmedEmail = email.trim();
  if (!trimmedEmail.includes("@")) {
    return null;
  }

  const suggestion = Mailcheck.run({
    email: trimmedEmail,
    domains: SUGGESTION_DOMAINS,
    suggested: (result: MailcheckSuggestion) => result,
    empty: () => null,
  });

  if (!suggestion || typeof suggestion !== "object" || !("full" in suggestion)) {
    return null;
  }

  return typeof suggestion.full === "string" ? suggestion.full : null;
}

export function validateEmailForSignup(email: string): string | null {
  if (email.trim() !== email) {
    return "Email cannot start or end with spaces";
  }

  const suggestion = getCommonEmailTypoSuggestion(email);
  if (suggestion) {
    return `Email domain looks incorrect. Did you mean ${suggestion}?`;
  }

  return null;
}
