import { useState } from 'react';
import { Send, Paperclip, Video, X, MessageCircle, Circle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'admin' | 'client' | 'representative';
  senderName: string;
  message: string;
  timestamp: string;
  attachment?: {
    type: 'file' | 'image';
    name: string;
    url: string;
  };
}

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'user' | 'admin' | 'representative';
  userName: string;
  clientName?: string;
  onStartVideoCall?: () => void;
}

const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'admin',
    senderName: 'Admin User',
    message: 'Hello! I wanted to update you on your Capital One settlement offer.',
    timestamp: '2024-12-23 10:30 AM'
  },
  {
    id: '2',
    sender: 'client',
    senderName: 'John Smith',
    message: 'Great! What\'s the update?',
    timestamp: '2024-12-23 10:32 AM'
  },
  {
    id: '3',
    sender: 'admin',
    senderName: 'Admin User',
    message: 'We\'ve received a counter-offer at 55% of the original balance. This would save you $4,005!',
    timestamp: '2024-12-23 10:33 AM'
  },
  {
    id: '4',
    sender: 'client',
    senderName: 'John Smith',
    message: 'That sounds good. What are the next steps?',
    timestamp: '2024-12-23 10:35 AM'
  },
];

export function Chat({ isOpen, onClose, userRole, userName, clientName, onStartVideoCall }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: userRole === 'user' ? 'client' : userRole === 'admin' ? 'admin' : 'representative',
        senderName: userName,
        message: newMessage,
        timestamp: new Date().toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };
      
      setMessages([...messages, message]);
      setNewMessage('');
      
      // Simulate typing indicator
      if (userRole === 'user') {
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
          }, 2000);
        }, 500);
      }
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const message: Message = {
        id: Date.now().toString(),
        sender: userRole === 'user' ? 'client' : userRole === 'admin' ? 'admin' : 'representative',
        senderName: userName,
        message: 'Shared a file',
        timestamp: new Date().toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        attachment: {
          type: file.type.startsWith('image/') ? 'image' : 'file',
          name: file.name,
          url: URL.createObjectURL(file)
        }
      };
      
      setMessages([...messages, message]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-end md:items-center justify-center md:justify-end p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:w-96 h-[80vh] md:h-[600px] md:mr-4 md:mb-4 flex flex-col shadow-2xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5" />
            <div>
              <h3 className="font-medium">
                {userRole === 'user' ? 'Support Chat' : `Chat with ${clientName || 'Client'}`}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-green-100">
                <Circle className="w-2 h-2 fill-current" />
                <span>Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onStartVideoCall && (
              <button
                onClick={onStartVideoCall}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Start Video Call"
              >
                <Video className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg) => {
            const isOwnMessage = 
              (userRole === 'user' && msg.sender === 'client') ||
              (userRole === 'admin' && msg.sender === 'admin') ||
              (userRole === 'representative' && msg.sender === 'representative');

            return (
              <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                  {!isOwnMessage && (
                    <p className="text-xs text-gray-500 mb-1 ml-1">{msg.senderName}</p>
                  )}
                  <div className={`rounded-2xl px-4 py-2 ${
                    isOwnMessage 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                    {msg.attachment && (
                      <div className={`mt-2 p-2 rounded-lg ${
                        isOwnMessage ? 'bg-green-700' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4" />
                          <span className="text-xs truncate">{msg.attachment.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className={`text-xs text-gray-400 mt-1 ${isOwnMessage ? 'text-right mr-1' : 'ml-1'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[75%]">
                <p className="text-xs text-gray-500 mb-1 ml-1">
                  {userRole === 'user' ? 'Admin' : 'Client'} is typing...
                </p>
                <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
          <div className="flex items-end gap-2">
            <label className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
              <Paperclip className="w-5 h-5 text-gray-600" />
              <input
                type="file"
                className="hidden"
                onChange={handleFileAttach}
                accept="image/*,.pdf,.doc,.docx"
              />
            </label>
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}