import { Quotation, Template, BusinessProfile } from './types';
import { formatCurrency } from './currencies';

export const sendQuotationEmail = async (
  quotation: Quotation,
  template: Template,
  businessProfile: BusinessProfile,
  customMessage?: string
): Promise<void> => {
  const formatAmount = (amount: number) => formatCurrency(amount, quotation.currency);

  const subject = `Quotation ${quotation.quotationNumber} from ${businessProfile.companyName}`;
  
  const body = `Dear ${quotation.clientName},

Please find below your quotation details:

${customMessage ? `${customMessage}\n\n` : ''}

QUOTATION DETAILS:
- Quotation Number: ${quotation.quotationNumber}
- Issue Date: ${new Date(quotation.issueDate).toLocaleDateString()}
- Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}
- Total Amount: ${formatAmount(quotation.total)}

ITEMS:
${quotation.items.map((item, index) => 
  `${index + 1}. ${item.description} - Qty: ${item.quantity} @ ${formatAmount(item.unitPrice)} = ${formatAmount(item.total)}`
).join('\n')}

Subtotal: ${formatAmount(quotation.subtotal)}
${quotation.discountRate > 0 ? `Discount (${quotation.discountRate}%): -${formatAmount(quotation.discountAmount)}\n` : ''}
Tax (${quotation.taxRate}%): ${formatAmount(quotation.taxAmount)}
TOTAL: ${formatAmount(quotation.total)}

${quotation.notes ? `\nNotes:\n${quotation.notes}\n` : ''}

${quotation.terms ? `\nTerms & Conditions:\n${quotation.terms}\n` : ''}

${businessProfile.bankDetails ? `\nBanking Details:\nBank: ${businessProfile.bankDetails.bankName}\nAccount: ${businessProfile.bankDetails.accountName}\nAccount Number: ${businessProfile.bankDetails.accountNumber}\n` : ''}

Best regards,
${businessProfile.companyName}
${businessProfile.companyPhone}
${businessProfile.companyEmail}

---
This quotation was generated using Dovepeak Quotation Master`;

  // Create mailto link
  const mailtoLink = `mailto:${quotation.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  // Open default email client
  window.open(mailtoLink);
};