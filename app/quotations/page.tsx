'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import { Quotation, Template } from '@/lib/types';
import { getQuotations, getTemplates } from '@/lib/storage';
import QuotationCard from '@/components/QuotationCard';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterQuotations();
  }, [quotations, searchTerm, statusFilter, sortBy]);

  const loadData = () => {
    const loadedQuotations = getQuotations();
    const loadedTemplates = getTemplates();
    setQuotations(loadedQuotations);
    setTemplates(loadedTemplates);
  };

  const filterQuotations = () => {
    let filtered = [...quotations];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'amount-high':
          return b.total - a.total;
        case 'amount-low':
          return a.total - b.total;
        case 'client':
          return a.clientName.localeCompare(b.clientName);
        default:
          return 0;
      }
    });

    setFilteredQuotations(filtered);
  };

  const getTemplate = (templateId: string) => {
    return templates.find(t => t.id === templateId) || null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
          <p className="text-gray-600">Manage all your quotations</p>
        </div>
        <Link href="/quotations/create">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Quotation
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search quotations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
            <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
            <SelectItem value="client">Client Name</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center text-sm text-gray-600">
          <Filter className="w-4 h-4 mr-2" />
          {filteredQuotations.length} of {quotations.length} quotations
        </div>
      </div>

      {/* Quotations Grid */}
      {filteredQuotations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Plus className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {quotations.length === 0 ? 'No quotations yet' : 'No quotations match your filters'}
          </h3>
          <p className="text-gray-600 mb-4">
            {quotations.length === 0 
              ? 'Create your first quotation to get started.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {quotations.length === 0 && (
            <Link href="/quotations/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Quotation
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuotations.map((quotation) => (
            <QuotationCard
              key={quotation.id}
              quotation={quotation}
              template={getTemplate(quotation.templateId)}
              onUpdate={loadData}
            />
          ))}
        </div>
      )}
    </div>
  );
}