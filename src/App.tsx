import { useState } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { DebtList } from './components/DebtList';
import { PaymentMethods } from './components/PaymentMethods';
import { DocumentsActivity } from './components/DocumentsActivity';
import { SettlementReadiness } from './components/SettlementReadiness';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminClientActivityNotifications } from './components/AdminClientActivityNotifications';
import { RepresentativeDashboard } from './components/RepresentativeDashboard';
import { Notifications } from './components/Notifications';
import { Chat } from './components/Chat';
import { VideoCall } from './components/VideoCall';
import { LayoutDashboard, FileText, Calendar, LogOut, User, MessageCircle, Circle, CreditCard, Upload, FileSignature } from 'lucide-react';
import logo from 'figma:asset/a98b64261dfcc336eaa9b8b5b0cda53f73b92fa9.png';

type TabType = 'dashboard' | 'debts' | 'payment-methods' | 'documents' | 'settlement-ready';
type UserRole = 'user' | 'admin' | 'representative' | null;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userName] = useState('John Smith');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(true);
  const [lastLoginTime, setLastLoginTime] = useState<string>('');

  const handleLogin = (role: 'user' | 'admin' | 'representative') => {
    setUserRole(role);
    const loginTime = new Date().toISOString();
    setLastLoginTime(loginTime);
    console.log(`User logged in at: ${loginTime}`);
    // In production, this would send to backend to track client activity
  };

  const handleLogout = () => {
    setUserRole(null);
    setActiveTab('dashboard');
    setIsChatOpen(false);
    setIsVideoCallOpen(false);
  };

  const handleOpenChat = () => {
    setIsChatOpen(true);
    setHasUnreadMessages(false);
  };

  const handleStartVideoCall = () => {
    setIsVideoCallOpen(true);
  };

  // Show login page if not authenticated
  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  // Show representative dashboard
  if (userRole === 'representative') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Representative Header */}
        <header className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-b border-green-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Lifeify Logo" className="h-10" />
                <div>
                  <h1 className="text-white">Lifeify Representative</h1>
                  <p className="text-sm text-green-100">Debt Settlement Portal</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-green-100">Debt Settlement Rep</p>
                  <p className="text-white">Representative User</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <RepresentativeDashboard />
        </main>
      </div>
    );
  }

  // Show admin dashboard
  if (userRole === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <header className="bg-gradient-to-r from-purple-600 to-green-600 text-white border-b border-purple-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Lifeify Logo" className="h-10" />
                <div>
                  <h1 className="text-white">Lifeify Admin</h1>
                  <p className="text-sm text-purple-100">Debt Settlement Portal</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <AdminClientActivityNotifications />
                <div className="text-right">
                  <p className="text-sm text-purple-100">Administrator</p>
                  <p className="text-white">Admin User</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdminDashboard />
        </main>
      </div>
    );
  }

  // Show user dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Lifeify Logo" className="h-10" />
              <div>
                <h1 className="text-gray-900">Lifeify</h1>
                <p className="text-sm text-gray-500">Debt Settlement Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Notifications />
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back</p>
                <p className="text-gray-900">{userName}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('debts')}
              className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                activeTab === 'debts'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>My Debts</span>
            </button>
            <button
              onClick={() => setActiveTab('payment-methods')}
              className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                activeTab === 'payment-methods'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>Payment Methods</span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                activeTab === 'documents'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span>Documents Activity</span>
            </button>
            <button
              onClick={() => setActiveTab('settlement-ready')}
              className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                activeTab === 'settlement-ready'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileSignature className="w-5 h-5" />
              <span>Settlement Readiness</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'debts' && <DebtList />}
        {activeTab === 'payment-methods' && <PaymentMethods />}
        {activeTab === 'documents' && <DocumentsActivity />}
        {activeTab === 'settlement-ready' && <SettlementReadiness />}
      </main>

      {/* Chat and Video Call */}
      {isChatOpen && (
        <Chat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          userRole={userRole}
          userName={userName}
          clientName={userRole === 'user' ? undefined : userName}
          onStartVideoCall={handleStartVideoCall}
        />
      )}
      {isVideoCallOpen && (
        <VideoCall
          isOpen={isVideoCallOpen}
          onClose={() => setIsVideoCallOpen(false)}
          userRole={userRole}
          participantName={userRole === 'user' ? 'Admin User' : userName}
        />
      )}

      {/* Floating Chat Button */}
      <button
        onClick={handleOpenChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all hover:scale-110 flex items-center justify-center z-40"
      >
        <MessageCircle className="w-6 h-6" />
        {hasUnreadMessages && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <Circle className="w-3 h-3 fill-current animate-pulse" />
          </span>
        )}
      </button>
    </div>
  );
}