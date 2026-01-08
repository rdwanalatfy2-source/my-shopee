
import React, { useState, useEffect, useMemo } from 'react';
import { getProducts, saveProducts, getCurrentUser, getCategories } from '../utils/storage';
import { Product, Category, Role } from '../types';
import { Plus, Trash2, Package, Search, Edit3, X, CheckCircle, AlertTriangle, Barcode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showToast, setShowToast] = useState(false);
  
  const navigate = useNavigate();

  const initialForm = {
    barcode: '',
    name: '',
    categoryId: '',
    costPrice: '',
    price: '',
    quantity: ''
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.role !== Role.ADMIN) {
      navigate('/');
      return;
    }
    setProducts(getProducts());
    const cats = getCategories();
    setCategories(cats);
    if (cats.length > 0) {
      setFormData(prev => ({ ...prev, categoryId: cats[0].id }));
    }
  }, [navigate]);

  const profitMargin = useMemo(() => {
    const cost = parseFloat(formData.costPrice);
    const price = parseFloat(formData.price);
    if (!cost || !price || cost <= 0) return 0;
    return ((price - cost) / cost) * 100;
  }, [formData.costPrice, formData.price]);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      alert('الرجاء إضافة صنف أولاً من قسم الأصناف');
      return;
    }

    const productData: Product = {
      id: editingProduct ? editingProduct.id : crypto.randomUUID(),
      barcode: formData.barcode,
      name: formData.name,
      categoryId: formData.categoryId,
      costPrice: parseFloat(formData.costPrice) || 0,
      price: parseFloat(formData.price) || 0,
      quantity: parseInt(formData.quantity) || 0
    };

    let updatedProducts: Product[];
    if (editingProduct) {
      updatedProducts = products.map(p => p.id === editingProduct.id ? productData : p);
    } else {
      updatedProducts = [productData, ...products];
    }

    setProducts(updatedProducts);
    saveProducts(updatedProducts);
    handleCloseModal();
    triggerToast();
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      barcode: product.barcode || '',
      name: product.name,
      categoryId: product.categoryId,
      costPrice: product.costPrice.toString(),
      price: product.price.toString(),
      quantity: product.quantity.toString()
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ ...initialForm, categoryId: categories[0]?.id || '' });
  };

  const deleteProduct = (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveProducts(updated);
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'غير مصنف';

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.barcode && p.barcode.includes(searchTerm))
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle size={20} />
          <span>تم حفظ المنتج بنجاح</span>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة المخزون</h1>
          <p className="text-gray-500">إضافة وتعديل المنتجات مع دعم الباركود والربحية.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          <Plus size={20} />
          إضافة منتج جديد
        </button>
      </header>

      <div className="relative group">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="ابحث بالاسم أو الباركود..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pr-12 pl-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs uppercase font-bold">
                <th className="px-6 py-5">الباركود</th>
                <th className="px-6 py-5">المنتج</th>
                <th className="px-6 py-5">الصنف</th>
                <th className="px-6 py-5 text-center">التكلفة</th>
                <th className="px-6 py-5 text-center">البيع</th>
                <th className="px-6 py-5 text-center">الكمية</th>
                <th className="px-6 py-5 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">{p.barcode || '---'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-400">
                        <Package size={18} />
                      </div>
                      <span className="font-bold text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                      {getCategoryName(p.categoryId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500">{p.costPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center font-black text-gray-900">{p.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 font-bold ${p.quantity < 5 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(p)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-full"><Edit3 size={18} /></button>
                      <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
            <header className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}</h2>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
            </header>

            <form onSubmit={handleSaveProduct} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-gray-500">الباركود (اختياري)</label>
                  <div className="relative">
                    <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input
                      type="text" value={formData.barcode}
                      onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="00000000"
                    />
                  </div>
                </div>
                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-gray-500">التصنيف</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">اسم المنتج</label>
                <input
                  type="text" required value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: وصلة نحاس 1 إنش"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">سعر التكلفة</label>
                  <input
                    type="number" step="0.01" required value={formData.costPrice}
                    onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">سعر البيع</label>
                  <input
                    type="number" step="0.01" required value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold ${parseFloat(formData.price) < parseFloat(formData.costPrice) ? 'text-red-500 border-red-200' : 'text-blue-600'}`}
                  />
                </div>
              </div>

              {profitMargin !== 0 && (
                <div className={`p-3 rounded-xl flex items-center justify-between text-sm font-bold ${profitMargin > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  <span>هامش الربح المتوقع:</span>
                  <span>{profitMargin.toFixed(1)}%</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">الكمية المتوفرة</label>
                <input
                  type="number" required value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-4 text-gray-400 font-bold hover:bg-gray-50 rounded-2xl transition-all">إلغاء</button>
                <button type="submit" className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg active:scale-95 transition-all">
                  {editingProduct ? 'حفظ التعديلات' : 'تأكيد الإضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
