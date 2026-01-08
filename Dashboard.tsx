
import React, { useMemo, useEffect, useState } from 'react';
import { getSales, getProducts, getCurrentUser, getCategories } from '../utils/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, FileText, PackageCheck, AlertCircle, Coins, Clock, X, Sparkles, CheckCircle } from 'lucide-react';
import { Role, SaleStatus } from '../types';

const Dashboard: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const sales = useMemo(() => getSales(), []);
  const products = useMemo(() => getProducts(), []);
  const categories = useMemo(() => getCategories(), []);
  const user = getCurrentUser();
  const isAdmin = user?.role === Role.ADMIN;

  useEffect(() => {
    const welcomeSeen = sessionStorage.getItem('shakerin_welcome_seen');
    if (!welcomeSeen) {
      const timer = setTimeout(() => setShowWelcome(true), 800);
      sessionStorage.setItem('shakerin_welcome_seen', 'true');
      return () => clearTimeout(timer);
    }
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(s => s.date.startsWith(today));
    
    const dailyRevenue = todaySales.reduce((acc, s) => {
      if (s.status === SaleStatus.RETURNED) return acc;
      return acc + s.totalAmount;
    }, 0);
    
    const dailyProfit = todaySales.reduce((acc, sale) => {
      if (sale.status === SaleStatus.RETURNED) return acc;
      const saleProfit = sale.items.reduce((sum, item) => {
        const actualQty = item.quantity - (item.returnedQuantity || 0);
        return sum + ((item.price - item.costPrice) * actualQty);
      }, 0);
      return acc + saleProfit;
    }, 0);

    const invoiceCount = todaySales.filter(s => s.status !== SaleStatus.RETURNED).length;

    const productUsage: Record<string, number> = {};
    sales.forEach(sale => {
      if (sale.status === SaleStatus.RETURNED) return;
      sale.items.forEach(item => {
        const actualQty = item.quantity - (item.returnedQuantity || 0);
        if (actualQty > 0) {
          productUsage[item.productName] = (productUsage[item.productName] || 0) + actualQty;
        }
      });
    });

    const topProducts = Object.entries(productUsage)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const lowStock = products.filter(p => p.quantity < 5).length;
    const recentSales = [...sales].reverse().slice(0, 5);

    return { dailyRevenue, dailyProfit, invoiceCount, topProducts, lowStock, recentSales };
  }, [sales, products]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-8 animate-fadeIn font-['Tajawal']" dir="rtl">
      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn" onClick={() => setShowWelcome(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp border border-blue-50">
            <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-8 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="inline-flex p-4 bg-white/20 rounded-full mb-4 shadow-inner">
                  <Sparkles size={40} className="text-yellow-300 animate-pulse" />
                </div>
                <h2 className="text-2xl font-black mb-1">أهلاً بك</h2>
                <p className="text-blue-100 text-sm leading-relaxed font-medium">
                  مرحباً بك في <br/> 
                  <span className="text-xl font-black text-white block mt-1 tracking-tight">كهربائي وسباكة الشاكرين 👋</span>
                </p>
              </div>
            </div>
            <div className="p-8 text-center">
              <p className="text-slate-500 text-sm font-medium mb-6">يسعدنا انضمامك إلينا اليوم. لوحة التحكم جاهزة لإدارة مبيعاتك.</p>
              <button 
                onClick={() => setShowWelcome(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                تفضل بالدخول
                <CheckCircle size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <header>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">لوحة التحكم</h1>
        <p className="text-slate-500 mt-2 font-medium">مرحباً بك في كهربائي وسباكة الشاكرين.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">مبيعات اليوم</p>
            <p className="text-2xl font-black text-slate-800">{stats.dailyRevenue.toLocaleString()}</p>
          </div>
        </div>

        {isAdmin && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
              <Coins size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">أرباح اليوم</p>
              <p className="text-2xl font-black text-emerald-600">{stats.dailyProfit.toLocaleString()}</p>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl text-slate-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">الفواتير</p>
            <p className="text-2xl font-black text-slate-800">{stats.invoiceCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-amber-50 p-4 rounded-2xl text-amber-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">النواقص</p>
            <p className="text-2xl font-black text-amber-600">{stats.lowStock}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-black mb-6">الأصناف الأكثر طلباً</h2>
          <div className="h-80">
            {stats.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={28}>
                    {stats.topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 italic font-medium">لا توجد بيانات بيع حالياً</div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <Clock className="text-blue-600" size={20} />
            أحدث العمليات
          </h2>
          <div className="space-y-4">
            {stats.recentSales.map(sale => (
              <div key={sale.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors hover:border-blue-200">
                <div>
                  <p className="font-black text-slate-800 text-xs">{sale.id}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{sale.customerName || 'عميل نقدي'}</p>
                </div>
                <div className="text-left">
                  <p className="font-black text-blue-600 text-sm">{sale.totalAmount.toFixed(0)}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">ر.س</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
