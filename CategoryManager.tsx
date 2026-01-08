
import React, { useState, useEffect } from 'react';
import { getCategories, saveCategories, getProducts } from '../../utils/storage';
import { Category } from '../../types';
import { Plus, Trash2, Tag, AlertCircle } from 'lucide-react';

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    const newCat: Category = {
      id: crypto.randomUUID(),
      name: newName.trim()
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    saveCategories(updated);
    setNewName('');
  };

  const handleDelete = (id: string) => {
    const products = getProducts();
    const isUsed = products.some(p => p.categoryId === id);
    
    if (isUsed) {
      alert('لا يمكن حذف هذا الصنف لأنه مرتبط بمنتجات موجودة حالياً.');
      return;
    }

    if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
      const updated = categories.filter(c => c.id !== id);
      setCategories(updated);
      saveCategories(updated);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">إدارة الأصناف</h1>
        <p className="text-gray-500 mt-2">إضافة وتعديل تصنيفات المنتجات في المحل.</p>
      </header>

      <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Plus size={20} className="text-blue-600" />
          إضافة صنف جديد
        </h2>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            type="text"
            placeholder="اسم الصنف (مثلاً: إنارة، عدد يدوية)"
            required
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95">
            إضافة
          </button>
        </form>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <Tag size={20} className="text-blue-600" />
          <h2 className="text-xl font-bold">الأصناف الحالية</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
              <span className="font-bold text-gray-800 text-lg">{cat.name}</span>
              <button 
                onClick={() => handleDelete(cat.id)}
                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              لا يوجد أصناف مسجلة.
            </div>
          )}
        </div>
      </section>

      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4 max-w-2xl">
        <AlertCircle className="text-blue-600 shrink-0" />
        <p className="text-sm text-blue-800 leading-relaxed">
          تساعد الأصناف في تنظيم المخزن وتسهيل عملية البحث في نقطة البيع. ننصح باختيار أسماء أصناف واضحة وشاملة.
        </p>
      </div>
    </div>
  );
};

export default CategoryManager;
