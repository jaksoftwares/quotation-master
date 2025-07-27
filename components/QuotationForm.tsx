'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, Mail, Download } from 'lucide-react';
import { Quotation, QuotationItem, Template, BusinessProfile } from '@/lib/types';
import { getTemplates, saveQuotation, generateQuotationNumber, getBusinessProfiles, getBusinessProfile } from '@/lib/storage';
import { CURRENCIES, formatCurrency } from '@/lib/currencies';
import { updateQuotationTotals, calculateItemTotal } from '@/lib/calculations';
import { generatePDF } from '@/lib/pdf';
import { sendQuotationEmail } from '@/lib/email';
import { useToast } from '@/hooks/use-toast';

interface QuotationFormProps {
  quotation?: Quotation;
  onSave?: (quotation: Quotation) => void;
}

export default function QuotationForm({ quotation, onSave }: QuotationFormProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [formData, setFormData] = useState<Quotation>(() => {
    if (quotation) return quotation;
    
    return {
      id: crypto.randomUUID(),
      quotationNumber: generateQuotationNumber(),
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      issueDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      items: [{ id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0, total: 0 }],
      subtotal: 0,
      taxRate: 10,
      taxAmount: 0,
      discountRate: 0,
      discountAmount: 0,
      total: 0,
      notes: '',
      terms: '',
      templateId: '',
      businessProfileId: '',
      currency: 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedBusinessProfile, setSelectedBusinessProfile] = useState<BusinessProfile | null>(null);

  useEffect(() => {
    const loadedTemplates = getTemplates();
    const loadedProfiles = getBusinessProfiles();
    setTemplates(loadedTemplates);
    setBusinessProfiles(loadedProfiles);
    
    if (!quotation && loadedTemplates.length > 0) {
      const defaultTemplate = loadedTemplates[0];
      const defaultProfile = loadedProfiles.find(p => p.isDefault) || loadedProfiles[0];
      setFormData(prev => ({
        ...prev,
        templateId: defaultTemplate.id,
        businessProfileId: defaultProfile?.id || '',
        currency: defaultProfile?.defaultCurrency || 'USD',
        taxRate: defaultTemplate.taxRate,
        terms: defaultTemplate.defaultTerms,
        notes: defaultTemplate.defaultNotes,
      }));
      setSelectedTemplate(defaultTemplate);
      setSelectedBusinessProfile(defaultProfile || null);
    } else if (quotation) {
      const template = loadedTemplates.find(t => t.id === quotation.templateId);
      const profile = loadedProfiles.find(p => p.id === quotation.businessProfileId);
      setSelectedTemplate(template || null);
      setSelectedBusinessProfile(profile || null);
    }
  }, [quotation]);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setFormData(prev => ({
        ...prev,
        templateId: template.id,
        taxRate: template.taxRate,
        terms: template.defaultTerms,
        notes: template.defaultNotes,
      }));
    }
  };

  const handleBusinessProfileChange = (profileId: string) => {
    const profile = businessProfiles.find(p => p.id === profileId);
    if (profile) {
      setSelectedBusinessProfile(profile);
      setFormData(prev => ({
        ...prev,
        businessProfileId: profile.id,
        currency: profile.defaultCurrency,
        taxRate: profile.defaultTaxRate,
      }));
    }
  };
  const updateFormData = (updates: Partial<Quotation>) => {
    setFormData(prev => updateQuotationTotals({ ...prev, ...updates }));
  };

  const addItem = () => {
    const newItem: QuotationItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    updateFormData({ items: [...formData.items, newItem] });
  };

  const updateItem = (index: number, updates: Partial<QuotationItem>) => {
    const updatedItems = formData.items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, ...updates };
        updatedItem.total = calculateItemTotal(updatedItem.quantity, updatedItem.unitPrice);
        return updatedItem;
      }
      return item;
    });
    updateFormData({ items: updatedItems });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      updateFormData({ items: updatedItems });
    }
  };

  const handleSave = () => {
    if (!formData.clientName || !formData.clientEmail || !selectedTemplate || !selectedBusinessProfile) {
      toast({
        title: "Missing Information",
        description: "Please fill in client name, email, and select a template and business profile.",
        variant: "destructive",
      });
      return;
    }

    const finalData = updateQuotationTotals(formData);
    saveQuotation(finalData);
    onSave?.(finalData);
    
    toast({
      title: "Success",
      description: "Quotation saved successfully!",
    });
  };

  const handleDownloadPDF = () => {
    if (!selectedTemplate || !selectedBusinessProfile) {
      toast({
        title: "Missing Template",
        description: "Please select a template and business profile first.",
        variant: "destructive",
      });
      return;
    }

    const finalData = updateQuotationTotals(formData);
    generatePDF(finalData, selectedTemplate, selectedBusinessProfile);
    
    toast({
      title: "PDF Generated",
      description: "Your quotation PDF is being generated.",
    });
  };

  const handleSendEmail = () => {
    if (!formData.clientEmail || !selectedTemplate || !selectedBusinessProfile) {
      toast({
        title: "Missing Information",
        description: "Please ensure client email, template, and business profile are selected.",
        variant: "destructive",
      });
      return;
    }

    const finalData = updateQuotationTotals(formData);
    sendQuotationEmail(finalData, selectedTemplate, selectedBusinessProfile);
    
    // Update status to sent
    updateFormData({ status: 'sent' });
    
    toast({
      title: "Email Client Opened",
      description: "Your default email client has been opened with the quotation details.",
    });
  };

  const formatAmount = (amount: number) => formatCurrency(amount, formData.currency);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {quotation ? 'Edit Quotation' : 'Create Quotation'}
        </h1>
        <div className="flex gap-2">
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={handleDownloadPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button onClick={handleSendEmail} variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Quotation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quotationNumber">Quotation Number</Label>
                  <Input
                    id="quotationNumber"
                    value={formData.quotationNumber}
                    onChange={(e) => updateFormData({ quotationNumber: e.target.value })}
                    className="bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="template">Template</Label>
                  <Select value={formData.templateId} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="businessProfile">Business Profile</Label>
                  <Select value={formData.businessProfileId} onValueChange={handleBusinessProfileChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a business profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessProfiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name} - {profile.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => updateFormData({ currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name} ({currency.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => updateFormData({ issueDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => updateFormData({ validUntil: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => updateFormData({ status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => updateFormData({ clientName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Client Email *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => updateFormData({ clientEmail: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clientPhone">Client Phone</Label>
                  <Input
                    id="clientPhone"
                    value={formData.clientPhone}
                    onChange={(e) => updateFormData({ clientPhone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="clientAddress">Client Address</Label>
                <Textarea
                  id="clientAddress"
                  value={formData.clientAddress}
                  onChange={(e) => updateFormData({ clientAddress: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Items</CardTitle>
                <Button onClick={addItem} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg">
                    <div className="md:col-span-5">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, { description: e.target.value })}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                        min="1"
                        step="1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) })}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Total</Label>
                      <div className="flex items-center h-10 px-3 bg-gray-50 border rounded-md">
                        {formatAmount(item.total)}
                      </div>
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length === 1}
                        className="w-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes and Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateFormData({ notes: e.target.value })}
                  rows={3}
                  placeholder="Any additional notes for the client"
                />
              </div>
              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => updateFormData({ terms: e.target.value })}
                  rows={4}
                  placeholder="Payment terms and conditions"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatAmount(formData.subtotal)}</span>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discountRate">Discount %</Label>
                  <Input
                    id="discountRate"
                    type="number"
                    value={formData.discountRate}
                    onChange={(e) => updateFormData({ discountRate: Number(e.target.value) })}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  {formData.discountRate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Discount Amount:</span>
                      <span>-{formatAmount(formData.discountAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax %</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) => updateFormData({ taxRate: Number(e.target.value) })}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <div className="flex justify-between text-sm">
                    <span>Tax Amount:</span>
                    <span>{formatAmount(formData.taxAmount)}</span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatAmount(formData.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Profile Info */}
          {selectedBusinessProfile && (
            <Card>
              <CardHeader>
                <CardTitle>Business Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>{selectedBusinessProfile.companyName}</strong>
                  </div>
                  <div>{selectedBusinessProfile.companyAddress}</div>
                  <div>{selectedBusinessProfile.companyPhone}</div>
                  <div>{selectedBusinessProfile.companyEmail}</div>
                  <div className="pt-2 border-t">
                    <span className="font-medium">Currency: </span>
                    {selectedBusinessProfile.defaultCurrency}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Template Info */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Template Style</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>{selectedTemplate.name}</strong>
                  </div>
                  <div>{selectedTemplate.description}</div>
                  <div className="pt-2 border-t">
                    <span className="font-medium">Style: </span>
                    {selectedTemplate.style}
                  </div>
                  <div>
                    <span className="font-medium">Layout: </span>
                    {selectedTemplate.layout}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}