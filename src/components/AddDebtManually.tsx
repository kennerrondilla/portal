import { useState } from 'react';
import { X, Plus, AlertCircle, Info } from 'lucide-react';

interface AddDebtManuallyProps {
  isOpen: boolean;
  onClose: () => void;
  onDebtAdded: (debt: ManualDebtInput) => void;
}

export interface ManualDebtInput {
  creditor: string;
  originalCreditor?: string;
  collectionAgency?: string;
  accountNumber?: string;
  debtType: string;
  originalAmount: number;
  currentBalance: number;
  interestRate?: number;
  interestAccrued: number;
  status: 'Active' | 'In Settlement' | 'Settled' | 'Overdue';
  lastPayment?: string;
  nextDue?: string;
  legalStatus: 'None' | 'Collections' | 'Legal Pursuit' | 'Judgment' | 'Settled';
  legalDetails?: {
    caseNumber?: string;
    filedDate?: string;
    courtName?: string;
    attorney?: string;
    judgmentAmount?: number;
    judgmentDate?: string;
  };
  notes?: string;
}

export function AddDebtManually({ isOpen, onClose, onDebtAdded }: AddDebtManuallyProps) {
  const [formData, setFormData] = useState<Partial<ManualDebtInput>>({
    status: 'Active',
    legalStatus: 'None',
    debtType: 'Credit Card',
    interestAccrued: 0,
  });

  const [showLegalDetails, setShowLegalDetails] = useState(false);
  const [showCollectionInfo, setShowCollectionInfo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLegalDetailsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      legalDetails: {
        ...prev.legalDetails,
        [field]: value,
      },
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.creditor?.trim()) {
      newErrors.creditor = 'Creditor name is required';
    }

    if (!formData.debtType) {
      newErrors.debtType = 'Debt type is required';
    }

    if (!formData.originalAmount || formData.originalAmount <= 0) {
      newErrors.originalAmount = 'Original amount must be greater than 0';
    }

    if (!formData.currentBalance || formData.currentBalance < 0) {
      newErrors.currentBalance = 'Current balance must be 0 or greater';
    }

    if (formData.originalAmount && formData.currentBalance && formData.currentBalance > formData.originalAmount) {
      newErrors.currentBalance = 'Current balance cannot exceed original amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onDebtAdded(formData as ManualDebtInput);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFormData({
      status: 'Active',
      legalStatus: 'None',
      debtType: 'Credit Card',
      interestAccrued: 0,
    });
    setShowLegalDetails(false);
    setShowCollectionInfo(false);
    setErrors({});
  };

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Add Debt Manually</h3>
              <p className="text-sm text-gray-500 mt-1">Enter debt information to add to your account</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-gray-900 mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Creditor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.creditor || ''}
                  onChange={(e) => handleInputChange('creditor', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                    errors.creditor ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Chase Credit Card"
                />
                {errors.creditor && (
                  <p className="text-xs text-red-600 mt-1">{errors.creditor}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.accountNumber || ''}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="e.g., ****1234"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Debt Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.debtType || 'Credit Card'}
                  onChange={(e) => handleInputChange('debtType', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                    errors.debtType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Medical Bill">Medical Bill</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Auto Loan">Auto Loan</option>
                  <option value="Student Loan">Student Loan</option>
                  <option value="Utility Bill">Utility Bill</option>
                  <option value="Other">Other</option>
                </select>
                {errors.debtType && (
                  <p className="text-xs text-red-600 mt-1">{errors.debtType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Debt Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status || 'Active'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                >
                  <option value="Active">Active</option>
                  <option value="In Settlement">In Settlement</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Settled">Settled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div>
            <h4 className="text-gray-900 mb-4">Financial Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Original Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.originalAmount || ''}
                    onChange={(e) => handleInputChange('originalAmount', parseFloat(e.target.value) || 0)}
                    className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                      errors.originalAmount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.originalAmount && (
                  <p className="text-xs text-red-600 mt-1">{errors.originalAmount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Current Balance <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.currentBalance || ''}
                    onChange={(e) => handleInputChange('currentBalance', parseFloat(e.target.value) || 0)}
                    className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                      errors.currentBalance ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.currentBalance && (
                  <p className="text-xs text-red-600 mt-1">{errors.currentBalance}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Interest Accrued
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.interestAccrued || 0}
                    onChange={(e) => handleInputChange('interestAccrued', parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Interest Rate (Annual %)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.interestRate || ''}
                    onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || undefined)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    placeholder="0.00"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Dates */}
          <div>
            <h4 className="text-gray-900 mb-4">Payment Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Last Payment Date
                </label>
                <input
                  type="date"
                  value={formData.lastPayment || ''}
                  onChange={(e) => handleInputChange('lastPayment', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Next Payment Due Date
                </label>
                <input
                  type="date"
                  value={formData.nextDue || ''}
                  onChange={(e) => handleInputChange('nextDue', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Collection Information Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowCollectionInfo(!showCollectionInfo)}
              className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 mb-4"
            >
              <Info className="w-4 h-4" />
              <span>{showCollectionInfo ? 'Hide' : 'Add'} Collection Agency Information (Optional)</span>
            </button>

            {showCollectionInfo && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Original Creditor
                    </label>
                    <input
                      type="text"
                      value={formData.originalCreditor || ''}
                      onChange={(e) => handleInputChange('originalCreditor', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="e.g., Chase Bank"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Collection Agency
                    </label>
                    <input
                      type="text"
                      value={formData.collectionAgency || ''}
                      onChange={(e) => handleInputChange('collectionAgency', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="e.g., Allied Collections"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Legal Status */}
          <div>
            <h4 className="text-gray-900 mb-4">Legal Status</h4>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">
                Legal Status
              </label>
              <select
                value={formData.legalStatus || 'None'}
                onChange={(e) => {
                  handleInputChange('legalStatus', e.target.value);
                  setShowLegalDetails(e.target.value !== 'None');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              >
                <option value="None">None</option>
                <option value="Collections">Collections</option>
                <option value="Legal Pursuit">Legal Pursuit</option>
                <option value="Judgment">Judgment</option>
                <option value="Settled">Settled</option>
              </select>
            </div>

            {showLegalDetails && formData.legalStatus !== 'None' && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 space-y-4">
                <div className="flex items-start gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-yellow-900">
                    {formData.legalStatus === 'Judgment' && 'Provide details about the judgment issued.'}
                    {formData.legalStatus === 'Legal Pursuit' && 'Provide details about the legal action in progress.'}
                    {formData.legalStatus === 'Collections' && 'Provide details about the collection activity.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Case Number
                    </label>
                    <input
                      type="text"
                      value={formData.legalDetails?.caseNumber || ''}
                      onChange={(e) => handleLegalDetailsChange('caseNumber', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="e.g., CV-2024-12345"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Filed Date
                    </label>
                    <input
                      type="date"
                      value={formData.legalDetails?.filedDate || ''}
                      onChange={(e) => handleLegalDetailsChange('filedDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Court Name
                    </label>
                    <input
                      type="text"
                      value={formData.legalDetails?.courtName || ''}
                      onChange={(e) => handleLegalDetailsChange('courtName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="e.g., Superior Court"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Attorney/Agency Name
                    </label>
                    <input
                      type="text"
                      value={formData.legalDetails?.attorney || ''}
                      onChange={(e) => handleLegalDetailsChange('attorney', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="e.g., Smith & Associates"
                    />
                  </div>

                  {formData.legalStatus === 'Judgment' && (
                    <>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Judgment Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.legalDetails?.judgmentAmount || ''}
                            onChange={(e) => handleLegalDetailsChange('judgmentAmount', parseFloat(e.target.value) || undefined)}
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Judgment Date
                        </label>
                        <input
                          type="date"
                          value={formData.legalDetails?.judgmentDate || ''}
                          onChange={(e) => handleLegalDetailsChange('judgmentDate', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <h4 className="text-gray-900 mb-4">Additional Notes (Optional)</h4>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
              placeholder="Add any additional information about this debt..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="flex-1 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Debt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
