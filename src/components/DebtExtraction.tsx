import { useState } from 'react';
import { Upload, X, FileText, Loader2, Check, AlertCircle, Link2, Sparkles } from 'lucide-react';

interface ExtractedDebt {
  creditor: string;
  accountNumber: string;
  balance: number;
  status: string;
  debtType: string;
  originalCreditor?: string;
  collectionAgency?: string;
  confidence: number;
}

interface DebtExtractionProps {
  isOpen?: boolean;
  onClose: () => void;
  onDebtsExtracted: (debts: ExtractedDebt[]) => void;
}

export function DebtExtraction({ isOpen = true, onClose, onDebtsExtracted }: DebtExtractionProps) {
  const [extractionMethod, setExtractionMethod] = useState<'upload' | 'api' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedDebts, setExtractedDebts] = useState<ExtractedDebt[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Simulate API connection
  const [apiConnected, setApiConnected] = useState(false);
  const [apiProvider, setApiProvider] = useState<string>('');

  if (!isOpen) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleProcessUpload = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock extracted data
    const mockExtractedDebts: ExtractedDebt[] = [
      {
        creditor: 'Capital One Bank',
        accountNumber: '****1234',
        balance: 8900,
        status: 'Active',
        debtType: 'Credit Card',
        confidence: 0.96
      },
      {
        creditor: 'Chase Credit Services',
        accountNumber: '****5678',
        balance: 12500,
        status: 'Overdue',
        debtType: 'Credit Card',
        originalCreditor: 'Chase Bank',
        collectionAgency: 'Allied Collections',
        confidence: 0.94
      },
      {
        creditor: 'Memorial Hospital',
        accountNumber: 'MH-2024-9876',
        balance: 15200,
        status: 'Active',
        debtType: 'Medical Bill',
        confidence: 0.98
      },
      {
        creditor: 'Personal Loan Corp',
        accountNumber: '****4321',
        balance: 6600,
        status: 'In Settlement',
        debtType: 'Personal Loan',
        confidence: 0.91
      }
    ];

    setExtractedDebts(mockExtractedDebts);
    setShowResults(true);
    setIsProcessing(false);
  };

  const handleAPIConnection = async () => {
    if (!apiProvider) return;

    setIsProcessing(true);
    
    // Simulate API connection and data fetching
    await new Promise(resolve => setTimeout(resolve, 2500));

    setApiConnected(true);

    // Mock extracted data from API
    const mockAPIDebts: ExtractedDebt[] = [
      {
        creditor: 'Experian Credit Report',
        accountNumber: 'Multiple Accounts',
        balance: 45230,
        status: 'Active',
        debtType: 'Multiple',
        confidence: 0.99
      },
      {
        creditor: 'Wells Fargo Bank',
        accountNumber: '****7890',
        balance: 4500,
        status: 'Active',
        debtType: 'Credit Card',
        confidence: 0.97
      },
      {
        creditor: 'City Medical Center',
        accountNumber: 'CMC-2024-1122',
        balance: 3940,
        status: 'Active',
        debtType: 'Medical Bill',
        confidence: 0.95
      }
    ];

    setExtractedDebts(mockAPIDebts);
    setShowResults(true);
    setIsProcessing(false);
  };

  const handleConfirmDebts = () => {
    onDebtsExtracted(extractedDebts);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setExtractionMethod(null);
    setIsProcessing(false);
    setExtractedDebts([]);
    setUploadedFile(null);
    setShowResults(false);
    setApiConnected(false);
    setApiProvider('');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.95) return 'text-green-600';
    if (confidence >= 0.85) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-gray-900">AI-Powered Debt Extraction</h3>
              <p className="text-sm text-gray-500 mt-1">Upload reports to automatically extract debt information</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {!extractionMethod && !showResults && (
            <div className="space-y-4">
              <h4 className="text-gray-900">Choose Extraction Method</h4>
              
              {/* Upload Option */}
              <button
                onClick={() => setExtractionMethod('upload')}
                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Upload className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-gray-900 mb-1">Upload Credit Report or Statement</h5>
                    <p className="text-sm text-gray-500">
                      Upload PDF, CSV, or image files of your credit reports, bank statements, or collection notices. 
                      Our AI will automatically extract creditor names, balances, account numbers, and debt status.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">PDF</span>
                      <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">CSV</span>
                      <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">JPG/PNG</span>
                      <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">XLSX</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Upload Flow */}
          {extractionMethod === 'upload' && !showResults && (
            <div className="space-y-6">
              <button
                onClick={() => setExtractionMethod(null)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to methods
              </button>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-600 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.csv,.jpg,.jpeg,.png,.xlsx,.xls"
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-gray-900 mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">PDF, CSV, JPG, PNG, or XLSX (Max 10MB)</p>
                </label>
              </div>

              {uploadedFile && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-900">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="p-1 hover:bg-green-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleProcessUpload}
                  disabled={!uploadedFile || isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Extract Debt Information</span>
                    </>
                  )}
                </button>
              </div>

              {isProcessing && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-900">AI is analyzing your document...</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Extracting creditor names, account numbers, balances, and debt statuses. This may take a few moments.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* API Connection Flow */}
          {extractionMethod === 'api' && !showResults && (
            <div className="space-y-6">
              <button
                onClick={() => setExtractionMethod(null)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to methods
              </button>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Select Credit Bureau or Financial Data Provider</label>
                <select
                  value={apiProvider}
                  onChange={(e) => setApiProvider(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                >
                  <option value="">Choose a provider...</option>
                  <option value="experian">Experian</option>
                  <option value="equifax">Equifax</option>
                  <option value="transunion">TransUnion</option>
                  <option value="plaid">Plaid (Bank Connections)</option>
                </select>
              </div>

              {apiProvider && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-yellow-900">Secure Connection</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        You'll be redirected to {apiProvider.charAt(0).toUpperCase() + apiProvider.slice(1)}'s secure authentication page. 
                        Your credentials are never stored by Lifeify.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleAPIConnection}
                disabled={!apiProvider || isProcessing}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-5 h-5" />
                    <span>Connect & Extract Data</span>
                  </>
                )}
              </button>

              {isProcessing && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-900">Connecting to {apiProvider}...</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Fetching your debt information securely. This may take a few moments.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results */}
          {showResults && extractedDebts.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-gray-900">Extracted Debt Information</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Review the extracted data and confirm to add to your debt list
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">{extractedDebts.length} debts found</span>
                </div>
              </div>

              <div className="space-y-3">
                {extractedDebts.map((debt, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-green-600 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="text-gray-900">{debt.creditor}</h5>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            {debt.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{debt.debtType}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs ${getConfidenceColor(debt.confidence)}`}>
                          {(debt.confidence * 100).toFixed(0)}% confidence
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Account Number</p>
                        <p className="text-sm text-gray-900 mt-1">{debt.accountNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Balance</p>
                        <p className="text-sm text-gray-900 mt-1">${debt.balance.toLocaleString()}</p>
                      </div>
                    </div>

                    {(debt.originalCreditor || debt.collectionAgency) && (
                      <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-3">
                        {debt.originalCreditor && (
                          <div>
                            <p className="text-xs text-gray-500">Original Creditor</p>
                            <p className="text-sm text-gray-900 mt-1">{debt.originalCreditor}</p>
                          </div>
                        )}
                        {debt.collectionAgency && (
                          <div>
                            <p className="text-xs text-gray-500">Collection Agency</p>
                            <p className="text-sm text-gray-900 mt-1">{debt.collectionAgency}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Start Over
                </button>
                <button
                  onClick={handleConfirmDebts}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  <span>Confirm & Add {extractedDebts.length} Debts</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}