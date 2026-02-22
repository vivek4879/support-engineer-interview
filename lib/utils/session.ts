import { eq } from "drizzle-orm";
import { sessions } from "@/lib/db/schema";

export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

type SessionValues = {
  userId: number;
  token: string;
  expiresAt: string;
};

export function createSessionExpiryIso(now: Date = new Date()): string {
  const expiresAt = new Date(now);
  expiresAt.setSeconds(expiresAt.getSeconds() + SESSION_MAX_AGE_SECONDS);
  return expiresAt.toISOString();
}

export function replaceUserSession(db: any, values: SessionValues): void {
  db.delete(sessions).where(eq(sessions.userId, values.userId)).run();
  db.insert(sessions).values(values).run();
}
