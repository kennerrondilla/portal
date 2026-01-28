import { useState } from 'react';
import { Users, FileText, Phone, Mail, Search, CheckCircle, AlertCircle, X } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalDebt: number;
  settledAmount: number;
  status: 'Active' | 'Pending' | 'Completed';
  assignedDebts: number;
  lastContact?: string;
}

interface Debt {
  id: string;
  clientId: string;
  clientName: string;
  creditor: string;
  originalCreditor?: string;
  collectionAgency?: string;
  type: string;
  originalAmount: number;
  currentBalance: number;
  interestAccrued: number;
  status: 'Active' | 'In Settlement' | 'Settled' | 'Overdue';
  legalStatus?: 'None' | 'Collections' | 'Legal Pursuit' | 'Judgment';
  nextAction?: string;
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    totalDebt: 45230,
    settledAmount: 18500,
    status: 'Active',
    assignedDebts: 3,
    lastContact: '2024-12-18'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 234-5678',
    totalDebt: 32400,
    settledAmount: 12000,
    status: 'Active',
    assignedDebts: 2,
    lastContact: '2024-12-17'
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'mbrown@email.com',
    phone: '(555) 345-6789',
    totalDebt: 28900,
    settledAmount: 28900,
    status: 'Completed',
    assignedDebts: 0,
    lastContact: '2024-12-10'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@email.com',
    phone: '(555) 456-7890',
    totalDebt: 51200,
    settledAmount: 0,
    status: 'Pending',
    assignedDebts: 5,
    lastContact: '2024-12-19'
  },
];

const mockDebts: Debt[] = [
  {
    id: 'D1',
    clientId: '1',
    clientName: 'John Smith',
    creditor: 'Chase Credit Card',
    type: 'Credit Card',
    originalAmount: 12500,
    currentBalance: 11800,
    interestAccrued: 1240,
    status: 'Active',
    legalStatus: 'None',
    nextAction: 'Follow up on payment plan',
  },
  {
    id: 'D2',
    clientId: '1',
    clientName: 'John Smith',
    creditor: 'Capital One Visa',
    originalCreditor: 'Capital One Bank',
    collectionAgency: 'Nationwide Credit Services',
    type: 'Credit Card',
    originalAmount: 8900,
    currentBalance: 6700,
    interestAccrued: 780,
    status: 'In Settlement',
    legalStatus: 'Collections',
    nextAction: 'Contact collection agency for counter-offer',
  },
  {
    id: 'D3',
    clientId: '2',
    clientName: 'Sarah Johnson',
    creditor: 'Medical Center Hospital',
    type: 'Medical Bill',
    originalAmount: 15200,
    currentBalance: 8360,
    interestAccrued: 340,
    status: 'In Settlement',
    legalStatus: 'Legal Pursuit',
    nextAction: 'Coordinate with attorney on settlement',
  },
  {
    id: 'D5',
    clientId: '4',
    clientName: 'Emily Davis',
    creditor: 'Personal Loan - Bank',
    type: 'Personal Loan',
    originalAmount: 8900,
    currentBalance: 8900,
    interestAccrued: 1560,
    status: 'Active',
    legalStatus: 'None',
    nextAction: 'Obtain POA signature from client',
  },
];

export function RepresentativeDashboard() {
  const [clients] = useState<Client[]>(mockClients);
  const [debts] = useState<Debt[]>(mockDebts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeDebts = debts.filter(d => d.status === 'In Settlement' || d.status === 'Active').length;
  const settledDebts = debts.filter(d => d.status === 'Settled').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDebtStatusColor = (status: string) => {
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

  const clientDebts = selectedClient ? debts.filter(d => d.clientId === selectedClient.id) : [];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">My Clients</p>
              <p className="text-2xl text-gray-900 mt-1">{clients.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-4">↑ {clients.filter(c => c.status === 'Active').length} active</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Debts</p>
              <p className="text-2xl text-gray-900 mt-1">{activeDebts}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">In negotiation</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Settled This Month</p>
              <p className="text-2xl text-gray-900 mt-1">{settledDebts}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-4">↑ 3 this week</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Actions</p>
              <p className="text-2xl text-gray-900 mt-1">8</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-orange-600 mt-4">Requires attention</p>
        </div>
      </div>

      {/* My Active Debts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-gray-900">My Active Debts</h3>
          <p className="text-sm text-gray-500 mt-1">Debts assigned to you requiring action</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm text-gray-600">Client</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Creditor</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Type</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Balance</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Next Action</th>
              </tr>
            </thead>
            <tbody>
              {debts.map((debt) => (
                <tr key={debt.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-gray-900">{debt.clientName}</td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-gray-900">{debt.creditor}</p>
                      {(debt.originalCreditor || debt.collectionAgency) && (
                        <p className="text-xs text-gray-500 mt-1">
                          {debt.originalCreditor && `Orig: ${debt.originalCreditor}`}
                          {debt.originalCreditor && debt.collectionAgency && ' • '}
                          {debt.collectionAgency && `Agency: ${debt.collectionAgency}`}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{debt.type}</td>
                  <td className="py-4 px-4 text-gray-900">${debt.currentBalance.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getDebtStatusColor(debt.status)}`}>
                      {debt.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{debt.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* My Clients */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900">My Clients</h3>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedClient(client)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-gray-900">{client.name}</h4>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${getStatusColor(client.status)}`}>
                    {client.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Assigned Debts</span>
                  <span className="text-gray-900">{client.assignedDebts}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500">Last Contact</span>
                  <span className="text-gray-900">{client.lastContact ? new Date(client.lastContact).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No clients found matching your search</p>
          </div>
        )}
      </div>

      {/* Client Details Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedClient(null)}>
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-gray-900">{selectedClient.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedClient.email}</p>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Client Information */}
              <div>
                <h4 className="text-gray-900 mb-4">Client Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-900 mt-1">{selectedClient.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-gray-900 mt-1">{selectedClient.phone}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Total Debt</p>
                    <p className="text-gray-900 mt-1">${selectedClient.totalDebt.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Amount Settled</p>
                    <p className="text-gray-900 mt-1">${selectedClient.settledAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Client's Debts */}
              <div>
                <h4 className="text-gray-900 mb-4">Client Debts ({clientDebts.length})</h4>
                <div className="space-y-3">
                  {clientDebts.map((debt) => (
                    <div key={debt.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-gray-900">{debt.creditor}</p>
                          {(debt.originalCreditor || debt.collectionAgency) && (
                            <p className="text-xs text-gray-500 mt-1">
                              {debt.originalCreditor && `Original: ${debt.originalCreditor}`}
                              {debt.originalCreditor && debt.collectionAgency && ' • '}
                              {debt.collectionAgency && `Agency: ${debt.collectionAgency}`}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getDebtStatusColor(debt.status)}`}>
                          {debt.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div>
                          <p className="text-xs text-gray-500">Type</p>
                          <p className="text-sm text-gray-900 mt-1">{debt.type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Balance</p>
                          <p className="text-sm text-gray-900 mt-1">${debt.currentBalance.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Legal Status</p>
                          <p className="text-sm text-gray-900 mt-1">{debt.legalStatus || 'None'}</p>
                        </div>
                      </div>
                      {debt.nextAction && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <p className="text-xs text-gray-500">Next Action</p>
                          <p className="text-sm text-gray-900 mt-1">{debt.nextAction}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Phone className="w-4 h-4" />
                  Call Client
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Mail className="w-4 h-4" />
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
