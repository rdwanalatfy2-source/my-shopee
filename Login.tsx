
import React, { useState } from 'react';
import { getUsers, setCurrentUser } from '../utils/storage';
import { LogIn, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      setCurrentUser(user);
      onLogin();
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">
        <div className="bg-blue-600 p-8 text-white text-center">
          <div className="inline-block p-4 bg-white/20 rounded-full mb-4">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-2xl font-bold">نظام إدارة المحل</h1>
          <p className="text-blue-100 mt-2">يرجى تسجيل الدخول للمتابعة</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 text-center font-bold">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">اسم المستخدم</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="أدخل اسم المستخدم"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95"
          >
            <LogIn size={20} />
            دخول للنظام
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
