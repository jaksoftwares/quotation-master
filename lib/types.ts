export interface Quotation {
  id: string;
  quotationNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress?: string;
  issueDate: string;
  validUntil: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  items: QuotationItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  templateId: string;
  businessProfileId: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  style: 'modern' | 'classic' | 'minimal' | 'corporate' | 'creative';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  layout: 'standard' | 'compact' | 'detailed';
  showLogo: boolean;
  headerStyle: 'simple' | 'banner' | 'sidebar';
  defaultTerms: string;
  defaultNotes: string;
  taxRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite?: string;
  companyLogo?: string;
  taxId?: string;
  registrationNumber?: string;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    routingNumber?: string;
    swiftCode?: string;
  };
  defaultCurrency: string;
  defaultTaxRate: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  total: number;
  draft: number;
  sent: number;
  accepted: number;
  rejected: number;
  totalValue: number;
  monthlyValue: number;
  averageValue: number;
  conversionRate: number;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}

export interface AnalyticsData {
  monthlyRevenue: Array<{ month: string; revenue: number; quotations: number }>;
  statusDistribution: Array<{ status: string; count: number; percentage: number }>;
  topClients: Array<{ name: string; value: number; quotations: number }>;
  recentActivity: Array<{ id: string; type: string; description: string; date: string }>;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  dateRange: { start: string; end: string };
  includeItems: boolean;
  includeAnalytics: boolean;
  template?: string;
}