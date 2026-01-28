import { useState } from 'react';
import { Mail, Upload, FileText, Eye, Download, Trash2, X } from 'lucide-react';

interface EmailDocument {
  id: string;
  type: 'email' | 'pdf';
  title: string;
  content?: string;
  fileName?: string;
  uploadDate: string;
  uploadedBy: string;
}

interface EmailPDFViewerProps {
  debtId?: string;
}

export function EmailPDFViewer({ debtId }: EmailPDFViewerProps) {
  const [documents, setDocuments] = useState<EmailDocument[]>([
    {
      id: '1',
      type: 'email',
      title: 'Settlement Offer Communication',
      content: `Dear Capital One,

We are writing on behalf of our client, John Smith, regarding account ending in 4532.

Our client is experiencing financial hardship and would like to propose a settlement offer of 55% of the outstanding balance ($4,895).

This settlement would be paid in a lump sum within 30 days of acceptance.

Please review this offer and respond at your earliest convenience.

Best regards,
Lifeify Debt Settlement Team`,
      uploadDate: '2024-12-18',
      uploadedBy: 'Admin User'
    }
  ]);

  const [emailText, setEmailText] = useState('');
  const [emailTitle, setEmailTitle] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<EmailDocument | null>(null);

  const handleSaveEmail = () => {
    if (emailText.trim() && emailTitle.trim()) {
      const newEmail: EmailDocument = {
        id: Date.now().toString(),
        type: 'email',
        title: emailTitle,
        content: emailText,
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: 'Admin User'
      };
      
      setDocuments([newEmail, ...documents]);
      setEmailText('');
      setEmailTitle('');
      setShowEmailForm(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const newDoc: EmailDocument = {
        id: Date.now().toString(),
        type: 'pdf',
        title: file.name.replace('.pdf', ''),
        fileName: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: 'Admin User'
      };
      
      setDocuments([newDoc, ...documents]);
    }
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    if (selectedDocument?.id === id) {
      setSelectedDocument(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowEmailForm(!showEmailForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Mail className="w-4 h-4" />
          <span>Add Email Text</span>
        </button>
        
        <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>Upload PDF</span>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Email Form */}
      {showEmailForm && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Email Title
              </label>
              <input
                type="text"
                value={emailTitle}
                onChange={(e) => setEmailTitle(e.target.value)}
                placeholder="e.g., Settlement Offer Communication"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Email Content
              </label>
              <textarea
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                rows={8}
                placeholder="Paste or type email content here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveEmail}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Email
              </button>
              <button
                onClick={() => {
                  setShowEmailForm(false);
                  setEmailText('');
                  setEmailTitle('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-2">
        {documents.map((doc) => (
          <div key={doc.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  doc.type === 'email' ? 'bg-green-100' : 'bg-purple-100'
                }`}>
                  {doc.type === 'email' ? (
                    <Mail className="w-5 h-5 text-green-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900">{doc.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-gray-500">
                      {doc.type === 'email' ? 'Email' : 'PDF'} • {doc.uploadDate}
                    </p>
                    <p className="text-xs text-gray-400">by {doc.uploadedBy}</p>
                  </div>
                  {doc.type === 'email' && doc.content && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {doc.content}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1 ml-4">
                <button
                  onClick={() => setSelectedDocument(doc)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="View"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
                {doc.type === 'pdf' && (
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {documents.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No emails or PDFs uploaded yet</p>
          <p className="text-sm text-gray-400 mt-1">Add email communications or upload PDF documents</p>
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedDocument(null)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedDocument.type === 'email' ? (
                  <Mail className="w-5 h-5 text-green-600" />
                ) : (
                  <FileText className="w-5 h-5 text-purple-600" />
                )}
                <div>
                  <h3 className="text-gray-900">{selectedDocument.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedDocument.uploadDate}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {selectedDocument.type === 'email' && selectedDocument.content && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900">
                    {selectedDocument.content}
                  </pre>
                </div>
              )}
              
              {selectedDocument.type === 'pdf' && (
                <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-900 mb-2">{selectedDocument.fileName}</p>
                  <p className="text-sm text-gray-500 mb-4">PDF viewer would display here</p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}