import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, SlidersHorizontal, ChevronLeft, ChevronRight, Package, Sparkles } from 'lucide-react';
import api from '../api/axiosInstance';
import CategoryPills from '../components/CategoryPills';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { useToast } from '../context/ToastContext';

const Home = ({ categories = [], onViewDetails, onEditProduct, refreshKey, onProductDeleted, onCategoriesUpdated }) => {
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 8,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
  };

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 8,
        sort,
      };
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (selectedCategory && selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      const res = await api.get('/products', { params });
      if (res.data?.data) {
        setProducts(res.data.data.products || []);
        setPagination(res.data.data.pagination || {});
      }
    } catch (err) {
      console.error('Mahsulotlarni yuklashda xatolik:', err);
      toast.error('Serverdan mahsulotlarni olib bo\'lmadi');
    } finally {
      setLoading(false);
    }
  }, [page, sort, debouncedSearch, selectedCategory, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, refreshKey]);

  // Handle Delete Product (Admin)
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Haqiqatan ham bu mahsulotni o\'chirmoqchimisiz? Ushbu amalni bekor qilib bo\'lmaydi.')) {
      return;
    }
    try {
      await api.delete(`/products/${productId}`);
      toast.success('Mahsulot muvaffaqiyatli o\'chirildi');
      fetchProducts();
      if (onProductDeleted) onProductDeleted();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mahsulotni o\'chirishda xatolik yuz berdi');
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-slate-950 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Zamonaviy Savdo Maydoni
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Hayotingiz uchun sifatli va zamonaviy mahsulotlar.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            Express & MongoDB API orqali real vaqt rejimida ishlaydigan katalog. Qulay qidiruv, saralash va tezkor filtrlar.
          </p>
        </div>
      </section>

      {/* Control Bar: Search & Sort */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mahsulot nomi yoki kalit so'zlar bo'yicha qidirish..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
                aria-label="Tozalash"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Saralash:</span>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="newest" className="bg-slate-900 text-white">Yangi qo'shilganlar</option>
              <option value="price_asc" className="bg-slate-900 text-white">Narx: Arzondan qimmatga</option>
              <option value="price_desc" className="bg-slate-900 text-white">Narx: Qimmatdan arzonga</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <CategoryPills
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          onCategoryCreated={() => {
            if (onCategoriesUpdated) onCategoriesUpdated();
          }}
        />
      </section>

      {/* Product Grid Area */}
      <section>
        {loading ? (
          <SkeletonLoader count={8} />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                onViewDetails={onViewDetails}
                onEdit={onEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 rounded-3xl border border-slate-800 bg-slate-900/30">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Hech qanday mahsulot topilmadi</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              {search || selectedCategory !== 'all'
                ? 'Qidiruv so\'zini o\'zgartirib ko\'ring yoki boshqa kategoriyani tanlang.'
                : 'Hozircha katalogda mahsulotlar mavjud emas.'}
            </p>
            {(search || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                Filtrlarni tozalash
              </button>
            )}
          </div>
        )}
      </section>

      {/* Pagination Controls */}
      {!loading && pagination.totalPages > 1 && (
        <section className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            Sahifa: <span className="font-semibold text-white">{pagination.currentPage}</span> /{' '}
            <span className="font-semibold text-white">{pagination.totalPages}</span> (Jami {pagination.totalProducts} ta mahsulot)
          </p>

          <div className="flex items-center gap-1.5">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Oldingi sahifa"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: pagination.totalPages }).map((_, index) => {
              const pageNum = index + 1;
              const isActive = pagination.currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((prev) => prev + 1)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Keyingi sahifa"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
