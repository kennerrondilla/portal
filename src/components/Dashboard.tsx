import { TrendingDown, DollarSign, Target, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BudgetApprovalNotification } from './BudgetApprovalNotification';
import { useState, useEffect } from 'react';

const debtByType = [
  { name: 'Credit Cards', value: 18500, color: '#3b82f6' },
  { name: 'Medical Bills', value: 12300, color: '#10b981' },
  { name: 'Personal Loans', value: 8900, color: '#f59e0b' },
  { name: 'Other', value: 5530, color: '#6366f1' },
];

const settlementProgress = [
  { month: 'Jan', original: 52000, current: 48000 },
  { month: 'Feb', original: 52000, current: 47000 },
  { month: 'Mar', original: 52000, current: 45230 },
  { month: 'Apr', original: 52000, current: 45230 },
  { month: 'May', original: 52000, current: 45230 },
  { month: 'Jun', original: 52000, current: 45230 },
];

export function Dashboard() {
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    // Delay chart rendering to ensure container is mounted
    const timer = setTimeout(() => setChartsReady(true), 100);
    return () => clearTimeout(timer);
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

  return (
    <div className="space-y-6">
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
              <p className="text-2xl text-gray-900 mt-1">$45,230</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600">13% decrease</span>
            <span className="text-gray-500 ml-1">from original</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Settlement Target</p>
              <p className="text-2xl text-gray-900 mt-1">$27,138</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">40% savings goal</span>
              <span className="text-gray-900">60%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Settlements</p>
              <p className="text-2xl text-gray-900 mt-1">3</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">2 pending approval</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Next Payment</p>
              <p className="text-2xl text-gray-900 mt-1">$850</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Due in 5 days</p>
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
          <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900">Payment processed</p>
              <p className="text-sm text-gray-500">$850.00 paid to Chase Credit Card</p>
              <p className="text-xs text-gray-400 mt-1">2 days ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900">Settlement offer accepted</p>
              <p className="text-sm text-gray-500">Medical Center - 45% reduction approved</p>
              <p className="text-xs text-gray-400 mt-1">5 days ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900">New settlement proposal</p>
              <p className="text-sm text-gray-500">Capital One - Waiting for review</p>
              <p className="text-xs text-gray-400 mt-1">1 week ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}