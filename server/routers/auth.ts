import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../trpc";
import { db } from "@/lib/db";
import { users, sessions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { hashSsn } from "@/lib/utils/ssn";
import { getSessionTokenFromRequest } from "@/lib/utils/cookies";
import {
  buildLogoutResponse,
  createSessionExpiryIso,
  deleteSessionByToken,
  replaceUserSession,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/utils/session";
import { validatePasswordStrength } from "@/lib/utils/password";
import { validateDateOfBirth } from "@/lib/utils/date-of-birth";
import { normalizeEmailForLookup, validateEmailForSignup } from "@/lib/utils/email";
import { isValidUsStateCode } from "@/lib/utils/state";

export const authRouter = router({
  signup: publicProcedure
    .input(
      z
        .object({
          email: z.string().email(),
          password: z.string(),
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          phoneNumber: z.string().regex(/^\+?\d{10,15}$/),
          dateOfBirth: z.string(),
          ssn: z.string().regex(/^\d{9}$/),
          address: z.string().min(1),
          city: z.string().min(1),
          state: z.string().length(2).toUpperCase(),
          zipCode: z.string().regex(/^\d{5}$/),
        })
        .superRefine((input, ctx) => {
          const passwordIssue = validatePasswordStrength(input.password);
          if (passwordIssue) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["password"],
              message: passwordIssue,
            });
          }

          const dateOfBirthIssue = validateDateOfBirth(input.dateOfBirth);
          if (dateOfBirthIssue) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["dateOfBirth"],
              message: dateOfBirthIssue,
            });
          }

          const emailIssue = validateEmailForSignup(input.email);
          if (emailIssue) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["email"],
              message: emailIssue,
            });
          }

          if (!isValidUsStateCode(input.state)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["state"],
              message: "Use a valid US state code (for example, CA or NY)",
            });
          }
        })
    )
    .mutation(async ({ input, ctx }) => {
      const lookupEmail = normalizeEmailForLookup(input.email);
      const existingUser = await db
        .select()
        .from(users)
        .where(sql`lower(${users.email}) = ${lookupEmail}`)
        .get();

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const hashedSsn = await hashSsn(input.ssn);

      await db.insert(users).values({
        ...input,
        password: hashedPassword,
        ssn: hashedSsn,
      });

      // Fetch the created user
      const user = await db.select().from(users).where(eq(users.email, input.email)).get();

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }

      // Create session
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "temporary-secret-for-interview", {
        expiresIn: "7d",
      });

      const expiresAt = createSessionExpiryIso();
      db.transaction((tx) => {
        replaceUserSession(tx, {
          userId: user.id,
          token,
          expiresAt,
        });
      });

      // Set cookie
      if ("setHeader" in ctx.res) {
        ctx.res.setHeader(
          "Set-Cookie",
          `session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}`
        );
      } else {
        (ctx.res as Headers).set(
          "Set-Cookie",
          `session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}`
        );
      }

      const { password: _password, ssn: _ssn, ...safeUser } = user;
      return { user: safeUser, token };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const lookupEmail = normalizeEmailForLookup(input.email);
      const user = await db
        .select()
        .from(users)
        .where(sql`lower(${users.email}) = ${lookupEmail}`)
        .get();

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const validPassword = await bcrypt.compare(input.password, user.password);

      if (!validPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "temporary-secret-for-interview", {
        expiresIn: "7d",
      });

      const expiresAt = createSessionExpiryIso();
      db.transaction((tx) => {
        replaceUserSession(tx, {
          userId: user.id,
          token,
          expiresAt,
        });
      });

      if ("setHeader" in ctx.res) {
        ctx.res.setHeader(
          "Set-Cookie",
          `session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}`
        );
      } else {
        (ctx.res as Headers).set(
          "Set-Cookie",
          `session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}`
        );
      }

      const { password: _password, ssn: _ssn, ...safeUser } = user;
      return { user: safeUser, token };
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    const token = getSessionTokenFromRequest(ctx.req as any);
    const deletedSessions = token ? deleteSessionByToken(db, token) : 0;

    if ("setHeader" in ctx.res) {
      ctx.res.setHeader("Set-Cookie", `session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
    } else {
      (ctx.res as Headers).set("Set-Cookie", `session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
    }

    return buildLogoutResponse(deletedSessions);
  }),
});
