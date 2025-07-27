import { QuotationItem, Quotation } from './types';

export const calculateItemTotal = (quantity: number, unitPrice: number): number => {
  return quantity * unitPrice;
};

export const calculateSubtotal = (items: QuotationItem[]): number => {
  return items.reduce((sum, item) => sum + item.total, 0);
};

export const calculateTaxAmount = (subtotal: number, taxRate: number): number => {
  return (subtotal * taxRate) / 100;
};

export const calculateDiscountAmount = (subtotal: number, discountRate: number): number => {
  return (subtotal * discountRate) / 100;
};

export const calculateTotal = (
  subtotal: number,
  taxAmount: number,
  discountAmount: number
): number => {
  return subtotal + taxAmount - discountAmount;
};

export const updateQuotationTotals = (quotation: Quotation): Quotation => {
  const subtotal = calculateSubtotal(quotation.items);
  const taxAmount = calculateTaxAmount(subtotal, quotation.taxRate);
  const discountAmount = calculateDiscountAmount(subtotal, quotation.discountRate);
  const total = calculateTotal(subtotal, taxAmount, discountAmount);

  return {
    ...quotation,
    subtotal,
    taxAmount,
    discountAmount,
    total,
  };
};