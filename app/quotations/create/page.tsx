'use client';

import { useRouter } from 'next/navigation';
import QuotationForm from '@/components/QuotationForm';
import { Quotation } from '@/lib/types';

export default function CreateQuotationPage() {
  const router = useRouter();

  const handleSave = (quotation: Quotation) => {
    router.push('/quotations');
  };

  return (
    <QuotationForm onSave={handleSave} />
  );
}