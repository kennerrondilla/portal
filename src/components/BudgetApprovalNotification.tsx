import { useState } from 'react';
import { MessageCircle, CheckCircle, DollarSign, X, Clock } from 'lucide-react';

interface BudgetApprovalMessage {
  id: string;
  sentDate: string;
  viewedDate?: string;
  respondedDate?: string;
  proposedSettlements: {
    debtId: string;
    creditor: string;
    originalAmount: number;
    settlementAmount: number;
    settlementPercentage: number;
    approved?: boolean;
  }[];
  budgetAmount?: number;
  status: 'Sent' | 'Viewed' | 'Responded';
}

interface BudgetApprovalNotificationProps {
  onMessageClick?: () => void;
  onResponse?: (approvedSettlements: string[], budgetAmount: number) => void;
}

export function BudgetApprovalNotification({ onMessageClick, onResponse }: BudgetApprovalNotificationProps) {
  const [showModal, setShowModal] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [selectedSettlements, setSelectedSettlements] = useState<Set<string>>(new Set());

  // Mock message - in real app, this would come from props or API
  const mockMessage: BudgetApprovalMessage = {
    id: 'msg-1',
    sentDate: new Date().toISOString(),
    proposedSettlements: [
      {
        debtId: 'D1',
        creditor: 'Capital One',
        originalAmount: 8500,
        settlementAmount: 4675,
        settlementPercentage: 55,
        approved: false
      },
      {
        debtId: 'D2',
        creditor: 'Chase Bank',
        originalAmount: 12300,
        settlementAmount: 6765,
        settlementPercentage: 55,
        approved: false
      },
      {
        debtId: 'D3',
        creditor: 'Discover Card',
        originalAmount: 6800,
        settlementAmount: 3740,
        settlementPercentage: 55,
        approved: false
      }
    ],
    status: 'Sent'
  };

  const handleOpenModal = () => {
    setShowModal(true);
    if (onMessageClick) {
      onMessageClick();
    }
  };

  const toggleSettlement = (debtId: string) => {
    const newSelected = new Set(selectedSettlements);
    if (newSelected.has(debtId)) {
      newSelected.delete(debtId);
    } else {
      newSelected.add(debtId);
    }
    setSelectedSettlements(newSelected);
  };

  const handleSubmitResponse = () => {
    const budget = parseFloat(budgetAmount);
    if (isNaN(budget) || budget <= 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    if (onResponse) {
      onResponse(Array.from(selectedSettlements), budget);
    }

    alert('Your response has been submitted! Our team will review and process your approved settlements.');
    setShowModal(false);
    setBudgetAmount('');
    setSelectedSettlements(new Set());
  };

  const totalSelectedAmount = mockMessage.proposedSettlements
    .filter(s => selectedSettlements.has(s.debtId))
    .reduce((sum, s) => sum + s.settlementAmount, 0);

  return (
    <>
      {/* Notification Banner */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">New Settlement Approval Request</h4>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">New</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              We have {mockMessage.proposedSettlements.length} proposed settlement offers ready for your review. 
              Please review and let us know how much budget you can allocate.
            </p>
            <button
              onClick={handleOpenModal}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Review & Respond
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Settlement Approval Request</h3>
                  <p className="text-sm text-gray-500">Sent {new Date(mockMessage.sentDate).toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {/* Introduction */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Outstanding Collections - Potential Settlement Offers</h4>
                <p className="text-sm text-gray-700 mb-2">
                  Below are proposed settlement amounts for your outstanding debts. 
                  <strong className="text-blue-900"> Please note: These are potential offers and NOT guaranteed by creditors.</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Select which settlements you'd like to approve and tell us how much budget you can commit.
                </p>
              </div>

              {/* Proposed Settlements */}
              <div className="space-y-3 mb-6">
                <h5 className="font-semibold text-gray-900 mb-3">Proposed Settlement Offers</h5>
                {mockMessage.proposedSettlements.map((settlement) => (
                  <div
                    key={settlement.debtId}
                    onClick={() => toggleSettlement(settlement.debtId)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedSettlements.has(settlement.debtId)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          selectedSettlements.has(settlement.debtId)
                            ? 'border-green-600 bg-green-600'
                            : 'border-gray-300'
                        }`}>
                          {selectedSettlements.has(settlement.debtId) && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{settlement.creditor}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Original Balance: <span className="font-medium">${settlement.originalAmount.toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {settlement.settlementPercentage}% of original balance
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600 mb-1">Settlement Amount</div>
                        <div className="text-2xl font-bold text-green-600">
                          ${settlement.settlementAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Budget Input */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  How much budget can you commit towards these settlements?
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none text-lg font-medium"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Your budget will help us prioritize and process the settlements you approve
                </p>
              </div>

              {/* Summary */}
              {selectedSettlements.size > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Selected Settlements Total</div>
                      <div className="text-2xl font-bold text-green-700">
                        ${totalSelectedAmount.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{selectedSettlements.size} settlement{selectedSettlements.size !== 1 ? 's' : ''} selected</div>
                      {budgetAmount && parseFloat(budgetAmount) > 0 && (
                        <div className={`text-sm font-medium mt-1 ${
                          parseFloat(budgetAmount) >= totalSelectedAmount ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {parseFloat(budgetAmount) >= totalSelectedAmount 
                            ? '✓ Budget covers selected settlements' 
                            : '⚠ Budget less than selected total'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSubmitResponse}
                  disabled={selectedSettlements.size === 0 || !budgetAmount || parseFloat(budgetAmount) <= 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <CheckCircle className="w-5 h-5" />
                  Submit Response
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                <Clock className="w-3 h-3 inline mr-1" />
                Our team will process payments on your behalf once settlements are confirmed by creditors
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
