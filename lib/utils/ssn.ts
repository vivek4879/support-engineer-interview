import bcrypt from "bcryptjs";

const SSN_HASH_ROUNDS = 12;

export async function hashSsn(ssn: string): Promise<string> {
  return bcrypt.hash(ssn, SSN_HASH_ROUNDS);
}

export async function verifySsnHash(ssn: string, hash: string): Promise<boolean> {
  return bcrypt.compare(ssn, hash);
}
