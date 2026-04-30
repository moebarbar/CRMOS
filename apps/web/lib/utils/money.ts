/**
 * Format a money amount with the right currency. Accepts Prisma's Decimal
 * (which serializes via .toString()) plus plain numbers/strings.
 */
export function formatMoney(
  amount: number | string | { toString(): string } | null | undefined,
  currency = 'USD',
  locale?: string,
): string {
  const n = typeof amount === 'number' ? amount : Number(amount?.toString() ?? 0);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}
