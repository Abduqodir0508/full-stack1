import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import VerifyEmail from './pages/VerifyEmail';
import AuthModal from './components/AuthModal';
import AddProductModal from './components/AddProductModal';
import ProductDetailModal from './components/ProductDetailModal';
import api from './api/axiosInstance';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAdmin } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState('store'); // 'store' | 'admin' | 'verify'
  const [verificationToken, setVerificationToken] = useState(null);

  // Data State
  const [categories, setCategories] = useState([]);
  const [refreshProductsKey, setRefreshProductsKey] = useState(0);

  // Modals State
  const [authModal, setAuthModal] = useState({ isOpen: false, initialTab: 'login' });
  const [addProductModal, setAddProductModal] = useState({ isOpen: false, productToEdit: null });
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);

  // Check URL parameters on mount for email verification token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const path = window.location.pathname;

    if (token || path.includes('/verify-email')) {
      setVerificationToken(token);
      setActiveTab('verify');
    }
  }, []);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories');
      if (res.data?.data) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load categories:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Auth Modal trigger
  const handleOpenAuth = (tab = 'login') => {
    setAuthModal({ isOpen: true, initialTab: tab });
  };

  // Add / Edit Product Modal trigger
  const handleOpenAddProduct = () => {
    setAddProductModal({ isOpen: true, productToEdit: null });
  };

  const handleEditProduct = (product) => {
    setAddProductModal({ isOpen: true, productToEdit: product });
  };

  const handleProductSaved = () => {
    setRefreshProductsKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenAddProduct={handleOpenAddProduct}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'store' && (
          <Home
            categories={categories}
            onCategoriesUpdated={fetchCategories}
            onViewDetails={(product) => setSelectedProductDetails(product)}
            onEditProduct={handleEditProduct}
            refreshKey={refreshProductsKey}
            onProductDeleted={() => setRefreshProductsKey((prev) => prev + 1)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            categories={categories}
            onCategoriesUpdated={() => {
              fetchCategories();
              setRefreshProductsKey((prev) => prev + 1);
            }}
            onOpenAddProduct={handleOpenAddProduct}
            onEditProduct={handleEditProduct}
          />
        )}

        {activeTab === 'verify' && (
          <VerifyEmail
            tokenFromUrl={verificationToken}
            onVerificationSuccess={() => {
              // User verified and automatically signed in
            }}
            onGoToStore={() => {
              // Clear search params
              window.history.replaceState({}, document.title, window.location.pathname);
              setActiveTab('store');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialTab={authModal.initialTab}
        onClose={() => setAuthModal({ isOpen: false, initialTab: 'login' })}
        onNavigateVerify={(token) => {
          setVerificationToken(token);
          setActiveTab('verify');
        }}
      />

      <AddProductModal
        isOpen={addProductModal.isOpen}
        productToEdit={addProductModal.productToEdit}
        categories={categories}
        onClose={() => setAddProductModal({ isOpen: false, productToEdit: null })}
        onProductSaved={handleProductSaved}
        onCategoryAdded={fetchCategories}
      />

      <ProductDetailModal
        product={selectedProductDetails}
        onClose={() => setSelectedProductDetails(null)}
      />
    </div>
  );
}

export default App;

