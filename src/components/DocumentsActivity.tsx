import { useEffect, useState } from 'react';
import { Upload, Phone, DollarSign, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { apiFetch } from '../api/client';

interface Document {
  id: string;
  type: 'notice' | 'receipt';
  fileName: string;
  uploadDate: string;
  creditor: string;
  notes?: string;
}

interface CreditorCall {
  id: string;
  date: string;
  creditor: string;
  phoneNumber: string;
  extension?: string;
  regarding: string;
  notes?: string;
}

export function DocumentsActivity() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [creditorCalls, setCreditorCalls] = useState<CreditorCall[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showCallLogForm, setShowCallLogForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  
  // Upload form state
  const [uploadType, setUploadType] = useState<'notice' | 'receipt'>('notice');
  const [uploadCreditor, setUploadCreditor] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Call log form state
  const [callDate, setCallDate] = useState('');
  const [callCreditor, setCallCreditor] = useState('');
  const [callPhone, setCallPhone] = useState('');
  const [callExtension, setCallExtension] = useState('');
  const [callRegarding, setCallRegarding] = useState('');
  const [callNotes, setCallNotes] = useState('');
  
  // Budget form state
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetAvailableDate, setBudgetAvailableDate] = useState('');
  const [budgetNotes, setBudgetNotes] = useState('');

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const [documentsData, callsData] = await Promise.all([
          apiFetch<Document[]>('/documents'),
          apiFetch<CreditorCall[]>('/creditor-calls'),
        ]);
        setDocuments(documentsData);
        setCreditorCalls(callsData);
      } catch (error) {
        setLoadError('Unable to load documents and calls.');
      } finally {
        setIsLoading(false);
      }
    };

    loadActivity();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a PDF or image file (JPEG, PNG)');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile || !uploadCreditor) {
      toast.error('Please select a file and enter creditor name');
      return;
    }

    try {
      const newDocument = await apiFetch<Document>('/documents', {
        method: 'POST',
        body: JSON.stringify({
          type: uploadType,
          fileName: selectedFile.name,
          uploadDate: new Date().toISOString().split('T')[0],
          creditor: uploadCreditor,
          notes: uploadNotes,
        }),
      });

      setDocuments([newDocument, ...documents]);
      toast.success(`${uploadType === 'notice' ? 'Notice' : 'Receipt'} uploaded successfully! Admin has been notified.`);

      // Reset form
      setSelectedFile(null);
      setUploadCreditor('');
      setUploadNotes('');
      setShowUploadForm(false);
    } catch (error) {
      toast.error('Unable to upload document.');
    }
  };

  const handleLogCall = async () => {
    if (!callDate || !callCreditor || !callPhone || !callRegarding) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newCall = await apiFetch<CreditorCall>('/creditor-calls', {
        method: 'POST',
        body: JSON.stringify({
          date: callDate,
          creditor: callCreditor,
          phoneNumber: callPhone,
          extension: callExtension || undefined,
          regarding: callRegarding,
          notes: callNotes,
        }),
      });

      setCreditorCalls([newCall, ...creditorCalls]);
      toast.success('Creditor call logged successfully! Admin has been notified.');

      // Reset form
      setCallDate('');
      setCallCreditor('');
      setCallPhone('');
      setCallExtension('');
      setCallRegarding('');
      setCallNotes('');
      setShowCallLogForm(false);
    } catch (error) {
      toast.error('Unable to log call.');
    }
  };

  const handleUpdateBudget = async () => {
    if (!budgetAmount || !budgetAvailableDate) {
      toast.error('Please enter budget amount and available date');
      return;
    }

    try {
      await apiFetch('/budget-commitments', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(budgetAmount),
          availableDate: budgetAvailableDate,
          notes: budgetNotes,
        }),
      });

      toast.success(`Budget updated to $${parseFloat(budgetAmount).toLocaleString()}! Admin has been notified.`);

      // Reset form
      setBudgetAmount('');
      setBudgetAvailableDate('');
      setBudgetNotes('');
      setShowBudgetForm(false);
    } catch (error) {
      toast.error('Unable to update budget.');
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await apiFetch<void>(`/documents/${id}`, { method: 'DELETE' });
      setDocuments(documents.filter(doc => doc.id !== id));
      toast.success('Document deleted');
    } catch (error) {
      toast.error('Unable to delete document.');
    }
  };

  const handleDeleteCall = async (id: string) => {
    try {
      await apiFetch<void>(`/creditor-calls/${id}`, { method: 'DELETE' });
      setCreditorCalls(creditorCalls.filter(call => call.id !== id));
      toast.success('Call log deleted');
    } catch (error) {
      toast.error('Unable to delete call log.');
    }
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
          Loading activity...
        </div>
      )}
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Documents & Activity</h2>
        <p className="text-gray-600 mt-1">
          Upload documents from creditors, log phone calls you receive, and update your available budget. 
          Our team will be notified of all updates automatically.
        </p>
      </div>

      {/* Header with Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() => setShowUploadForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
        <Button
          onClick={() => setShowCallLogForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Phone className="w-4 h-4 mr-2" />
          Log Creditor Call
        </Button>
        <Button
          onClick={() => setShowBudgetForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Update Budget
        </Button>
      </div>

      {/* Upload Document Form */}
      {showUploadForm && (
        <Card className="p-6 border-2 border-green-200 bg-green-50/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-green-600" />
              Upload Document
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUploadForm(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Document Type</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="notice"
                    checked={uploadType === 'notice'}
                    onChange={(e) => setUploadType(e.target.value as 'notice' | 'receipt')}
                    className="w-4 h-4 text-green-600"
                  />
                  <span>Notice</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="receipt"
                    checked={uploadType === 'receipt'}
                    onChange={(e) => setUploadType(e.target.value as 'notice' | 'receipt')}
                    className="w-4 h-4 text-green-600"
                  />
                  <span>Receipt</span>
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="upload-file">Select File (PDF or Image, max 10MB)</Label>
              <Input
                id="upload-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="mt-1"
              />
              {selectedFile && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {selectedFile.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="upload-creditor">Creditor Name *</Label>
              <Input
                id="upload-creditor"
                value={uploadCreditor}
                onChange={(e) => setUploadCreditor(e.target.value)}
                placeholder="Enter creditor name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="upload-notes">Notes (Optional)</Label>
              <Textarea
                id="upload-notes"
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                placeholder="Add any additional notes about this document"
                className="mt-1"
                rows={3}
              />
            </div>

            <Button
              onClick={handleUploadDocument}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Upload Document
            </Button>
          </div>
        </Card>
      )}

      {/* Log Creditor Call Form */}
      {showCallLogForm && (
        <Card className="p-6 border-2 border-blue-200 bg-blue-50/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              Log Creditor Call
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCallLogForm(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="call-date">Date of Call *</Label>
              <Input
                id="call-date"
                type="date"
                value={callDate}
                onChange={(e) => setCallDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="call-creditor">Creditor Name *</Label>
              <Input
                id="call-creditor"
                value={callCreditor}
                onChange={(e) => setCallCreditor(e.target.value)}
                placeholder="Enter creditor name"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="call-phone">Phone Number *</Label>
                <Input
                  id="call-phone"
                  value={callPhone}
                  onChange={(e) => setCallPhone(e.target.value)}
                  placeholder="1-800-555-0123"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="call-extension">Extension (Optional)</Label>
                <Input
                  id="call-extension"
                  value={callExtension}
                  onChange={(e) => setCallExtension(e.target.value)}
                  placeholder="ext. 1234"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="call-regarding">Call Was Regarding *</Label>
              <Input
                id="call-regarding"
                value={callRegarding}
                onChange={(e) => setCallRegarding(e.target.value)}
                placeholder="e.g., Settlement offer, Payment reminder, etc."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="call-notes">Additional Notes (Optional)</Label>
              <Textarea
                id="call-notes"
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Add any details about the conversation"
                className="mt-1"
                rows={3}
              />
            </div>

            <Button
              onClick={handleLogCall}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Log Call
            </Button>
          </div>
        </Card>
      )}

      {/* Update Budget Form */}
      {showBudgetForm && (
        <Card className="p-6 border-2 border-purple-200 bg-purple-50/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              Update Available Budget
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBudgetForm(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-amber-800">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Let us know how much money you have available to settle your debts. Our team will be notified and can prepare settlement offers accordingly.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="budget-amount">Available Budget Amount *</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="budget-amount"
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="budget-date">Funds Available By *</Label>
              <Input
                id="budget-date"
                type="date"
                value={budgetAvailableDate}
                onChange={(e) => setBudgetAvailableDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="budget-notes">Notes (Optional)</Label>
              <Textarea
                id="budget-notes"
                value={budgetNotes}
                onChange={(e) => setBudgetNotes(e.target.value)}
                placeholder="Add any additional information about your budget"
                className="mt-1"
                rows={3}
              />
            </div>

            <Button
              onClick={handleUpdateBudget}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Update Budget
            </Button>
          </div>
        </Card>
      )}

      {/* Documents List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          Uploaded Documents
        </h3>
        
        {documents.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No documents uploaded yet</p>
            <p className="text-sm text-gray-400 mt-1">Upload notices and receipts to keep track of all creditor communications</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      doc.type === 'notice' ? 'bg-amber-100' : 'bg-green-100'
                    }`}>
                      <FileText className={`w-5 h-5 ${
                        doc.type === 'notice' ? 'text-amber-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{doc.fileName}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          doc.type === 'notice' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {doc.type === 'notice' ? 'Notice' : 'Receipt'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{doc.creditor}</p>
                      {doc.notes && (
                        <p className="text-sm text-gray-500 mt-1">{doc.notes}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">Uploaded: {doc.uploadDate}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.id)}
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Creditor Calls List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-gray-600" />
          Creditor Call Log
        </h3>
        
        {creditorCalls.length === 0 ? (
          <Card className="p-8 text-center">
            <Phone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No creditor calls logged yet</p>
            <p className="text-sm text-gray-400 mt-1">Log any calls you receive from creditors so we can help you respond appropriately</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {creditorCalls.map((call) => (
              <Card key={call.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{call.creditor}</p>
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                          {call.date}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {call.phoneNumber}
                        {call.extension && ` ext. ${call.extension}`}
                      </p>
                      <p className="text-sm text-gray-700 mt-2 font-medium">Regarding: {call.regarding}</p>
                      {call.notes && (
                        <p className="text-sm text-gray-500 mt-1">{call.notes}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCall(call.id)}
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
