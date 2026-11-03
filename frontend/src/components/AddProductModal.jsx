import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, Plus, Sparkles, Check } from 'lucide-react';
import api from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';

const AddProductModal = ({ isOpen, onClose, onProductSaved, onCategoryAdded, productToEdit = null, categories = [] }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    stock: '10',
    description: '',
    imageUrl: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Inline new category input
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [addingCatLoading, setAddingCatLoading] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        title: productToEdit.title || '',
        category: productToEdit.category?._id || productToEdit.category || '',
        price: productToEdit.price !== undefined ? productToEdit.price : '',
        stock: productToEdit.stock !== undefined ? productToEdit.stock : '0',
        description: productToEdit.description || '',
        imageUrl: productToEdit.image?.startsWith('http') ? productToEdit.image : '',
      });
      setImagePreview(productToEdit.image || null);
      setSelectedFile(null);
    } else {
      setFormData({
        title: '',
        category: categories.length > 0 ? categories[0]._id : '',
        price: '',
        stock: '10',
        description: '',
        imageUrl: '',
      });
      setSelectedFile(null);
      setImagePreview(null);
    }
    setIsAddingNewCat(false);
    setNewCatName('');
  }, [productToEdit, categories, isOpen]);

  if (!isOpen) return null;

  const handleQuickAddCategory = async () => {
    if (!newCatName.trim()) return;
    setAddingCatLoading(true);
    try {
      const res = await api.post('/categories', { name: newCatName.trim() });
      const created = res.data?.data;
      toast.success(`"${newCatName.trim()}" kategoriyasi qo'shildi!`);
      if (onCategoryAdded) onCategoryAdded(created);
      setFormData((prev) => ({ ...prev, category: created._id }));
      setNewCatName('');
      setIsAddingNewCat(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kategoriya qo\'shishda xatolik');
    } finally {
      setAddingCatLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp|gif)$/i)) {
        toast.error('Faqat rasm fayllari (JPG, PNG, WEBP, GIF) qabul qilinadi.', 'Yaroqsiz fayl');
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, imageUrl: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Mahsulot nomi kiritilishi shart');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      toast.error('Iltimos, to\'g\'ri narx kiriting');
      return;
    }
    if (!formData.category) {
      toast.error('Iltimos, kategoriyani tanlang');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('category', formData.category);
      data.append('price', formData.price);
      data.append('stock', formData.stock);
      data.append('description', formData.description.trim());

      if (selectedFile) {
        data.append('image', selectedFile);
      } else if (formData.imageUrl.trim()) {
        data.append('image', formData.imageUrl.trim());
      }

      let res;
      if (productToEdit) {
        res = await api.put(`/products/${productToEdit._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Mahsulot muvaffaqiyatli yangilandi!');
      } else {
        res = await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Yangi mahsulot muvaffaqiyatli yaratildi!');
      }

      onProductSaved(res.data.data);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Mahsulotni saqlashda xatolik yuz berdi';
      toast.error(msg, 'Saqlashda Xato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-xl glass-panel rounded-3xl border border-slate-700/80 bg-slate-900/95 shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {productToEdit ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot Qo\'shish'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Mahsulot Nomi *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Masalan: Aura Simsiz Quloqchinlar"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Category & Price Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Kategoriya *
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-0.5"
                >
                  {isAddingNewCat ? 'Mavjud ro\'yxat' : '+ Yangi toifa'}
                </button>
              </div>

              {isAddingNewCat ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Toifa nomi..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800/90 border border-indigo-500 text-white placeholder-slate-500 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleQuickAddCategory}
                    disabled={addingCatLoading || !newCatName.trim()}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50"
                  >
                    {addingCatLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : (
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                >
                  <option value="" disabled>
                    Kategoriyani tanlang
                  </option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id} className="bg-slate-900 text-white">
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Narxi (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-semibold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="99.99"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Ombordagi Soni (Zaxira)
            </label>
            <input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="10"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tavsifi
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mahsulotning afzalliklari va xususiyatlarini yozing..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Multer File Upload & Image Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Mahsulot Rasmi (Multer orqali yuklash)
            </label>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-2 flex items-center gap-4">
                <img
                  src={imagePreview}
                  alt="Ko'rish"
                  className="w-20 h-20 object-cover rounded-xl border border-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">
                    {selectedFile ? selectedFile.name : 'Mavjud rasm'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Saqlashga tayyor'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setImagePreview(null);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-800/40 hover:bg-slate-800/70 group">
                <Upload className="w-7 h-7 text-slate-400 group-hover:text-indigo-400 transition-colors mb-2" />
                <span className="text-xs font-semibold text-slate-300">
                  Rasm yuklash uchun bu yerni bosing yoki faylni tashlang
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Formatlar: PNG, JPG, WEBP, GIF (5MB gacha)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}

            {/* Optional URL input fallback */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] text-slate-400 shrink-0">Yoki rasm havolasi:</span>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => {
                  setFormData({ ...formData, imageUrl: e.target.value });
                  if (e.target.value) {
                    setImagePreview(e.target.value);
                    setSelectedFile(null);
                  }
                }}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Bekor qilish
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  {productToEdit ? 'O\'zgarishlarni Yangilash' : 'Mahsulotni Yaratish'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
