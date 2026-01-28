import { useState } from 'react';
import { Bell, Upload, Phone, DollarSign, FileSignature, CheckCircle, X, Eye, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface ClientActivity {
  id: string;
  clientId: string;
  clientName: string;
  type: 'document_upload' | 'call_log' | 'budget_update' | 'settlement_commitment';
  timestamp: string;
  viewed: boolean;
  details: {
    // Document upload details
    documentType?: 'notice' | 'receipt';
    fileName?: string;
    creditor?: string;
    documentNotes?: string;
    
    // Call log details
    callDate?: string;
    callPhone?: string;
    callExtension?: string;
    callRegarding?: string;
    callNotes?: string;
    
    // Budget update details
    budgetAmount?: number;
    budgetAvailableDate?: string;
    budgetNotes?: string;
    
    // Settlement commitment details
    committedDebts?: {
      creditor: string;
      settlementAmount: number;
    }[];
    totalCommitment?: number;
    commitmentDate?: string;
    signature?: string;
  };
}

const mockActivities: ClientActivity[] = [
  {
    id: '1',
    clientId: 'c1',
    clientName: 'John Smith',
    type: 'document_upload',
    timestamp: new Date().toISOString(),
    viewed: false,
    details: {
      documentType: 'notice',
      fileName: 'collection_notice_chase.pdf',
      creditor: 'Chase Credit Card',
      documentNotes: 'Final notice received today',
    },
  },
  {
    id: '2',
    clientId: 'c2',
    clientName: 'Sarah Johnson',
    type: 'call_log',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    viewed: false,
    details: {
      callDate: new Date().toISOString().split('T')[0],
      callPhone: '1-800-555-0123',
      callExtension: '4567',
      creditor: 'Capital One',
      callRegarding: 'Settlement offer discussion',
      callNotes: 'They offered 60% settlement if I can pay this week',
    },
  },
  {
    id: '3',
    clientId: 'c1',
    clientName: 'John Smith',
    type: 'budget_update',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    viewed: true,
    details: {
      budgetAmount: 5000,
      budgetAvailableDate: '2025-02-15',
      budgetNotes: 'Getting tax refund',
    },
  },
];

export function AdminClientActivityNotifications() {
  const [activities, setActivities] = useState<ClientActivity[]>(mockActivities);
  const [showNotifications, setShowNotifications] = useState(false);

  const unviewedCount = activities.filter(a => !a.viewed).length;

  const handleMarkAsViewed = (activityId: string) => {
    setActivities(activities.map(a => 
      a.id === activityId ? { ...a, viewed: true } : a
    ));
  };

  const handleMarkAllViewed = () => {
    setActivities(activities.map(a => ({ ...a, viewed: true })));
  };

  const handleDismiss = (activityId: string) => {
    setActivities(activities.filter(a => a.id !== activityId));
  };

  const getActivityIcon = (type: ClientActivity['type']) => {
    switch (type) {
      case 'document_upload':
        return <Upload className="w-5 h-5 text-green-600" />;
      case 'call_log':
        return <Phone className="w-5 h-5 text-blue-600" />;
      case 'budget_update':
        return <DollarSign className="w-5 h-5 text-purple-600" />;
      case 'settlement_commitment':
        return <FileSignature className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getActivityTitle = (activity: ClientActivity) => {
    switch (activity.type) {
      case 'document_upload':
        return `${activity.details.documentType === 'notice' ? 'Notice' : 'Receipt'} Uploaded`;
      case 'call_log':
        return 'Creditor Call Logged';
      case 'budget_update':
        return 'Budget Updated';
      case 'settlement_commitment':
        return 'Settlement Commitment Signed';
    }
  };

  const getActivityDescription = (activity: ClientActivity) => {
    switch (activity.type) {
      case 'document_upload':
        return `${activity.details.fileName} - ${activity.details.creditor}`;
      case 'call_log':
        return `${activity.details.creditor} - ${activity.details.callRegarding}`;
      case 'budget_update':
        return `$${activity.details.budgetAmount?.toLocaleString()} available by ${activity.details.budgetAvailableDate}`;
      case 'settlement_commitment':
        return `${activity.details.committedDebts?.length} debts - $${activity.details.totalCommitment?.toLocaleString()}`;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 hover:bg-purple-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-white" />
        {unviewedCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {unviewedCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-[600px] overflow-hidden bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-green-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Client Activity</h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {unviewedCount > 0 ? `${unviewedCount} new notification${unviewedCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unviewedCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleMarkAllViewed}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Activity List */}
          <div className="max-h-[500px] overflow-y-auto">
            {activities.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No client activity yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !activity.viewed ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'document_upload' ? 'bg-green-100' :
                        activity.type === 'call_log' ? 'bg-blue-100' :
                        activity.type === 'budget_update' ? 'bg-purple-100' :
                        'bg-emerald-100'
                      }`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 text-sm">
                                {activity.clientName}
                              </p>
                              {!activity.viewed && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {getActivityTitle(activity)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDismiss(activity.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3 text-gray-400" />
                          </Button>
                        </div>
                        
                        <p className="text-sm text-gray-700 mt-1">
                          {getActivityDescription(activity)}
                        </p>

                        {/* Additional Details */}
                        {activity.type === 'document_upload' && activity.details.documentNotes && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            "{activity.details.documentNotes}"
                          </p>
                        )}
                        {activity.type === 'call_log' && activity.details.callNotes && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            "{activity.details.callNotes}"
                          </p>
                        )}
                        {activity.type === 'budget_update' && activity.details.budgetNotes && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            "{activity.details.budgetNotes}"
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(activity.timestamp)}
                          </span>
                          {!activity.viewed && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsViewed(activity.id)}
                              className="h-6 text-xs px-2 text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Mark read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
