import { useEffect, useState } from 'react';
import { Plus, MoreVertical, TrendingDown, AlertCircle, X, Gavel, Scale, FileText, Sparkles } from 'lucide-react';
import { DebtExtraction } from './DebtExtraction';
import { AddDebtManually, ManualDebtInput } from './AddDebtManually';
import { apiFetch } from '../api/client';

interface Debt {
  id: string;
  creditor: string;
  originalCreditor?: string;
  collectionAgency?: string;
  type: string;
  originalAmount: number;
  currentBalance: number;
  interestAccrued: number;
  status: 'Active' | 'In Settlement' | 'Settled' | 'Overdue';
  lastPayment?: string;
  nextDue?: string;
  legalStatus?: 'None' | 'Collections' | 'Legal Pursuit' | 'Judgment' | 'Settled';
  legalDetails?: {
    caseNumber?: string;
    filedDate?: string;
    courtName?: string;
    attorney?: string;
    judgmentAmount?: number;
    judgmentDate?: string;
  };
  accountNumber?: string;
}

export function DebtList() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [showExtractionModal, setShowExtractionModal] = useState(false);
  const [showManualAddModal, setShowManualAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadDebts = async () => {
      try {
        const data = await apiFetch<Debt[]>('/debts');
        setDebts(data);
      } catch (error) {
        setLoadError('Unable to load debts.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDebts();
  }, []);

  const handleDebtsExtracted = async (extractedDebts: any[]) => {
    // Convert extracted debts to Debt format and add to list
    try {
      const newDebts = await Promise.all(
        extractedDebts.map((extracted) =>
          apiFetch<Debt>('/debts', {
            method: 'POST',
            body: JSON.stringify({
              creditor: extracted.creditor,
              originalCreditor: extracted.originalCreditor,
              collectionAgency: extracted.collectionAgency,
              type: extracted.debtType,
              originalAmount: extracted.balance,
              currentBalance: extracted.balance,
              interestAccrued: 0,
              status: extracted.status,
              accountNumber: extracted.accountNumber,
              legalStatus: 'None',
            }),
          }),
        ),
      );

      setDebts([...newDebts, ...debts]);
    } catch (error) {
      setLoadError('Unable to save extracted debts.');
    }
  };

  const handleManualDebtAdded = async (manualDebtInput: ManualDebtInput) => {
    try {
      const newDebt = await apiFetch<Debt>('/debts', {
        method: 'POST',
        body: JSON.stringify({
          creditor: manualDebtInput.creditor,
          originalCreditor: manualDebtInput.originalCreditor,
          collectionAgency: manualDebtInput.collectionAgency,
          type: manualDebtInput.debtType,
          originalAmount: manualDebtInput.originalAmount,
          currentBalance: manualDebtInput.currentBalance,
          interestAccrued: manualDebtInput.interestAccrued,
          status: manualDebtInput.status,
          lastPayment: manualDebtInput.lastPayment,
          nextDue: manualDebtInput.nextDue,
          legalStatus: manualDebtInput.legalStatus,
          legalDetails: manualDebtInput.legalDetails,
          accountNumber: manualDebtInput.accountNumber,
        }),
      });

      setDebts([newDebt, ...debts]);
    } catch (error) {
      setLoadError('Unable to add debt.');
    }
  };

  const filteredDebts = filter === 'All' ? debts : debts.filter(d => d.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'In Settlement':
        return 'bg-purple-100 text-purple-700';
      case 'Settled':
        return 'bg-green-100 text-green-700';
      case 'Overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getLegalStatusColor = (status: string) => {
    switch (status) {
      case 'None':
        return 'bg-gray-100 text-gray-700';
      case 'Collections':
        return 'bg-yellow-100 text-yellow-700';
      case 'Legal Pursuit':
        return 'bg-orange-100 text-orange-700';
      case 'Judgment':
        return 'bg-red-100 text-red-700';
      case 'Settled':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getLegalStatusIcon = (legalStatus: string) => {
    switch (legalStatus) {
      case 'Legal Pursuit':
        return <Gavel className="w-5 h-5" />;
      case 'Judgment':
        return <Scale className="w-5 h-5" />;
      case 'Collections':
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  // Calculate running balance totals
  const calculateTotals = () => {
    const totalOriginal = filteredDebts.reduce((sum, debt) => sum + debt.originalAmount, 0);
    // Estimate settlement at 60% of current balance for debts in settlement, or 55% for active debts
    // Medical bills, utilities, and student loans are NOT negotiable
    const totalSettlement = filteredDebts.reduce((sum, debt) => {
      // Check if debt type is non-negotiable
      const nonNegotiableTypes = ['medical bill', 'medical bills', 'medical', 'utility', 'utilities', 'student loan', 'student loans'];
      const isNonNegotiable = nonNegotiableTypes.some(type => debt.type.toLowerCase().includes(type));
      
      if (isNonNegotiable) return sum + debt.originalAmount;
      if (debt.status === 'Settled') return sum + debt.currentBalance;
      if (debt.status === 'In Settlement') return sum + (debt.currentBalance * 0.60);
      return sum + (debt.currentBalance * 0.55);
    }, 0);
    const totalSavings = totalOriginal - totalSettlement;
    
    return { totalOriginal, totalSettlement, totalSavings };
  };

  const { totalOriginal, totalSettlement, totalSavings } = calculateTotals();

  // Calculate settlement for individual debt
  const getDebtSettlement = (debt: Debt) => {
    // Check if debt type is non-negotiable
    const nonNegotiableTypes = ['medical bill', 'medical bills', 'medical', 'utility', 'utilities', 'student loan', 'student loans'];
    const isNonNegotiable = nonNegotiableTypes.some(type => debt.type.toLowerCase().includes(type));
    
    if (isNonNegotiable) return debt.originalAmount;
    if (debt.status === 'Settled') return debt.currentBalance;
    if (debt.status === 'In Settlement') return debt.currentBalance * 0.60;
    return debt.currentBalance * 0.55;
  };

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          Loading debts...
        </div>
      )}

      {/* AI Extraction Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-green-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-gray-900 mb-1">Save Time with AI-Powered Debt Extraction</h4>
            <p className="text-sm text-gray-600 mb-3">
              Upload your credit reports or connect to credit bureaus to automatically extract all your debt information. 
              Our AI identifies creditor names, balances, account numbers, and statuses in seconds.
            </p>
            <button 
              onClick={() => setShowExtractionModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Try AI Extraction Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">My Debts</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and track all your debts</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowExtractionModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            <span>AI Extract Debts</span>
          </button>
          <button 
            onClick={() => setShowManualAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Manually</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', 'Active', 'In Settlement', 'Overdue', 'Settled'].map((status) => (
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

      {/* Running Balance Summary */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
        <div className="mb-4">
          <h3 className="text-gray-900">Debt Settlement Summary</h3>
          <p className="text-sm text-gray-600 mt-1">Total amounts across all debts</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Total Original Amount</p>
            <p className="text-2xl text-gray-900">${totalOriginal.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Amount you originally owed</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Estimated Settlement Amount</p>
            <p className="text-2xl text-green-600">${Math.round(totalSettlement).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Expected amount to pay</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200 bg-green-50">
            <p className="text-xs text-green-700 mb-1">Estimated Total Savings</p>
            <p className="text-2xl text-green-600">${Math.round(totalSavings).toLocaleString()}</p>
            <p className="text-xs text-green-700 mt-1">{totalOriginal > 0 ? Math.round((totalSavings / totalOriginal) * 100) : 0}% savings from original</p>
          </div>
        </div>
      </div>

      {/* Debts Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredDebts.map((debt) => {
          const reduction = ((debt.originalAmount - debt.currentBalance) / debt.originalAmount) * 100;
          const settlementAmount = getDebtSettlement(debt);
          const savings = debt.originalAmount - settlementAmount;
          
          return (
            <div 
              key={debt.id} 
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedDebt(debt)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-gray-900">{debt.creditor}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(debt.status)}`}>
                      {debt.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{debt.type}</p>
                </div>
                <button 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Settlement Summary Row */}
              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Original Amount</p>
                  <p className="text-lg text-gray-900">${debt.originalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Est. Settlement</p>
                  <p className="text-lg text-green-600">${Math.round(settlementAmount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700 mb-1">Est. Savings</p>
                  <p className="text-lg text-green-600">${Math.round(savings).toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">{((savings / debt.originalAmount) * 100).toFixed(0)}% saved</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Current Balance</p>
                  <p className="text-gray-900 mt-1">${debt.currentBalance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Interest Accrued</p>
                  <p className="text-gray-900 mt-1">${debt.interestAccrued.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Next Due</p>
                  <p className="text-gray-900 mt-1">{debt.nextDue || 'N/A'}</p>
                </div>
              </div>

              {reduction > 0 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    {reduction.toFixed(1)}% reduction from original amount
                  </span>
                </div>
              )}

              {debt.status === 'Overdue' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700">
                    Payment overdue - Contact creditor immediately
                  </span>
                </div>
              )}

              {debt.legalStatus && debt.legalStatus !== 'None' && (
                <div className={`flex items-center gap-2 p-3 rounded-lg border mt-2 ${
                  debt.legalStatus === 'Judgment' ? 'bg-red-50 border-red-200' :
                  debt.legalStatus === 'Legal Pursuit' ? 'bg-orange-50 border-orange-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}>
                  {getLegalStatusIcon(debt.legalStatus)}
                  <span className={`text-sm ${
                    debt.legalStatus === 'Judgment' ? 'text-red-700' :
                    debt.legalStatus === 'Legal Pursuit' ? 'text-orange-700' :
                    'text-yellow-700'
                  }`}>
                    {debt.legalStatus === 'Judgment' ? 'Judgment Issued' :
                     debt.legalStatus === 'Legal Pursuit' ? 'Legal Action in Progress' :
                     'In Collections'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredDebts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No debts found with the selected filter</p>
        </div>
      )}

      {/* Debt Details Modal */}
      {selectedDebt && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedDebt(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-gray-900">{selectedDebt.creditor}</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedDebt.type}</p>
              </div>
              <button 
                onClick={() => setSelectedDebt(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Creditor Information */}
              {(selectedDebt.originalCreditor || selectedDebt.collectionAgency) && (
                <div>
                  <h4 className="text-gray-900 mb-4">Creditor Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDebt.originalCreditor && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-700 mb-1">Original Creditor</p>
                        <p className="text-gray-900">{selectedDebt.originalCreditor}</p>
                      </div>
                    )}
                    {selectedDebt.collectionAgency && (
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-xs text-orange-700 mb-1">Third Party Collection Agency</p>
                        <p className="text-gray-900">{selectedDebt.collectionAgency}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Financial Overview */}
              <div>
                <h4 className="text-gray-900 mb-4">Financial Overview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Original Amount</p>
                    <p className="text-gray-900 mt-1">${selectedDebt.originalAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Current Balance</p>
                    <p className="text-gray-900 mt-1">${selectedDebt.currentBalance.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Interest Accrued</p>
                    <p className="text-gray-900 mt-1">${selectedDebt.interestAccrued.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Total Owed</p>
                    <p className="text-gray-900 mt-1">
                      ${(selectedDebt.currentBalance + selectedDebt.interestAccrued).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h4 className="text-gray-900 mb-4">Payment Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Last Payment</p>
                    <p className="text-gray-900 mt-1">{selectedDebt.lastPayment || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Next Due</p>
                    <p className="text-gray-900 mt-1">{selectedDebt.nextDue || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Debt Status */}
              <div>
                <h4 className="text-gray-900 mb-4">Debt Status</h4>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-2 rounded-lg ${getStatusColor(selectedDebt.status)}`}>
                    {selectedDebt.status}
                  </span>
                </div>
              </div>

              {/* Legal Status */}
              <div>
                <h4 className="text-gray-900 mb-4">Legal Status</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-2 rounded-lg ${getLegalStatusColor(selectedDebt.legalStatus || 'None')}`}>
                      {selectedDebt.legalStatus || 'None'}
                    </span>
                  </div>

                  {selectedDebt.legalStatus && selectedDebt.legalStatus !== 'None' && selectedDebt.legalDetails && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                      {selectedDebt.legalStatus === 'Judgment' && (
                        <>
                          <div className="flex items-start gap-3">
                            <Scale className="w-5 h-5 text-red-600 mt-1" />
                            <div className="flex-1">
                              <p className="text-sm text-red-900">A judgment has been issued against you for this debt.</p>
                              <p className="text-xs text-red-700 mt-1">
                                This means the creditor has obtained a court order confirming the debt is owed.
                              </p>
                            </div>
                          </div>
                          {selectedDebt.legalDetails.judgmentAmount && (
                            <div className="grid grid-cols-2 gap-3 mt-3">
                              <div>
                                <p className="text-xs text-gray-500">Judgment Amount</p>
                                <p className="text-gray-900 mt-1">${selectedDebt.legalDetails.judgmentAmount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Judgment Date</p>
                                <p className="text-gray-900 mt-1">{selectedDebt.legalDetails.judgmentDate}</p>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {selectedDebt.legalStatus === 'Legal Pursuit' && (
                        <div className="flex items-start gap-3">
                          <Gavel className="w-5 h-5 text-orange-600 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm text-orange-900">Legal action is in progress for this debt.</p>
                            <p className="text-xs text-orange-700 mt-1">
                              The creditor has filed a lawsuit. Respond promptly to avoid a default judgment.
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedDebt.legalStatus === 'Collections' && (
                        <div className="flex items-start gap-3">
                          <FileText className="w-5 h-5 text-yellow-600 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm text-yellow-900">This debt has been sent to collections.</p>
                            <p className="text-xs text-yellow-700 mt-1">
                              A collection agency is attempting to recover the debt on behalf of the creditor.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-3 mt-3 pt-3 border-t border-gray-200">
                        {selectedDebt.legalDetails.caseNumber && (
                          <div>
                            <p className="text-xs text-gray-500">Case Number</p>
                            <p className="text-gray-900 mt-1">{selectedDebt.legalDetails.caseNumber}</p>
                          </div>
                        )}
                        {selectedDebt.legalDetails.filedDate && (
                          <div>
                            <p className="text-xs text-gray-500">Filed Date</p>
                            <p className="text-gray-900 mt-1">{selectedDebt.legalDetails.filedDate}</p>
                          </div>
                        )}
                        {selectedDebt.legalDetails.courtName && (
                          <div>
                            <p className="text-xs text-gray-500">Court</p>
                            <p className="text-gray-900 mt-1">{selectedDebt.legalDetails.courtName}</p>
                          </div>
                        )}
                        {selectedDebt.legalDetails.attorney && (
                          <div>
                            <p className="text-xs text-gray-500">Attorney/Agency</p>
                            <p className="text-gray-900 mt-1">{selectedDebt.legalDetails.attorney}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(!selectedDebt.legalStatus || selectedDebt.legalStatus === 'None') && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-900">No legal action is currently being taken on this debt.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Contact Creditor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debt Extraction Modal */}
      {showExtractionModal && (
        <DebtExtraction
          onClose={() => setShowExtractionModal(false)}
          onDebtsExtracted={handleDebtsExtracted}
        />
      )}

      {/* Add Debt Manually Modal */}
      {showManualAddModal && (
        <AddDebtManually
          isOpen={showManualAddModal}
          onClose={() => setShowManualAddModal(false)}
          onDebtAdded={handleManualDebtAdded}
        />
      )}
    </div>
  );
}
