import React, { useState } from 'react';
import { Tag, Sparkles, Plus, Check, X, Loader2 } from 'lucide-react';
import api from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';

const CategoryPills = ({ categories = [], selectedCategory = 'all', onSelectCategory, onCategoryCreated }) => {
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/categories', { name: newCatName.trim() });
      toast.success(`"${newCatName.trim()}" kategoriyasi muvaffaqiyatli qo'shildi!`);
      const created = res.data?.data;
      setNewCatName('');
      setIsAdding(false);
      if (onCategoryCreated) {
        onCategoryCreated(created);
      }
      if (created?._id) {
        onSelectCategory(created._id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kategoriya qo\'shishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full overflow-x-auto py-2 no-scrollbar">
      <div className="flex items-center gap-2 min-w-max">
        {/* All Products Pill */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Barcha mahsulotlar
        </button>

        {/* Dynamic Category Pills */}
        {categories.map((cat) => {
          const isActive = selectedCategory === cat._id;
          return (
            <button
              key={cat._id}
              onClick={() => onSelectCategory(cat._id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Tag className="w-3.5 h-3.5 opacity-70" />
              {cat.name}
            </button>
          );
        })}

        {/* Inline Add Category Button / Form */}
        {isAdding ? (
          <form
            onSubmit={handleAddCategory}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-indigo-500 shadow-md animate-fade-in"
          >
            <input
              type="text"
              autoFocus
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Yangi kategoriya..."
              className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-32 py-1"
            />
            <button
              type="submit"
              disabled={loading || !newCatName.trim()}
              className="p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
              title="Saqlash"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Bekor qilish"
            >
              <X className="w-3 h-3" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/15 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all duration-200 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            + Kategoriya qo'shish
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryPills;
