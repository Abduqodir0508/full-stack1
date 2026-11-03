import React from 'react';
import { ShoppingBag, Shield, LogOut, User as UserIcon, PlusCircle, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenAuth, onOpenAddProduct, activeTab, setActiveTab }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const handleAddProductClick = () => {
    // Agar foydalanuvchi tizimga kirmagan bo'lsa, xohlasa kiradi, xohlasa to'g'ridan-to'g'ri ochiladi
    onOpenAddProduct();
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('store')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                  Mini<span className="text-indigo-400">Store</span>
                </span>
                <span className="text-[10px] block font-medium uppercase tracking-wider text-slate-400 -mt-1">
                  MERN E-Tijorat
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('store')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                activeTab === 'store'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Mahsulotlar Katalogi
            </button>

            {/* Boshqaruv paneli barcha foydalanuvchilarga ko'rinadi */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors ${
                activeTab === 'admin'
                  ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Boshqaruv Paneli
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* Mahsulot qo'shish tugmasi endi HAR QANDAY FOYDALANUVCHIGA ko'rinadi! */}
            <button
              onClick={handleAddProductClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Mahsulot Qo'shish
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs shadow-inner">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-slate-200 leading-tight">{user?.name}</p>
                    <div className="flex items-center gap-1">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-indigo-400">
                          <Shield className="w-2.5 h-2.5" /> Administrator
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Mijoz</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Chiqish"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                  aria-label="Chiqish"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Kirish
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition-all active:scale-95"
                >
                  Ro'yxatdan o'tish
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
