import 'server-only';
import { and, eq, gte, sql } from 'drizzle-orm';

import { userCredit } from '../db/schema';
import { db } from '../db/client';

/**
 * Ensure a userCredit row exists for the given user.
 *
 * Inserts a userCredit row for `userId` if one does not already exist.
 *
 * @param userId - The identifier of the user to initialize in the userCredit table
 */
async function ensureUserCreditRow(userId: string) {
  await db.insert(userCredit).values({ userId }).onConflictDoNothing();
}

/**
 * Fetches a user's credit totals and available balance, creating a userCredit row if one does not exist.
 *
 * @param userId - The ID of the user whose credit information to retrieve
 * @returns An object with `totalCredits`, `availableCredits`, and `reservedCredits`, or `null` if the user's credit row could not be initialized
 */
export async function getUserCreditsInfo({ userId }: { userId: string }) {
  let creditsRows = await db
    .select({
      credits: userCredit.credits,
      reservedCredits: userCredit.reservedCredits,
    })
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);

  let userInfo = creditsRows[0];
  if (!userInfo) {
    await ensureUserCreditRow(userId);
    creditsRows = await db
      .select({
        credits: userCredit.credits,
        reservedCredits: userCredit.reservedCredits,
      })
      .from(userCredit)
      .where(eq(userCredit.userId, userId))
      .limit(1);
    userInfo = creditsRows[0];
    if (!userInfo) return null;
  }

  return {
    totalCredits: userInfo.credits,
    availableCredits: userInfo.credits - userInfo.reservedCredits,
    reservedCredits: userInfo.reservedCredits,
  };
}

/**
 * Attempt to reserve up to `maxAmount` of a user's available credits, failing if the reservation would be less than `minAmount`.
 *
 * @param userId - The ID of the user whose credits should be reserved
 * @param maxAmount - The maximum number of credits to attempt to reserve
 * @param minAmount - The minimum acceptable number of credits to reserve
 * @returns `{ success: true, reservedAmount }` when reservation succeeds with `reservedAmount` equal to the reserved credits; `{ success: false, error }` when reservation fails with an explanatory `error` message
 */
export async function reserveAvailableCredits({
  userId,
  maxAmount,
  minAmount,
}: {
  userId: string;
  maxAmount: number;
  minAmount: number;
}): Promise<
  | {
      success: true;
      reservedAmount: number;
    }
  | {
      success: false;
      error: string;
    }
> {
  try {
    const userInfo = await getUserCreditsInfo({ userId });
    if (!userInfo) {
      return { success: false, error: 'User credits not initialized' };
    }

    const availableCredits = userInfo.availableCredits;
    const amountToReserve = Math.min(maxAmount, availableCredits);

    if (amountToReserve < minAmount) {
      return { success: false, error: 'Insufficient credits' };
    }

    const result = await db
      .update(userCredit)
      .set({
        reservedCredits: sql`${userCredit.reservedCredits} + ${amountToReserve}`,
      })
      .where(
        and(
          eq(userCredit.userId, userId),
          gte(
            sql`${userCredit.credits} - ${userCredit.reservedCredits}`,
            amountToReserve,
          ),
        ),
      )
      .returning({
        credits: userCredit.credits,
        reservedCredits: userCredit.reservedCredits,
      });

    if (result.length === 0) {
      return { success: false, error: 'Failed to reserve credits' };
    }

    return {
      success: true,
      reservedAmount: amountToReserve,
    };
  } catch (error) {
    console.error('Failed to reserve available credits:', error);
    return { success: false, error: 'Failed to reserve credits' };
  }
}

/**
 * Apply finalized credit changes for a user by deducting used credits and clearing reserved credits.
 *
 * @param userId - The ID of the user whose credits are being finalized
 * @param reservedAmount - Amount previously reserved that should be released (decrement from reserved credits)
 * @param actualAmount - Actual amount to deduct from the user's total credits
 */
export async function finalizeCreditsUsage({
  userId,
  reservedAmount,
  actualAmount,
}: {
  userId: string;
  reservedAmount: number;
  actualAmount: number;
}): Promise<void> {
  await db
    .update(userCredit)
    .set({
      credits: sql`${userCredit.credits} - ${actualAmount}`,
      reservedCredits: sql`${userCredit.reservedCredits} - ${reservedAmount}`,
    })
    .where(eq(userCredit.userId, userId));
}

/**
 * Decreases the reserved credit balance for a user by a specified amount.
 *
 * @param userId - The ID of the user whose reserved credits will be reduced
 * @param amount - The number of credits to release from the user's reserved balance
 */
export async function releaseReservedCredits({
  userId,
  amount,
}: {
  userId: string;
  amount: number;
}): Promise<void> {
  await db
    .update(userCredit)
    .set({
      reservedCredits: sql`${userCredit.reservedCredits} - ${amount}`,
    })
    .where(eq(userCredit.userId, userId));
}