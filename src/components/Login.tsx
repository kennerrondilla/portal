import { useState } from 'react';
import { LogIn, User, Shield, UserCog } from 'lucide-react';
import logo from 'figma:asset/a98b64261dfcc336eaa9b8b5b0cda53f73b92fa9.png';

interface LoginProps {
  onLogin: (role: 'user' | 'admin' | 'representative') => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | 'representative'>('user');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <img src={logo} alt="Lifeify Logo" className="h-16" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-gray-900 mb-2">Welcome to Lifeify</h1>
          <p className="text-gray-500">Debt Settlement Portal</p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            type="button"
            onClick={() => setSelectedRole('user')}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedRole === 'user'
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <User className={`w-6 h-6 mx-auto mb-1 ${selectedRole === 'user' ? 'text-green-600' : 'text-gray-400'}`} />
            <p className={`text-xs ${selectedRole === 'user' ? 'text-green-600' : 'text-gray-600'}`}>User</p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('representative')}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedRole === 'representative'
                ? 'border-emerald-600 bg-emerald-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <UserCog className={`w-6 h-6 mx-auto mb-1 ${selectedRole === 'representative' ? 'text-emerald-600' : 'text-gray-400'}`} />
            <p className={`text-xs ${selectedRole === 'representative' ? 'text-emerald-600' : 'text-gray-600'}`}>Rep</p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('admin')}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedRole === 'admin'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <Shield className={`w-6 h-6 mx-auto mb-1 ${selectedRole === 'admin' ? 'text-purple-600' : 'text-gray-400'}`} />
            <p className={`text-xs ${selectedRole === 'admin' ? 'text-purple-600' : 'text-gray-600'}`}>Admin</p>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Sign In</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-green-600 hover:text-green-700">
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
}