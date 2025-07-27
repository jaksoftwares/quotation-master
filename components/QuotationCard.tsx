'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Download, 
  Mail, 
  Eye,
  Copy 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Quotation, Template } from '@/lib/types';
import { deleteQuotation, saveQuotation } from '@/lib/storage';
import { generatePDF } from '@/lib/pdf';
import { sendQuotationEmail } from '@/lib/email';
import { useToast } from '@/hooks/use-toast';

interface QuotationCardProps {
  quotation: Quotation;
  template: Template | null;
  onUpdate: () => void;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
};

export default function QuotationCard({ quotation, template, onUpdate }: QuotationCardProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quotation?')) return;
    
    setIsDeleting(true);
    try {
      deleteQuotation(quotation.id);
      onUpdate();
      toast({
        title: "Success",
        description: "Quotation deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete quotation",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!template) {
      toast({
        title: "Error",
        description: "Template not found",
        variant: "destructive",
      });
      return;
    }

    generatePDF(quotation, template);
    toast({
      title: "PDF Generated",
      description: "Your quotation PDF is being generated.",
    });
  };

  const handleSendEmail = () => {
    if (!template) {
      toast({
        title: "Error",
        description: "Template not found",
        variant: "destructive",
      });
      return;
    }

    sendQuotationEmail(quotation, template);
    
    // Update status to sent if it was draft
    if (quotation.status === 'draft') {
      const updatedQuotation = { ...quotation, status: 'sent' as const };
      saveQuotation(updatedQuotation);
      onUpdate();
    }
    
    toast({
      title: "Email Client Opened",
      description: "Your default email client has been opened with the quotation details.",
    });
  };

  const handleDuplicate = () => {
    const duplicatedQuotation: Quotation = {
      ...quotation,
      id: crypto.randomUUID(),
      quotationNumber: `${quotation.quotationNumber}-COPY`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveQuotation(duplicatedQuotation);
    onUpdate();
    
    toast({
      title: "Success",
      description: "Quotation duplicated successfully",
    });
  };

  const isExpired = new Date(quotation.validUntil) < new Date() && quotation.status !== 'accepted';

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Link 
              href={`/quotations/${quotation.id}`}
              className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              {quotation.quotationNumber}
            </Link>
            <p className="text-sm text-gray-600">{quotation.clientName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[quotation.status]}>
              {quotation.status}
            </Badge>
            {isExpired && (
              <Badge variant="destructive">Expired</Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/quotations/${quotation.id}`}>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/quotations/${quotation.id}/edit`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDownloadPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSendEmail}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Issue Date:</span>
            <span>{formatDate(quotation.issueDate)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Valid Until:</span>
            <span className={isExpired ? 'text-red-600 font-medium' : ''}>
              {formatDate(quotation.validUntil)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Items:</span>
            <span>{quotation.items.length}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-3">
            <span>Total:</span>
            <span className="text-green-600">{formatCurrency(quotation.total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}