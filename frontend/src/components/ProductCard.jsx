import React, { useState } from 'react';
import { Eye, Edit3, Trash2, PackageCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product, onViewDetails, onEdit, onDelete }) => {
  const { isAdmin, isAuthenticated } = useAuth();
  const [imageError, setImageError] = useState(false);

  const getImageUrl = (imgPath) => {
    if (!imgPath || imageError) {
      return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80';
    }
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    return imgPath;
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group glass-card rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
      <div>
        {/* Image Container with Badges */}
        <div className="relative w-full h-52 bg-slate-950 overflow-hidden">
          <img
            src={getImageUrl(product.image)}
            alt={product.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

          {/* Category Badge */}
          {product.category?.name && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-950/80 text-indigo-300 backdrop-blur-md border border-indigo-500/20">
              {product.category.name}
            </span>
          )}

          {/* Stock Badge */}
          <span
            className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md flex items-center gap-1 ${
              isOutOfStock
                ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {isOutOfStock ? (
              <>
                <AlertCircle className="w-3 h-3" /> Tugagan
              </>
            ) : (
              <>
                <PackageCheck className="w-3 h-3" /> {product.stock} ta qoldi
              </>
            )}
          </span>

          {/* User & Admin Controls Overlay */}
          {isAuthenticated && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(product);
                }}
                title="Mahsulotni tahrirlash"
                className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors border border-slate-700 shadow-lg"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(product._id);
                }}
                title="Mahsulotni o'chirish"
                className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors border border-slate-700 shadow-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="p-4 sm:p-5">
          <h3 className="text-base font-semibold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
            {product.title}
          </h3>
          <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description || 'Mahsulot uchun to\'liq tavsif kiritilmagan.'}
          </p>
        </div>
      </div>

      {/* Footer / Price & Details */}
      <div className="p-4 sm:p-5 pt-0 flex items-center justify-between border-t border-slate-800/40 mt-2">
        <div>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">Narxi</span>
          <span className="text-lg font-bold text-white tracking-tight">
            ${Number(product.price).toFixed(2)}
          </span>
        </div>

        <button
          onClick={() => onViewDetails(product)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition-all shadow-sm active:scale-95"
        >
          <Eye className="w-3.5 h-3.5" />
          Ko'rish
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
