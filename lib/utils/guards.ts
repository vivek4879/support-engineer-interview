import { TRPCError } from "@trpc/server";

export function requireEntity<T>(entity: T | null | undefined, message: string): T {
  if (!entity) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message,
    });
  }

  return entity;
}
