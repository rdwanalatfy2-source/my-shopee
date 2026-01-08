
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getProducts, updateProductQuantity, saveSale, getCurrentUser, getCategories } from '../utils/storage';
import { Product, SaleItem, Sale, Category, SaleStatus } from '../types';
import { 
  ShoppingCart, Plus, Minus, Trash2, CheckCircle, 
  Search, Receipt, Package, X, CreditCard, Printer,
  Info, AlertCircle, Tag, User as UserIcon, Phone, ChevronRight, ChevronLeft
} from 'lucide-react';

const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false); // التحكم في ظهور السلة بالجوال
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const user = getCurrentUser();

  useEffect(() => {
    setProducts(getProducts());
    setCategories(getCategories());
    barcodeInputRef.current?.focus();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (p.barcode && p.barcode === searchTerm);
      const matchesCat = selectedCat === 'all' || p.categoryId === selectedCat;
      return matchesSearch && matchesCat;
    });
  }, [products, searchTerm, selectedCat]);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    const currentInCart = existing ? existing.quantity : 0;

    if (currentInCart + 1 > product.quantity) {
      alert(`عذراً! الكمية المتاحة من ${product.name} هي ${product.quantity} فقط.`);
      return;
    }

    if (existing) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        costPrice: product.costPrice,
        quantity: 1,
        returnedQuantity: 0,
        total: product.price
      }]);
    }
  };

  const updateCartQty = (productId: string, newQty: number) => {
    const product = products.find(p => p.id === productId);
    if (!product || newQty < 1) return;

    if (newQty > product.quantity) {
      alert("لا يمكن تجاوز الكمية المتوفرة في المخزن");
      return;
    }

    setCart(cart.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQty, total: newQty * item.price }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);

  const processSale = () => {
    if (cart.length === 0) return;

    const saleRecord: Sale = {
      id: `INV-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart,
      totalAmount: cartTotal,
      sellerId: user?.id || 'unknown',
      customerName: customerName.trim() || 'عميل نقدي',
      customerPhone: customerPhone.trim() || '---',
      status: SaleStatus.PENDING
    };

    saveSale(saleRecord);
    cart.forEach(item => updateProductQuantity(item.productId, item.quantity));

    setCart([]);
    setProducts(getProducts());
    setIsSuccess(true);
    setIsCartVisible(false);
    
    setTimeout(() => {
      setIsSuccess(false);
      setCustomerName('');
      setCustomerPhone('');
      barcodeInputRef.current?.focus();
    }, 5000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getCatName = (id: string) => categories.find(c => c.id === id)?.name || 'عام';

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 h-full overflow-hidden animate-fadeIn relative">
      
      {/* Products Section */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden print:hidden">
        <div className="p-4 md:p-6 border-b border-gray-50 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2 md:gap-3">
              <Package className="text-blue-600" size={28} />
              المبيعات
            </h1>
            <div className="lg:hidden">
               <button 
                onClick={() => setIsCartVisible(true)}
                className="relative p-2 bg-blue-50 text-blue-600 rounded-xl active:scale-90 transition-all"
               >
                 <ShoppingCart size={24} />
                 {cart.length > 0 && (
                   <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                     {cart.length}
                   </span>
                 )}
               </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="ابحث بالاسم أو الباركود..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pr-11 pl-4 py-3 md:py-4 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all text-sm md:text-lg font-medium"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
              <button onClick={() => setSelectedCat('all')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedCat === 'all' ? 'bg-slate-800 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>الكل</button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedCat === cat.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{cat.name}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 bg-slate-50/50">
          {filteredProducts.map(p => (
            <div 
              key={p.id} 
              onClick={() => p.quantity > 0 && addToCart(p)} 
              className={`group p-3 md:p-4 bg-white border border-gray-100 rounded-xl md:rounded-2xl transition-all cursor-pointer flex flex-col justify-between ${p.quantity === 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 active:scale-95'}`}
            >
              <div>
                <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase mb-2 inline-block">{getCatName(p.categoryId)}</span>
                <h3 className="font-bold text-slate-700 text-xs md:text-sm mb-1 leading-tight line-clamp-2">{p.name}</h3>
                <p className="text-base md:text-xl font-black text-slate-900 mt-2">{p.price.toFixed(2)} <span className="text-[10px] font-bold text-gray-400">ر.س</span></p>
              </div>
              <div className="mt-3 md:mt-4 pt-2 md:pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className={`text-[9px] md:text-[10px] font-bold ${p.quantity <= 5 ? 'text-red-500' : 'text-gray-400'}`}>
                  المخزن: {p.quantity}
                </span>
                <div className="bg-blue-50 text-blue-600 p-1 md:p-1.5 rounded-lg lg:opacity-0 group-hover:opacity-100 transition-all"><Plus size={14} /></div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-300 gap-2">
               <Package size={48} className="opacity-20" />
               <p className="font-bold italic">لا يوجد منتجات</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Overlay for Mobile */}
      <div 
        className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isCartVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsCartVisible(false)}
      />

      {/* Cart Drawer/Section */}
      <div className={`fixed inset-y-0 left-0 z-50 w-full md:w-[450px] lg:relative lg:inset-auto lg:w-[400px] xl:w-[450px] transform transition-transform duration-300 ease-in-out bg-white lg:translate-x-0 flex flex-col shadow-2xl lg:shadow-xl border-r border-gray-100 rounded-tr-3xl lg:rounded-3xl overflow-hidden print:w-full print:shadow-none print:border-none ${isCartVisible ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-5 md:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Receipt size={22} className="text-blue-400" />
            <h2 className="text-lg md:text-xl font-black">الفاتورة</h2>
          </div>
          <button onClick={() => setIsCartVisible(false)} className="lg:hidden p-2 hover:bg-slate-800 rounded-xl transition-colors">
             <X size={24} />
          </button>
        </div>

        <div className="p-4 bg-blue-50/50 border-b border-blue-100 space-y-3 shrink-0 print:hidden">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400" size={14} />
              <input type="text" placeholder="اسم الزبون..." value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full pr-9 pl-3 py-2.5 bg-white border border-blue-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
            </div>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400" size={14} />
              <input type="text" placeholder="رقم الهاتف..." value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full pr-9 pl-3 py-2.5 bg-white border border-blue-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar print:overflow-visible">
          {cart.length > 0 ? (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.productId} className="flex justify-between items-center gap-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm leading-tight">{item.productName}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{item.price.toFixed(2)} ر.س / للوحدة</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                      <button onClick={() => updateCartQty(item.productId, item.quantity - 1)} className="p-1 text-slate-400 hover:text-red-500 transition-colors active:scale-90"><Minus size={14} /></button>
                      <span className="font-black text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.productId, item.quantity + 1)} className="p-1 text-slate-400 hover:text-blue-500 transition-colors active:scale-90"><Plus size={14} /></button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-900 text-sm">{item.total.toFixed(2)} <span className="text-[10px]">ر.س</span></span>
                      <button onClick={() => removeFromCart(item.productId)} className="text-gray-300 hover:text-red-500 transition-colors active:scale-90"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !isSuccess && (
            <div className="flex flex-col items-center justify-center h-full py-10 text-gray-300 gap-4 opacity-30">
              <ShoppingCart size={48} />
              <p className="font-bold text-sm">السلة فارغة</p>
            </div>
          )}

          {isSuccess && (
            <div className="flex flex-col items-center justify-center h-full py-10 text-emerald-500 gap-4 text-center">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center shadow-inner"><CheckCircle size={32} /></div>
              <p className="font-black text-lg">تم البيع بنجاح!</p>
              <button onClick={handlePrint} className="bg-slate-800 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all print:hidden">
                <Printer size={18} /> طباعة الفاتورة
              </button>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 bg-slate-50 border-t border-gray-100 space-y-4 md:space-y-6 shrink-0 print:bg-white print:border-t-2 print:border-black">
          <div className="flex justify-between items-center">
            <span className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-widest">الإجمالي</span>
            <div className="text-right">
              <p className="text-2xl md:text-3xl font-black text-blue-600 leading-none print:text-black">
                {cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm font-bold">ر.س</span>
              </p>
            </div>
          </div>
          <button 
            onClick={processSale} 
            disabled={cart.length === 0 || isSuccess} 
            className={`w-full py-4 md:py-5 rounded-2xl font-black text-base md:text-lg transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl print:hidden ${isSuccess ? 'bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-200 disabled:shadow-none'}`}
          >
            إتمام العملية
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
