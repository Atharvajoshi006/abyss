import { db } from '../db/database';
import type { Wallet } from '../types/wallet';

export interface CreateWalletInput {
  username: string;
  displayName?: string;
}

/**
 * Creates and persists a new wallet in IndexedDB.
 * Enforces case-insensitive username uniqueness at both logic and database levels.
 */
export async function createWallet(input: CreateWalletInput): Promise<Wallet> {
  const rawUsername = input.username?.trim() ?? '';

  if (!rawUsername) {
    throw new Error('Username is required and cannot be empty.');
  }

  // Check username format: 2-30 characters, letters, numbers, hyphens, underscores, dots
  if (!/^[a-zA-Z0-9._-]{2,30}$/.test(rawUsername)) {
    throw new Error(
      'Username must be 2 to 30 characters long and contain only letters, numbers, underscores, periods, or dashes.'
    );
  }

  const usernameKey = rawUsername.toLowerCase();
  const displayName = input.displayName?.trim() || undefined;

  // Frontend pre-check for quick feedback
  const existingByUsername = await db.wallets.where('usernameKey').equals(usernameKey).first();
  if (existingByUsername) {
    throw new Error(
      `Username "${rawUsername}" is already taken (usernames are case-insensitive). Please choose another.`
    );
  }

  const newWallet: Wallet = {
    id: `w_${crypto.randomUUID()}`,
    username: rawUsername,
    usernameKey,
    displayName,
    createdAt: new Date().toISOString(),
  };

  try {
    await db.wallets.add(newWallet);
    return newWallet;
  } catch (error: unknown) {
    // Check if Dexie thrown ConstraintError
    if (
      error &&
      typeof error === 'object' &&
      ('name' in error && (error.name === 'ConstraintError' || error.name === 'BulkError'))
    ) {
      throw new Error(
        `Username "${rawUsername}" is already taken (usernames are case-insensitive).`
      );
    }
    throw error;
  }
}

/**
 * Returns all wallets ordered by creation date descending.
 */
export async function getWallets(): Promise<Wallet[]> {
  return await db.wallets.orderBy('createdAt').reverse().toArray();
}

/**
 * Returns a wallet by its unique ID.
 */
export async function getWalletById(id: string): Promise<Wallet | undefined> {
  return await db.wallets.get(id);
}

/**
 * Returns a wallet by normalized username key.
 */
export async function getWalletByUsernameKey(usernameKey: string): Promise<Wallet | undefined> {
  return await db.wallets.where('usernameKey').equals(usernameKey.toLowerCase()).first();
}
