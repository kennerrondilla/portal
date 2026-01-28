import { useState } from 'react';
import { CheckCircle, AlertTriangle, Calendar, DollarSign, X, FileSignature, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner@2.0.3';

interface Debt {
  id: string;
  creditor: string;
  originalAmount: number;
  currentBalance: number;
  estimatedSettlement: number;
  estimatedSavings: number;
  type: string;
  status: string;
}

interface SettlementCommitment {
  debtId: string;
  creditor: string;
  settlementAmount: number;
  commitmentDate: string;
  signedAt: string;
  signature: string;
}

const mockDebts: Debt[] = [
  {
    id: '1',
    creditor: 'Chase Credit Card',
    originalAmount: 12500,
    currentBalance: 11800,
    estimatedSettlement: 7080,
    estimatedSavings: 4720,
    type: 'Credit Card',
    status: 'Active',
  },
  {
    id: '2',
    creditor: 'Capital One Visa',
    originalAmount: 8900,
    currentBalance: 6700,
    estimatedSettlement: 3685,
    estimatedSavings: 3015,
    type: 'Credit Card',
    status: 'In Settlement',
  },
  {
    id: '4',
    creditor: 'Personal Loan - Bank',
    originalAmount: 8900,
    currentBalance: 8900,
    estimatedSettlement: 5340,
    estimatedSavings: 3560,
    type: 'Personal Loan',
    status: 'Active',
  },
  {
    id: '5',
    creditor: 'Discover Card',
    originalAmount: 6600,
    currentBalance: 4070,
    estimatedSettlement: 2239,
    estimatedSavings: 1831,
    type: 'Credit Card',
    status: 'Overdue',
  },
];

export function SettlementReadiness() {
  const [debts] = useState<Debt[]>(mockDebts);
  const [commitments, setCommitments] = useState<SettlementCommitment[]>([]);
  const [selectedDebts, setSelectedDebts] = useState<string[]>([]);
  const [showESignature, setShowESignature] = useState(false);
  const [settlementDate, setSettlementDate] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [budgetDate, setBudgetDate] = useState('');
  const [showBudgetCommitment, setShowBudgetCommitment] = useState(false);
  
  // E-signature state
  const [agreed1, setAgreed1] = useState(false);
  const [agreed2, setAgreed2] = useState(false);
  const [agreed3, setAgreed3] = useState(false);
  const [signatureName, setSignatureName] = useState('');

  const handleToggleDebt = (debtId: string) => {
    if (selectedDebts.includes(debtId)) {
      setSelectedDebts(selectedDebts.filter(id => id !== debtId));
    } else {
      setSelectedDebts([...selectedDebts, debtId]);
    }
  };

  const handleProceedToCommit = () => {
    if (selectedDebts.length === 0) {
      toast.error('Please select at least one debt to settle');
      return;
    }
    if (!settlementDate) {
      toast.error('Please select when funds will be available');
      return;
    }
    setShowESignature(true);
  };

  const handleSignAndCommit = () => {
    if (!agreed1 || !agreed2 || !agreed3) {
      toast.error('Please agree to all terms');
      return;
    }
    if (!signatureName) {
      toast.error('Please enter your full name as signature');
      return;
    }

    const selectedDebtDetails = debts.filter(d => selectedDebts.includes(d.id));
    const newCommitments: SettlementCommitment[] = selectedDebtDetails.map(debt => ({
      debtId: debt.id,
      creditor: debt.creditor,
      settlementAmount: debt.estimatedSettlement,
      commitmentDate: settlementDate,
      signedAt: new Date().toISOString(),
      signature: signatureName,
    }));

    setCommitments([...commitments, ...newCommitments]);

    // Notify admin
    console.log('Admin notification: Settlement commitment signed', {
      debts: selectedDebtDetails,
      date: settlementDate,
      signature: signatureName,
      timestamp: new Date().toISOString(),
    });

    toast.success(`Settlement commitment for ${selectedDebtDetails.length} debt(s) confirmed! Admin has been notified.`);

    // Reset
    setSelectedDebts([]);
    setSettlementDate('');
    setShowESignature(false);
    setAgreed1(false);
    setAgreed2(false);
    setAgreed3(false);
    setSignatureName('');
  };

  const handleBudgetCommit = () => {
    if (!totalBudget || !budgetDate) {
      toast.error('Please enter budget amount and available date');
      return;
    }

    const budget = parseFloat(totalBudget);
    if (budget <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }

    // Notify admin
    console.log('Admin notification: Total budget committed', {
      amount: budget,
      date: budgetDate,
      timestamp: new Date().toISOString(),
    });

    toast.success(`Budget of $${budget.toLocaleString()} committed for ${budgetDate}! Admin has been notified.`);

    // Reset
    setTotalBudget('');
    setBudgetDate('');
    setShowBudgetCommitment(false);
  };

  const selectedTotal = debts
    .filter(d => selectedDebts.includes(d.id))
    .reduce((sum, d) => sum + d.estimatedSettlement, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settlement Readiness</h2>
        <p className="text-gray-600 mt-1">
          Let us know when you're ready to settle your debts. You can commit a total budget or select specific debts to settle.
        </p>
      </div>

      {/* Important Disclosure */}
      <Card className="p-6 bg-amber-50 border-2 border-amber-200">
        <div className="flex gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold text-amber-900">Important Disclosure</h3>
            <p className="text-sm text-amber-800">
              The settlement offers presented here are <strong>potential savings and proposed settlement amounts</strong>. 
              These are <strong>not guaranteed</strong> and are subject to change based on creditor policies and final 
              settlement offer amounts from collection agencies.
            </p>
            <p className="text-sm text-amber-800 mt-2">
              By selecting debts and committing to settlement, you acknowledge that:
            </p>
            <ul className="text-sm text-amber-800 space-y-1 ml-4 list-disc">
              <li>We will make every attempt to settle these accounts to help you save money</li>
              <li>We will settle each debt <strong>one time</strong></li>
              <li>If you cannot keep your promise to pay the creditor, a <strong>$25 resettlement fee</strong> will apply</li>
              <li>Funds must be readily available in your account by the committed date</li>
              <li>We do not track whether funds went through - bounced checks or declined cards are your responsibility</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Budget Commitment Option */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-600" />
          Commit Total Budget for Settlement
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Instead of selecting specific debts, you can let us know the total amount you have available 
          and we'll work to settle as many accounts as possible within your budget.
        </p>
        
        {!showBudgetCommitment ? (
          <Button
            onClick={() => setShowBudgetCommitment(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Commit Total Budget
          </Button>
        ) : (
          <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div>
              <Label htmlFor="total-budget">Total Budget Available</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="total-budget"
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="budget-date">Funds Available By</Label>
              <Input
                id="budget-date"
                type="date"
                value={budgetDate}
                onChange={(e) => setBudgetDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleBudgetCommit}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Commit Budget
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBudgetCommitment(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Select Specific Debts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Or Select Specific Debts to Settle
        </h3>
        
        <div className="space-y-3">
          {debts.map((debt) => {
            const isSelected = selectedDebts.includes(debt.id);
            const isCommitted = commitments.some(c => c.debtId === debt.id);

            return (
              <Card 
                key={debt.id} 
                className={`p-4 transition-all ${
                  isSelected 
                    ? 'border-2 border-green-500 bg-green-50' 
                    : isCommitted
                    ? 'border-2 border-blue-500 bg-blue-50'
                    : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="pt-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleDebt(debt.id)}
                      disabled={isCommitted}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{debt.creditor}</h4>
                      {isCommitted && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Committed
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Current Balance</p>
                        <p className="font-medium text-gray-900">${debt.currentBalance.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Estimated Settlement</p>
                        <p className="font-medium text-green-600">${debt.estimatedSettlement.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Estimated Savings</p>
                        <p className="font-medium text-blue-600">${debt.estimatedSavings.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Type</p>
                        <p className="font-medium text-gray-900">{debt.type}</p>
                      </div>
                    </div>

                    {isCommitted && commitments.find(c => c.debtId === debt.id) && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-sm text-blue-700">
                          <strong>Committed:</strong> Settlement by {commitments.find(c => c.debtId === debt.id)?.commitmentDate}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Selection Summary and Commitment */}
      {selectedDebts.length > 0 && !showESignature && (
        <Card className="p-6 bg-green-50 border-2 border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Settlement Summary</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Selected Debts:</span>
              <span className="font-semibold text-gray-900">{selectedDebts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-900">Total Settlement Amount:</span>
              <span className="font-bold text-green-600 text-xl">${selectedTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="settlement-date">When will funds be available?</Label>
            <Input
              id="settlement-date"
              type="date"
              value={settlementDate}
              onChange={(e) => setSettlementDate(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleProceedToCommit}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <FileSignature className="w-4 h-4 mr-2" />
            Proceed to Commitment & E-Signature
          </Button>
        </Card>
      )}

      {/* E-Signature Modal */}
      {showESignature && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileSignature className="w-6 h-6 text-green-600" />
                  Settlement Commitment Agreement
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowESignature(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">You are committing to settle:</h3>
                <ul className="space-y-1 mb-3">
                  {debts.filter(d => selectedDebts.includes(d.id)).map(debt => (
                    <li key={debt.id} className="text-sm text-gray-700">
                      • {debt.creditor} - ${debt.estimatedSettlement.toLocaleString()}
                    </li>
                  ))}
                </ul>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">Total Settlement Amount:</span>
                    <span className="font-bold text-green-600">${selectedTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="font-semibold">Funds Available By:</span>
                    <span className="font-bold text-gray-900">{settlementDate}</span>
                  </div>
                </div>
              </div>

              {/* Terms and Agreements */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Please read and agree to the following:</h3>
                
                <label className="flex gap-3 items-start cursor-pointer">
                  <Checkbox
                    checked={agreed1}
                    onCheckedChange={(checked) => setAgreed1(checked as boolean)}
                    className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <span className="text-sm text-gray-700">
                    I understand that Lifeify will make every attempt to settle the selected accounts to help me save money, 
                    but settlement amounts are not guaranteed and are subject to creditor approval.
                  </span>
                </label>

                <label className="flex gap-3 items-start cursor-pointer">
                  <Checkbox
                    checked={agreed2}
                    onCheckedChange={(checked) => setAgreed2(checked as boolean)}
                    className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <span className="text-sm text-gray-700">
                    I understand that each debt will be settled <strong>one time</strong>. If I cannot keep my promise to pay 
                    the creditor after settlement is reached, I will be charged a <strong>$25 resettlement fee</strong> per account.
                  </span>
                </label>

                <label className="flex gap-3 items-start cursor-pointer">
                  <Checkbox
                    checked={agreed3}
                    onCheckedChange={(checked) => setAgreed3(checked as boolean)}
                    className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <span className="text-sm text-gray-700">
                    I confirm that the funds will be readily available in my account by the committed date. I understand that 
                    Lifeify does not track whether funds go through, and that bounced checks or declined cards are my sole responsibility. 
                    I am responsible for ensuring sufficient funds are available when payment is due to the creditor.
                  </span>
                </label>
              </div>

              {/* E-Signature */}
              <div className="pt-4 border-t border-gray-200">
                <Label htmlFor="signature">Electronic Signature (Full Legal Name) *</Label>
                <Input
                  id="signature"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Type your full legal name"
                  className="mt-1 font-serif text-lg"
                />
                <p className="text-xs text-gray-500 mt-2">
                  By typing your name above, you agree to the terms and acknowledge this as your legal electronic signature.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSignAndCommit}
                  disabled={!agreed1 || !agreed2 || !agreed3 || !signatureName}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                >
                  <FileSignature className="w-4 h-4 mr-2" />
                  Sign & Commit to Settlement
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowESignature(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Committed Settlements */}
      {commitments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Your Settlement Commitments
          </h3>
          <div className="space-y-3">
            {commitments.map((commitment, index) => (
              <Card key={index} className="p-4 bg-blue-50 border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{commitment.creditor}</h4>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <p className="text-gray-600">Settlement Amount</p>
                        <p className="font-medium text-gray-900">${commitment.settlementAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Committed Date</p>
                        <p className="font-medium text-gray-900">{commitment.commitmentDate}</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-gray-600">
                      <p>Signed: {new Date(commitment.signedAt).toLocaleString()}</p>
                      <p>Signature: {commitment.signature}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}