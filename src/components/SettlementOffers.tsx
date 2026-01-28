import { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, TrendingDown } from 'lucide-react';

interface Settlement {
  id: string;
  creditor: string;
  originalDebt: number;
  settlementOffer: number;
  savings: number;
  savingsPercent: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Counter Offer' | 'Completed';
  deadline?: string;
  notes?: string;
  proposedDate: string;
}

const mockSettlements: Settlement[] = [
  {
    id: '1',
    creditor: 'Capital One Visa',
    originalDebt: 8900,
    settlementOffer: 5340,
    savings: 3560,
    savingsPercent: 40,
    status: 'Pending',
    deadline: '12/25/2024',
    proposedDate: '12/08/2024',
    notes: 'Offered 40% reduction with lump sum payment',
  },
  {
    id: '2',
    creditor: 'Medical Center Hospital',
    originalDebt: 15200,
    settlementOffer: 8360,
    savings: 6840,
    savingsPercent: 45,
    status: 'Approved',
    proposedDate: '12/01/2024',
    notes: 'Approved 45% reduction, payment plan available',
  },
  {
    id: '3',
    creditor: 'Discover Card',
    originalDebt: 6600,
    settlementOffer: 4620,
    savings: 1980,
    savingsPercent: 30,
    status: 'Counter Offer',
    deadline: '12/20/2024',
    proposedDate: '11/28/2024',
    notes: 'Counter offered 25% reduction instead of requested 30%',
  },
  {
    id: '4',
    creditor: 'Chase Credit Card',
    originalDebt: 12500,
    settlementOffer: 7500,
    savings: 5000,
    savingsPercent: 40,
    status: 'Rejected',
    proposedDate: '11/15/2024',
    notes: 'Rejected initial offer, can resubmit after 30 days',
  },
];

export function SettlementOffers() {
  const [settlements] = useState<Settlement[]>(mockSettlements);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Counter Offer':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Counter Offer':
        return 'bg-orange-100 text-orange-700';
      case 'Completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Settlement Offers</h2>
          <p className="text-sm text-gray-500 mt-1">Track negotiation progress with creditors</p>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          New Settlement
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <p className="text-sm opacity-90">Total Potential Savings</p>
          <p className="text-3xl mt-2">$17,380</p>
          <p className="text-sm mt-2 opacity-90">Across all settlements</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <p className="text-sm opacity-90">Average Reduction</p>
          <p className="text-3xl mt-2">38.75%</p>
          <p className="text-sm mt-2 opacity-90">From original debt</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <p className="text-sm opacity-90">Pending Offers</p>
          <p className="text-3xl mt-2">2</p>
          <p className="text-sm mt-2 opacity-90">Awaiting response</p>
        </div>
      </div>

      {/* Settlements List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settlements.map((settlement) => (
          <div
            key={settlement.id}
            onClick={() => setSelectedSettlement(settlement)}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-gray-900 mb-2">{settlement.creditor}</h3>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(settlement.status)}`}>
                  {getStatusIcon(settlement.status)}
                  {settlement.status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Proposed</p>
                <p className="text-sm text-gray-900">{settlement.proposedDate}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Original Debt</span>
                <span className="text-gray-900">${settlement.originalDebt.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Settlement Offer</span>
                <span className="text-gray-900">${settlement.settlementOffer.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-900">Potential Savings</span>
                <div className="text-right">
                  <span className="text-green-600">${settlement.savings.toLocaleString()}</span>
                  <span className="text-xs text-green-600 ml-2">({settlement.savingsPercent}%)</span>
                </div>
              </div>
            </div>

            {settlement.deadline && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">
                  Response deadline: {settlement.deadline}
                </span>
              </div>
            )}

            {settlement.notes && (
              <p className="mt-4 text-sm text-gray-600 italic">{settlement.notes}</p>
            )}

            {settlement.status === 'Approved' && (
              <button className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Proceed to Payment
              </button>
            )}

            {settlement.status === 'Counter Offer' && (
              <div className="mt-4 flex gap-2">
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Accept Counter
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Revise Offer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Settlement Tips */}
      <div className="bg-green-50 rounded-lg border border-green-200 p-6">
        <div className="flex items-start gap-3">
          <TrendingDown className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-green-900 mb-2">Settlement Tips</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Start negotiations at 40-50% of the original debt for best results</li>
              <li>• Get all settlement agreements in writing before making payments</li>
              <li>• Keep detailed records of all communications with creditors</li>
              <li>• Consider lump sum payments for better negotiation leverage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}