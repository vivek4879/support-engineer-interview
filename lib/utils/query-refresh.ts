export type FundingQueryInvalidators = {
  invalidateAccounts: () => Promise<unknown>;
  invalidateTransactions: (accountId: number) => Promise<unknown>;
};

export async function refreshQueriesAfterFunding(
  invalidators: FundingQueryInvalidators,
  accountId: number
): Promise<void> {
  await Promise.all([
    invalidators.invalidateAccounts(),
    invalidators.invalidateTransactions(accountId),
  ]);
}
