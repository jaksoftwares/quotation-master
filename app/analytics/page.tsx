'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Target,
  Users,
  FileText,
  Clock
} from 'lucide-react';
import { Quotation } from '@/lib/types';
import { getQuotations } from '@/lib/storage';

interface MonthlyData {
  month: string;
  quotations: number;
  value: number;
  accepted: number;
}

interface StatusData {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export default function AnalyticsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [timeRange, setTimeRange] = useState('12'); // months
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);

  useEffect(() => {
    const loadedQuotations = getQuotations();
    setQuotations(loadedQuotations);
    generateAnalytics(loadedQuotations, parseInt(timeRange));
  }, [timeRange]);

  const generateAnalytics = (quotations: Quotation[], months: number) => {
    const now = new Date();
    const monthsData: MonthlyData[] = [];

    // Generate monthly data
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthQuotations = quotations.filter(q => {
        const qDate = new Date(q.createdAt);
        return qDate.getMonth() === date.getMonth() && qDate.getFullYear() === date.getFullYear();
      });

      monthsData.push({
        month,
        quotations: monthQuotations.length,
        value: monthQuotations.reduce((sum, q) => sum + q.total, 0),
        accepted: monthQuotations.filter(q => q.status === 'accepted').length,
      });
    }

    setMonthlyData(monthsData);

    // Generate status data
    const statusCounts = {
      draft: quotations.filter(q => q.status === 'draft').length,
      sent: quotations.filter(q => q.status === 'sent').length,
      accepted: quotations.filter(q => q.status === 'accepted').length,
      rejected: quotations.filter(q => q.status === 'rejected').length,
      expired: quotations.filter(q => new Date(q.validUntil) < new Date() && q.status !== 'accepted').length,
    };

    const total = quotations.length || 1;
    const statusDataArray: StatusData[] = [
      { status: 'Draft', count: statusCounts.draft, percentage: (statusCounts.draft / total) * 100, color: 'bg-gray-500' },
      { status: 'Sent', count: statusCounts.sent, percentage: (statusCounts.sent / total) * 100, color: 'bg-blue-500' },
      { status: 'Accepted', count: statusCounts.accepted, percentage: (statusCounts.accepted / total) * 100, color: 'bg-green-500' },
      { status: 'Rejected', count: statusCounts.rejected, percentage: (statusCounts.rejected / total) * 100, color: 'bg-red-500' },
      { status: 'Expired', count: statusCounts.expired, percentage: (statusCounts.expired / total) * 100, color: 'bg-orange-500' },
    ];

    setStatusData(statusDataArray);
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const totalValue = quotations.reduce((sum, q) => sum + q.total, 0);
  const acceptedValue = quotations.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.total, 0);
  const acceptanceRate = quotations.length > 0 ? (quotations.filter(q => q.status === 'accepted').length / quotations.length) * 100 : 0;
  const averageValue = quotations.length > 0 ? totalValue / quotations.length : 0;

  const getMaxValue = (data: MonthlyData[]) => {
    return Math.max(...data.map(d => Math.max(d.quotations, d.value / 1000, d.accepted)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Insights into your quotation performance</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Last 3 months</SelectItem>
            <SelectItem value="6">Last 6 months</SelectItem>
            <SelectItem value="12">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotations.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">All quotations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(acceptedValue)} accepted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageValue)}</div>
            <p className="text-xs text-muted-foreground">Per quotation</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-64 flex items-end justify-between gap-2">
                  {monthlyData.map((data, index) => {
                    const maxValue = getMaxValue(monthlyData);
                    const quotationHeight = maxValue > 0 ? (data.quotations / maxValue) * 100 : 0;
                    const valueHeight = maxValue > 0 ? (data.value / 1000 / maxValue) * 100 : 0;
                    const acceptedHeight = maxValue > 0 ? (data.accepted / maxValue) * 100 : 0;

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                        <div className="w-full h-48 flex items-end justify-center gap-1">
                          <div 
                            className="w-3 bg-blue-500 rounded-t"
                            style={{ height: `${quotationHeight}%` }}
                            title={`${data.quotations} quotations`}
                          />
                          <div 
                            className="w-3 bg-green-500 rounded-t"
                            style={{ height: `${acceptedHeight}%` }}
                            title={`${data.accepted} accepted`}
                          />
                          <div 
                            className="w-3 bg-purple-500 rounded-t"
                            style={{ height: `${valueHeight}%` }}
                            title={formatCurrency(data.value)}
                          />
                        </div>
                        <div className="text-xs text-center">
                          <div className="font-medium">{data.month}</div>
                          <div className="text-gray-500">{data.quotations}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center space-x-6 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    <span>Quotations</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span>Accepted</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                    <span>Value (k)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusData.map((status, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{status.status}</span>
                    <span>{status.count} ({status.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${status.color}`}
                      style={{ width: `${status.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Users className="w-5 h-5 mr-2" />
              Top Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const clientData = quotations.reduce((acc, q) => {
                acc[q.clientName] = (acc[q.clientName] || 0) + q.total;
                return acc;
              }, {} as Record<string, number>);

              const topClients = Object.entries(clientData)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5);

              return topClients.length > 0 ? (
                <div className="space-y-3">
                  {topClients.map(([client, value], index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{client}</span>
                      <span className="text-sm text-gray-600">{formatCurrency(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No client data available</p>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Clock className="w-5 h-5 mr-2" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const sentQuotations = quotations.filter(q => q.status !== 'draft');
              const avgResponseTime = sentQuotations.length > 0 
                ? sentQuotations.reduce((sum, q) => {
                    const created = new Date(q.createdAt);
                    const updated = new Date(q.updatedAt);
                    return sum + (updated.getTime() - created.getTime());
                  }, 0) / sentQuotations.length
                : 0;

              const days = Math.round(avgResponseTime / (1000 * 60 * 60 * 24));

              return (
                <div className="space-y-3">
                  <div className="text-2xl font-bold">{days} days</div>
                  <p className="text-sm text-gray-600">
                    Average time from creation to sending
                  </p>
                  <div className="text-xs text-gray-500">
                    Based on {sentQuotations.length} sent quotations
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calendar className="w-5 h-5 mr-2" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const now = new Date();
              const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
              
              const expiringSoon = quotations.filter(q => {
                const validUntil = new Date(q.validUntil);
                return q.status === 'sent' && validUntil > now && validUntil <= thirtyDaysFromNow;
              });

              return expiringSoon.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-2xl font-bold">{expiringSoon.length}</div>
                  <p className="text-sm text-gray-600">
                    Quotations expiring in 30 days
                  </p>
                  <div className="text-xs text-gray-500">
                    Total value: {formatCurrency(expiringSoon.reduce((sum, q) => sum + q.total, 0))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-sm text-gray-600">
                    No quotations expiring soon
                  </p>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}