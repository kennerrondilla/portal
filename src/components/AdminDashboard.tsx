import { useEffect, useState } from 'react';
import { Users, FileText, TrendingUp, DollarSign, Search, MoreVertical, CheckCircle, Clock, X, Save, Upload, Download, Eye, History, MessageCircle, Video, Circle, Plus, Trash2, Bell, Calendar, AlertCircle, Shield, Edit, XCircle, LayoutDashboard, UserCog, ClipboardList, Phone, Printer, MapPin, CreditCard, Banknote, Filter, ArrowUpDown, Wallet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { EmailPDFViewer } from './EmailPDFViewer';
import { Chat } from './Chat';
import { VideoCall } from './VideoCall';
import { apiFetch } from '../api/client';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalDebt: number;
  settledAmount: number;
  status: 'Active' | 'Pending' | 'Completed';
  joinDate: string;
  activeSettlements: number;
  monthlyBudget?: number; // Budget available for settlements
  budgetLastUpdated?: string; // When budget was last updated
  lastLogin?: string; // Track last login time
  lastMessageClick?: string; // Track last message click time
}

interface EditHistoryEntry {
  editor: string;
  timestamp: string;
  changes: string;
}

interface SettlementOffer {
  id: string;
  fileName: string;
  uploadDate: string;
  uploadedBy: string;
  offerAmount: number;
  offerPercentage: number;
}

interface AdditionalRepresentative {
  id: string;
  repName: string;
  repPhone: string;
  repExtension?: string;
}

interface Reminder {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Completed';
  category: 'Payment' | 'Follow-up' | 'Settlement' | 'Documentation' | 'Other';
  createdDate: string;
}

interface CreditorPolicy {
  id: string;
  creditorName: string;
  willSettle: boolean;
  minimumSettlementPercentage?: number;
  maximumSettlementPercentage?: number;
  notes: string;
  lastUpdated: string;
  // Contact Information
  phone?: string;
  fax?: string;
  address?: string;
  // Payment Methods
  paymentMethods?: {
    moneyOrderOnly?: boolean;
    eCheck?: boolean;
    payByPhone?: boolean;
    payByPhoneFee?: string;
    creditCard?: boolean;
    creditCardFee?: string;
    bankDraft?: boolean;
    other?: string;
  };
}

interface BudgetApprovalMessage {
  id: string;
  clientId: string;
  clientName: string;
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
  internalNotes?: {
    repName: string;
    repPhone: string;
    repExtension?: string;
    poaFaxed: boolean;
    poaFaxedDate?: string;
    notes: string;
    editHistory?: EditHistoryEntry[];
    additionalRepresentatives?: AdditionalRepresentative[];
  };
  settlementOffers?: SettlementOffer[];
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    totalDebt: 45230,
    settledAmount: 18500,
    status: 'Active',
    joinDate: '2024-01-15',
    activeSettlements: 3,
    monthlyBudget: 500,
    budgetLastUpdated: '2026-01-20',
    lastLogin: '2026-01-25 09:30 AM',
    lastMessageClick: '2026-01-24 02:15 PM',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    totalDebt: 32400,
    settledAmount: 12000,
    status: 'Active',
    joinDate: '2024-02-20',
    activeSettlements: 2,
    monthlyBudget: 750,
    budgetLastUpdated: '2026-01-22',
    lastLogin: '2026-01-26 08:15 AM',
    lastMessageClick: '2026-01-25 11:45 AM',
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'mbrown@email.com',
    totalDebt: 28900,
    settledAmount: 28900,
    status: 'Completed',
    joinDate: '2023-11-10',
    activeSettlements: 0,
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@email.com',
    totalDebt: 51200,
    settledAmount: 0,
    status: 'Pending',
    joinDate: '2024-12-01',
    activeSettlements: 0,
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'dwilson@email.com',
    totalDebt: 39800,
    settledAmount: 15900,
    status: 'Active',
    joinDate: '2024-03-05',
    activeSettlements: 4,
    monthlyBudget: 600,
    budgetLastUpdated: '2026-01-21',
    lastLogin: '2026-01-23 03:20 PM',
    lastMessageClick: 'Never',
  },
  {
    id: '6',
    name: 'Jennifer Martinez',
    email: 'j.martinez@email.com',
    totalDebt: 27800,
    settledAmount: 8900,
    status: 'Active',
    joinDate: '2024-01-22',
    activeSettlements: 2,
  },
  {
    id: '7',
    name: 'Robert Taylor',
    email: 'rtaylor@email.com',
    totalDebt: 34500,
    settledAmount: 0,
    status: 'Active',
    joinDate: '2024-11-05',
    activeSettlements: 1,
  },
  {
    id: '8',
    name: 'Lisa Anderson',
    email: 'lisa.a@email.com',
    totalDebt: 42100,
    settledAmount: 15200,
    status: 'Active',
    joinDate: '2024-03-18',
    activeSettlements: 3,
    monthlyBudget: 400,
    budgetLastUpdated: '2026-01-18',
    lastLogin: '2026-01-22 10:05 AM',
    lastMessageClick: '2026-01-21 04:30 PM',
  },
  {
    id: '9',
    name: 'James Thompson',
    email: 'jthompson@email.com',
    totalDebt: 29400,
    settledAmount: 11800,
    status: 'Active',
    joinDate: '2024-05-12',
    activeSettlements: 2,
  },
  {
    id: '10',
    name: 'Patricia Garcia',
    email: 'p.garcia@email.com',
    totalDebt: 38700,
    settledAmount: 0,
    status: 'Pending',
    joinDate: '2024-12-15',
    activeSettlements: 0,
  },
  {
    id: '11',
    name: 'Christopher Lee',
    email: 'clee@email.com',
    totalDebt: 31200,
    settledAmount: 9400,
    status: 'Active',
    joinDate: '2024-02-28',
    activeSettlements: 2,
    monthlyBudget: 450,
    budgetLastUpdated: '2026-01-20',
  },
  {
    id: '12',
    name: 'Amanda Rodriguez',
    email: 'arodriguez@email.com',
    totalDebt: 44800,
    settledAmount: 17900,
    status: 'Active',
    joinDate: '2024-04-10',
    activeSettlements: 3,
    monthlyBudget: 800,
    budgetLastUpdated: '2026-01-23',
  },
  {
    id: '13',
    name: 'Daniel White',
    email: 'd.white@email.com',
    totalDebt: 26500,
    settledAmount: 0,
    status: 'Active',
    joinDate: '2024-10-20',
    activeSettlements: 1,
  },
  {
    id: '14',
    name: 'Michelle Harris',
    email: 'mharris@email.com',
    totalDebt: 35900,
    settledAmount: 13200,
    status: 'Active',
    joinDate: '2024-06-08',
    activeSettlements: 2,
    monthlyBudget: 700,
    budgetLastUpdated: '2026-01-21',
  },
  {
    id: '15',
    name: 'Kevin Clark',
    email: 'kclark@email.com',
    totalDebt: 41300,
    settledAmount: 0,
    status: 'Pending',
    joinDate: '2024-11-28',
    activeSettlements: 0,
  },
  {
    id: '16',
    name: 'Rebecca Lewis',
    email: 'rlewis@email.com',
    totalDebt: 33600,
    settledAmount: 12100,
    status: 'Active',
    joinDate: '2024-07-15',
    activeSettlements: 2,
    monthlyBudget: 550,
    budgetLastUpdated: '2026-01-19',
  },
  {
    id: '17',
    name: 'Thomas Walker',
    email: 't.walker@email.com',
    totalDebt: 28300,
    settledAmount: 8700,
    status: 'Active',
    joinDate: '2024-08-22',
    activeSettlements: 1,
  },
  {
    id: '18',
    name: 'Laura Hall',
    email: 'lhall@email.com',
    totalDebt: 37200,
    settledAmount: 14800,
    status: 'Active',
    joinDate: '2024-05-30',
    activeSettlements: 3,
    monthlyBudget: 500,
    budgetLastUpdated: '2026-01-22',
  },
  {
    id: '19',
    name: 'Steven Young',
    email: 's.young@email.com',
    totalDebt: 46900,
    settledAmount: 19200,
    status: 'Active',
    joinDate: '2024-01-08',
    activeSettlements: 4,
    monthlyBudget: 650,
    budgetLastUpdated: '2026-01-22',
  },
  {
    id: '20',
    name: 'Karen King',
    email: 'kking@email.com',
    totalDebt: 30100,
    settledAmount: 0,
    status: 'Pending',
    joinDate: '2024-12-05',
    activeSettlements: 0,
  },
  {
    id: '21',
    name: 'Brian Wright',
    email: 'bwright@email.com',
    totalDebt: 39500,
    settledAmount: 15600,
    status: 'Active',
    joinDate: '2024-09-12',
    activeSettlements: 2,
    monthlyBudget: 600,
    budgetLastUpdated: '2026-01-23',
  },
  {
    id: '22',
    name: 'Nancy Scott',
    email: 'nscott@email.com',
    totalDebt: 32900,
    settledAmount: 10400,
    status: 'Active',
    joinDate: '2024-04-25',
    activeSettlements: 2,
  },
  {
    id: '23',
    name: 'Joseph Green',
    email: 'jgreen@email.com',
    totalDebt: 27600,
    settledAmount: 27600,
    status: 'Completed',
    joinDate: '2023-08-15',
    activeSettlements: 0,
  },
  {
    id: '24',
    name: 'Betty Adams',
    email: 'badams@email.com',
    totalDebt: 43200,
    settledAmount: 16700,
    status: 'Active',
    joinDate: '2024-03-02',
    activeSettlements: 3,
    monthlyBudget: 750,
    budgetLastUpdated: '2026-01-20',
  },
  {
    id: '25',
    name: 'Mark Nelson',
    email: 'm.nelson@email.com',
    totalDebt: 36800,
    settledAmount: 0,
    status: 'Active',
    joinDate: '2024-10-08',
    activeSettlements: 1,
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
    internalNotes: {
      repName: 'Michael Johnson',
      repPhone: '555-0123',
      repExtension: '456',
      poaFaxed: true,
      poaFaxedDate: '2024-11-15',
      notes: 'Client responsive, payment plan discussed. Follow up next week.',
      editHistory: [
        {
          editor: 'Admin User',
          timestamp: '2024-12-15 10:30 AM',
          changes: 'Updated notes and POA status'
        }
      ]
    },
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
    internalNotes: {
      repName: 'Sarah Williams',
      repPhone: '555-0145',
      poaFaxed: true,
      poaFaxedDate: '2024-10-22',
      notes: 'Settlement offer at 55% submitted. Awaiting creditor response.',
      editHistory: [
        {
          editor: 'Sarah Williams',
          timestamp: '2024-12-18 02:15 PM',
          changes: 'Added settlement offer details'
        },
        {
          editor: 'Admin User',
          timestamp: '2024-12-10 11:20 AM',
          changes: 'Initial contact established'
        }
      ]
    },
    settlementOffers: [
      {
        id: 'SO1',
        fileName: 'Capital_One_Settlement_Offer_55pct.pdf',
        uploadDate: '2024-12-18',
        uploadedBy: 'Sarah Williams',
        offerAmount: 4895,
        offerPercentage: 55
      }
    ]
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
    internalNotes: {
      repName: 'David Martinez',
      repPhone: '555-0189',
      repExtension: '221',
      poaFaxed: true,
      poaFaxedDate: '2024-09-05',
      notes: 'Legal action filed. Attorney contact established. Working on settlement.',
      editHistory: [
        {
          editor: 'David Martinez',
          timestamp: '2024-12-19 09:45 AM',
          changes: 'Updated legal status information'
        }
      ]
    },
  },
  {
    id: 'D4',
    clientId: '3',
    clientName: 'Michael Brown',
    creditor: 'Discover Card',
    originalCreditor: 'Discover Financial Services',
    collectionAgency: 'Allied Collection Group',
    type: 'Credit Card',
    originalAmount: 6600,
    currentBalance: 0,
    interestAccrued: 0,
    status: 'Settled',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Jennifer Lee',
      repPhone: '555-0198',
      poaFaxed: true,
      poaFaxedDate: '2023-12-01',
      notes: 'SETTLED: 45% of original balance. Final payment received 12/10/2024.',
      editHistory: [
        {
          editor: 'Jennifer Lee',
          timestamp: '2024-12-10 04:30 PM',
          changes: 'Marked as settled'
        }
      ]
    },
    settlementOffers: [
      {
        id: 'SO2',
        fileName: 'Discover_Final_Settlement_45pct.pdf',
        uploadDate: '2024-11-20',
        uploadedBy: 'Jennifer Lee',
        offerAmount: 2970,
        offerPercentage: 45
      }
    ]
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
    internalNotes: {
      repName: 'Robert Chen',
      repPhone: '555-0176',
      repExtension: '332',
      poaFaxed: false,
      notes: 'POA pending client signature. Documents sent via email.',
      editHistory: []
    },
  },
  // More Capital One debts (5+ clients total)
  {
    id: 'D6',
    clientId: '2',
    clientName: 'Sarah Johnson',
    creditor: 'Capital One Mastercard',
    originalCreditor: 'Capital One Bank',
    type: 'Credit Card',
    originalAmount: 7200,
    currentBalance: 5900,
    interestAccrued: 620,
    status: 'Active',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Lisa Chang',
      repPhone: '555-0234',
      poaFaxed: true,
      poaFaxedDate: '2024-03-10',
      notes: 'Client making minimum payments. Waiting for lump sum to settle.',
      editHistory: []
    },
  },
  {
    id: 'D7',
    clientId: '5',
    clientName: 'David Wilson',
    creditor: 'Capital One Auto Finance',
    originalCreditor: 'Capital One Bank',
    type: 'Auto Loan',
    originalAmount: 15600,
    currentBalance: 12400,
    interestAccrued: 1850,
    status: 'Active',
    legalStatus: 'Collections',
    internalNotes: {
      repName: 'Tom Rodriguez',
      repPhone: '555-0298',
      repExtension: '102',
      poaFaxed: true,
      poaFaxedDate: '2024-05-20',
      notes: 'Vehicle repossessed. Working on deficiency balance settlement.',
      editHistory: []
    },
  },
  {
    id: 'D8',
    clientId: '6',
    clientName: 'Jennifer Martinez',
    creditor: 'Capital One Platinum',
    originalCreditor: 'Capital One Bank',
    type: 'Credit Card',
    originalAmount: 9800,
    currentBalance: 8200,
    interestAccrued: 920,
    status: 'In Settlement',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Sarah Williams',
      repPhone: '555-0145',
      poaFaxed: true,
      poaFaxedDate: '2024-02-15',
      notes: 'Settlement offer 60% submitted. Awaiting response.',
      editHistory: []
    },
  },
  {
    id: 'D9',
    clientId: '7',
    clientName: 'Robert Taylor',
    creditor: 'Capital One Quicksilver',
    originalCreditor: 'Capital One Bank',
    type: 'Credit Card',
    originalAmount: 11300,
    currentBalance: 9700,
    interestAccrued: 1150,
    status: 'Active',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Michael Johnson',
      repPhone: '555-0123',
      poaFaxed: true,
      poaFaxedDate: '2024-11-08',
      notes: 'New account. Building rapport with creditor.',
      editHistory: []
    },
  },
  // Midland Credit Management debts (5+ clients)
  {
    id: 'D10',
    clientId: '1',
    clientName: 'John Smith',
    creditor: 'Midland Credit Management',
    originalCreditor: 'Citi Bank',
    type: 'Credit Card',
    originalAmount: 14200,
    currentBalance: 11900,
    interestAccrued: 1420,
    status: 'Active',
    legalStatus: 'Collections',
    internalNotes: {
      repName: 'Jennifer Lee',
      repPhone: '555-0198',
      repExtension: '789',
      poaFaxed: true,
      poaFaxedDate: '2024-01-20',
      notes: 'Account with Midland. Requires money order payment only.',
      editHistory: []
    },
  },
  {
    id: 'D11',
    clientId: '8',
    clientName: 'Lisa Anderson',
    creditor: 'Midland Credit Management',
    originalCreditor: 'Discover',
    type: 'Credit Card',
    originalAmount: 8700,
    currentBalance: 7200,
    interestAccrued: 760,
    status: 'In Settlement',
    legalStatus: 'Collections',
    internalNotes: {
      repName: 'David Martinez',
      repPhone: '555-0189',
      poaFaxed: true,
      poaFaxedDate: '2024-03-25',
      notes: 'Midland will settle at 40%. Money order required for payment.',
      editHistory: []
    },
  },
  {
    id: 'D12',
    clientId: '9',
    clientName: 'James Thompson',
    creditor: 'Midland Credit Management',
    originalCreditor: 'Chase Bank',
    type: 'Credit Card',
    originalAmount: 12500,
    currentBalance: 10300,
    interestAccrued: 1180,
    status: 'Active',
    legalStatus: 'Collections',
    internalNotes: {
      repName: 'Robert Chen',
      repPhone: '555-0176',
      poaFaxed: true,
      poaFaxedDate: '2024-05-15',
      notes: 'Midland account. Client saving for lump sum payment.',
      editHistory: []
    },
  },
  {
    id: 'D13',
    clientId: '10',
    clientName: 'Patricia Garcia',
    creditor: 'Midland Credit Management',
    originalCreditor: 'American Express',
    type: 'Credit Card',
    originalAmount: 16800,
    currentBalance: 14200,
    interestAccrued: 1820,
    status: 'Active',
    legalStatus: 'Collections',
    internalNotes: {
      repName: 'Tom Rodriguez',
      repPhone: '555-0298',
      poaFaxed: false,
      notes: 'POA pending. Midland purchased this Amex debt.',
      editHistory: []
    },
  },
  {
    id: 'D14',
    clientId: '11',
    clientName: 'Christopher Lee',
    creditor: 'Midland Credit Management',
    originalCreditor: 'Capital One',
    type: 'Credit Card',
    originalAmount: 9400,
    currentBalance: 7800,
    interestAccrued: 890,
    status: 'In Settlement',
    legalStatus: 'Collections',
    internalNotes: {
      repName: 'Lisa Chang',
      repPhone: '555-0234',
      poaFaxed: true,
      poaFaxedDate: '2024-03-01',
      notes: 'Settlement at 45% agreed. Money order being prepared.',
      editHistory: []
    },
  },
  {
    id: 'D15',
    clientId: '12',
    clientName: 'Amanda Rodriguez',
    creditor: 'Midland Credit Management',
    originalCreditor: 'Wells Fargo',
    type: 'Credit Card',
    originalAmount: 10600,
    currentBalance: 8900,
    interestAccrued: 980,
    status: 'Active',
    legalStatus: 'Collections',
    internalNotes: {
      repName: 'Sarah Williams',
      repPhone: '555-0145',
      poaFaxed: true,
      poaFaxedDate: '2024-04-12',
      notes: 'Midland willing to negotiate. Client preparing funds.',
      editHistory: []
    },
  },
  // Portfolio Recovery Associates debts (5+ clients)
  {
    id: 'D16',
    clientId: '13',
    clientName: 'Daniel White',
    creditor: 'Portfolio Recovery Associates',
    originalCreditor: 'Synchrony Bank',
    type: 'Credit Card',
    originalAmount: 7800,
    currentBalance: 6500,
    interestAccrued: 720,
    status: 'Active',
    legalStatus: 'Collections',
    internalNotes: {
      repName: 'Michael Johnson',
      repPhone: '555-0123',
      poaFaxed: true,
      poaFaxedDate: '2024-10-22',
      notes: 'PRA account. Accepts e-check payments.',
      editHistory: []
    },
  },
  {
    id: 'D17',
    clientId: '14',
    clientName: 'Michelle Harris',
    creditor: 'Portfolio Recovery Associates',
    originalCreditor: 'Citi Bank',
    type: 'Credit Card',
    originalAmount: 11200,
    currentBalance: 9300,
    interestAccrued: 1050,
    status: 'In Settlement',
    legalStatus: 'Collections',
    internalNotes: {
      repName: 'Jennifer Lee',
      repPhone: '555-0198',
      poaFaxed: true,
      poaFaxedDate: '2024-06-10',
      notes: 'PRA settlement offer 50% submitted. Good relationship with rep.',
      editHistory: []
    },
  },
  {
    id: 'D18',
    clientId: '15',
    clientName: 'Kevin Clark',
    creditor: 'Portfolio Recovery Associates',
    originalCreditor: 'Best Buy Card',
    type: 'Credit Card',
    originalAmount: 5900,
    currentBalance: 4800,
    interestAccrued: 540,
    status: 'Active',
    legalStatus: 'Collections',
    internalNotes: {
      repName: 'David Martinez',
      repPhone: '555-0189',
      poaFaxed: false,
      notes: 'New PRA account. POA being processed.',
      editHistory: []
    },
  },
  {
    id: 'D19',
    clientId: '16',
    clientName: 'Rebecca Lewis',
    creditor: 'Portfolio Recovery Associates',
    originalCreditor: 'Home Depot Credit',
    type: 'Credit Card',
    originalAmount: 8400,
    currentBalance: 7100,
    interestAccrued: 790,
    status: 'Active',
    legalStatus: 'Collections',
    internalNotes: {
      repName: 'Robert Chen',
      repPhone: '555-0176',
      poaFaxed: true,
      poaFaxedDate: '2024-07-18',
      notes: 'PRA willing to settle around 45-50%.',
      editHistory: []
    },
  },
  {
    id: 'D20',
    clientId: '17',
    clientName: 'Thomas Walker',
    creditor: 'Portfolio Recovery Associates',
    originalCreditor: 'Macys Credit Card',
    type: 'Credit Card',
    originalAmount: 6200,
    currentBalance: 5100,
    interestAccrued: 570,
    status: 'In Settlement',
    legalStatus: 'Collections',
    internalNotes: {
      repName: 'Tom Rodriguez',
      repPhone: '555-0298',
      poaFaxed: true,
      poaFaxedDate: '2024-08-25',
      notes: 'PRA settlement 48% accepted. Payment pending.',
      editHistory: []
    },
  },
  {
    id: 'D21',
    clientId: '18',
    clientName: 'Laura Hall',
    creditor: 'Portfolio Recovery Associates',
    originalCreditor: 'Target RedCard',
    type: 'Credit Card',
    originalAmount: 4700,
    currentBalance: 3900,
    interestAccrued: 430,
    status: 'Active',
    legalStatus: 'Collections',
    internalNotes: {
      repName: 'Lisa Chang',
      repPhone: '555-0234',
      poaFaxed: true,
      poaFaxedDate: '2024-06-01',
      notes: 'PRA account in good standing. Client building payment fund.',
      editHistory: []
    },
  },
  // Discover Card debts (additional 5+ clients)
  {
    id: 'D22',
    clientId: '19',
    clientName: 'Steven Young',
    creditor: 'Discover Card',
    originalCreditor: 'Discover Financial Services',
    type: 'Credit Card',
    originalAmount: 13800,
    currentBalance: 11600,
    interestAccrued: 1340,
    status: 'Active',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Sarah Williams',
      repPhone: '555-0145',
      poaFaxed: true,
      poaFaxedDate: '2024-01-10',
      notes: 'Direct with Discover. No collections yet. Working on settlement.',
      editHistory: []
    },
  },
  {
    id: 'D23',
    clientId: '20',
    clientName: 'Karen King',
    creditor: 'Discover Card',
    originalCreditor: 'Discover Financial Services',
    type: 'Credit Card',
    originalAmount: 9200,
    currentBalance: 7800,
    interestAccrued: 860,
    status: 'Active',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Michael Johnson',
      repPhone: '555-0123',
      poaFaxed: false,
      notes: 'New Discover account. POA pending.',
      editHistory: []
    },
  },
  {
    id: 'D24',
    clientId: '21',
    clientName: 'Brian Wright',
    creditor: 'Discover Card',
    originalCreditor: 'Discover Financial Services',
    collectionAgency: 'Allied Collection Group',
    type: 'Credit Card',
    originalAmount: 10500,
    currentBalance: 8700,
    interestAccrued: 980,
    status: 'In Settlement',
    legalStatus: 'Collections',
    internalNotes: {
      repName: 'Jennifer Lee',
      repPhone: '555-0198',
      poaFaxed: true,
      poaFaxedDate: '2024-09-15',
      notes: 'With collections. Settlement offer 52% pending.',
      editHistory: []
    },
  },
  {
    id: 'D25',
    clientId: '22',
    clientName: 'Nancy Scott',
    creditor: 'Discover Card',
    originalCreditor: 'Discover Financial Services',
    type: 'Credit Card',
    originalAmount: 7600,
    currentBalance: 6300,
    interestAccrued: 710,
    status: 'Active',
    legalStatus: 'None',
    internalNotes: {
      repName: 'David Martinez',
      repPhone: '555-0189',
      poaFaxed: true,
      poaFaxedDate: '2024-04-28',
      notes: 'Discover account. Client current on minimum payments.',
      editHistory: []
    },
  },
  {
    id: 'D26',
    clientId: '23',
    clientName: 'Joseph Green',
    creditor: 'Discover Card',
    originalCreditor: 'Discover Financial Services',
    type: 'Credit Card',
    originalAmount: 8100,
    currentBalance: 0,
    interestAccrued: 0,
    status: 'Settled',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Robert Chen',
      repPhone: '555-0176',
      poaFaxed: true,
      poaFaxedDate: '2023-08-18',
      notes: 'SETTLED: 42% of balance. Case closed.',
      editHistory: []
    },
  },
  // Chase Bank debts (5+ clients)
  {
    id: 'D27',
    clientId: '24',
    clientName: 'Betty Adams',
    creditor: 'Chase Sapphire Card',
    originalCreditor: 'Chase Bank',
    type: 'Credit Card',
    originalAmount: 15400,
    currentBalance: 12900,
    interestAccrued: 1520,
    status: 'Active',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Tom Rodriguez',
      repPhone: '555-0298',
      poaFaxed: true,
      poaFaxedDate: '2024-03-05',
      notes: 'Chase account. Client making payments. Settlement discussion pending.',
      editHistory: []
    },
  },
  {
    id: 'D28',
    clientId: '25',
    clientName: 'Mark Nelson',
    creditor: 'Chase Freedom Card',
    originalCreditor: 'Chase Bank',
    type: 'Credit Card',
    originalAmount: 11900,
    currentBalance: 9800,
    interestAccrued: 1120,
    status: 'Active',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Lisa Chang',
      repPhone: '555-0234',
      poaFaxed: false,
      notes: 'New Chase account. POA being sent.',
      editHistory: []
    },
  },
  {
    id: 'D29',
    clientId: '5',
    clientName: 'David Wilson',
    creditor: 'Chase Premier Plus Checking Overdraft',
    originalCreditor: 'Chase Bank',
    type: 'Bank Overdraft',
    originalAmount: 4200,
    currentBalance: 3500,
    interestAccrued: 380,
    status: 'Active',
    legalStatus: 'Collections',
    internalNotes: {
      repName: 'Sarah Williams',
      repPhone: '555-0145',
      poaFaxed: true,
      poaFaxedDate: '2024-03-08',
      notes: 'Chase overdraft account. Client account closed. Working on settlement.',
      editHistory: []
    },
  },
  {
    id: 'D30',
    clientId: '8',
    clientName: 'Lisa Anderson',
    creditor: 'Chase Amazon Visa',
    originalCreditor: 'Chase Bank',
    type: 'Credit Card',
    originalAmount: 8900,
    currentBalance: 7400,
    interestAccrued: 820,
    status: 'In Settlement',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Michael Johnson',
      repPhone: '555-0123',
      poaFaxed: true,
      poaFaxedDate: '2024-03-20',
      notes: 'Chase settlement offer 58% submitted.',
      editHistory: []
    },
  },
  {
    id: 'D31',
    clientId: '12',
    clientName: 'Amanda Rodriguez',
    creditor: 'Chase Slate Card',
    originalCreditor: 'Chase Bank',
    type: 'Credit Card',
    originalAmount: 10200,
    currentBalance: 8500,
    interestAccrued: 940,
    status: 'Active',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Jennifer Lee',
      repPhone: '555-0198',
      poaFaxed: true,
      poaFaxedDate: '2024-04-15',
      notes: 'Chase account in good standing. Building settlement funds.',
      editHistory: []
    },
  },
  // Citibank debts (5+ clients)
  {
    id: 'D32',
    clientId: '6',
    clientName: 'Jennifer Martinez',
    creditor: 'Citi Diamond Preferred Card',
    originalCreditor: 'Citibank',
    type: 'Credit Card',
    originalAmount: 12300,
    currentBalance: 10200,
    interestAccrued: 1180,
    status: 'Active',
    legalStatus: 'None',
    internalNotes: {
      repName: 'David Martinez',
      repPhone: '555-0189',
      poaFaxed: true,
      poaFaxedDate: '2024-01-25',
      notes: 'Citi account. Client responsive. Working on payment plan.',
      editHistory: []
    },
  },
  {
    id: 'D33',
    clientId: '11',
    clientName: 'Christopher Lee',
    creditor: 'Citi Rewards Card',
    originalCreditor: 'Citibank',
    type: 'Credit Card',
    originalAmount: 9700,
    currentBalance: 8100,
    interestAccrued: 890,
    status: 'Active',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Robert Chen',
      repPhone: '555-0176',
      poaFaxed: true,
      poaFaxedDate: '2024-03-02',
      notes: 'Citi willing to negotiate. Client preparing lump sum.',
      editHistory: []
    },
  },
  {
    id: 'D34',
    clientId: '14',
    clientName: 'Michelle Harris',
    creditor: 'Citi Simplicity Card',
    originalCreditor: 'Citibank',
    type: 'Credit Card',
    originalAmount: 8500,
    currentBalance: 7100,
    interestAccrued: 780,
    status: 'In Settlement',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Tom Rodriguez',
      repPhone: '555-0298',
      poaFaxed: true,
      poaFaxedDate: '2024-06-12',
      notes: 'Citi settlement 55% offer pending approval.',
      editHistory: []
    },
  },
  {
    id: 'D35',
    clientId: '16',
    clientName: 'Rebecca Lewis',
    creditor: 'Citi Double Cash Card',
    originalCreditor: 'Citibank',
    type: 'Credit Card',
    originalAmount: 11800,
    currentBalance: 9900,
    interestAccrued: 1100,
    status: 'Active',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Lisa Chang',
      repPhone: '555-0234',
      poaFaxed: true,
      poaFaxedDate: '2024-07-18',
      notes: 'Citi account. Good payment history. Settlement discussion soon.',
      editHistory: []
    },
  },
  {
    id: 'D36',
    clientId: '19',
    clientName: 'Steven Young',
    creditor: 'Citi Premier Card',
    originalCreditor: 'Citibank',
    type: 'Credit Card',
    originalAmount: 14200,
    currentBalance: 11900,
    interestAccrued: 1360,
    status: 'Active',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Sarah Williams',
      repPhone: '555-0145',
      poaFaxed: true,
      poaFaxedDate: '2024-01-12',
      notes: 'Citi premium card. Client building settlement fund.',
      editHistory: []
    },
  },
  // American Express debts (5+ clients)
  {
    id: 'D37',
    clientId: '4',
    clientName: 'Emily Davis',
    creditor: 'American Express Gold Card',
    originalCreditor: 'American Express',
    type: 'Charge Card',
    originalAmount: 18500,
    currentBalance: 15600,
    interestAccrued: 1920,
    status: 'Active',
    legalStatus: 'Legal Pursuit',
    internalNotes: {
      repName: 'Michael Johnson',
      repPhone: '555-0123',
      poaFaxed: false,
      notes: 'Amex has filed legal action. POA urgent. Attorney involved.',
      editHistory: []
    },
  },
  {
    id: 'D38',
    clientId: '7',
    clientName: 'Robert Taylor',
    creditor: 'American Express Blue Cash',
    originalCreditor: 'American Express',
    type: 'Credit Card',
    originalAmount: 13400,
    currentBalance: 11200,
    interestAccrued: 1290,
    status: 'Active',
    legalStatus: 'Collections',
    internalNotes: {
      repName: 'Jennifer Lee',
      repPhone: '555-0198',
      poaFaxed: true,
      poaFaxedDate: '2024-11-08',
      notes: 'Amex in collections. Working on settlement terms.',
      editHistory: []
    },
  },
  {
    id: 'D39',
    clientId: '13',
    clientName: 'Daniel White',
    creditor: 'American Express Everyday Card',
    originalCreditor: 'American Express',
    type: 'Credit Card',
    originalAmount: 9800,
    currentBalance: 8200,
    interestAccrued: 910,
    status: 'Active',
    legalStatus: 'None',
    internalNotes: {
      repName: 'David Martinez',
      repPhone: '555-0189',
      poaFaxed: true,
      poaFaxedDate: '2024-10-25',
      notes: 'Amex account. Client making minimum payments.',
      editHistory: []
    },
  },
  {
    id: 'D40',
    clientId: '18',
    clientName: 'Laura Hall',
    creditor: 'American Express Platinum',
    originalCreditor: 'American Express',
    type: 'Charge Card',
    originalAmount: 22100,
    currentBalance: 18500,
    interestAccrued: 2380,
    status: 'In Settlement',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Robert Chen',
      repPhone: '555-0176',
      poaFaxed: true,
      poaFaxedDate: '2024-06-02',
      notes: 'Amex Platinum. Settlement offer 62% submitted. High balance.',
      editHistory: []
    },
  },
  {
    id: 'D41',
    clientId: '21',
    clientName: 'Brian Wright',
    creditor: 'American Express Delta SkyMiles',
    originalCreditor: 'American Express',
    type: 'Credit Card',
    originalAmount: 11600,
    currentBalance: 9700,
    interestAccrued: 1080,
    status: 'Active',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Tom Rodriguez',
      repPhone: '555-0298',
      poaFaxed: true,
      poaFaxedDate: '2024-09-18',
      notes: 'Amex co-branded card. Client building settlement funds.',
      editHistory: []
    },
  },
  // Synchrony Bank debts (5+ clients)
  {
    id: 'D42',
    clientId: '9',
    clientName: 'James Thompson',
    creditor: 'Synchrony Bank - Amazon Store Card',
    originalCreditor: 'Synchrony Bank',
    type: 'Credit Card',
    originalAmount: 6700,
    currentBalance: 5600,
    interestAccrued: 620,
    status: 'Active',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Lisa Chang',
      repPhone: '555-0234',
      poaFaxed: true,
      poaFaxedDate: '2024-05-18',
      notes: 'Synchrony store card. Client responsive.',
      editHistory: []
    },
  },
  {
    id: 'D43',
    clientId: '15',
    clientName: 'Kevin Clark',
    creditor: 'Synchrony Bank - Lowes Card',
    originalCreditor: 'Synchrony Bank',
    type: 'Credit Card',
    originalAmount: 8900,
    currentBalance: 7400,
    interestAccrued: 820,
    status: 'Active',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Sarah Williams',
      repPhone: '555-0145',
      poaFaxed: false,
      notes: 'Synchrony Lowes card. POA pending.',
      editHistory: []
    },
  },
  {
    id: 'D44',
    clientId: '17',
    clientName: 'Thomas Walker',
    creditor: 'Synchrony Bank - PayPal Credit',
    originalCreditor: 'Synchrony Bank',
    type: 'Credit Card',
    originalAmount: 5200,
    currentBalance: 4300,
    interestAccrued: 480,
    status: 'In Settlement',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Michael Johnson',
      repPhone: '555-0123',
      poaFaxed: true,
      poaFaxedDate: '2024-08-28',
      notes: 'Synchrony PayPal credit. Settlement 50% pending.',
      editHistory: []
    },
  },
  {
    id: 'D45',
    clientId: '20',
    clientName: 'Karen King',
    creditor: 'Synchrony Bank - Sam\'s Club Card',
    originalCreditor: 'Synchrony Bank',
    type: 'Credit Card',
    originalAmount: 7100,
    currentBalance: 5900,
    interestAccrued: 660,
    status: 'Active',
    legalStatus: 'None',
    internalNotes: {
      repName: 'Jennifer Lee',
      repPhone: '555-0198',
      poaFaxed: false,
      notes: 'Synchrony store card. New account, POA in progress.',
      editHistory: []
    },
  },
  {
    id: 'D46',
    clientId: '22',
    clientName: 'Nancy Scott',
    creditor: 'Synchrony Bank - Care Credit',
    originalCreditor: 'Synchrony Bank',
    type: 'Medical Credit',
    originalAmount: 9400,
    currentBalance: 7800,
    interestAccrued: 870,
    status: 'Active',
    legalStatus: 'None',
    internalNotes: {
      repName: 'David Martinez',
      repPhone: '555-0189',
      poaFaxed: true,
      poaFaxedDate: '2024-04-30',
      notes: 'Synchrony CareCredit for medical expenses. Working on settlement.',
      editHistory: []
    },
  },
];

const mockReminders: Reminder[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'John Smith',
    title: 'Payment Follow-up',
    description: 'Client will have budget available after paycheck to settle Capital One debt.',
    dueDate: '2025-01-22',
    priority: 'High',
    status: 'Pending',
    category: 'Payment',
    createdDate: '2025-01-20'
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Sarah Johnson',
    title: 'Settlement Negotiation',
    description: 'Follow up on Chase settlement offer. Client expecting bonus mid-February.',
    dueDate: '2025-02-15',
    priority: 'Medium',
    status: 'Pending',
    category: 'Settlement',
    createdDate: '2025-01-18'
  },
  {
    id: '3',
    clientId: '4',
    clientName: 'Emily Davis',
    title: 'Documentation Review',
    description: 'Review and process POA documents for medical debt settlement.',
    dueDate: '2025-01-22',
    priority: 'High',
    status: 'Pending',
    category: 'Documentation',
    createdDate: '2025-01-22'
  },
  {
    id: '4',
    clientId: '1',
    clientName: 'John Smith',
    title: 'Monthly Check-in',
    description: 'Scheduled monthly progress call to discuss remaining debts.',
    dueDate: '2025-02-05',
    priority: 'Low',
    status: 'Pending',
    category: 'Follow-up',
    createdDate: '2025-01-15'
  },
  {
    id: '5',
    clientId: '5',
    clientName: 'David Wilson',
    title: 'Budget Available - Settlement Ready',
    description: 'Client confirmed budget is ready today to settle medical debt.',
    dueDate: '2025-01-22',
    priority: 'High',
    status: 'Pending',
    category: 'Payment',
    createdDate: '2025-01-18'
  },
  {
    id: '6',
    clientId: '2',
    clientName: 'Sarah Johnson',
    title: 'Overdue Follow-up',
    description: 'Client missed last week\'s payment deadline. Needs immediate follow-up.',
    dueDate: '2025-01-15',
    priority: 'High',
    status: 'Pending',
    category: 'Follow-up',
    createdDate: '2025-01-10'
  }
];

const mockCreditorPolicies: CreditorPolicy[] = [
  {
    id: '1',
    creditorName: 'Target',
    willSettle: false,
    notes: '',
    lastUpdated: '2025-01-15',
    phone: '1-800-591-3869',
    fax: '1-877-258-2821',
    address: 'Target National Bank, PO Box 9491, Minneapolis, MN 55440',
    paymentMethods: {
      payByPhone: true,
      payByPhoneFee: '$0',
      eCheck: true,
      creditCard: true,
      creditCardFee: '$0'
    }
  },
  {
    id: '2',
    creditorName: 'Macy\'s',
    willSettle: false,
    notes: '',
    lastUpdated: '2025-01-10',
    phone: '1-888-257-6757',
    fax: '1-800-289-6229',
    address: 'Macy\'s Credit Services, PO Box 8113, Mason, OH 45040',
    paymentMethods: {
      payByPhone: true,
      payByPhoneFee: '$0',
      eCheck: true,
      creditCard: false
    }
  },
  {
    id: '3',
    creditorName: 'Capital One',
    willSettle: true,
    minimumSettlementPercentage: 50,
    maximumSettlementPercentage: 70,
    notes: '',
    lastUpdated: '2025-01-20',
    phone: '1-800-227-4825',
    fax: '1-804-284-6805',
    address: 'Capital One, PO Box 30285, Salt Lake City, UT 84130',
    paymentMethods: {
      payByPhone: true,
      payByPhoneFee: '$0',
      eCheck: true,
      creditCard: true,
      creditCardFee: '$14.95',
      bankDraft: true
    }
  },
  {
    id: '4',
    creditorName: 'Discover Card',
    willSettle: true,
    minimumSettlementPercentage: 40,
    maximumSettlementPercentage: 60,
    notes: '',
    lastUpdated: '2025-01-18',
    phone: '1-800-347-2683',
    fax: '1-800-669-6780',
    address: 'Discover Card, PO Box 6103, Carol Stream, IL 60197',
    paymentMethods: {
      payByPhone: true,
      payByPhoneFee: '$0',
      eCheck: true,
      creditCard: false
    }
  },
  {
    id: '5',
    creditorName: 'Chase Bank',
    willSettle: true,
    minimumSettlementPercentage: 45,
    maximumSettlementPercentage: 65,
    notes: '',
    lastUpdated: '2025-01-12',
    phone: '1-800-432-3117',
    fax: '1-866-481-2657',
    address: 'Chase Card Services, PO Box 15298, Wilmington, DE 19850',
    paymentMethods: {
      payByPhone: true,
      payByPhoneFee: '$10',
      eCheck: true,
      creditCard: true,
      creditCardFee: '$10'
    }
  },
  {
    id: '6',
    creditorName: 'Citibank',
    willSettle: true,
    minimumSettlementPercentage: 35,
    maximumSettlementPercentage: 55,
    notes: '',
    lastUpdated: '2025-01-08',
    phone: '1-800-950-5114',
    fax: '1-800-945-0258',
    address: 'Citibank, PO Box 6500, The Lakes, NV 88901',
    paymentMethods: {
      payByPhone: true,
      payByPhoneFee: '$0',
      eCheck: true,
      creditCard: false,
      bankDraft: true
    }
  },
  {
    id: '7',
    creditorName: 'American Express',
    willSettle: false,
    notes: '',
    lastUpdated: '2025-01-05',
    phone: '1-800-528-4800',
    fax: '1-480-422-1234',
    address: 'American Express, PO Box 650448, Dallas, TX 75265',
    paymentMethods: {
      payByPhone: true,
      payByPhoneFee: '$0',
      eCheck: true,
      creditCard: false
    }
  },
  {
    id: '8',
    creditorName: 'Midland Credit Management',
    willSettle: true,
    minimumSettlementPercentage: 30,
    maximumSettlementPercentage: 50,
    notes: '',
    lastUpdated: '2025-01-22',
    phone: '1-800-296-2657',
    fax: '1-619-338-7935',
    address: 'Midland Credit Management, PO Box 939069, San Diego, CA 92193',
    paymentMethods: {
      moneyOrderOnly: true,
      payByPhone: false,
      eCheck: false,
      creditCard: false
    }
  }
];

const emptyPolicyForm = {
  creditorName: '',
  willSettle: true,
  minimumSettlementPercentage: '',
  maximumSettlementPercentage: '',
  notes: '',
  phone: '',
  fax: '',
  address: '',
  moneyOrderOnly: false,
  eCheck: false,
  payByPhone: false,
  payByPhoneFee: '',
  creditCard: false,
  creditCardFee: '',
  bankDraft: false,
  otherPayment: ''
};

export function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [editedNotes, setEditedNotes] = useState<Debt['internalNotes'] | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(true);
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [clientSearchText, setClientSearchText] = useState<string>('');
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [clientFormErrors, setClientFormErrors] = useState<Record<string, string>>({});
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [newReminder, setNewReminder] = useState({
    clientId: '',
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    category: 'Payment' as 'Payment' | 'Follow-up' | 'Settlement' | 'Documentation' | 'Other'
  });
  const [reminderFilter, setReminderFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [showNotificationBanner, setShowNotificationBanner] = useState(true);
  const [creditorPolicies, setCreditorPolicies] = useState<CreditorPolicy[]>(mockCreditorPolicies);
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<CreditorPolicy | null>(null);
  const [newPolicy, setNewPolicy] = useState(emptyPolicyForm);
  const [policySearchQuery, setPolicySearchQuery] = useState('');
  const [activePage, setActivePage] = useState<'dashboard' | 'clients' | 'debts' | 'tasks' | 'policies' | 'representatives' | 'creditor-lookup' | 'budget-approvals'>('dashboard');
  const [creditorSearchQuery, setCreditorSearchQuery] = useState('');
  const [creditorLookupSort, setCreditorLookupSort] = useState<'name' | 'debt' | 'budget'>('name');
  const [creditorLookupFilter, setCreditorLookupFilter] = useState<'all' | 'with-budget' | 'no-budget'>('all');
  const [budgetApprovalMessages, setBudgetApprovalMessages] = useState<BudgetApprovalMessage[]>([]);
  const [showSendBudgetMessage, setShowSendBudgetMessage] = useState(false);
  const [selectedClientForBudget, setSelectedClientForBudget] = useState<Client | null>(null);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [clientData, debtData] = await Promise.all([
          apiFetch<Client[]>('/admin/clients'),
          apiFetch<Debt[]>('/admin/debts'),
        ]);
        setClients(clientData);
        setDebts(debtData);
      } catch (error) {
        setLoadError('Unable to load admin data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name)); // Alphabetical order

  // Filter debts by selected client and text search
  const filteredDebts = debts.filter(debt => {
    // First apply dropdown filter
    const matchesDropdown = clientFilter === 'all' || debt.clientId === clientFilter;
    
    // Then apply text search filter
    if (clientSearchText.trim() === '') {
      return matchesDropdown;
    }
    
    const client = clients.find(c => c.id === debt.clientId);
    const matchesSearch = client?.name.toLowerCase().includes(clientSearchText.toLowerCase()) || false;
    
    return matchesDropdown && matchesSearch;
  }).sort((a, b) => a.clientName.localeCompare(b.clientName)); // Alphabetical order by client name

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'Active').length;
  const totalDebtManaged = clients.reduce((sum, c) => sum + c.totalDebt, 0);
  const totalSettled = clients.reduce((sum, c) => sum + c.settledAmount, 0);

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

  const handleDebtClick = (debt: Debt) => {
    setSelectedDebt(debt);
    setEditedNotes(debt.internalNotes || {
      repName: '',
      repPhone: '',
      repExtension: '',
      poaFaxed: false,
      poaFaxedDate: '',
      notes: '',
      editHistory: [],
    });
  };

  const handleSaveNotes = () => {
    if (selectedDebt && editedNotes) {
      // Add new edit history entry
      const newHistoryEntry: EditHistoryEntry = {
        editor: 'Admin User',
        timestamp: new Date().toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        changes: 'Updated internal notes'
      };

      const updatedNotes = {
        ...editedNotes,
        editHistory: [newHistoryEntry, ...(editedNotes.editHistory || [])]
      };

      const updatedDebt = { ...selectedDebt, internalNotes: updatedNotes };
      apiFetch<Debt>(`/admin/debts/${selectedDebt.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          internalNotes: updatedNotes,
          settlementOffers: selectedDebt.settlementOffers || [],
        }),
      })
        .then((response) => {
          const updatedDebts = debts.map(d =>
            d.id === selectedDebt.id
              ? { ...d, internalNotes: response.internalNotes }
              : d
          );
          setDebts(updatedDebts);
          setSelectedDebt({ ...selectedDebt, internalNotes: response.internalNotes });
          setEditedNotes(response.internalNotes || updatedNotes);
        })
        .catch(() => {
          setLoadError('Unable to save internal notes.');
        });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedDebt) {
      // Create new settlement offer
      const newOffer: SettlementOffer = {
        id: 'SO' + Date.now(),
        fileName: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: 'Admin User',
        offerAmount: 0, // Would be entered separately
        offerPercentage: 0
      };

      const updatedOffers = [...(selectedDebt.settlementOffers || []), newOffer];

      apiFetch<Debt>(`/admin/debts/${selectedDebt.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          internalNotes: selectedDebt.internalNotes || null,
          settlementOffers: updatedOffers,
        }),
      })
        .then((response) => {
          const updatedDebts = debts.map(d =>
            d.id === selectedDebt.id
              ? { ...d, settlementOffers: response.settlementOffers }
              : d
          );
          setDebts(updatedDebts);
          setSelectedDebt({ ...selectedDebt, settlementOffers: response.settlementOffers });
        })
        .catch(() => {
          setLoadError('Unable to save settlement offer.');
        });
    }
  };

  const handleAddClient = () => {
    const errors: Record<string, string> = {};
    
    if (!newClient.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!newClient.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClient.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!newClient.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    if (!newClient.password) {
      errors.password = 'Password is required';
    } else if (newClient.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!newClient.confirmPassword) {
      errors.confirmPassword = 'Please confirm password';
    } else if (newClient.password !== newClient.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setClientFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      apiFetch<Client>('/admin/clients', {
        method: 'POST',
        body: JSON.stringify({
          name: newClient.name,
          email: newClient.email,
          phone: newClient.phone,
          status: 'Pending',
          joinDate: new Date().toISOString().split('T')[0],
        }),
      })
        .then((createdClient) => {
          setClients([...clients, createdClient]);
          setShowAddClientModal(false);
          setNewClient({
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: ''
          });
          setClientFormErrors({});
        })
        .catch(() => {
          setLoadError('Unable to add client.');
        });
    }
  };

  const handleAddReminder = () => {
    if (!newReminder.clientId || !newReminder.title || !newReminder.dueDate) {
      return;
    }

    const client = clients.find(c => c.id === newReminder.clientId);
    if (!client) return;

    const reminder: Reminder = {
      id: Date.now().toString(),
      clientId: newReminder.clientId,
      clientName: client.name,
      title: newReminder.title,
      description: newReminder.description,
      dueDate: newReminder.dueDate,
      priority: newReminder.priority,
      status: 'Pending',
      category: newReminder.category,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setReminders([...reminders, reminder]);
    setShowAddReminderModal(false);
    setNewReminder({
      clientId: '',
      title: '',
      description: '',
      dueDate: '',
      priority: 'Medium',
      category: 'Payment'
    });
  };

  const handleCompleteReminder = (id: string) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, status: 'Completed' as const } : r
    ));
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const getFilteredReminders = () => {
    const today = new Date().toISOString().split('T')[0];
    
    return reminders.filter(reminder => {
      if (reminderFilter === 'pending') return reminder.status === 'Pending';
      if (reminderFilter === 'completed') return reminder.status === 'Completed';
      if (reminderFilter === 'overdue') return reminder.status === 'Pending' && reminder.dueDate < today;
      return true;
    });
  };

  const getUpcomingRemindersCount = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return reminders.filter(r => 
      r.status === 'Pending' && 
      new Date(r.dueDate) >= today && 
      new Date(r.dueDate) <= nextWeek
    ).length;
  };

  const getOverdueRemindersCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return reminders.filter(r => r.status === 'Pending' && r.dueDate < today).length;
  };

  const getTodaysReminders = () => {
    const today = new Date().toISOString().split('T')[0];
    return reminders.filter(r => r.status === 'Pending' && r.dueDate === today);
  };

  const handleAddOrUpdatePolicy = () => {
    if (!newPolicy.creditorName.trim()) {
      return;
    }

    const paymentMethods = {
      moneyOrderOnly: newPolicy.moneyOrderOnly,
      eCheck: newPolicy.eCheck,
      payByPhone: newPolicy.payByPhone,
      payByPhoneFee: newPolicy.payByPhoneFee,
      creditCard: newPolicy.creditCard,
      creditCardFee: newPolicy.creditCardFee,
      bankDraft: newPolicy.bankDraft,
      other: newPolicy.otherPayment
    };

    if (editingPolicy) {
      // Update existing policy
      const updatedPolicy: CreditorPolicy = {
        ...editingPolicy,
        creditorName: newPolicy.creditorName,
        willSettle: newPolicy.willSettle,
        minimumSettlementPercentage: newPolicy.willSettle && newPolicy.minimumSettlementPercentage 
          ? parseInt(newPolicy.minimumSettlementPercentage) 
          : undefined,
        maximumSettlementPercentage: newPolicy.willSettle && newPolicy.maximumSettlementPercentage 
          ? parseInt(newPolicy.maximumSettlementPercentage) 
          : undefined,
        notes: newPolicy.notes,
        phone: newPolicy.phone,
        fax: newPolicy.fax,
        address: newPolicy.address,
        paymentMethods,
        lastUpdated: new Date().toISOString().split('T')[0]
      };

      setCreditorPolicies(creditorPolicies.map(p => p.id === editingPolicy.id ? updatedPolicy : p));
    } else {
      // Add new policy
      const policy: CreditorPolicy = {
        id: Date.now().toString(),
        creditorName: newPolicy.creditorName,
        willSettle: newPolicy.willSettle,
        minimumSettlementPercentage: newPolicy.willSettle && newPolicy.minimumSettlementPercentage 
          ? parseInt(newPolicy.minimumSettlementPercentage) 
          : undefined,
        maximumSettlementPercentage: newPolicy.willSettle && newPolicy.maximumSettlementPercentage 
          ? parseInt(newPolicy.maximumSettlementPercentage) 
          : undefined,
        notes: newPolicy.notes,
        phone: newPolicy.phone,
        fax: newPolicy.fax,
        address: newPolicy.address,
        paymentMethods,
        lastUpdated: new Date().toISOString().split('T')[0]
      };

      setCreditorPolicies([...creditorPolicies, policy]);
    }

    setShowAddPolicyModal(false);
    setEditingPolicy(null);
    setNewPolicy(emptyPolicyForm);
  };

  const handleEditPolicy = (policy: CreditorPolicy) => {
    setEditingPolicy(policy);
    setNewPolicy({
      creditorName: policy.creditorName,
      willSettle: policy.willSettle,
      minimumSettlementPercentage: policy.minimumSettlementPercentage?.toString() || '',
      maximumSettlementPercentage: policy.maximumSettlementPercentage?.toString() || '',
      notes: policy.notes,
      phone: policy.phone || '',
      fax: policy.fax || '',
      address: policy.address || '',
      moneyOrderOnly: policy.paymentMethods?.moneyOrderOnly || false,
      eCheck: policy.paymentMethods?.eCheck || false,
      payByPhone: policy.paymentMethods?.payByPhone || false,
      payByPhoneFee: policy.paymentMethods?.payByPhoneFee || '',
      creditCard: policy.paymentMethods?.creditCard || false,
      creditCardFee: policy.paymentMethods?.creditCardFee || '',
      bankDraft: policy.paymentMethods?.bankDraft || false,
      otherPayment: policy.paymentMethods?.other || ''
    });
    setShowAddPolicyModal(true);
  };

  const handleDeletePolicy = (id: string) => {
    setCreditorPolicies(creditorPolicies.filter(p => p.id !== id));
  };

  const getFilteredPolicies = () => {
    return creditorPolicies.filter(policy =>
      policy.creditorName.toLowerCase().includes(policySearchQuery.toLowerCase())
    );
  };

  const navigationItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'clients' as const, label: 'Clients', icon: Users, badge: null },
    { id: 'debts' as const, label: 'All Debts', icon: FileText, badge: null },
    { id: 'budget-approvals' as const, label: 'Available Budget', icon: Wallet, badge: clients.filter(c => c.monthlyBudget && c.monthlyBudget > 0).length },
    { id: 'creditor-lookup' as const, label: 'Creditor Lookup', icon: Search, badge: null },
    { id: 'tasks' as const, label: 'Tasks & Reminders', icon: Bell, badge: getTodaysReminders().length + getOverdueRemindersCount() },
    { id: 'policies' as const, label: 'Creditor Policies', icon: Shield, badge: null },
    { id: 'representatives' as const, label: 'Representatives', icon: UserCog, badge: null }
  ];

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          Loading admin data...
        </div>
      )}
      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap relative ${
                  isActive 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge !== null && item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                    isActive 
                      ? 'bg-white text-green-600' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification Banners - Show on all pages */}
      {/* Today's Reminders Notification Banner */}
      {showNotificationBanner && getTodaysReminders().length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg p-4 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-gray-900 font-semibold">
                    {getTodaysReminders().length} Reminder{getTodaysReminders().length > 1 ? 's' : ''} Due Today
                  </h4>
                  <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs rounded-full font-medium">
                    Action Required
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  You have tasks scheduled for today. Review and complete them below.
                </p>
                
                {/* Today's Reminders List */}
                <div className="space-y-2">
                  {getTodaysReminders().map((reminder) => {
                    const priorityColors = {
                      Low: 'bg-gray-100 text-gray-700 border-gray-300',
                      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                      High: 'bg-red-100 text-red-800 border-red-300'
                    };
                    
                    return (
                      <div 
                        key={reminder.id} 
                        className="bg-white border border-yellow-200 rounded-lg p-3 flex items-start justify-between gap-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="text-gray-900 font-medium">{reminder.title}</h5>
                            <span className={`px-2 py-0.5 text-xs rounded border ${priorityColors[reminder.priority]}`}>
                              {reminder.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">{reminder.clientName}</span>
                            {reminder.description && ` - ${reminder.description}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Due today • {reminder.category}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCompleteReminder(reminder.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Complete
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowNotificationBanner(false)}
              className="p-1 hover:bg-yellow-100 rounded transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Overdue Reminders Warning */}
      {showNotificationBanner && getOverdueRemindersCount() > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-400 rounded-lg p-4 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-gray-900 font-semibold">
                    {getOverdueRemindersCount()} Overdue Reminder{getOverdueRemindersCount() > 1 ? 's' : ''}
                  </h4>
                  <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-medium">
                    Urgent
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  You have overdue tasks that need immediate attention. Scroll down to the Tasks & Reminders section to review them.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNotificationBanner(false)}
              className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Page */}
      {activePage === 'dashboard' && (
        <>
          {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Clients</p>
              <p className="text-2xl text-gray-900 mt-1">{totalClients}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-4">↑ {activeClients} active</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Debt Managed</p>
              <p className="text-2xl text-gray-900 mt-1">${(totalDebtManaged / 1000).toFixed(0)}K</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">${totalDebtManaged.toLocaleString()} total</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Settled</p>
              <p className="text-2xl text-gray-900 mt-1">${(totalSettled / 1000).toFixed(0)}K</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">{((totalSettled / totalDebtManaged) * 100).toFixed(1)}% of total</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="text-2xl text-gray-900 mt-1">87%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-4">↑ 5% from last month</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-gray-900 mb-4">Recent Admin Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900">Settlement approved for John Smith</p>
              <p className="text-sm text-gray-500">Capital One Visa - 40% reduction</p>
              <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900">New client registered</p>
              <p className="text-sm text-gray-500">Emily Davis - $51,200 total debt</p>
              <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900">Settlement proposal pending review</p>
              <p className="text-sm text-gray-500">Sarah Johnson - Medical Center Hospital</p>
              <p className="text-xs text-gray-400 mt-1">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Representatives Page */}
      {activePage === 'representatives' && (() => {
        const representativesMap = new Map<string, {
          name: string;
          phone: string;
          extension?: string;
          debts: Array<{ debtId: string; creditor: string; clientName: string; clientId: string }>;
          creditors: Set<string>;
          clients: Set<string>;
        }>();

        debts.forEach(debt => {
          if (debt.internalNotes) {
            const { repName, repPhone, repExtension, additionalRepresentatives } = debt.internalNotes;
            
            if (repName && repPhone) {
              const key = `${repName}-${repPhone}`;
              if (!representativesMap.has(key)) {
                representativesMap.set(key, {
                  name: repName,
                  phone: repPhone,
                  extension: repExtension,
                  debts: [],
                  creditors: new Set(),
                  clients: new Set()
                });
              }
              const rep = representativesMap.get(key)!;
              rep.debts.push({
                debtId: debt.id,
                creditor: debt.creditor,
                clientName: debt.clientName,
                clientId: debt.clientId
              });
              rep.creditors.add(debt.creditor);
              rep.clients.add(debt.clientId);
            }

            if (additionalRepresentatives && additionalRepresentatives.length > 0) {
              additionalRepresentatives.forEach(addRep => {
                const key = `${addRep.repName}-${addRep.repPhone}`;
                if (!representativesMap.has(key)) {
                  representativesMap.set(key, {
                    name: addRep.repName,
                    phone: addRep.repPhone,
                    extension: addRep.repExtension,
                    debts: [],
                    creditors: new Set(),
                    clients: new Set()
                  });
                }
                const rep = representativesMap.get(key)!;
                rep.debts.push({
                  debtId: debt.id,
                  creditor: debt.creditor,
                  clientName: debt.clientName,
                  clientId: debt.clientId
                });
                rep.creditors.add(debt.creditor);
                rep.clients.add(debt.clientId);
              });
            }
          }
        });

        const representativesList = Array.from(representativesMap.values());

        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Representatives Directory</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Complete list of all creditor representatives managing client debts
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <UserCog className="w-5 h-5 text-green-600" />
                  <span className="text-green-900 font-medium">{representativesList.length} Total Representatives</span>
                </div>
              </div>

              {representativesList.length === 0 ? (
                <div className="text-center py-12">
                  <UserCog className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-900 mb-2">No Representatives Found</h3>
                  <p className="text-gray-500">
                    Representatives are added through the debt internal notes section.<br />
                    Click on any debt in the "All Debts" page to add representatives.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {representativesList.map((rep, index) => (
                    <div 
                      key={`${rep.name}-${rep.phone}-${index}`}
                      className="bg-gradient-to-r from-green-50 to-white border-2 border-green-200 rounded-lg p-5 hover:border-green-400 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {rep.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{rep.name}</h4>
                            <div className="flex items-center gap-4 mt-1">
                              <div className="flex items-center gap-1 text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span className="text-sm">{rep.phone}</span>
                                {rep.extension && (
                                  <span className="text-sm text-gray-500">ext. {rep.extension}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-center px-3 py-2 bg-white border border-green-200 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{rep.clients.size}</div>
                            <div className="text-xs text-gray-600">Clients</div>
                          </div>
                          <div className="text-center px-3 py-2 bg-white border border-green-200 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{rep.debts.length}</div>
                            <div className="text-xs text-gray-600">Accounts</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-green-600" />
                            Creditors ({rep.creditors.size})
                          </h5>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {Array.from(rep.creditors).map((creditor, idx) => (
                              <div key={idx} className="text-sm text-gray-600 px-2 py-1 bg-white rounded border border-gray-200">
                                {creditor}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4 text-green-600" />
                            Clients ({rep.clients.size})
                          </h5>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {Array.from(new Set(rep.debts.map(d => d.clientName))).map((clientName, idx) => (
                              <div key={idx} className="text-sm text-gray-600 px-2 py-1 bg-white rounded border border-gray-200">
                                {clientName}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-green-200">
                        <details className="group">
                          <summary className="cursor-pointer text-sm font-medium text-green-700 hover:text-green-800 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            View All {rep.debts.length} Account{rep.debts.length !== 1 ? 's' : ''}
                            <ArrowUpDown className="w-3 h-3 ml-auto group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                            {rep.debts.map((debtInfo, idx) => {
                              const debt = debts.find(d => d.id === debtInfo.debtId);
                              return (
                                <div key={idx} className="text-sm bg-white border border-gray-200 rounded p-3">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className="font-medium text-gray-900">{debtInfo.clientName}</div>
                                      <div className="text-gray-600">{debtInfo.creditor}</div>
                                    </div>
                                    {debt && (
                                      <div className="text-right">
                                        <div className="font-semibold text-gray-900">${debt.currentBalance.toLocaleString()}</div>
                                        <div className={`text-xs px-2 py-0.5 rounded ${
                                          debt.status === 'Active' ? 'bg-green-100 text-green-700' :
                                          debt.status === 'In Settlement' ? 'bg-blue-100 text-blue-700' :
                                          debt.status === 'Settled' ? 'bg-gray-100 text-gray-700' :
                                          'bg-red-100 text-red-700'
                                        }`}>
                                          {debt.status}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </details>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Available Budget Page */}
      {activePage === 'budget-approvals' && (() => {
        const clientsWithBudget = clients
          .filter(client => client.monthlyBudget && client.monthlyBudget > 0)
          .sort((a, b) => (b.monthlyBudget || 0) - (a.monthlyBudget || 0));

        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Clients with Available Budget</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Send settlement approval requests and track client responses
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <Wallet className="w-5 h-5 text-green-600" />
                  <span className="text-green-900 font-medium">{clientsWithBudget.length} Clients with Budget</span>
                </div>
              </div>

              {clientsWithBudget.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No clients with available budget</p>
                  <p className="text-sm text-gray-400 mt-1">Budget information will appear here when clients update their monthly budget</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {clientsWithBudget.map((client) => {
                    const clientDebts = debts.filter(d => d.clientId === client.id && d.status !== 'Settled');
                    const totalOutstanding = clientDebts.reduce((sum, d) => sum + d.currentBalance, 0);
                    const proposedSettlements = clientDebts
                      .filter(d => d.type !== 'Medical Bill' && d.type !== 'Utility' && d.type !== 'Student Loan')
                      .slice(0, 3)
                      .map(d => ({
                        debtId: d.id,
                        creditor: d.creditor,
                        originalAmount: d.currentBalance,
                        settlementAmount: Math.round(d.currentBalance * 0.55),
                        settlementPercentage: 55
                      }));

                    return (
                      <div 
                        key={client.id}
                        className="bg-gradient-to-r from-green-50 to-white border-2 border-green-200 rounded-lg p-6 hover:border-green-400 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                {client.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">{client.name}</h4>
                                <p className="text-sm text-gray-600">{client.email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-center px-4 py-2 bg-white border border-green-200 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">${(client.monthlyBudget || 0).toLocaleString()}</div>
                              <div className="text-xs text-gray-600">Available Budget</div>
                            </div>
                          </div>
                        </div>

                        {/* Activity Tracking */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-white border border-gray-200 rounded p-3">
                            <div className="text-xs text-gray-600 mb-1">Last Login</div>
                            <div className="text-sm font-medium text-gray-900">
                              {client.lastLogin || 'Never'}
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded p-3">
                            <div className="text-xs text-gray-600 mb-1">Last Message Click</div>
                            <div className="text-sm font-medium text-gray-900">
                              {client.lastMessageClick || 'Never'}
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded p-3">
                            <div className="text-xs text-gray-600 mb-1">Budget Updated</div>
                            <div className="text-sm font-medium text-gray-900">
                              {client.budgetLastUpdated || 'N/A'}
                            </div>
                          </div>
                        </div>

                        {/* Outstanding Debts Summary */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-semibold text-gray-900">Outstanding Collections</h5>
                            <span className="text-sm text-gray-600">{clientDebts.length} debts</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <div className="text-xs text-gray-600">Total Outstanding</div>
                              <div className="text-lg font-bold text-red-600">${totalOutstanding.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600">Est. Settlement Total</div>
                              <div className="text-lg font-bold text-green-600">
                                ${proposedSettlements.reduce((sum, s) => sum + s.settlementAmount, 0).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Proposed Settlements */}
                        {proposedSettlements.length > 0 && (
                          <div className="mb-4">
                            <h5 className="font-semibold text-gray-900 mb-3">Proposed Settlement Offers (Not Guaranteed)</h5>
                            <div className="space-y-2">
                              {proposedSettlements.map((settlement, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded p-3 flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">{settlement.creditor}</div>
                                    <div className="text-sm text-gray-600">
                                      Original: ${settlement.originalAmount.toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-green-600">
                                      ${settlement.settlementAmount.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-600">{settlement.settlementPercentage}% settlement</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setSelectedClientForBudget(client);
                              setShowSendBudgetMessage(true);
                            }}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Send Budget Approval Request
                          </button>
                          <button
                            onClick={() => setActivePage('clients')}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Creditor Client Lookup Page */}
      {activePage === 'creditor-lookup' && (
        <>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-gray-900 mb-2">Creditor Client Lookup</h3>
              <p className="text-gray-600 text-sm">
                Search for a creditor to see all clients who have debts with that creditor. Perfect for batch processing when you have a creditor on the phone.
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for creditor (e.g., Midland Credit Management, Capital One)..."
                  value={creditorSearchQuery}
                  onChange={(e) => setCreditorSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Sorting and Filtering Controls */}
            {creditorSearchQuery.trim() !== '' && (
              <div className="mb-6 flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 font-medium">Sort by:</span>
                  <select
                    value={creditorLookupSort}
                    onChange={(e) => setCreditorLookupSort(e.target.value as 'name' | 'debt' | 'budget')}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="name">Client Name</option>
                    <option value="debt">Total Debt</option>
                    <option value="budget">Budget Amount</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 font-medium">Filter:</span>
                  <select
                    value={creditorLookupFilter}
                    onChange={(e) => setCreditorLookupFilter(e.target.value as 'all' | 'with-budget' | 'no-budget')}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Clients</option>
                    <option value="with-budget">With Budget Only</option>
                    <option value="no-budget">No Budget</option>
                  </select>
                </div>
              </div>
            )}

            {/* Results */}
            {creditorSearchQuery.trim() !== '' && (
              <>
                {/* Creditor Contact Info Card - Show if creditor exists in policies */}
                {(() => {
                  const matchedPolicy = creditorPolicies.find(p => 
                    p.creditorName.toLowerCase().includes(creditorSearchQuery.toLowerCase())
                  );
                  
                  if (matchedPolicy) {
                    return (
                      <div className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{matchedPolicy.creditorName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {matchedPolicy.willSettle ? (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                  Will Settle
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                  No Settlement
                                </span>
                              )}
                              {matchedPolicy.willSettle && matchedPolicy.minimumSettlementPercentage && (
                                <span className="text-sm text-gray-600">
                                  {matchedPolicy.minimumSettlementPercentage}% - {matchedPolicy.maximumSettlementPercentage}%
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setActivePage('policies');
                              setPolicySearchQuery(matchedPolicy.creditorName);
                            }}
                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                          >
                            View Full Details →
                          </button>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {matchedPolicy.phone && (
                            <div className="flex items-start gap-2">
                              <Phone className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-500">Phone</p>
                                <p className="text-sm font-medium text-gray-900">{matchedPolicy.phone}</p>
                              </div>
                            </div>
                          )}
                          {matchedPolicy.fax && (
                            <div className="flex items-start gap-2">
                              <Printer className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-500">Fax</p>
                                <p className="text-sm font-medium text-gray-900">{matchedPolicy.fax}</p>
                              </div>
                            </div>
                          )}
                          {matchedPolicy.address && (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="text-sm font-medium text-gray-900">{matchedPolicy.address}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Payment Methods */}
                        {matchedPolicy.paymentMethods && (
                          <div className="border-t border-green-200 pt-3">
                            <p className="text-xs text-gray-500 mb-2">Payment Methods</p>
                            <div className="flex flex-wrap gap-2">
                              {matchedPolicy.paymentMethods.moneyOrderOnly && (
                                <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-medium">
                                  Money Order Only
                                </span>
                              )}
                              {matchedPolicy.paymentMethods.eCheck && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  E-Check
                                </span>
                              )}
                              {matchedPolicy.paymentMethods.payByPhone && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                  Phone {matchedPolicy.paymentMethods.payByPhoneFee && `(${matchedPolicy.paymentMethods.payByPhoneFee})`}
                                </span>
                              )}
                              {matchedPolicy.paymentMethods.creditCard && (
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                                  Credit Card {matchedPolicy.paymentMethods.creditCardFee && `(${matchedPolicy.paymentMethods.creditCardFee})`}
                                </span>
                              )}
                              {matchedPolicy.paymentMethods.bankDraft && (
                                <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                                  Bank Draft
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Clients with this Creditor */}
                {(() => {
                  // Find all debts matching the creditor search
                  const matchingDebts = debts.filter(debt => 
                    debt.creditor.toLowerCase().includes(creditorSearchQuery.toLowerCase()) ||
                    (debt.originalCreditor && debt.originalCreditor.toLowerCase().includes(creditorSearchQuery.toLowerCase())) ||
                    (debt.collectionAgency && debt.collectionAgency.toLowerCase().includes(creditorSearchQuery.toLowerCase()))
                  );

                  // Group debts by client
                  const clientDebtsMap = matchingDebts.reduce((acc, debt) => {
                    if (!acc[debt.clientId]) {
                      acc[debt.clientId] = [];
                    }
                    acc[debt.clientId].push(debt);
                    return acc;
                  }, {} as Record<string, Debt[]>);

                  let clientsWithDebts = Object.entries(clientDebtsMap);

                  // Apply budget filter
                  if (creditorLookupFilter === 'with-budget') {
                    clientsWithDebts = clientsWithDebts.filter(([clientId]) => {
                      const client = clients.find(c => c.id === clientId);
                      return client && client.monthlyBudget && client.monthlyBudget > 0;
                    });
                  } else if (creditorLookupFilter === 'no-budget') {
                    clientsWithDebts = clientsWithDebts.filter(([clientId]) => {
                      const client = clients.find(c => c.id === clientId);
                      return client && (!client.monthlyBudget || client.monthlyBudget === 0);
                    });
                  }

                  // Apply sorting: Budget available first, then alphabetical within each group
                  clientsWithDebts.sort(([aId], [bId]) => {
                    const clientA = clients.find(c => c.id === aId);
                    const clientB = clients.find(c => c.id === bId);
                    if (!clientA || !clientB) return 0;

                    // Always prioritize clients with budget
                    const hasBudgetA = clientA.monthlyBudget && clientA.monthlyBudget > 0;
                    const hasBudgetB = clientB.monthlyBudget && clientB.monthlyBudget > 0;
                    
                    if (hasBudgetA && !hasBudgetB) return -1; // A has budget, B doesn't - A comes first
                    if (!hasBudgetA && hasBudgetB) return 1;  // B has budget, A doesn't - B comes first
                    
                    // Both have budget or both don't have budget - sort alphabetically
                    return clientA.name.localeCompare(clientB.name);
                  });

                  if (clientsWithDebts.length === 0) {
                    return (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="text-gray-900 font-medium mb-1">No Clients Found</h4>
                        <p className="text-gray-500 text-sm">
                          No clients match your filter criteria for "{creditorSearchQuery}"
                        </p>
                      </div>
                    );
                  }

                  // PDF Generation Function
                  const generatePDFReport = () => {
                    // Import jsPDF dynamically
                    import('jspdf').then((jsPDFModule) => {
                      const { jsPDF } = jsPDFModule;
                      const doc = new jsPDF();
                      
                      const matchedPolicy = creditorPolicies.find(p => 
                        p.creditorName.toLowerCase().includes(creditorSearchQuery.toLowerCase())
                      );
                      
                      let yPos = 20;
                      const pageHeight = doc.internal.pageSize.height;
                      const leftMargin = 14;
                      const lineHeight = 7;
                      
                      // Helper function to check if we need a new page
                      const checkNewPage = () => {
                        if (yPos > pageHeight - 20) {
                          doc.addPage();
                          yPos = 20;
                        }
                      };
                      
                      // Title
                      doc.setFontSize(16);
                      doc.setFont('helvetica', 'bold');
                      doc.text('CREDITOR CLIENT LOOKUP REPORT', leftMargin, yPos);
                      yPos += 10;
                      
                      // Report metadata
                      doc.setFontSize(10);
                      doc.setFont('helvetica', 'normal');
                      doc.text(`Generated: ${new Date().toLocaleString()}`, leftMargin, yPos);
                      yPos += lineHeight;
                      doc.text(`Creditor: ${creditorSearchQuery}`, leftMargin, yPos);
                      yPos += lineHeight;
                      doc.text(`Total Clients: ${clientsWithDebts.length}`, leftMargin, yPos);
                      yPos += lineHeight;
                      doc.text(`Total Debts: ${matchingDebts.length}`, leftMargin, yPos);
                      yPos += lineHeight;
                      doc.text(`Sort By: ${creditorLookupSort === 'name' ? 'Client Name' : creditorLookupSort === 'debt' ? 'Total Debt' : 'Budget Amount'}`, leftMargin, yPos);
                      yPos += lineHeight;
                      doc.text(`Filter: ${creditorLookupFilter === 'all' ? 'All Clients' : creditorLookupFilter === 'with-budget' ? 'With Budget Only' : 'No Budget'}`, leftMargin, yPos);
                      yPos += 10;
                      
                      checkNewPage();
                      
                      // Creditor contact information
                      if (matchedPolicy) {
                        doc.setFontSize(12);
                        doc.setFont('helvetica', 'bold');
                        doc.text('CREDITOR CONTACT INFORMATION', leftMargin, yPos);
                        yPos += lineHeight;
                        
                        doc.setFontSize(10);
                        doc.setFont('helvetica', 'normal');
                        doc.text(`Name: ${matchedPolicy.creditorName}`, leftMargin, yPos);
                        yPos += lineHeight;
                        if (matchedPolicy.phone) {
                          doc.text(`Phone: ${matchedPolicy.phone}`, leftMargin, yPos);
                          yPos += lineHeight;
                        }
                        if (matchedPolicy.fax) {
                          doc.text(`Fax: ${matchedPolicy.fax}`, leftMargin, yPos);
                          yPos += lineHeight;
                        }
                        if (matchedPolicy.address) {
                          const addressLines = doc.splitTextToSize(`Address: ${matchedPolicy.address}`, 180);
                          addressLines.forEach((line: string) => {
                            checkNewPage();
                            doc.text(line, leftMargin, yPos);
                            yPos += lineHeight;
                          });
                        }
                        doc.text(`Settlement Policy: ${matchedPolicy.willSettle ? 'Will Settle' : 'No Settlement'}`, leftMargin, yPos);
                        yPos += lineHeight;
                        if (matchedPolicy.willSettle && matchedPolicy.minimumSettlementPercentage) {
                          doc.text(`Settlement Range: ${matchedPolicy.minimumSettlementPercentage}% - ${matchedPolicy.maximumSettlementPercentage}%`, leftMargin, yPos);
                          yPos += lineHeight;
                        }
                        yPos += 5;
                      }
                      
                      checkNewPage();
                      
                      // Client details
                      doc.setFontSize(12);
                      doc.setFont('helvetica', 'bold');
                      doc.text('CLIENT DETAILS', leftMargin, yPos);
                      yPos += 10;
                      
                      clientsWithDebts.forEach(([clientId, clientDebts], index) => {
                        const client = clients.find(c => c.id === clientId);
                        if (!client) return;
                        
                        const totalOwed = clientDebts.reduce((sum, debt) => sum + debt.currentBalance, 0);
                        
                        checkNewPage();
                        
                        // Client header
                        doc.setFontSize(11);
                        doc.setFont('helvetica', 'bold');
                        doc.text(`${index + 1}. ${client.name}`, leftMargin, yPos);
                        yPos += lineHeight;
                        
                        // Client details
                        doc.setFontSize(10);
                        doc.setFont('helvetica', 'normal');
                        doc.text(`   Email: ${client.email}`, leftMargin, yPos);
                        yPos += lineHeight;
                        doc.text(`   Status: ${client.status}`, leftMargin, yPos);
                        yPos += lineHeight;
                        doc.text(`   Total Owed to Creditor: $${totalOwed.toLocaleString()}`, leftMargin, yPos);
                        yPos += lineHeight;
                        
                        if (client.monthlyBudget && client.monthlyBudget > 0) {
                          doc.text(`   Monthly Budget: $${client.monthlyBudget.toLocaleString()} (Updated: ${client.budgetLastUpdated})`, leftMargin, yPos);
                          yPos += lineHeight;
                        } else {
                          doc.text(`   Monthly Budget: Not Set`, leftMargin, yPos);
                          yPos += lineHeight;
                        }
                        
                        doc.text(`   Accounts with this Creditor: ${clientDebts.length}`, leftMargin, yPos);
                        yPos += lineHeight;
                        
                        // Debt details
                        clientDebts.forEach((debt, dIndex) => {
                          checkNewPage();
                          
                          doc.setFont('helvetica', 'bold');
                          doc.text(`     ${dIndex + 1}. ${debt.creditor} - ${debt.type}`, leftMargin + 5, yPos);
                          yPos += lineHeight;
                          
                          doc.setFont('helvetica', 'normal');
                          doc.text(`        Original: $${debt.originalAmount.toLocaleString()} | Current: $${debt.currentBalance.toLocaleString()}`, leftMargin + 5, yPos);
                          yPos += lineHeight;
                          doc.text(`        Status: ${debt.status}`, leftMargin + 5, yPos);
                          yPos += lineHeight;
                          
                          if (debt.originalCreditor) {
                            doc.text(`        Original Creditor: ${debt.originalCreditor}`, leftMargin + 5, yPos);
                            yPos += lineHeight;
                          }
                          if (debt.collectionAgency) {
                            doc.text(`        Collection Agency: ${debt.collectionAgency}`, leftMargin + 5, yPos);
                            yPos += lineHeight;
                          }
                          if (debt.legalStatus && debt.legalStatus !== 'None') {
                            doc.text(`        Legal Status: ${debt.legalStatus}`, leftMargin + 5, yPos);
                            yPos += lineHeight;
                          }
                        });
                        
                        yPos += 3;
                      });
                      
                      // Save the PDF
                      const fileName = `Creditor_Lookup_Report_${creditorSearchQuery.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
                      doc.save(fileName);
                    }).catch((error) => {
                      console.error('Failed to load jsPDF:', error);
                      alert('Failed to generate PDF. Please try again.');
                    });
                  };

                  return (
                    <div>
                      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <p className="text-green-800 font-medium">
                              Found {clientsWithDebts.length} client{clientsWithDebts.length !== 1 ? 's' : ''} with {matchingDebts.length} debt{matchingDebts.length !== 1 ? 's' : ''} for this creditor
                            </p>
                          </div>
                          <button
                            onClick={generatePDFReport}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            <Download className="w-4 h-4" />
                            Generate PDF Report
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {clientsWithDebts.map(([clientId, clientDebts]) => {
                          const client = clients.find(c => c.id === clientId);
                          if (!client) return null;

                          const totalOwed = clientDebts.reduce((sum, debt) => sum + debt.currentBalance, 0);
                          const hasBudget = client.monthlyBudget && client.monthlyBudget > 0;

                          return (
                            <div 
                              key={clientId} 
                              className={`bg-white border-2 rounded-lg p-5 hover:border-green-300 transition-all ${
                                hasBudget ? 'border-green-400 bg-green-50/30' : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-lg font-semibold text-gray-900">{client.name}</h4>
                                    {hasBudget && (
                                      <div className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-full text-xs font-medium">
                                        <Wallet className="w-3 h-3" />
                                        Budget Available
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500">{client.email}</p>
                                  {hasBudget && (
                                    <div className="mt-2 flex items-center gap-2">
                                      <div className="px-3 py-1.5 bg-green-100 border border-green-300 rounded-lg">
                                        <p className="text-xs text-green-700 font-medium">Monthly Budget: ${client.monthlyBudget?.toLocaleString()}</p>
                                        <p className="text-xs text-green-600">Last Updated: {client.budgetLastUpdated}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Total Owed to Creditor</p>
                                  <p className="text-lg font-bold text-red-600">${totalOwed.toLocaleString()}</p>
                                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(client.status)} mt-1`}>
                                    {client.status}
                                  </span>
                                </div>
                              </div>

                              {/* Debts for this client with this creditor */}
                              <div className="space-y-3">
                                <p className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                                  Accounts ({clientDebts.length})
                                </p>
                                {clientDebts.map(debt => (
                                  <div 
                                    key={debt.id} 
                                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                                    onClick={() => {
                                      setSelectedDebt(debt);
                                      setEditedNotes(debt.internalNotes || {
                                        repName: '',
                                        repPhone: '',
                                        repExtension: '',
                                        poaFaxed: false,
                                        poaFaxedDate: '',
                                        notes: '',
                                        editHistory: [],
                                        additionalRepresentatives: []
                                      });
                                    }}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <h5 className="font-medium text-gray-900">{debt.creditor}</h5>
                                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                                            debt.status === 'Settled' ? 'bg-green-100 text-green-700' :
                                            debt.status === 'In Settlement' ? 'bg-yellow-100 text-yellow-700' :
                                            debt.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                          }`}>
                                            {debt.status}
                                          </span>
                                          {debt.legalStatus && debt.legalStatus !== 'None' && (
                                            <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 font-medium">
                                              {debt.legalStatus}
                                            </span>
                                          )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                          <p className="text-gray-600">
                                            <span className="text-gray-500">Type:</span> {debt.type}
                                          </p>
                                          <p className="text-gray-600">
                                            <span className="text-gray-500">Original:</span> ${debt.originalAmount.toLocaleString()}
                                          </p>
                                          {debt.originalCreditor && (
                                            <p className="text-gray-600 col-span-2">
                                              <span className="text-gray-500">Original Creditor:</span> {debt.originalCreditor}
                                            </p>
                                          )}
                                          {debt.collectionAgency && (
                                            <p className="text-gray-600 col-span-2">
                                              <span className="text-gray-500">Collection Agency:</span> {debt.collectionAgency}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-right ml-4">
                                        <p className="text-xs text-gray-500">Current Balance</p>
                                        <p className="text-xl font-bold text-gray-900">${debt.currentBalance.toLocaleString()}</p>
                                        {debt.interestAccrued > 0 && (
                                          <p className="text-xs text-red-600 mt-1">
                                            +${debt.interestAccrued.toLocaleString()} interest
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <p className="text-xs text-green-600 font-medium">Click to view internal notes and representative info →</p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Quick Actions */}
                              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                                <button
                                  onClick={() => {
                                    setSelectedClient(client);
                                    setIsChatOpen(true);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  Message Client
                                </button>
                                <button
                                  onClick={() => setActivePage('clients')}
                                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Full Profile
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </>
      )}

      {/* Clients Page */}
      {activePage === 'clients' && (
        <>
          {/* Client Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900">Client Management</h3>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" onClick={() => setShowAddClientModal(true)}>
            Add Client
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Clients Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm text-gray-600">Client</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Total Debt</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Settled</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Active Settlements</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Join Date</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-900">
                    ${client.totalDebt.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-gray-900">${client.settledAmount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {((client.settledAmount / client.totalDebt) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full">
                      {client.activeSettlements}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {new Date(client.joinDate).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClient(client);
                          setIsChatOpen(true);
                        }}
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors relative"
                        title="Send Message"
                      >
                        <MessageCircle className="w-5 h-5 text-green-600" />
                        {hasUnreadMessages && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No clients found matching your search</p>
          </div>
        )}
      </div>
        </>
      )}

      {/* Debts Page */}
      {activePage === 'debts' && (
        <>
          {/* Client Debts Management */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-gray-900">All Client Debts</h3>
                <p className="text-sm text-gray-500 mt-1">Click on any debt to view internal notes and settlement offers</p>
              </div>
            </div>

            {/* Client Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dropdown Filter */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Filter by Client (Dropdown)</label>
                <select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                >
                  <option value="all">All Clients ({debts.length} debts)</option>
                  {[...clients].sort((a, b) => a.name.localeCompare(b.name)).map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({debts.filter(d => d.clientId === client.id).length} debts)
                    </option>
                  ))}
                </select>
              </div>

              {/* Text Search Filter */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Search by Client Name</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={clientSearchText}
                    onChange={(e) => setClientSearchText(e.target.value)}
                    placeholder="Type client name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                  />
                  {clientSearchText && (
                    <button
                      onClick={() => setClientSearchText('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Running Balance Summary */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6 mb-6">
              <div className="mb-4">
                <h3 className="text-gray-900">Debt Settlement Summary</h3>
                <p className="text-sm text-gray-600 mt-1">Total amounts across {filteredDebts.length} debt(s)</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Total Original Amount</p>
                  <p className="text-2xl text-gray-900">
                    ${filteredDebts.reduce((sum, debt) => sum + debt.originalAmount, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Amount originally owed</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Estimated Settlement Amount</p>
                  <p className="text-2xl text-green-600">
                    ${Math.round(filteredDebts.reduce((sum, debt) => {
                      // Medical bills, utilities, and student loans are NOT negotiable
                      const nonNegotiableTypes = ['medical bill', 'medical bills', 'medical', 'utility', 'utilities', 'student loan', 'student loans'];
                      const isNonNegotiable = nonNegotiableTypes.some(type => debt.type.toLowerCase().includes(type));
                      
                      if (isNonNegotiable) return sum + debt.originalAmount;
                      if (debt.status === 'Settled') return sum + debt.currentBalance;
                      if (debt.status === 'In Settlement') return sum + (debt.currentBalance * 0.60);
                      return sum + (debt.currentBalance * 0.55);
                    }, 0)).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Expected amount to pay</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200 bg-green-50">
                  <p className="text-xs text-green-700 mb-1">Estimated Total Savings</p>
                  <p className="text-2xl text-green-600">
                    ${Math.round(filteredDebts.reduce((sum, debt) => sum + debt.originalAmount, 0) - 
                      filteredDebts.reduce((sum, debt) => {
                        // Medical bills, utilities, and student loans are NOT negotiable
                        const nonNegotiableTypes = ['medical bill', 'medical bills', 'medical', 'utility', 'utilities', 'student loan', 'student loans'];
                        const isNonNegotiable = nonNegotiableTypes.some(type => debt.type.toLowerCase().includes(type));
                        
                        if (isNonNegotiable) return sum + debt.originalAmount;
                        if (debt.status === 'Settled') return sum + debt.currentBalance;
                        if (debt.status === 'In Settlement') return sum + (debt.currentBalance * 0.60);
                        return sum + (debt.currentBalance * 0.55);
                      }, 0)).toLocaleString()}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {filteredDebts.reduce((sum, debt) => sum + debt.originalAmount, 0) > 0 
                      ? Math.round(((filteredDebts.reduce((sum, debt) => sum + debt.originalAmount, 0) - 
                          filteredDebts.reduce((sum, debt) => {
                            // Medical bills, utilities, and student loans are NOT negotiable
                            const nonNegotiableTypes = ['medical bill', 'medical bills', 'medical', 'utility', 'utilities', 'student loan', 'student loans'];
                            const isNonNegotiable = nonNegotiableTypes.some(type => debt.type.toLowerCase().includes(type));
                            
                            if (isNonNegotiable) return sum + debt.originalAmount;
                            if (debt.status === 'Settled') return sum + debt.currentBalance;
                            if (debt.status === 'In Settlement') return sum + (debt.currentBalance * 0.60);
                            return sum + (debt.currentBalance * 0.55);
                          }, 0)) / filteredDebts.reduce((sum, debt) => sum + debt.originalAmount, 0)) * 100)
                      : 0}% savings from original
                  </p>
                </div>
              </div>
            </div>

            {/* Debts Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm text-gray-600">Client</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">Creditor</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">Original</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">Est. Settlement</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">Est. Savings</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">Legal Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDebts.map((debt) => {
                    // Medical bills, utilities, and student loans are NOT negotiable
                    const nonNegotiableTypes = ['medical bill', 'medical bills', 'medical', 'utility', 'utilities', 'student loan', 'student loans'];
                    const isNonNegotiable = nonNegotiableTypes.some(type => debt.type.toLowerCase().includes(type));
                    
                    const settlementAmount = isNonNegotiable
                      ? debt.originalAmount
                      : debt.status === 'Settled' 
                        ? debt.currentBalance 
                        : debt.status === 'In Settlement' 
                          ? debt.currentBalance * 0.60 
                          : debt.currentBalance * 0.55;
                    const savings = debt.originalAmount - settlementAmount;
                    
                    return (
                      <tr
                        key={debt.id}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleDebtClick(debt)}
                      >
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
                        <td className="py-4 px-4 text-gray-900">${debt.originalAmount.toLocaleString()}</td>
                        <td className="py-4 px-4 text-green-600">${Math.round(settlementAmount).toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-green-600">${Math.round(savings).toLocaleString()}</p>
                            <p className="text-xs text-green-600">{((savings / debt.originalAmount) * 100).toFixed(0)}%</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(debt.status)}`}>
                            {debt.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {debt.legalStatus || 'None'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Tasks & Reminders Page */}
      {activePage === 'tasks' && (
        <>
          {/* Tasks & Reminders */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-gray-900">Tasks & Reminders</h3>
            {getUpcomingRemindersCount() > 0 && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full flex items-center gap-1">
                <Bell className="w-4 h-4" />
                {getUpcomingRemindersCount()} upcoming
              </span>
            )}
            {getOverdueRemindersCount() > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {getOverdueRemindersCount()} overdue
              </span>
            )}
          </div>
          <button 
            onClick={() => setShowAddReminderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Reminder
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setReminderFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              reminderFilter === 'all' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({reminders.length})
          </button>
          <button
            onClick={() => setReminderFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              reminderFilter === 'pending' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pending ({reminders.filter(r => r.status === 'Pending').length})
          </button>
          <button
            onClick={() => setReminderFilter('overdue')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              reminderFilter === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Overdue ({getOverdueRemindersCount()})
          </button>
          <button
            onClick={() => setReminderFilter('completed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              reminderFilter === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Completed ({reminders.filter(r => r.status === 'Completed').length})
          </button>
        </div>

        {/* Reminders List */}
        <div className="space-y-3">
          {getFilteredReminders().map((reminder) => {
            const isOverdue = reminder.status === 'Pending' && reminder.dueDate < new Date().toISOString().split('T')[0];
            const priorityColors = {
              Low: 'bg-gray-100 text-gray-700',
              Medium: 'bg-yellow-100 text-yellow-700',
              High: 'bg-red-100 text-red-700'
            };
            const categoryIcons = {
              Payment: DollarSign,
              'Follow-up': MessageCircle,
              Settlement: FileText,
              Documentation: Upload,
              Other: Circle
            };
            const CategoryIcon = categoryIcons[reminder.category];

            return (
              <div 
                key={reminder.id} 
                className={`p-4 border-2 rounded-lg ${
                  isOverdue 
                    ? 'border-red-200 bg-red-50' 
                    : reminder.status === 'Completed' 
                    ? 'border-gray-200 bg-gray-50 opacity-60' 
                    : 'border-gray-200 hover:border-green-600'
                } transition-all`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isOverdue ? 'bg-red-100' : reminder.status === 'Completed' ? 'bg-gray-200' : 'bg-green-100'
                  }`}>
                    <CategoryIcon className={`w-5 h-5 ${
                      isOverdue ? 'text-red-600' : reminder.status === 'Completed' ? 'text-gray-500' : 'text-green-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="text-gray-900 font-medium">{reminder.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">{reminder.clientName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded ${priorityColors[reminder.priority]}`}>
                          {reminder.priority}
                        </span>
                      </div>
                    </div>
                    
                    {reminder.description && (
                      <p className="text-sm text-gray-600 mb-3">{reminder.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                            {new Date(reminder.dueDate).toLocaleDateString()}
                            {isOverdue && ' (Overdue)'}
                          </span>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {reminder.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {reminder.status === 'Pending' && (
                          <button
                            onClick={() => handleCompleteReminder(reminder.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {getFilteredReminders().length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reminders found</p>
            <p className="text-sm text-gray-400 mt-1">Add a reminder to track important tasks and follow-ups</p>
          </div>
        )}
      </div>
        </>
      )}

      {/* Creditor Policies Page */}
      {activePage === 'policies' && (
        <>
          {/* Creditor Settlement Policies */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-gray-900">Creditor Directory & Settlement Policies</h3>
            <p className="text-sm text-gray-500 mt-1">Internal glossary with contact info, payment methods, and settlement policies</p>
          </div>
          <button 
            onClick={() => {
              setEditingPolicy(null);
              setNewPolicy(emptyPolicyForm);
              setShowAddPolicyModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Creditor
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search creditors..."
            value={policySearchQuery}
            onChange={(e) => setPolicySearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
          />
        </div>

        {/* Creditor Directory Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {getFilteredPolicies().map((policy) => (
            <div key={policy.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <h4 className="text-gray-900 font-semibold">{policy.creditorName}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {policy.willSettle ? (
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Will Settle
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Won't Settle
                      </span>
                    )}
                    {policy.willSettle && (policy.minimumSettlementPercentage || policy.maximumSettlementPercentage) && (
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        {policy.minimumSettlementPercentage || '?'}% - {policy.maximumSettlementPercentage || '?'}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => handleEditPolicy(policy)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit Policy"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeletePolicy(policy.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete Policy"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              {(policy.phone || policy.fax || policy.address) && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h5 className="text-xs text-gray-500 uppercase tracking-wide mb-2">Contact Information</h5>
                  <div className="space-y-1.5">
                    {policy.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700">{policy.phone}</span>
                      </div>
                    )}
                    {policy.fax && (
                      <div className="flex items-center gap-2 text-sm">
                        <Printer className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700">{policy.fax}</span>
                      </div>
                    )}
                    {policy.address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{policy.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              {policy.paymentMethods && Object.values(policy.paymentMethods).some(v => v) && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h5 className="text-xs text-gray-500 uppercase tracking-wide mb-2">Payment Methods</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {policy.paymentMethods.moneyOrderOnly && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                        Money Order ONLY
                      </span>
                    )}
                    {policy.paymentMethods.eCheck && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        E-Check
                      </span>
                    )}
                    {policy.paymentMethods.payByPhone && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        Pay-by-Phone {policy.paymentMethods.payByPhoneFee && `(${policy.paymentMethods.payByPhoneFee})`}
                      </span>
                    )}
                    {policy.paymentMethods.creditCard && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        Credit Card {policy.paymentMethods.creditCardFee && `(${policy.paymentMethods.creditCardFee})`}
                      </span>
                    )}
                    {policy.paymentMethods.bankDraft && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        Bank Draft
                      </span>
                    )}
                    {policy.paymentMethods.other && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {policy.paymentMethods.other}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {policy.notes && (
                <div className="mb-3">
                  <h5 className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">Notes</h5>
                  <p className="text-sm text-gray-700 line-clamp-3">{policy.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="text-xs text-gray-400">
                Last updated: {new Date(policy.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {getFilteredPolicies().length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No creditors found</p>
            <p className="text-sm text-gray-400 mt-1">Add creditors with contact info, payment methods, and settlement policies</p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-medium text-blue-900 mb-1">Internal Creditor Glossary - Quick Reference:</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Contact Info:</strong> Phone numbers, fax, and mailing addresses for each creditor</li>
                <li>• <strong>Payment Methods:</strong> Accepted payment types and any associated fees (e.g., pay-by-phone charges)</li>
                <li>• <strong>Special Requirements:</strong> "Money Order ONLY" badge indicates creditors like Midland Credit Management that don't accept phone payments</li>
                <li>• <strong>Settlement Range:</strong> Typical minimum/maximum settlement percentages (e.g., "50% - 70%" means they won't accept below 50%)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Debt Details Modal with Tabs */}
      {selectedDebt && editedNotes && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedDebt(null)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <div>
                <h3 className="text-gray-900">{selectedDebt.creditor}</h3>
                <p className="text-sm text-gray-500 mt-1">Client: {selectedDebt.clientName}</p>
              </div>
              <button
                onClick={() => setSelectedDebt(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="notes">Internal Notes</TabsTrigger>
                  <TabsTrigger value="settlements">Settlements</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
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

                  {/* Debt Overview */}
                  <div>
                    <h4 className="text-gray-900 mb-4">Debt Overview</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                        <p className="text-xs text-gray-500">Debt Type</p>
                        <p className="text-gray-900 mt-1">{selectedDebt.type}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="text-gray-900 mt-1">{selectedDebt.status}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Legal Status</p>
                        <p className="text-gray-900 mt-1">{selectedDebt.legalStatus || 'None'}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="space-y-6 mt-6">
                  {/* Representative Information */}
                  <div>
                    <h4 className="text-gray-900 mb-4">Representative Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Representative Name *
                        </label>
                        <input
                          type="text"
                          value={editedNotes.repName}
                          onChange={(e) => setEditedNotes({ ...editedNotes, repName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="Enter rep name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={editedNotes.repPhone}
                          onChange={(e) => setEditedNotes({ ...editedNotes, repPhone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="555-0123"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Extension
                        </label>
                        <input
                          type="text"
                          value={editedNotes.repExtension || ''}
                          onChange={(e) => setEditedNotes({ ...editedNotes, repExtension: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Representatives */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-gray-900">Additional Representatives</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const newRep: AdditionalRepresentative = {
                            id: Date.now().toString(),
                            repName: '',
                            repPhone: '',
                            repExtension: ''
                          };
                          setEditedNotes({
                            ...editedNotes,
                            additionalRepresentatives: [
                              ...(editedNotes.additionalRepresentatives || []),
                              newRep
                            ]
                          });
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Representative</span>
                      </button>
                    </div>

                    {editedNotes.additionalRepresentatives && editedNotes.additionalRepresentatives.length > 0 && (
                      <div className="space-y-4">
                        {editedNotes.additionalRepresentatives.map((rep, index) => (
                          <div key={rep.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-start justify-between mb-3">
                              <h5 className="text-sm text-gray-700">Representative #{index + 1}</h5>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedReps = editedNotes.additionalRepresentatives?.filter(
                                    (r) => r.id !== rep.id
                                  );
                                  setEditedNotes({
                                    ...editedNotes,
                                    additionalRepresentatives: updatedReps
                                  });
                                }}
                                className="p-1 hover:bg-red-100 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm text-gray-600 mb-2">
                                  Representative Name
                                </label>
                                <input
                                  type="text"
                                  value={rep.repName}
                                  onChange={(e) => {
                                    const updatedReps = editedNotes.additionalRepresentatives?.map((r) =>
                                      r.id === rep.id ? { ...r, repName: e.target.value } : r
                                    );
                                    setEditedNotes({
                                      ...editedNotes,
                                      additionalRepresentatives: updatedReps
                                    });
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                  placeholder="Enter rep name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600 mb-2">
                                  Phone Number
                                </label>
                                <input
                                  type="tel"
                                  value={rep.repPhone}
                                  onChange={(e) => {
                                    const updatedReps = editedNotes.additionalRepresentatives?.map((r) =>
                                      r.id === rep.id ? { ...r, repPhone: e.target.value } : r
                                    );
                                    setEditedNotes({
                                      ...editedNotes,
                                      additionalRepresentatives: updatedReps
                                    });
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                  placeholder="555-0123"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600 mb-2">
                                  Extension
                                </label>
                                <input
                                  type="text"
                                  value={rep.repExtension || ''}
                                  onChange={(e) => {
                                    const updatedReps = editedNotes.additionalRepresentatives?.map((r) =>
                                      r.id === rep.id ? { ...r, repExtension: e.target.value } : r
                                    );
                                    setEditedNotes({
                                      ...editedNotes,
                                      additionalRepresentatives: updatedReps
                                    });
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                  placeholder="Optional"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {(!editedNotes.additionalRepresentatives || editedNotes.additionalRepresentatives.length === 0) && (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-500">No additional representatives added yet</p>
                        <p className="text-xs text-gray-400 mt-1">Click the button above to add more representatives</p>
                      </div>
                    )}
                  </div>

                  {/* Power of Attorney Information */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3 mb-3">
                      <input
                        type="checkbox"
                        id="poaFaxed"
                        checked={editedNotes.poaFaxed}
                        onChange={(e) => setEditedNotes({ ...editedNotes, poaFaxed: e.target.checked })}
                        className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor="poaFaxed" className="flex-1 text-sm text-blue-900 cursor-pointer">
                        Power of Attorney has been faxed to creditor
                      </label>
                    </div>
                    
                    {editedNotes.poaFaxed && (
                      <div className="ml-7">
                        <label className="block text-sm text-blue-900 mb-2">
                          Date Faxed
                        </label>
                        <input
                          type="date"
                          value={editedNotes.poaFaxedDate || ''}
                          onChange={(e) => setEditedNotes({ ...editedNotes, poaFaxedDate: e.target.value })}
                          className="px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Notes Field */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Internal Notes
                    </label>
                    <textarea
                      value={editedNotes.notes}
                      onChange={(e) => setEditedNotes({ ...editedNotes, notes: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      placeholder="Add internal notes about this debt, communications with creditor, settlement progress, etc."
                    />
                  </div>

                  {/* Edit History */}
                  {editedNotes.editHistory && editedNotes.editHistory.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <History className="w-4 h-4 text-gray-500" />
                        <h4 className="text-gray-900">Edit History</h4>
                      </div>
                      <div className="space-y-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                        {editedNotes.editHistory.map((entry, index) => (
                          <div key={index} className="pb-2 border-b border-gray-200 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-900">{entry.editor}</p>
                              <p className="text-xs text-gray-500">{entry.timestamp}</p>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{entry.changes}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSaveNotes}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Internal Notes
                    </button>
                    <button
                      onClick={() => setSelectedDebt(null)}
                      className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </TabsContent>

                <TabsContent value="settlements" className="space-y-6 mt-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-gray-900">Settlement Offers</h4>
                      <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>Upload Offer</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {selectedDebt.settlementOffers && selectedDebt.settlementOffers.length > 0 ? (
                      <div className="space-y-3">
                        {selectedDebt.settlementOffers.map((offer) => (
                          <div key={offer.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="w-4 h-4 text-gray-600" />
                                  <p className="text-gray-900">{offer.fileName}</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                  <div>
                                    <p className="text-xs text-gray-500">Upload Date</p>
                                    <p className="text-sm text-gray-900 mt-1">{offer.uploadDate}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Uploaded By</p>
                                    <p className="text-sm text-gray-900 mt-1">{offer.uploadedBy}</p>
                                  </div>
                                  {offer.offerAmount > 0 && (
                                    <>
                                      <div>
                                        <p className="text-xs text-gray-500">Offer Amount</p>
                                        <p className="text-sm text-gray-900 mt-1">${offer.offerAmount.toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Percentage</p>
                                        <p className="text-sm text-green-700 mt-1">{offer.offerPercentage}% of original</p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                  <Eye className="w-4 h-4 text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                  <Download className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No settlement offers uploaded yet</p>
                        <p className="text-sm text-gray-400 mt-1">Upload settlement documents to track offers</p>
                      </div>
                    )}
                  </div>

                  {/* Email/PDF Communications */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-gray-900 mb-4">Email & PDF Communications</h4>
                    <EmailPDFViewer debtId={selectedDebt.id} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}

      {/* Chat and Video Call */}
      {isChatOpen && (
        <Chat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          userRole="admin"
          userName="Admin User"
          clientName={selectedClient?.name || 'Client'}
          onStartVideoCall={() => setIsVideoCallOpen(true)}
        />
      )}
      {isVideoCallOpen && (
        <VideoCall
          isOpen={isVideoCallOpen}
          onClose={() => setIsVideoCallOpen(false)}
          userRole="admin"
          participantName={selectedClient?.name || 'Client'}
        />
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => {
          setIsChatOpen(true);
          setHasUnreadMessages(false);
          if (!selectedClient) {
            setSelectedClient(clients[0]); // Default to first client
          }
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all hover:scale-110 flex items-center justify-center z-40"
      >
        <MessageCircle className="w-6 h-6" />
        {hasUnreadMessages && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <Circle className="w-3 h-3 fill-current animate-pulse" />
          </span>
        )}
      </button>

      {/* Add Client Modal */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowAddClientModal(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <div>
                <h3 className="text-gray-900">Register New Client</h3>
                <p className="text-sm text-gray-500 mt-1">Create a new client account</p>
              </div>
              <button
                onClick={() => {
                  setShowAddClientModal(false);
                  setNewClient({
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    confirmPassword: ''
                  });
                  setClientFormErrors({});
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    placeholder="Enter client full name"
                  />
                  {clientFormErrors.name && (
                    <p className="text-sm text-red-500 mt-1">{clientFormErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    placeholder="client@example.com"
                  />
                  {clientFormErrors.email && (
                    <p className="text-sm text-red-500 mt-1">{clientFormErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    placeholder="(555) 555-5555"
                  />
                  {clientFormErrors.phone && (
                    <p className="text-sm text-red-500 mt-1">{clientFormErrors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={newClient.password}
                    onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    placeholder="Minimum 8 characters"
                  />
                  {clientFormErrors.password && (
                    <p className="text-sm text-red-500 mt-1">{clientFormErrors.password}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={newClient.confirmPassword}
                    onChange={(e) => setNewClient({ ...newClient, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    placeholder="Re-enter password"
                  />
                  {clientFormErrors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">{clientFormErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Registration Button */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleAddClient}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Register Client
                </button>
                <button
                  onClick={() => {
                    setShowAddClientModal(false);
                    setNewClient({
                      name: '',
                      email: '',
                      phone: '',
                      password: '',
                      confirmPassword: ''
                    });
                    setClientFormErrors({});
                  }}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddReminderModal && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowAddReminderModal(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-gray-900">Add New Reminder</h3>
                  <p className="text-sm text-gray-500 mt-1">Set a task or reminder for client follow-up</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddReminderModal(false);
                  setNewReminder({
                    clientId: '',
                    title: '',
                    description: '',
                    dueDate: '',
                    priority: 'Medium',
                    category: 'Payment'
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Client *
                  </label>
                  <select
                    value={newReminder.clientId}
                    onChange={(e) => setNewReminder({ ...newReminder, clientId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                  >
                    <option value="">Select a client...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    placeholder="e.g., Payment Follow-up, Settlement Review"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newReminder.description}
                    onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none resize-none"
                    placeholder="Add details about when client will have budget available or what needs to be done..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={newReminder.dueDate}
                      onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Priority
                    </label>
                    <select
                      value={newReminder.priority}
                      onChange={(e) => setNewReminder({ ...newReminder, priority: e.target.value as 'Low' | 'Medium' | 'High' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Category
                  </label>
                  <select
                    value={newReminder.category}
                    onChange={(e) => setNewReminder({ ...newReminder, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                  >
                    <option value="Payment">Payment</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Settlement">Settlement</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleAddReminder}
                  disabled={!newReminder.clientId || !newReminder.title || !newReminder.dueDate}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Bell className="w-4 h-4" />
                  Add Reminder
                </button>
                <button
                  onClick={() => {
                    setShowAddReminderModal(false);
                    setNewReminder({
                      clientId: '',
                      title: '',
                      description: '',
                      dueDate: '',
                      priority: 'Medium',
                      category: 'Payment'
                    });
                  }}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Creditor Policy Modal */}
      {showAddPolicyModal && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => {
          setShowAddPolicyModal(false);
          setEditingPolicy(null);
          setNewPolicy(emptyPolicyForm);
        }}>
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-gray-900">
                    {editingPolicy ? 'Edit Creditor Information' : 'Add Creditor to Directory'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingPolicy ? 'Update contact info, payment methods, and settlement policies' : 'Add contact info, payment methods, and settlement policies'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddPolicyModal(false);
                  setEditingPolicy(null);
                  setNewPolicy(emptyPolicyForm);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Creditor Name *
                  </label>
                  <input
                    type="text"
                    value={newPolicy.creditorName}
                    onChange={(e) => setNewPolicy({ ...newPolicy, creditorName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    placeholder="e.g., Capital One, Chase Bank, Target"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Will This Creditor Settle Debts?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="willSettle"
                        checked={newPolicy.willSettle === true}
                        onChange={() => setNewPolicy({ ...newPolicy, willSettle: true })}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-sm text-gray-700">Yes, will settle</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="willSettle"
                        checked={newPolicy.willSettle === false}
                        onChange={() => setNewPolicy({ ...newPolicy, willSettle: false })}
                        className="w-4 h-4 text-red-600"
                      />
                      <span className="text-sm text-gray-700">No, won't settle</span>
                    </label>
                  </div>
                </div>

                {newPolicy.willSettle && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Minimum Settlement %
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={newPolicy.minimumSettlementPercentage}
                          onChange={(e) => setNewPolicy({ ...newPolicy, minimumSettlementPercentage: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                          placeholder="e.g., 50"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Won't accept offers below this %</p>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Maximum Settlement %
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={newPolicy.maximumSettlementPercentage}
                          onChange={(e) => setNewPolicy({ ...newPolicy, maximumSettlementPercentage: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                          placeholder="e.g., 70"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Typical upper range</p>
                    </div>
                  </div>
                )}

                {/* Contact Information Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-gray-900 font-medium mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={newPolicy.phone}
                        onChange={(e) => setNewPolicy({ ...newPolicy, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                        placeholder="e.g., 1-800-123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Fax Number
                      </label>
                      <input
                        type="text"
                        value={newPolicy.fax}
                        onChange={(e) => setNewPolicy({ ...newPolicy, fax: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                        placeholder="e.g., 1-800-987-6543"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Mailing Address
                      </label>
                      <textarea
                        value={newPolicy.address}
                        onChange={(e) => setNewPolicy({ ...newPolicy, address: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none resize-none"
                        placeholder="PO Box or street address for payments"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Methods Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-gray-900 font-medium mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-green-600" />
                    Accepted Payment Methods
                  </h4>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={newPolicy.moneyOrderOnly}
                        onChange={(e) => setNewPolicy({ ...newPolicy, moneyOrderOnly: e.target.checked })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <div className="flex-1">
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">Money Order ONLY</span>
                        <p className="text-xs text-gray-500">Does not accept phone or electronic payments</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={newPolicy.eCheck}
                        onChange={(e) => setNewPolicy({ ...newPolicy, eCheck: e.target.checked })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">E-Check / Bank Draft</span>
                    </label>

                    <div>
                      <label className="flex items-center gap-3 cursor-pointer group mb-2">
                        <input
                          type="checkbox"
                          checked={newPolicy.payByPhone}
                          onChange={(e) => setNewPolicy({ ...newPolicy, payByPhone: e.target.checked })}
                          className="w-4 h-4 text-green-600 rounded"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">Pay-by-Phone</span>
                      </label>
                      {newPolicy.payByPhone && (
                        <input
                          type="text"
                          value={newPolicy.payByPhoneFee}
                          onChange={(e) => setNewPolicy({ ...newPolicy, payByPhoneFee: e.target.value })}
                          className="ml-7 w-full max-w-xs px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                          placeholder="Fee amount (e.g., $10 or $0)"
                        />
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-3 cursor-pointer group mb-2">
                        <input
                          type="checkbox"
                          checked={newPolicy.creditCard}
                          onChange={(e) => setNewPolicy({ ...newPolicy, creditCard: e.target.checked })}
                          className="w-4 h-4 text-green-600 rounded"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">Credit/Debit Card</span>
                      </label>
                      {newPolicy.creditCard && (
                        <input
                          type="text"
                          value={newPolicy.creditCardFee}
                          onChange={(e) => setNewPolicy({ ...newPolicy, creditCardFee: e.target.value })}
                          className="ml-7 w-full max-w-xs px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                          placeholder="Fee amount (e.g., $14.95 or $0)"
                        />
                      )}
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={newPolicy.bankDraft}
                        onChange={(e) => setNewPolicy({ ...newPolicy, bankDraft: e.target.checked })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">Bank Draft / Wire Transfer</span>
                    </label>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Other Payment Methods
                      </label>
                      <input
                        type="text"
                        value={newPolicy.otherPayment}
                        onChange={(e) => setNewPolicy({ ...newPolicy, otherPayment: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                        placeholder="e.g., Western Union, MoneyGram, etc."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Notes & Details
                  </label>
                  <textarea
                    value={newPolicy.notes}
                    onChange={(e) => setNewPolicy({ ...newPolicy, notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none resize-none"
                    placeholder="Add details about settlement policies, best practices, timing considerations, etc."
                  />
                </div>

                {!newPolicy.willSettle && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-sm font-medium text-red-900 mb-1">Non-Settling Creditor</h5>
                        <p className="text-sm text-red-800">
                          This creditor won't accept settlement offers. Make sure to document their typical approach 
                          (e.g., legal action, payment plans only, sells to collections, etc.) in the notes above.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleAddOrUpdatePolicy}
                  disabled={!newPolicy.creditorName.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Shield className="w-4 h-4" />
                  {editingPolicy ? 'Update Creditor' : 'Add Creditor'}
                </button>
                <button
                  onClick={() => {
                    setShowAddPolicyModal(false);
                    setEditingPolicy(null);
                    setNewPolicy(emptyPolicyForm);
                  }}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Budget Approval Message Modal */}
      {showSendBudgetMessage && selectedClientForBudget && (() => {
        const clientDebts = debts.filter(d => 
          d.clientId === selectedClientForBudget.id && 
          d.status !== 'Settled' &&
          d.type !== 'Medical Bill' && 
          d.type !== 'Utility' && 
          d.type !== 'Student Loan'
        );
        
        const proposedSettlements = clientDebts.slice(0, 5).map(d => ({
          debtId: d.id,
          creditor: d.creditor,
          originalAmount: d.currentBalance,
          settlementAmount: Math.round(d.currentBalance * 0.55),
          settlementPercentage: 55,
          approved: false
        }));

        return (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => {
            setShowSendBudgetMessage(false);
            setSelectedClientForBudget(null);
          }}>
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900">Send Budget Approval Request</h3>
                    <p className="text-sm text-gray-500 mt-1">Send settlement offer approval request to {selectedClientForBudget.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSendBudgetMessage(false);
                    setSelectedClientForBudget(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6">
                {/* Client Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">{selectedClientForBudget.name}</div>
                      <div className="text-sm text-gray-600">{selectedClientForBudget.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">Available Budget</div>
                      <div className="text-xl font-bold text-green-600">
                        ${(selectedClientForBudget.monthlyBudget || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Preview */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Message Preview</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="space-y-3 text-sm text-gray-700">
                      <p><strong>Hello {selectedClientForBudget.name},</strong></p>
                      <p>We have potential settlement offers available for your outstanding collections. These are <strong>proposed (not guaranteed)</strong> settlement amounts:</p>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                        {proposedSettlements.map((settlement, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                            <div>
                              <div className="font-medium text-gray-900">{settlement.creditor}</div>
                              <div className="text-xs text-gray-500">Original: ${settlement.originalAmount.toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">${settlement.settlementAmount.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">{settlement.settlementPercentage}% settlement</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <p><strong>How much budget can you commit towards these settlements?</strong></p>
                      <p className="text-xs text-gray-500 italic">
                        Please respond with the amount you can allocate, and which settlements you'd like to approve. 
                        We will process payments on your behalf once settlements are confirmed by the creditors.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delivery Method */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border-2 border-green-600 bg-green-50 rounded-lg p-3 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-900">In-Portal Message</span>
                      </div>
                      <p className="text-xs text-gray-600">Client will see in their dashboard</p>
                    </div>
                    <div className="border border-gray-300 bg-gray-50 rounded-lg p-3 cursor-not-allowed opacity-50">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageCircle className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">SMS Text</span>
                      </div>
                      <p className="text-xs text-gray-600">Coming soon</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // Create a new budget approval message
                      const newMessage: BudgetApprovalMessage = {
                        id: `msg-${Date.now()}`,
                        clientId: selectedClientForBudget.id,
                        clientName: selectedClientForBudget.name,
                        sentDate: new Date().toISOString(),
                        proposedSettlements: proposedSettlements,
                        status: 'Sent'
                      };
                      setBudgetApprovalMessages([...budgetApprovalMessages, newMessage]);
                      setShowSendBudgetMessage(false);
                      setSelectedClientForBudget(null);
                      alert(`Budget approval request sent to ${selectedClientForBudget.name}!`);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Send Request
                  </button>
                  <button
                    onClick={() => {
                      setShowSendBudgetMessage(false);
                      setSelectedClientForBudget(null);
                    }}
                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
