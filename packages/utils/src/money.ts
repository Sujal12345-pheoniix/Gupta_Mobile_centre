/**
 * Money utility for Gupta Mobile Centre
 *
 * Business rule #12: Monetary values must use integer minor units or a decimal type;
 * never JavaScript floating-point arithmetic for money.
 *
 * PostgreSQL Decimal is used for persistence (e.g., Decimal(12,2)).
 * This utility provides safe formatting and basic operations.
 */

/**
 * Format a monetary value as a string with 2 decimal places.
 * Input: value in minor units (e.g., 79900 = ₹799.00)
 * Output: formatted string (e.g., "799.00")
 */
export function formatMoney(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (Number.isNaN(num)) {
    return '0.00';
  }

  // Use toLocaleString for consistent formatting
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Parse a monetary string to minor units (multiply by 100).
 * Input: "799.00"
 * Output: 79900
 */
export function toMinorUnits(value: string | number): number {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (Number.isNaN(num)) {
    return 0;
  }

  // Round to avoid floating-point issues
  return Math.round(num * 100);
}

/**
 * Add two monetary values in minor units.
 * Both inputs are expected in minor units (e.g., 79900, 50000).
 */
export function addMoney(a: number, b: number): number {
  return a + b;
}

/**
 * Subtract two monetary values in minor units.
 */
export function subtractMoney(a: number, b: number): number {
  return a - b;
}

/**
 * Multiply a monetary value by a scalar (for tax calculations etc.).
 * Input: value in minor units, multiplier (e.g., 1.18 for 18% tax)
 * Output: result in minor units (rounded)
 */
export function multiplyMoney(value: number, multiplier: number): number {
  return Math.round(value * multiplier);
}

/**
 * Divide a monetary value by a divisor.
 * Input: value in minor units, divisor
 * Output: result in minor units (rounded)
 */
export function divideMoney(value: number, divisor: number): number {
  if (divisor === 0) {
    throw new Error('Division by zero in monetary calculation');
  }
  return Math.round(value / divisor);
}

/**
 * Calculate tax amount from subtotal and tax rate.
 * taxRate: percentage (e.g., 18 for 18%)
 * Returns tax amount in minor units.
 */
export function calculateTax(subtotalMinorUnits: number, taxRate: number): number {
  // taxRate is a percentage, e.g., 18 means 18%
  const rate = taxRate / 100;
  return Math.round(subtotalMinorUnits * rate);
}

/**
 * Calculate total from subtotal and tax amount (both in minor units).
 */
export function calculateTotal(subtotalMinorUnits: number, taxAmountMinorUnits: number): number {
  return subtotalMinorUnits + taxAmountMinorUnits;
}

/**
 * Calculate discount amount from subtotal and discount percentage.
 * discountPercent: e.g., 10 for 10%
 * Returns discount amount in minor units.
 */
export function calculateDiscount(subtotalMinorUnits: number, discountPercent: number): number {
  return Math.round(subtotalMinorUnits * (discountPercent / 100));
}