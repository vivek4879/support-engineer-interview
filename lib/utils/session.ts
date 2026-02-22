import { eq } from "drizzle-orm";
import { sessions } from "@/lib/db/schema";

export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
export const SESSION_EXPIRY_BUFFER_MS = 60_000;

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

export function isSessionUsable(expiresAtIso: string, now: Date = new Date()): boolean {
  const remainingMs = new Date(expiresAtIso).getTime() - now.getTime();
  return remainingMs > SESSION_EXPIRY_BUFFER_MS;
}

export function replaceUserSession(db: any, values: SessionValues): void {
  db.delete(sessions).where(eq(sessions.userId, values.userId)).run();
  db.insert(sessions).values(values).run();
}

export function deleteSessionByToken(db: any, token: string): number {
  const result = db.delete(sessions).where(eq(sessions.token, token)).run();
  return typeof result?.changes === "number" ? result.changes : 0;
}

export function buildLogoutResponse(deletedSessions: number): { success: boolean; message: string } {
  if (deletedSessions > 0) {
    return {
      success: true,
      message: "Logged out successfully",
    };
  }

  return {
    success: false,
    message: "No active session",
  };
}
