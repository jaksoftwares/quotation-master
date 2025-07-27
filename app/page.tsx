'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { Quotation, DashboardStats } from '@/lib/types';
import { getQuotations } from '@/lib/storage';
import { formatCurrency } from '@/lib/currencies';

export default function Dashboard() {
const [stats, setStats] = useState<DashboardStats>({
  total: 0,
  draft: 0,
  sent: 0,
  accepted: 0,
  rejected: 0,
  totalValue: 0,
  monthlyValue: 0,
  averageValue: 0,
  conversionRate: 0,
});

  const [recentQuotations, setRecentQuotations] = useState<Quotation[]>([]);

  useEffect(() => {
    const quotations = getQuotations();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Calculate stats
 const newStats: DashboardStats = {
  total: quotations.length,
  draft: quotations.filter(q => q.status === 'draft').length,
  sent: quotations.filter(q => q.status === 'sent').length,
  accepted: quotations.filter(q => q.status === 'accepted').length,
  rejected: quotations.filter(q => q.status === 'rejected').length,
  totalValue: quotations.reduce((sum, q) => sum + q.total, 0),
  monthlyValue: quotations
    .filter(q => {
      const date = new Date(q.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, q) => sum + q.total, 0),
  averageValue:
    quotations.length > 0
      ? quotations.reduce((sum, q) => sum + q.total, 0) / quotations.length
      : 0,
  conversionRate:
    quotations.length > 0
      ? (quotations.filter(q => q.status === 'accepted').length / quotations.length) * 100
      : 0,
};

    setStats(newStats);
    
    // Get recent quotations (last 5)
    const recent = quotations
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    setRecentQuotations(recent);
  }, []);

  const formatAmount = (amount: number, currency: string = 'USD') => formatCurrency(amount, currency);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    expired: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to Dovepeak Quotation Master</p>
        </div>
        <Link href="/quotations/create">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Quotation
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">All quotations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(stats.monthlyValue)}</div>
            <p className="text-xs text-muted-foreground">Current month value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}% acceptance rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Draft</span>
                </div>
                <Badge variant="secondary">{stats.draft}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-500" />
                  <span>Sent</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">{stats.sent}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  <span>Accepted</span>
                </div>
                <Badge className="bg-green-100 text-green-800">{stats.accepted}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <XCircle className="w-4 h-4 mr-2 text-red-500" />
                  <span>Rejected</span>
                </div>
                <Badge className="bg-red-100 text-red-800">{stats.rejected}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Quotations</CardTitle>
              <Link href="/quotations">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentQuotations.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No quotations yet</p>
                <Link href="/quotations/create">
                  <Button className="mt-2" size="sm">
                    Create Your First Quotation
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentQuotations.map((quotation) => (
                  <div key={quotation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Link 
                        href={`/quotations/${quotation.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {quotation.quotationNumber}
                      </Link>
                      <p className="text-sm text-gray-600">{quotation.clientName}</p>
                      <p className="text-xs text-gray-500">{formatDate(quotation.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatAmount(quotation.total, quotation.currency)}</div>
                  <Badge className={statusColors[quotation.status]}>
                        {quotation.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/quotations/create">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <Plus className="w-6 h-6 mb-2" />
                Create Quotation
              </Button>
            </Link>
            <Link href="/quotations">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <FileText className="w-6 h-6 mb-2" />
                View All Quotations
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <FileText className="w-6 h-6 mb-2" />
                Manage Templates
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}