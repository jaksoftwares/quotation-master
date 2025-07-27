'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QuotationForm from '@/components/QuotationForm';
import { Quotation } from '@/lib/types';
import { getQuotation } from '@/lib/storage';

export default function EditQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    const loadedQuotation = getQuotation(id);
    
    if (!loadedQuotation) {
      router.push('/quotations');
      return;
    }

    setQuotation(loadedQuotation);
    setLoading(false);
  }, [params.id, router]);

  const handleSave = (updatedQuotation: Quotation) => {
    router.push(`/quotations/${updatedQuotation.id}`);
  };

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

  if (!quotation) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quotation not found</h2>
        <button onClick={() => router.push('/quotations')}>
          Back to Quotations
        </button>
      </div>
    );
  }

  return (
    <QuotationForm quotation={quotation} onSave={handleSave} />
  );
}