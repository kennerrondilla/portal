import { useState } from 'react';
import { Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Payment {
  id: string;
  creditor: string;
  amount: number;
  dueDate: string;
  status: 'Upcoming' | 'Paid' | 'Overdue' | 'Scheduled';
  paymentMethod?: string;
  confirmationNumber?: string;
}

const mockPayments: Payment[] = [
  {
    id: '1',
    creditor: 'Chase Credit Card',
    amount: 850,
    dueDate: '2024-12-20',
    status: 'Upcoming',
    paymentMethod: 'Auto-Pay',
  },
  {
    id: '2',
    creditor: 'Medical Center Hospital',
    amount: 450,
    dueDate: '2024-12-25',
    status: 'Scheduled',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: '3',
    creditor: 'Chase Credit Card',
    amount: 850,
    dueDate: '2024-12-01',
    status: 'Paid',
    paymentMethod: 'Auto-Pay',
    confirmationNumber: 'CNF-98234',
  },
  {
    id: '4',
    creditor: 'Utility Company',
    amount: 120,
    dueDate: '2024-12-30',
    status: 'Upcoming',
  },
  {
    id: '5',
    creditor: 'City Clinic',
    amount: 200,
    dueDate: '2025-01-10',
    status: 'Scheduled',
    paymentMethod: 'Credit Card',
  },
  {
    id: '6',
    creditor: 'Discover Card',
    amount: 300,
    dueDate: '2024-11-15',
    status: 'Overdue',
  },
  {
    id: '7',
    creditor: 'Capital One Visa',
    amount: 1200,
    dueDate: '2025-01-15',
    status: 'Upcoming',
  },
  {
    id: '8',
    creditor: 'Medical Center Hospital',
    amount: 450,
    dueDate: '2024-11-28',
    status: 'Paid',
    paymentMethod: 'Bank Transfer',
    confirmationNumber: 'CNF-97123',
  },
];

export function PaymentSchedule() {
  const [payments] = useState<Payment[]>(mockPayments);
  const [filter, setFilter] = useState<string>('All');

  const filteredPayments = filter === 'All' 
    ? payments 
    : payments.filter(p => p.status === filter);

  const sortedPayments = [...filteredPayments].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Overdue':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'Scheduled':
        return <Clock className="w-5 h-5 text-green-600" />;
      case 'Upcoming':
        return <Calendar className="w-5 h-5 text-yellow-600" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Overdue':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Scheduled':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Upcoming':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const upcomingTotal = payments
    .filter(p => p.status === 'Upcoming' || p.status === 'Scheduled')
    .reduce((sum, p) => sum + p.amount, 0);

  const paidTotal = payments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueTotal = payments
    .filter(p => p.status === 'Overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Payment Schedule</h2>
          <p className="text-sm text-gray-500 mt-1">Manage upcoming and past payments</p>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Make Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Upcoming</p>
              <p className="text-xl text-gray-900">${upcomingTotal.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {payments.filter(p => p.status === 'Upcoming' || p.status === 'Scheduled').length} payments scheduled
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Paid This Month</p>
              <p className="text-xl text-gray-900">${paidTotal.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {payments.filter(p => p.status === 'Paid').length} payments completed
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-xl text-gray-900">${overdueTotal.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {payments.filter(p => p.status === 'Overdue').length} payments overdue
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', 'Upcoming', 'Scheduled', 'Paid', 'Overdue'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Payments List */}
      <div className="space-y-3">
        {sortedPayments.map((payment) => {
          const daysUntil = getDaysUntil(payment.dueDate);
          const isUrgent = daysUntil <= 5 && daysUntil >= 0 && payment.status === 'Upcoming';

          return (
            <div
              key={payment.id}
              className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${
                isUrgent ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center">
                    {getStatusIcon(payment.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-gray-900">{payment.creditor}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(payment.dueDate)}
                      </span>
                      {payment.paymentMethod && (
                        <span>• {payment.paymentMethod}</span>
                      )}
                      {payment.confirmationNumber && (
                        <span>• {payment.confirmationNumber}</span>
                      )}
                    </div>

                    {isUrgent && (
                      <div className="mt-2 text-sm text-orange-700">
                        ⚠️ Due in {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right ml-4">
                  <p className="text-xl text-gray-900">${payment.amount.toLocaleString()}</p>
                  {payment.status === 'Upcoming' && (
                    <button className="mt-2 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedPayments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No payments found with the selected filter</p>
        </div>
      )}

      {/* Payment Methods */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h4 className="text-blue-900 mb-3">Payment Methods</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-900">Bank Account ****1234</p>
            <p className="text-xs text-gray-500 mt-1">Primary payment method</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-900">Credit Card ****5678</p>
            <p className="text-xs text-gray-500 mt-1">Backup payment method</p>
          </div>
        </div>
        <button className="mt-4 text-sm text-green-600 hover:text-green-700">
          + Add Payment Method
        </button>
      </div>
    </div>
  );
}