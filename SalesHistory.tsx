
import React, { useState, useMemo } from 'react';
import { getSales, updateSaleStatus, returnProductsToStock, processPartialReturn } from '../utils/storage';
import { Sale, SaleStatus, SaleItem } from '../types';
import { 
  Search, CheckCircle, RotateCcw, Clock, 
  Calendar, Eye, X, AlertCircle, ChevronLeft, Package, Trash2,
  Printer, User as UserIcon, Receipt, Info
} from 'lucide-react';

const SalesHistory: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>(getSales().reverse());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isReturnMode, setIsReturnMode] = useState(false);

  const filteredSales = useMemo(() => {
    return sales.filter(s => 
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (s.customerName && s.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [sales, searchTerm]);

  const handleConfirm = (saleId: string) => {
    updateSaleStatus(saleId, SaleStatus.CONFIRMED);
    const updated = getSales().reverse();
    setSales(updated);
    if (selectedSale?.id === saleId) {
      setSelectedSale(updated.find(s => s.id === saleId) || null);
    }
  };

  const handleItemReturn = (e: React.MouseEvent, saleId: string, item: SaleItem) => {
    e.stopPropagation();
    const currentReturned = item.returnedQuantity || 0;
    const remaining = item.quantity - currentReturned;
    
    if (remaining <= 0) {
      alert("تم استرجاع هذا الصنف بالكامل.");
      return;
    }

    const qtyStr = prompt(`كم الكمية المراد استرجاعها من "${item.productName}"؟\nالحد الأقصى المتاح: ${remaining}`, "1");
    if (qtyStr === null) return;
    
    const qty = parseInt(qtyStr);
    if (isNaN(qty) || qty <= 0 || qty > remaining) {
      alert("الكمية المدخلة غير صحيحة.");
      return;
    }

    try {
      processPartialReturn(saleId, item.productId, qty);
      const updated = getSales().reverse();
      setSales(updated);
      const newSelected = updated.find(s => s.id === saleId);
      setSelectedSale(newSelected || null);
      alert(`تم استرجاع (${qty}) بنجاح.`);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الاسترجاع.");
    }
  };

  const handleFullReturn = (sale: Sale) => {
    if (!confirm('هل أنت متأكد من إلغاء الفاتورة بالكامل؟')) return;
    try {
      updateSaleStatus(sale.id, SaleStatus.RETURNED);
      returnProductsToStock(sale.items);
      const updated = getSales().reverse();
      setSales(updated);
      setSelectedSale(null);
      alert("تمت إعادة الفاتورة بالكامل.");
    } catch (error) {
      alert("حدث خطأ أثناء الإلغاء.");
    }
  };

  const getStatusBadge = (status: SaleStatus) => {
    switch (status) {
      case SaleStatus.CONFIRMED:
        return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[0.65rem] font-black border border-emerald-100 flex items-center gap-1"><CheckCircle size={10}/> مؤكدة</span>;
      case SaleStatus.RETURNED:
        return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[0.65rem] font-black border border-red-100 flex items-center gap-1"><RotateCcw size={10}/> مرتجعة</span>;
      case SaleStatus.PARTIAL_RETURN:
        return <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[0.65rem] font-black border border-orange-100 flex items-center gap-1"><AlertCircle size={10}/> مرتجع جزئي</span>;
      default:
        return <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[0.65rem] font-black border border-amber-100 flex items-center gap-1"><Clock size={10}/> انتظار</span>;
    }
  };

  const invoiceSummary = useMemo(() => {
    if (!selectedSale) return { original: 0, returnedValue: 0, net: 0 };
    const original = selectedSale.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const returnedValue = selectedSale.items.reduce((acc, item) => acc + (item.price * (item.returnedQuantity || 0)), 0);
    return { original, returnedValue, net: selectedSale.totalAmount };
  }, [selectedSale]);

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-[1200px] mx-auto font-['Tajawal']" dir="rtl">
      <header className="px-2 md:px-0">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">سجل المبيعات</h1>
        <p className="text-slate-500 text-xs md:text-sm font-medium">مراجعة الفواتير والعمليات المالية.</p>
      </header>

      <div className="relative group px-2 md:px-0 z-10">
        <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="ابحث برقم الفاتورة أو اسم الزبون..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-slate-50/50 text-slate-400 text-[0.7rem] font-black uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-5">رقم الفاتورة</th>
              <th className="px-6 py-5">الزبون</th>
              <th className="px-6 py-5 text-center">الإجمالي</th>
              <th className="px-6 py-5 text-center">الحالة</th>
              <th className="px-6 py-5 text-left">الإجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredSales.map(sale => (
              <tr key={sale.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setSelectedSale(sale)}>
                <td className="px-6 py-5 font-black text-slate-800">{sale.id}</td>
                <td className="px-6 py-5">
                  <div className="font-bold text-sm text-slate-700">{sale.customerName || 'عميل نقدي'}</div>
                  <div className="text-[0.6rem] text-slate-400 font-bold">{new Date(sale.date).toLocaleString('ar-SA')}</div>
                </td>
                <td className="px-6 py-5 font-black text-blue-600 text-center text-sm">{sale.totalAmount.toFixed(2)} ر.س</td>
                <td className="px-6 py-5 text-center">
                  <div className="inline-flex">{getStatusBadge(sale.status)}</div>
                </td>
                <td className="px-6 py-5 text-left">
                  <button className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile List */}
      <div className="lg:hidden grid grid-cols-1 gap-3 px-2">
        {filteredSales.map(sale => (
          <div key={sale.id} onClick={() => setSelectedSale(sale)} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 active:scale-[0.98] transition-all flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-800 text-sm">{sale.id}</span>
                {getStatusBadge(sale.status)}
              </div>
              <p className="text-xs font-bold text-slate-600">{sale.customerName || 'عميل نقدي'}</p>
            </div>
            <ChevronLeft size={16} className="text-slate-300" />
          </div>
        ))}
      </div>

      {/* Enhanced Modal Structure */}
      {selectedSale && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-4 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity" onClick={() => setSelectedSale(null)}></div>
          
          <div className="relative bg-white w-full max-w-3xl h-full max-h-[96vh] md:max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-slideUp">
            
            {/* Modal Header - Guaranteed Visible */}
            <header className="sticky top-0 bg-slate-900 p-6 md:p-8 text-white flex flex-col gap-6 shrink-0 z-50 shadow-xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                    <Receipt size={24} className="text-white" />
                   </div>
                   <div>
                    <h2 className="text-lg md:text-2xl font-black tracking-tight flex items-center gap-3">
                      الفاتورة <span className="text-blue-400">{selectedSale.id}</span>
                    </h2>
                    <p className="text-[0.65rem] md:text-xs text-slate-400 font-bold mt-1 flex items-center gap-1">
                      <Calendar size={12} /> {new Date(selectedSale.date).toLocaleString('ar-SA')}
                    </p>
                   </div>
                </div>
                <button 
                  onClick={() => setSelectedSale(null)} 
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-95"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                 <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-[0.6rem] text-slate-400 font-bold mb-1 uppercase tracking-wider">الزبون</p>
                    <div className="flex items-center gap-2">
                       <UserIcon size={14} className="text-blue-400" />
                       <span className="text-xs font-black truncate">{selectedSale.customerName || 'عميل نقدي'}</span>
                    </div>
                 </div>
                 <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-[0.6rem] text-slate-400 font-bold mb-1 uppercase tracking-wider">الحالة</p>
                    <div className="flex items-center gap-2">
                       {getStatusBadge(selectedSale.status)}
                    </div>
                 </div>
                 <div className="hidden md:block p-3 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-[0.6rem] text-slate-400 font-bold mb-1 uppercase tracking-wider">الهاتف</p>
                    <p className="text-xs font-black text-slate-200">{selectedSale.customerPhone || '---'}</p>
                 </div>
              </div>
            </header>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar bg-slate-50/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">المحتويات</h3>
                {selectedSale.status !== SaleStatus.RETURNED && (
                   <button 
                     onClick={() => setIsReturnMode(!isReturnMode)}
                     className={`px-4 py-2 rounded-xl text-[0.7rem] font-black transition-all ${isReturnMode ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                   >
                     {isReturnMode ? 'إلغاء وضع الاسترجاع' : 'تفعيل الاسترجاع'}
                   </button>
                 )}
              </div>

              {isReturnMode && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3 animate-pulse">
                  <Info className="text-orange-500" size={18} />
                  <p className="text-xs text-orange-800 font-black">اضغط على زر الاسترجاع بجانب الصنف لتعديله.</p>
                </div>
              )}

              <div className="space-y-4">
                {selectedSale.items.map((item, idx) => {
                  const currentReturned = item.returnedQuantity || 0;
                  const remaining = item.quantity - currentReturned;
                  return (
                    <div key={idx} className={`p-5 rounded-3xl border transition-all shadow-sm ${remaining === 0 ? 'bg-red-50 border-red-100 opacity-60 grayscale' : 'bg-white border-slate-100'}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="font-black text-slate-800 text-sm md:text-base mb-1">{item.productName}</p>
                          <div className="flex items-center gap-3 text-[0.7rem] text-slate-400 font-bold">
                            <span>السعر: {item.price.toFixed(2)}</span>
                            <span>العدد: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-black text-blue-600 text-sm">{(item.price * remaining).toFixed(2)} ر.س</p>
                          {currentReturned > 0 && <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-lg text-[0.6rem] font-black">مرتجع: {currentReturned}</span>}
                        </div>
                      </div>
                      
                      {isReturnMode && remaining > 0 && (
                        <button 
                          onClick={(e) => handleItemReturn(e, selectedSale.id, item)}
                          className="mt-4 w-full py-3 bg-orange-600 text-white rounded-2xl text-[0.75rem] font-black shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                          <RotateCcw size={14} /> استرجاع كمية
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4 mb-32">
                 <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                    <span>القيمة الأصلية</span>
                    <span>{invoiceSummary.original.toFixed(2)} ر.س</span>
                 </div>
                 {invoiceSummary.returnedValue > 0 && (
                   <div className="flex justify-between items-center text-sm font-bold text-red-500">
                      <span>إجمالي المرتجع (-)</span>
                      <span>{invoiceSummary.returnedValue.toFixed(2)} ر.س</span>
                   </div>
                 )}
                 <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-base font-black text-slate-800">الصافي المالي</span>
                    <span className="text-2xl font-black text-blue-600 tracking-tight">{invoiceSummary.net.toFixed(2)} ر.س</span>
                 </div>
              </div>
            </div>

            {/* Modal Footer - Fixed Bottom */}
            <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 bg-white/95 backdrop-blur-md border-t border-slate-100 flex flex-col md:flex-row gap-3 z-50 shadow-2xl shrink-0">
              {selectedSale.status === SaleStatus.PENDING && (
                <button 
                  onClick={() => handleConfirm(selectedSale.id)}
                  className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <CheckCircle size={20} /> تأكيد وقبض
                </button>
              )}
              
              {selectedSale.status !== SaleStatus.RETURNED && (
                <button 
                  onClick={() => handleFullReturn(selectedSale)}
                  className="flex-1 bg-white text-red-600 py-4 rounded-2xl font-black border border-red-100 hover:bg-red-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Trash2 size={20} /> إبطال الفاتورة
                </button>
              )}
              
              <button 
                onClick={() => window.print()}
                className="bg-slate-900 text-white p-4 rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Printer size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
