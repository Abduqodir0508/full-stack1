import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Plus,
  Trash2,
  Edit3,
  AlertTriangle,
  Sparkles,
  Loader2,
} from 'lucide-react';
import api from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = ({ categories = [], onCategoriesUpdated, onOpenAddProduct, onEditProduct }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Fetch all products for admin overview
  const fetchAllProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await api.get('/products?limit=100');
      if (res.data?.data?.products) {
        setProducts(res.data.data.products);
      }
    } catch (err) {
      toast.error('Admin mahsulotlar ro\'yxatini yuklab bo\'lmadi');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Handle Add Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setCreatingCategory(true);
    try {
      await api.post('/categories', { name: newCategoryName.trim() });
      toast.success(`"${newCategoryName.trim()}" kategoriyasi yaratildi!`);
      setNewCategoryName('');
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kategoriya yaratishda xatolik yuz berdi');
    } finally {
      setCreatingCategory(false);
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!window.confirm(`"${categoryName}" kategoriyasini o'chirishni tasdiqlaysizmi?`)) {
      return;
    }

    try {
      await api.delete(`/categories/${categoryId}`);
      toast.success(`"${categoryName}" kategoriyasi o'chirildi`);
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kategoriyani o\'chirishda xatolik yuz berdi');
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId, productTitle) => {
    if (!window.confirm(`Haqiqatan ham "${productTitle}" mahsulotini o'chirmoqchimisiz?`)) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      toast.success('Mahsulot muvaffaqiyatli o\'chirildi');
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mahsulotni o\'chirishda xatolik yuz berdi');
    }
  };

  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl border border-indigo-500/20 bg-slate-900/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Boshqaruv Markazi</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Xush kelibsiz, <strong className="text-slate-200">{user?.name}</strong>. Mahsulotlar, kategoriyalar va ombor zaxirasini boshqaring.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddProduct}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Yangi Mahsulot Yaratish
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jami Mahsulotlar</span>
            <Package className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{products.length} ta</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Faol Kategoriyalar</span>
            <FolderTree className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{categories.length} ta</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jami Zaxira</span>
            <Sparkles className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{totalStock} dona</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kam Qolgan Mahsulotlar</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            <span className={lowStockCount > 0 ? 'text-amber-400' : 'text-slate-300'}>
              {lowStockCount} ta
            </span>
          </p>
        </div>
      </div>

      {/* Categories Management Section */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-slate-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-indigo-400" />
              Kategoriyalarni Boshqarish
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Yangi toifalar qo'shing yoki kerakmaslarini o'chiring.
            </p>
          </div>

          {/* Quick Add Category Form */}
          <form onSubmit={handleCreateCategory} className="flex items-center gap-2 max-w-sm w-full">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Masalan: Aqlli Soatlar"
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={creatingCategory || !newCategoryName.trim()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              {creatingCategory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Qo'shish
            </button>
          </form>
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-200"
            >
              <span>{cat.name}</span>
              <span className="text-[10px] text-slate-500">({cat.slug})</span>
              <button
                type="button"
                onClick={() => handleDeleteCategory(cat._id, cat.name)}
                title="Kategoriyani o'chirish"
                className="text-slate-400 hover:text-rose-400 transition-colors p-0.5 ml-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Products Inventory Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            Mahsulotlar Inventari
          </h3>
          <span className="text-xs text-slate-400">Jami {products.length} ta mahsulot</span>
        </div>

        <div className="overflow-x-auto">
          {loadingProducts ? (
            <div className="py-12 flex justify-center items-center gap-2 text-slate-400 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              Inventar yuklanmoqda...
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-6">Mahsulot</th>
                  <th className="py-3 px-6">Kategoriya</th>
                  <th className="py-3 px-6">Narxi</th>
                  <th className="py-3 px-6">Zaxira Holati</th>
                  <th className="py-3 px-6 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={prod.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100&q=80'}
                        alt={prod.title}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-800 shrink-0"
                      />
                      <span className="font-semibold text-white max-w-xs truncate">{prod.title}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-indigo-300 border border-indigo-500/20">
                        {prod.category?.name || 'Umumiy'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-white">${Number(prod.price).toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          prod.stock <= 0
                            ? 'text-rose-400 bg-rose-950/50'
                            : prod.stock <= 5
                            ? 'text-amber-400 bg-amber-950/50'
                            : 'text-emerald-400 bg-emerald-950/50'
                        }`}
                      >
                        {prod.stock <= 0 ? 'Tugagan' : `${prod.stock} ta mavjud`}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => onEditProduct(prod)}
                          title="Tahrirlash"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod._id, prod.title)}
                          title="O'chirish"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
