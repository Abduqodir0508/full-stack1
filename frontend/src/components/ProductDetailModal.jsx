import React from 'react';
import { X, PackageCheck, AlertCircle, ShoppingCart, Tag, Calendar } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ProductDetailModal = ({ product, onClose }) => {
  const toast = useToast();

  if (!product) return null;

  const getImageUrl = (imgPath) => {
    if (!imgPath) {
      return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80';
    }
    return imgPath;
  };

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    toast.success(`"${product.title}" savatchangizga muvaffaqiyatli qo'shildi!`, 'Savat Yangilandi');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-3xl glass-panel rounded-3xl border border-slate-700/80 bg-slate-900/90 shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-700"
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image */}
          <div className="relative bg-slate-950 min-h-[300px] md:min-h-full flex items-center justify-center overflow-hidden">
            <img
              src={getImageUrl(product.image)}
              alt={product.title}
              className="w-full h-full object-cover max-h-[420px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Product Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Category & Status */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Tag className="w-3.5 h-3.5" />
                  {product.category?.name || 'Umumiy'}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    isOutOfStock
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {isOutOfStock ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" /> Sotuvda mavjud emas
                    </>
                  ) : (
                    <>
                      <PackageCheck className="w-3.5 h-3.5" /> {product.stock} ta mavjud
                    </>
                  )}
                </span>
              </div>

              {/* Title & Price */}
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{product.title}</h2>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-indigo-400">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">AQSH Dollari (soliqlar hisoblangan)</span>
                </div>
              </div>

              {/* Description */}
              <div className="pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Batafsil Tavsif</h4>
                <p className="text-sm text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                  {product.description || 'Ushbu mahsulot uchun hozircha tavsif yozilmagan.'}
                </p>
              </div>

              {/* Meta */}
              {product.createdAt && (
                <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Qo'shilgan sana: {new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-800 mt-6 flex gap-3">
              <button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isOutOfStock
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-98'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {isOutOfStock ? 'Hozirda mavjud emas' : 'Savatga qo\'shish'}
              </button>

              <button
                onClick={onClose}
                className="py-3 px-5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
