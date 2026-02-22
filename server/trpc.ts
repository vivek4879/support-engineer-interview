import { initTRPC, TRPCError } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionTokenFromRequest } from "@/lib/utils/cookies";
import { deleteSessionByToken, isSessionUsable } from "@/lib/utils/session";

function clearSessionCookie(res: any) {
  if ("setHeader" in res) {
    res.setHeader("Set-Cookie", `session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
  } else {
    (res as Headers).set("Set-Cookie", `session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
  }
}

export async function createContext(opts: CreateNextContextOptions | FetchCreateContextFnOptions) {
  // Handle different adapter types
  let req: any;
  let res: any;

  if ("req" in opts && "res" in opts) {
    // Next.js adapter
    req = opts.req;
    res = opts.res;
  } else {
    // Fetch adapter
    req = opts.req;
    res = opts.resHeaders;
  }

  const token = getSessionTokenFromRequest(req as any);

  let user = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "temporary-secret-for-interview") as {
        userId: number;
      };

      const session = await db.select().from(sessions).where(eq(sessions.token, token)).get();

      if (session && isSessionUsable(session.expiresAt)) {
        user = await db.select().from(users).where(eq(users.id, decoded.userId)).get();
      } else if (session) {
        // Revoke near-expiry/expired session to avoid ambiguous auth state.
        deleteSessionByToken(db, token);
        clearSessionCookie(res);
      }
    } catch (error) {
      // Invalid token
    }
  }

  return {
    user,
    req,
    res,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
