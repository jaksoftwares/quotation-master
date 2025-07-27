'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Download, 
  Mail, 
  ArrowLeft,
  Building,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Quotation, Template } from '@/lib/types';
import { getQuotation, getTemplate } from '@/lib/storage';
import { generatePDF } from '@/lib/pdf';
import { sendQuotationEmail } from '@/lib/email';
import { useToast } from '@/hooks/use-toast';

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
};

export default function QuotationViewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    const loadedQuotation = getQuotation(id);
    
    if (!loadedQuotation) {
      router.push('/quotations');
      return;
    }

    const loadedTemplate = getTemplate(loadedQuotation.templateId);
    setQuotation(loadedQuotation);
    setTemplate(loadedTemplate);
    setLoading(false);
  }, [params.id, router]);

  const handleDownloadPDF = () => {
    if (!quotation || !template) return;
    
    generatePDF(quotation, template);
    toast({
      title: "PDF Generated",
      description: "Your quotation PDF is being generated.",
    });
  };

  const handleSendEmail = () => {
    if (!quotation || !template) return;
    
    sendQuotationEmail(quotation, template);
    toast({
      title: "Email Client Opened",
      description: "Your default email client has been opened with the quotation details.",
    });
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quotation...</p>
        </div>
      </div>
    );
  }

  if (!quotation || !template) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quotation not found</h2>
        <Link href="/quotations">
          <Button>Back to Quotations</Button>
        </Link>
      </div>
    );
  }

  const isExpired = new Date(quotation.validUntil) < new Date() && quotation.status !== 'accepted';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/quotations">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quotation.quotationNumber}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={statusColors[quotation.status]}>
                {quotation.status}
              </Badge>
              {isExpired && (
                <Badge variant="destructive">Expired</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/quotations/${quotation.id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
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
          {/* Quotation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Quotation Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Issue Date</label>
                  <p className="text-lg">{formatDate(quotation.issueDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Valid Until</label>
                  <p className={`text-lg ${isExpired ? 'text-red-600 font-medium' : ''}`}>
                    {formatDate(quotation.validUntil)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-lg">{formatDate(quotation.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-lg">{formatDate(quotation.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-lg font-medium">{quotation.clientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg">{quotation.clientEmail}</p>
                </div>
                {quotation.clientPhone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-lg">{quotation.clientPhone}</p>
                  </div>
                )}
                {quotation.clientAddress && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-lg whitespace-pre-line">{quotation.clientAddress}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Description</th>
                      <th className="text-right py-2 font-medium">Qty</th>
                      <th className="text-right py-2 font-medium">Unit Price</th>
                      <th className="text-right py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.items.map((item, index) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3">{item.description}</td>
                        <td className="text-right py-3">{item.quantity}</td>
                        <td className="text-right py-3">{formatCurrency(item.unitPrice)}</td>
                        <td className="text-right py-3 font-medium">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notes and Terms */}
          {(quotation.notes || quotation.terms) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quotation.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-line">{quotation.notes}</p>
                  </CardContent>
                </Card>
              )}
              {quotation.terms && (
                <Card>
                  <CardHeader>
                    <CardTitle>Terms & Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-line">{quotation.terms}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(quotation.subtotal)}</span>
                </div>
                {quotation.discountRate > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({quotation.discountRate}%):</span>
                    <span>-{formatCurrency(quotation.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax ({quotation.taxRate}%):</span>
                  <span>{formatCurrency(quotation.taxAmount)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatCurrency(quotation.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="font-medium">{template.companyName}</div>
                <div className="text-gray-600">{template.companyAddress}</div>
                <div className="text-gray-600">{template.companyPhone}</div>
                <div className="text-gray-600">{template.companyEmail}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}