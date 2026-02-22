import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc";
import { db } from "@/lib/db";
import { accounts, transactions } from "@/lib/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { isValidFundingAmount, normalizeCurrencyAmount } from "@/lib/utils/money";
import { requireEntity } from "@/lib/utils/guards";
import { escapeHtml } from "@/lib/utils/sanitize";
import { generateSecureAccountNumber } from "@/lib/utils/account-number";
import { isValidCardNumber } from "@/lib/utils/card";
import { isValidRoutingNumber } from "@/lib/utils/bank";
import { sortTransactionsNewestFirst } from "@/lib/utils/transactions";

export const accountRouter = router({
  createAccount: protectedProcedure
    .input(
      z.object({
        accountType: z.enum(["checking", "savings"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const account = db.transaction((tx) => {
        // Check if user already has an account of this type
        const existingAccount = tx
          .select()
          .from(accounts)
          .where(and(eq(accounts.userId, ctx.user.id), eq(accounts.accountType, input.accountType)))
          .get();

        if (existingAccount) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `You already have a ${input.accountType} account`,
          });
        }

        let accountNumber;
        let isUnique = false;

        // Generate unique account number
        while (!isUnique) {
          accountNumber = generateSecureAccountNumber();
          const existing = tx.select().from(accounts).where(eq(accounts.accountNumber, accountNumber)).get();
          isUnique = !existing;
        }

        const createdAccount = tx
          .insert(accounts)
          .values({
            userId: ctx.user.id,
            accountNumber: accountNumber!,
            accountType: input.accountType,
            balance: 0,
            status: "active",
          })
          .returning()
          .get();

        return requireEntity(createdAccount, "Failed to create account");
      });

      return account;
    }),

  getAccounts: protectedProcedure.query(async ({ ctx }) => {
    const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, ctx.user.id));

    return userAccounts;
  }),

  fundAccount: protectedProcedure
    .input(
      z
        .object({
          accountId: z.number(),
          amount: z.number().finite().refine(isValidFundingAmount, {
            message: "Amount must be at least $0.01",
          }),
          fundingSource: z.object({
            type: z.enum(["card", "bank"]),
            accountNumber: z.string(),
            routingNumber: z.string().optional(),
          }),
        })
        .superRefine((input, refinementCtx) => {
          if (input.fundingSource.type === "card" && !isValidCardNumber(input.fundingSource.accountNumber)) {
            refinementCtx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["fundingSource", "accountNumber"],
              message: "Invalid card number",
            });
          }

          if (input.fundingSource.type === "bank") {
            const routingNumber = input.fundingSource.routingNumber?.trim();
            if (!routingNumber) {
              refinementCtx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["fundingSource", "routingNumber"],
                message: "Routing number is required for bank transfers",
              });
              return;
            }

            if (!isValidRoutingNumber(routingNumber)) {
              refinementCtx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["fundingSource", "routingNumber"],
                message: "Routing number must be 9 digits",
              });
            }
          }
        })
    )
    .mutation(async ({ input, ctx }) => {
      const amount = normalizeCurrencyAmount(input.amount);
      if (!isValidFundingAmount(amount)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Amount must be at least $0.01",
        });
      }

      const result = db.transaction((tx) => {
        // Verify account belongs to user
        const account = tx
          .select()
          .from(accounts)
          .where(and(eq(accounts.id, input.accountId), eq(accounts.userId, ctx.user.id)))
          .get();

        if (!account) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Account not found",
          });
        }

        if (account.status !== "active") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Account is not active",
          });
        }

        // Create transaction and balance update in the same DB transaction.
        const transaction = tx
          .insert(transactions)
          .values({
            accountId: input.accountId,
            type: "deposit",
            amount,
            description: `Funding from ${input.fundingSource.type}`,
            status: "completed",
            processedAt: new Date().toISOString(),
          })
          .returning()
          .get();

        tx
          .update(accounts)
          .set({
            balance: sql`ROUND(${accounts.balance} + ${amount}, 2)`,
          })
          .where(eq(accounts.id, input.accountId))
          .run();

        const updatedAccount = tx
          .select({ balance: accounts.balance })
          .from(accounts)
          .where(eq(accounts.id, input.accountId))
          .get();

        if (!updatedAccount) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update account balance",
          });
        }

        return {
          transaction,
          newBalance: updatedAccount.balance,
        };
      });

      return result;
    }),

  getTransactions: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Verify account belongs to user
      const account = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.id, input.accountId), eq(accounts.userId, ctx.user.id)))
        .get();

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      }

      const accountTransactions = await db
        .select()
        .from(transactions)
        .where(eq(transactions.accountId, input.accountId))
        .orderBy(desc(transactions.createdAt), desc(transactions.id));

      const formattedTransactions = accountTransactions.map((transaction) => ({
        ...transaction,
        description: transaction.description ? escapeHtml(transaction.description) : transaction.description,
        accountType: account.accountType,
      }));

      return sortTransactionsNewestFirst(formattedTransactions);
    }),
});
