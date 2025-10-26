import { CreditReservation, reserveCreditsWithCleanup } from "@/lib/credits/credit-reservation";
import { getUserById } from "@/lib/db/queries";
import { env } from "@/lib/env";

const unlimitedEmails = new Set(
  (env.UNLIMITED_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0)
);

class UnlimitedCreditReservation extends CreditReservation {
  constructor(userId: string) {
    super(userId, 1_000_000);
  }
  async finalize(_actualCost: number) {}
  async release() {}
  async cleanup() {}
}

export async function getCreditReservation(userId: string, baseModelCost: number) {
  // Unlimited bypass: if user's email is in UNLIMITED_EMAILS, skip reservations/deductions
  try {
    const user = await getUserById({ userId });
    const email = user?.email?.toLowerCase();
    if (email && unlimitedEmails.has(email)) {
      const reservation = new UnlimitedCreditReservation(userId);
      return { reservation, error: null as string | null };
    }
  } catch {
    // If user lookup fails, fall back to normal credit reservation
  }

  const reservedCredits = await reserveCreditsWithCleanup(userId, baseModelCost, 1);

  if (!reservedCredits.success) {
    return { reservation: null, error: reservedCredits.error };
  }

  return { reservation: reservedCredits.reservation, error: null };
}
