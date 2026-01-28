import { useEffect, useState } from 'react';
import { CreditCard, Building, Plus, Trash2, X, Save, CheckCircle } from 'lucide-react';
import { apiFetch } from '../api/client';

interface PaymentMethod {
  id: string;
  type: 'Bank Account' | 'Credit Card' | 'Debit Card';
  name: string;
  last4: string;
  isPrimary: boolean;
  holderName: string;
  expiryDate?: string;
  bankName?: string;
  accountType?: 'Checking' | 'Savings';
}

export function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<string | null>(null);
  const [newMethod, setNewMethod] = useState<Partial<PaymentMethod>>({
    type: 'Bank Account',
    name: '',
    last4: '',
    holderName: '',
    isPrimary: false,
  });

  useEffect(() => {
    const loadMethods = async () => {
      try {
        const data = await apiFetch<PaymentMethod[]>('/payment-methods');
        setPaymentMethods(data);
      } catch (error) {
        setLoadError('Unable to load payment methods.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMethods();
  }, []);

  const handleAddMethod = async () => {
    if (newMethod.name && newMethod.last4 && newMethod.holderName) {
      try {
        const method = await apiFetch<PaymentMethod>('/payment-methods', {
          method: 'POST',
          body: JSON.stringify({
            type: newMethod.type || 'Bank Account',
            name: newMethod.name,
            last4: newMethod.last4,
            isPrimary: paymentMethods.length === 0 || newMethod.isPrimary || false,
            holderName: newMethod.holderName,
            bankName: newMethod.type === 'Bank Account' ? newMethod.bankName : undefined,
            accountType: newMethod.type === 'Bank Account' ? newMethod.accountType : undefined,
            expiryDate: newMethod.type !== 'Bank Account' ? newMethod.expiryDate : undefined,
          }),
        });

        setPaymentMethods([...paymentMethods, method]);
        setShowAddModal(false);
        setNewMethod({
          type: 'Bank Account',
          name: '',
          last4: '',
          holderName: '',
          isPrimary: false,
        });
      } catch (error) {
        setLoadError('Unable to add payment method.');
      }
    }
  };

  const handleDeleteMethod = async (id: string) => {
    try {
      await apiFetch<void>(`/payment-methods/${id}`, { method: 'DELETE' });
      setPaymentMethods(paymentMethods.filter(m => m.id !== id));
    } catch (error) {
      setLoadError('Unable to delete payment method.');
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await apiFetch<PaymentMethod>(`/payment-methods/${id}/primary`, { method: 'PATCH' });
      setPaymentMethods(paymentMethods.map(m => ({
        ...m,
        isPrimary: m.id === id,
      })));
    } catch (error) {
      setLoadError('Unable to update primary method.');
    }
  };

  const getIcon = (type: string) => {
    if (type === 'Bank Account') {
      return <Building className="w-6 h-6 text-green-600" />;
    }
    return <CreditCard className="w-6 h-6 text-green-600" />;
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
          Loading payment methods...
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Payment Methods</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your payment methods for debt settlement processing by your administrator
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Method
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-blue-900 mb-1">Payment Processing Information</h4>
            <p className="text-sm text-blue-700">
              Your administrator will process all debt settlement payments on your behalf using the payment methods you provide. 
              Add and manage your preferred payment methods here for the admin to use when making settlements with creditors.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods Grid */}
      {paymentMethods.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-gray-900 mb-2">No Payment Methods</h3>
          <p className="text-gray-500 mb-4">Add a payment method to enable settlement processing</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Your First Payment Method
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`bg-white rounded-lg border-2 p-6 relative ${
                method.isPrimary ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
            >
              {method.isPrimary && (
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                    Primary
                  </span>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {getIcon(method.type)}
                </div>
                
                <div className="flex-1">
                  <h4 className="text-gray-900 mb-1">{method.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {method.type} •••• {method.last4}
                  </p>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Account Holder: {method.holderName}</p>
                    {method.bankName && <p>Bank: {method.bankName}</p>}
                    {method.accountType && <p>Type: {method.accountType}</p>}
                    {method.expiryDate && <p>Expires: {method.expiryDate}</p>}
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    {!method.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(method.id)}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        Set as Primary
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteMethod(method.id)}
                      className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Add Payment Method</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Payment Type */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">Payment Type</label>
                <select
                  value={newMethod.type}
                  onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                  <option value="Bank Account">Bank Account</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                </select>
              </div>

              {/* Account/Card Name */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  {newMethod.type === 'Bank Account' ? 'Account Name' : 'Card Name'}
                </label>
                <input
                  type="text"
                  value={newMethod.name}
                  onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                  placeholder="e.g., Chase Checking, Visa Card"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Holder Name */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={newMethod.holderName}
                  onChange={(e) => setNewMethod({ ...newMethod, holderName: e.target.value })}
                  placeholder="Full name on account"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Last 4 Digits */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Last 4 Digits
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={newMethod.last4}
                  onChange={(e) => setNewMethod({ ...newMethod, last4: e.target.value.replace(/\D/g, '') })}
                  placeholder="1234"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Bank-specific fields */}
              {newMethod.type === 'Bank Account' && (
                <>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Bank Name</label>
                    <input
                      type="text"
                      value={newMethod.bankName || ''}
                      onChange={(e) => setNewMethod({ ...newMethod, bankName: e.target.value })}
                      placeholder="e.g., Chase Bank"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Account Type</label>
                    <select
                      value={newMethod.accountType || 'Checking'}
                      onChange={(e) => setNewMethod({ ...newMethod, accountType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    >
                      <option value="Checking">Checking</option>
                      <option value="Savings">Savings</option>
                    </select>
                  </div>
                </>
              )}

              {/* Card-specific fields */}
              {newMethod.type !== 'Bank Account' && (
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={newMethod.expiryDate || ''}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                      }
                      setNewMethod({ ...newMethod, expiryDate: value });
                    }}
                    maxLength={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
              )}

              {/* Set as Primary */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={newMethod.isPrimary}
                  onChange={(e) => setNewMethod({ ...newMethod, isPrimary: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="isPrimary" className="text-sm text-gray-700">
                  Set as primary payment method
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMethod}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Add Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
