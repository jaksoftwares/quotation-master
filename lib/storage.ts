import { Quotation, Template, BusinessProfile } from './types';

const QUOTATIONS_KEY = 'dovepeak_quotations';
const TEMPLATES_KEY = 'dovepeak_templates';
const BUSINESS_PROFILES_KEY = 'dovepeak_business_profiles';

// Quotation storage functions
export const saveQuotation = (quotation: Quotation): void => {
  const quotations = getQuotations();
  const existingIndex = quotations.findIndex(q => q.id === quotation.id);
  
  if (existingIndex >= 0) {
    quotations[existingIndex] = { ...quotation, updatedAt: new Date().toISOString() };
  } else {
    quotations.push(quotation);
  }
  
  localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(quotations));
};

export const getQuotations = (): Quotation[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(QUOTATIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getQuotation = (id: string): Quotation | null => {
  const quotations = getQuotations();
  return quotations.find(q => q.id === id) || null;
};

export const deleteQuotation = (id: string): void => {
  const quotations = getQuotations().filter(q => q.id !== id);
  localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(quotations));
};

// Template storage functions
export const saveTemplate = (template: Template): void => {
  const templates = getTemplates();
  const existingIndex = templates.findIndex(t => t.id === template.id);
  
  if (existingIndex >= 0) {
    templates[existingIndex] = { ...template, updatedAt: new Date().toISOString() };
  } else {
    templates.push(template);
  }
  
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
};

export const getTemplates = (): Template[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(TEMPLATES_KEY);
  return data ? JSON.parse(data) : getDefaultTemplates();
};

export const getTemplate = (id: string): Template | null => {
  const templates = getTemplates();
  return templates.find(t => t.id === id) || null;
};

export const deleteTemplate = (id: string): void => {
  const templates = getTemplates().filter(t => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
};

// Business Profile storage functions
export const saveBusinessProfile = (profile: BusinessProfile): void => {
  const profiles = getBusinessProfiles();
  const existingIndex = profiles.findIndex(p => p.id === profile.id);
  
  // If this is being set as default, remove default from others
  if (profile.isDefault) {
    profiles.forEach(p => p.isDefault = false);
  }
  
  if (existingIndex >= 0) {
    profiles[existingIndex] = { ...profile, updatedAt: new Date().toISOString() };
  } else {
    profiles.push(profile);
  }
  
  localStorage.setItem(BUSINESS_PROFILES_KEY, JSON.stringify(profiles));
};

export const getBusinessProfiles = (): BusinessProfile[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(BUSINESS_PROFILES_KEY);
  return data ? JSON.parse(data) : getDefaultBusinessProfiles();
};

export const getBusinessProfile = (id: string): BusinessProfile | null => {
  const profiles = getBusinessProfiles();
  return profiles.find(p => p.id === id) || null;
};

export const getDefaultBusinessProfile = (): BusinessProfile | null => {
  const profiles = getBusinessProfiles();
  return profiles.find(p => p.isDefault) || profiles[0] || null;
};

export const deleteBusinessProfile = (id: string): void => {
  const profiles = getBusinessProfiles().filter(p => p.id !== id);
  
  // If we deleted the default profile, make the first remaining one default
  if (profiles.length > 0 && !profiles.some(p => p.isDefault)) {
    profiles[0].isDefault = true;
  }
  
  localStorage.setItem(BUSINESS_PROFILES_KEY, JSON.stringify(profiles));
};
// Initialize default template
const getDefaultTemplates = (): Template[] => {
  const defaultTemplates: Template[] = [
    {
      id: 'modern-template',
      name: 'Modern Professional',
      description: 'Clean, modern design with blue accents',
      style: 'modern',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      fontFamily: 'Inter',
      layout: 'standard',
      showLogo: true,
      headerStyle: 'banner',
      defaultTerms: 'Payment is due within 30 days of acceptance. All prices are subject to change without notice.',
      defaultNotes: 'Thank you for considering our services. We look forward to working with you.',
      taxRate: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'classic-template',
      name: 'Classic Business',
      description: 'Traditional business template with elegant styling',
      style: 'classic',
      primaryColor: '#1F2937',
      secondaryColor: '#374151',
      fontFamily: 'Georgia',
      layout: 'standard',
      showLogo: true,
      headerStyle: 'simple',
      defaultTerms: 'Payment is due within 30 days of acceptance. All prices are subject to change without notice.',
      defaultNotes: 'Thank you for considering our services. We look forward to working with you.',
      taxRate: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'minimal-template',
      name: 'Minimal Clean',
      description: 'Minimalist design focusing on content',
      style: 'minimal',
      primaryColor: '#6B7280',
      secondaryColor: '#9CA3AF',
      fontFamily: 'Arial',
      layout: 'compact',
      showLogo: false,
      headerStyle: 'simple',
      defaultTerms: 'Payment is due within 30 days of acceptance.',
      defaultNotes: 'Thank you for your business.',
      taxRate: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'corporate-template',
      name: 'Corporate Executive',
      description: 'Professional corporate design with detailed layout',
      style: 'corporate',
      primaryColor: '#059669',
      secondaryColor: '#047857',
      fontFamily: 'Arial',
      layout: 'detailed',
      showLogo: true,
      headerStyle: 'sidebar',
      defaultTerms: 'Payment is due within 30 days of acceptance. All prices are subject to change without notice. Late payments may incur additional charges.',
      defaultNotes: 'Thank you for considering our services. We look forward to a successful partnership.',
      taxRate: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'creative-template',
      name: 'Creative Studio',
      description: 'Modern creative template with vibrant colors',
      style: 'creative',
      primaryColor: '#7C3AED',
      secondaryColor: '#5B21B6',
      fontFamily: 'Inter',
      layout: 'standard',
      showLogo: true,
      headerStyle: 'banner',
      defaultTerms: 'Payment is due within 30 days of acceptance. All prices are subject to change without notice.',
      defaultNotes: 'Thank you for choosing us for your creative needs. We look forward to bringing your vision to life.',
      taxRate: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(defaultTemplates));
  return defaultTemplates;
};

// Initialize default business profiles
const getDefaultBusinessProfiles = (): BusinessProfile[] => {
  const defaultProfile: BusinessProfile = {
    id: 'default-profile',
    name: 'Default Business',
    companyName: 'Your Company Name',
    companyAddress: '123 Business Street\nCity, State 12345\nCountry',
    companyPhone: '+1 (555) 123-4567',
    companyEmail: 'contact@yourcompany.com',
    companyWebsite: 'www.yourcompany.com',
    taxId: 'TAX123456789',
    registrationNumber: 'REG123456789',
    bankDetails: {
      bankName: 'Your Bank Name',
      accountName: 'Your Company Name',
      accountNumber: '1234567890',
      routingNumber: '123456789',
      swiftCode: 'BANKCODE',
    },
    defaultCurrency: 'USD',
    defaultTaxRate: 10,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(BUSINESS_PROFILES_KEY, JSON.stringify([defaultProfile]));
  return [defaultProfile];
};

// Utility functions
export const generateQuotationNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const quotations = getQuotations();
  const monthQuotations = quotations.filter(q => 
    q.quotationNumber.startsWith(`QUO-${year}${month}`)
  );
  const nextNumber = (monthQuotations.length + 1).toString().padStart(3, '0');
  return `QUO-${year}${month}-${nextNumber}`;
};

export const exportData = (): string => {
  const data = {
    quotations: getQuotations(),
    templates: getTemplates(),
    businessProfiles: getBusinessProfiles(),
    exportDate: new Date().toISOString(),
    version: '2.0',
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonData: string): void => {
  try {
    const data = JSON.parse(jsonData);
    if (data.quotations) {
      localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(data.quotations));
    }
    if (data.templates) {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(data.templates));
    }
    if (data.businessProfiles) {
      localStorage.setItem(BUSINESS_PROFILES_KEY, JSON.stringify(data.businessProfiles));
    }
  } catch (error) {
    throw new Error('Invalid data format');
  }
};