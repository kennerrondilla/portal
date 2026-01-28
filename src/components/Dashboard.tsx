import { TrendingDown, DollarSign, Target, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BudgetApprovalNotification } from './BudgetApprovalNotification';
import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6'];

interface DashboardResponse {
  totalDebt: number;
  totalOriginal: number;
  settlementTarget: number;
  activeSettlements: number;
  debtByType: { name: string; value: number }[];
  settlementProgress: { month: string; original: number; current: number }[];
  nextPayment: { amount: number; dueDate: string; creditor: string } | null;
  recentActivity: { type: string; creditor: string; amount: number; date: string | null }[];
}

export function Dashboard() {
  const [chartsReady, setChartsReady] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Delay chart rendering to ensure container is mounted
    const timer = setTimeout(() => setChartsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await apiFetch<DashboardResponse>('/dashboard');
        setDashboardData(data);
      } catch (error) {
        setLoadError('Unable to load dashboard data.');
      }
    };

    loadDashboard();
  }, []);

  const handleMessageClick = () => {
    // Track when user clicks/views the message
    console.log('Budget approval message viewed at:', new Date().toISOString());
    // In production, this would update the backend
  };

  const handleResponse = (approvedSettlements: string[], budgetAmount: number) => {
    // Track when user responds
    console.log('User responded with:', { approvedSettlements, budgetAmount, timestamp: new Date().toISOString() });
    // In production, this would update the backend
  };

  const debtByType = (dashboardData?.debtByType || []).map((entry, index) => ({
    ...entry,
    color: chartColors[index % chartColors.length],
  }));

  const settlementProgress = dashboardData?.settlementProgress || [];
  const totalDebt = dashboardData?.totalDebt || 0;
  const totalOriginal = dashboardData?.totalOriginal || 0;
  const settlementTarget = dashboardData?.settlementTarget || 0;
  const activeSettlements = dashboardData?.activeSettlements || 0;
  const nextPayment = dashboardData?.nextPayment;
  const recentActivity = dashboardData?.recentActivity || [];
  const debtReduction = totalOriginal > 0 ? Math.round(((totalOriginal - totalDebt) / totalOriginal) * 100) : 0;
  const savingsPercent = totalDebt > 0 ? Math.round((settlementTarget / totalDebt) * 100) : 0;

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {/* Budget Approval Notification */}
      <BudgetApprovalNotification 
        onMessageClick={handleMessageClick}
        onResponse={handleResponse}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Debt</p>
              <p className="text-2xl text-gray-900 mt-1">${totalDebt.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600">{debtReduction}% decrease</span>
            <span className="text-gray-500 ml-1">from original</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Settlement Target</p>
              <p className="text-2xl text-gray-900 mt-1">${Math.round(settlementTarget).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">40% savings goal</span>
              <span className="text-gray-900">{savingsPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${savingsPercent}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Settlements</p>
              <p className="text-2xl text-gray-900 mt-1">{activeSettlements}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Keep an eye on new approvals</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Next Payment</p>
              <p className="text-2xl text-gray-900 mt-1">
                {nextPayment ? `$${nextPayment.amount.toLocaleString()}` : 'N/A'}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            {nextPayment?.dueDate ? `Due ${nextPayment.dueDate}` : 'No upcoming payments'}
          </p>
        </div>
      </div>

      {/* Charts */}
      {chartsReady && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Debt Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-6">Debt Breakdown by Type</h3>
            <div style={{ width: '100%', height: '256px', minWidth: 0, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={debtByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {debtByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {debtByType.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Settlement Progress */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900 mb-6">Settlement Progress</h3>
            <div style={{ width: '100%', height: '256px', minWidth: 0, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={settlementProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="original" fill="#e5e7eb" name="Original Debt" />
                  <Bar dataKey="current" fill="#3b82f6" name="Current Debt" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity yet.</p>
          ) : (
            recentActivity.map((activity, index) => {
              const isPayment = activity.type === 'payment';
              return (
                <div
                  key={`${activity.type}-${activity.creditor}-${index}`}
                  className={`flex items-start gap-4 ${index < recentActivity.length - 1 ? 'pb-4 border-b border-gray-100' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isPayment ? 'bg-green-100' : 'bg-purple-100'}`}>
                    {isPayment ? (
                      <DollarSign className="w-5 h-5 text-green-600" />
                    ) : (
                      <Target className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">
                      {isPayment ? 'Payment scheduled' : 'Settlement commitment signed'}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${activity.amount.toLocaleString()} {isPayment ? 'to' : 'for'} {activity.creditor}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{activity.date || 'Recently'}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
