
import React, { useState, useEffect } from 'react';
import { getUsers, saveUsers } from '../../utils/storage';
import { User, Role } from '../../types';
import { UserPlus, Trash2, Users, Edit3, X, Eye, EyeOff, Save } from 'lucide-react';

const EmployeeManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUserId) {
      const updated = users.map(u => 
        u.id === editingUserId 
          ? { ...u, username, password } 
          : u
      );
      setUsers(updated);
      saveUsers(updated);
      setEditingUserId(null);
    } else {
      const newUser: User = {
        id: crypto.randomUUID(),
        username,
        password,
        role: Role.EMPLOYEE,
        createdAt: new Date().toISOString()
      };
      const updated = [...users, newUser];
      setUsers(updated);
      saveUsers(updated);
    }
    
    setUsername('');
    setPassword('');
  };

  const deleteUser = (id: string) => {
    if (id === '1') {
      alert('لا يمكن حذف حساب المدير الرئيسي.');
      return;
    }
    if (!confirm('هل أنت متأكد من حذف هذا الحساب؟')) return;
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    saveUsers(updated);
  };

  const startEdit = (user: User) => {
    setEditingUserId(user.id);
    setUsername(user.username);
    setPassword(user.password || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 animate-fadeIn font-['Tajawal']" dir="rtl">
      <header>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">إدارة الصلاحيات والمستخدمين</h1>
        <p className="text-slate-500 mt-1">تعديل بيانات المدير أو إضافة وتعديل حسابات الموظفين.</p>
      </header>

      <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700">
          {editingUserId ? <Edit3 size={20} className="text-orange-500" /> : <UserPlus size={20} className="text-blue-600" />}
          {editingUserId ? 'تعديل بيانات الحساب' : 'إضافة موظف جديد'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[0.7rem] font-bold text-slate-400 mr-2 uppercase">اسم المستخدم</label>
            <input
              type="text"
              placeholder="أدخل اسم المستخدم"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[0.7rem] font-bold text-slate-400 mr-2 uppercase">كلمة المرور</label>
            <input
              type="text"
              placeholder="أدخل كلمة المرور"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <button 
              type="submit" 
              className={`flex-1 py-3 rounded-xl font-black transition-all shadow-lg flex items-center justify-center gap-2 ${editingUserId ? 'bg-orange-500 text-white shadow-orange-100 hover:bg-orange-600' : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'}`}
            >
              {editingUserId ? <Save size={18} /> : <UserPlus size={18} />}
              {editingUserId ? 'حفظ التغييرات' : 'إضافة الموظف'}
            </button>
            {editingUserId && (
              <button 
                type="button" 
                onClick={() => { setEditingUserId(null); setUsername(''); setPassword(''); }}
                className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition-all"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-2">
          <Users size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800">الحسابات النشطة</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-50/50 text-slate-400 text-[0.65rem] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">اسم المستخدم</th>
                <th className="px-6 py-4">كلمة المرور</th>
                <th className="px-6 py-4">الدور</th>
                <th className="px-6 py-4 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-700">{u.username}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-mono text-sm text-slate-500">
                      <span>{showPasswords[u.id] ? u.password : '••••••••'}</span>
                      <button onClick={() => togglePasswordVisibility(u.id)} className="p-1 hover:text-blue-600 transition-colors">
                        {showPasswords[u.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${u.role === Role.ADMIN ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => startEdit(u)} 
                        className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                        title="تعديل"
                      >
                        <Edit3 size={18} />
                      </button>
                      {u.id !== '1' && (
                        <button 
                          onClick={() => deleteUser(u.id)} 
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="حذف"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default EmployeeManager;
