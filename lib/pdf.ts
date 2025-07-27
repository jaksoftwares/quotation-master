import { Quotation, Template, BusinessProfile } from './types';
import { formatCurrency } from './currencies';

export const generatePDF = async (quotation: Quotation, template: Template, businessProfile: BusinessProfile): Promise<void> => {
  // Create a new window for PDF generation
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const formatAmount = (amount: number) => formatCurrency(amount, quotation.currency);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Quotation ${quotation.quotationNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: '${template.fontFamily}', sans-serif; 
          line-height: 1.6; 
          color: #333;
          background: white;
        }
        .container { 
          max-width: 800px; 
          margin: 0 auto; 
          padding: 40px 20px;
        }
        .header-banner { 
          display: flex; 
          justify-content: space-between; 
          align-items: start;
          margin-bottom: 40px;
          border-bottom: 3px solid ${template.primaryColor};
          padding-bottom: 20px;
        }
        .header-sidebar {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 40px;
          margin-bottom: 40px;
        }
        .header-simple {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e2e8f0;
        }
        .company-info h1 { 
          color: ${template.primaryColor}; 
          font-size: 28px; 
          margin-bottom: 10px;
        }
        .company-info p { 
          margin: 5px 0; 
          color: #666;
        }
        .quotation-info { 
          text-align: right;
        }
        .quotation-info h2 { 
          color: ${template.primaryColor}; 
          font-size: 24px; 
          margin-bottom: 10px;
        }
        .logo {
          max-width: 150px;
          max-height: 80px;
          margin-bottom: 20px;
        }
        .client-section { 
          margin: 40px 0;
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
        }
        .client-section h3 { 
          color: ${template.primaryColor}; 
          margin-bottom: 15px;
          font-size: 18px;
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 30px 0;
        }
        .items-table th, .items-table td { 
          padding: 12px; 
          text-align: left; 
          border-bottom: 1px solid #e2e8f0;
        }
        .items-table th { 
          background-color: ${template.primaryColor}; 
          color: white; 
          font-weight: 600;
        }
        .items-table tr:nth-child(even) { 
          background-color: #f8fafc;
        }
        .totals { 
          float: right; 
          width: 300px; 
          margin: 30px 0;
        }
        .totals table { 
          width: 100%; 
          border-collapse: collapse;
        }
        .totals td { 
          padding: 8px 12px; 
          border-bottom: 1px solid #e2e8f0;
        }
        .totals .total-row { 
          background-color: ${template.primaryColor}; 
          color: white; 
          font-weight: bold;
          font-size: 18px;
        }
        .notes, .terms { 
          clear: both; 
          margin: 30px 0; 
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
        }
        .notes h4, .terms h4 { 
          color: ${template.primaryColor}; 
          margin-bottom: 10px;
        }
        .bank-details {
          margin-top: 30px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
        }
        .bank-details h4 {
          color: ${template.primaryColor};
          margin-bottom: 10px;
        }
        .footer { 
          margin-top: 50px; 
          text-align: center; 
          color: #666; 
          font-size: 14px;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: white;
        }
        .status-draft { background-color: #64748b; }
        .status-sent { background-color: #3B82F6; }
        .status-accepted { background-color: #10B981; }
        .status-rejected { background-color: #EF4444; }
        .status-expired { background-color: #F59E0B; }
        .compact-layout .container { padding: 20px; }
        .compact-layout .client-section { margin: 20px 0; padding: 15px; }
        .detailed-layout .additional-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 30px 0;
        }
        @media print {
          body { print-color-adjust: exact; }
          .container { padding: 20px; }
        }
      </style>
    </head>
    <body class="${template.layout}-layout">
      <div class="container">
        <div class="header-${template.headerStyle}">
          <div class="company-info">
            ${template.showLogo && businessProfile.companyLogo ? `<img src="${businessProfile.companyLogo}" alt="Logo" class="logo" />` : ''}
            <h1>${businessProfile.companyName}</h1>
            <p>${businessProfile.companyAddress.replace(/\n/g, '<br>')}</p>
            <p>Phone: ${businessProfile.companyPhone}</p>
            <p>Email: ${businessProfile.companyEmail}</p>
            ${businessProfile.companyWebsite ? `<p>Website: ${businessProfile.companyWebsite}</p>` : ''}
            ${businessProfile.taxId ? `<p>Tax ID: ${businessProfile.taxId}</p>` : ''}
          </div>
          <div class="quotation-info">
            <h2>QUOTATION</h2>
            <p><strong>Number:</strong> ${quotation.quotationNumber}</p>
            <p><strong>Date:</strong> ${formatDate(quotation.issueDate)}</p>
            <p><strong>Valid Until:</strong> ${formatDate(quotation.validUntil)}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${quotation.status}">${quotation.status}</span></p>
          </div>
        </div>

        <div class="client-section">
          <h3>Bill To:</h3>
          <p><strong>${quotation.clientName}</strong></p>
          <p>${quotation.clientEmail}</p>
          ${quotation.clientPhone ? `<p>${quotation.clientPhone}</p>` : ''}
          ${quotation.clientAddress ? `<p>${quotation.clientAddress}</p>` : ''}
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${quotation.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${formatAmount(item.unitPrice)}</td>
                <td>${formatAmount(item.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;">${formatAmount(quotation.subtotal)}</td>
            </tr>
            ${quotation.discountRate > 0 ? `
            <tr>
              <td>Discount (${quotation.discountRate}%):</td>
              <td style="text-align: right;">-${formatAmount(quotation.discountAmount)}</td>
            </tr>
            ` : ''}
            <tr>
              <td>Tax (${quotation.taxRate}%):</td>
              <td style="text-align: right;">${formatAmount(quotation.taxAmount)}</td>
            </tr>
            <tr class="total-row">
              <td>TOTAL:</td>
              <td style="text-align: right;">${formatAmount(quotation.total)}</td>
            </tr>
          </table>
        </div>

        ${quotation.notes ? `
        <div class="notes">
          <h4>Notes:</h4>
          <p>${quotation.notes}</p>
        </div>
        ` : ''}

        ${quotation.terms ? `
        <div class="terms">
          <h4>Terms & Conditions:</h4>
          <p>${quotation.terms}</p>
        </div>
        ` : ''}

        ${businessProfile.bankDetails && template.layout === 'detailed' ? `
        <div class="bank-details">
          <h4>Banking Details:</h4>
          <p><strong>Bank:</strong> ${businessProfile.bankDetails.bankName}</p>
          <p><strong>Account Name:</strong> ${businessProfile.bankDetails.accountName}</p>
          <p><strong>Account Number:</strong> ${businessProfile.bankDetails.accountNumber}</p>
          ${businessProfile.bankDetails.routingNumber ? `<p><strong>Routing Number:</strong> ${businessProfile.bankDetails.routingNumber}</p>` : ''}
          ${businessProfile.bankDetails.swiftCode ? `<p><strong>SWIFT Code:</strong> ${businessProfile.bankDetails.swiftCode}</p>` : ''}
        </div>
        ` : ''}

        <div class="footer">
          <p>Generated by Dovepeak Quotation Master</p>
          <p>Thank you for your business!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 100);
  };
};