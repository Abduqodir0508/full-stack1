import React from 'react';
import { ShoppingBag, Layers, Database, Server, Code } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white">
                Mini<span className="text-indigo-400">Store</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              MERN stack (MongoDB, Express, React, Node.js) asosidagi to'liq va zamonaviy e-tijorat do'koni. JWT autentifikatsiyasi, Multer fayl yuklash va tezkor qidiruv tizimi.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <Database className="w-3 h-3 text-emerald-400" /> MongoDB
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <Server className="w-3 h-3 text-sky-400" /> Express.js
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <Code className="w-3 h-3 text-cyan-400" /> React + Vite
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <Layers className="w-3 h-3 text-indigo-400" /> Tailwind CSS
              </span>
            </div>
          </div>

          {/* Quick Architecture Specs */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Backend Imkoniyatlari</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Markazlashtirilgan xatoliklar nazorati</li>
              <li>• JWT Bearer autentifikatsiyasi</li>
              <li>• Admin va Mijoz huquqlari (RBAC)</li>
              <li>• Multer rasm yuklash va xotira boshqaruvi</li>
              <li>• Nodemailer orqali hisobni faollashtirish</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Frontend Imkoniyatlari</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Glassmorphism zamonaviy dizayn</li>
              <li>• Tezkor qidiruv va kategoriya filtri</li>
              <li>• Dinamik sahifalash va saralash</li>
              <li>• Rasm predyuklash va interaktiv modallar</li>
              <li>• O'zbek tilidagi to'liq bildirishnomalar</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MiniStore. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              API & Tizim faol
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
