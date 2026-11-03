import React, { useState } from 'react';
import { X, Lock, Mail, User, Eye, EyeOff, Loader2, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AuthModal = ({ isOpen, initialTab = 'login', onClose, onNavigateVerify }) => {
  const { login, register, resendVerification, verifyEmail } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Unverified state helper
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);

  if (!isOpen) return null;

  const handleFillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@ministore.com');
      setPassword('admin123');
    } else {
      setEmail('user@ministore.com');
      setPassword('user123');
    }
    setActiveTab('login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUnverifiedEmail(null);

    try {
      if (activeTab === 'login') {
        await login(email, password);
        toast.success('Xush kelibsiz! Tizimga muvaffaqiyatli kirdingiz.');
        onClose();
      } else {
        const res = await register(name, email, password);
        setRegistrationSuccess({
          name: name.trim(),
          email: email.trim(),
          token: res.data?.verificationToken,
          previewUrl: res.data?.previewUrl,
        });
        toast.success('Ro\'yxatdan muvaffaqiyatli o\'tdingiz! Iltimos, hisobingizni tasdiqlang.');
      }
    } catch (err) {
      const errorData = err.response?.data;
      const msg = errorData?.message || err.message || 'Autentifikatsiyada xatolik yuz berdi';

      if (errorData?.error?.requiresVerification || msg.toLowerCase().includes('tasdiqlanmagan') || msg.toLowerCase().includes('not verified')) {
        setUnverifiedEmail(email);
        if (errorData?.error?.verificationToken) {
          setRegistrationSuccess({
            name: name.trim() || 'Mijoz',
            email,
            token: errorData.error.verificationToken,
          });
        }
      }

      toast.error(msg, activeTab === 'login' ? 'Kirishda Xato' : 'Ro\'yxatdan O\'tishda Xato');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Instant Activation & Auto Login
  const handleInstantActivateAndLogin = async (tokenToVerify) => {
    if (!tokenToVerify) return;
    setLoading(true);
    try {
      await verifyEmail(tokenToVerify, registrationSuccess?.name);
      toast.success('Hisobingiz faollashtirildi va tizimga kirdingiz!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Faollashtirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail && !email) return;
    const targetEmail = unverifiedEmail || email;
    setLoading(true);
    try {
      const res = await resendVerification(targetEmail);
      toast.success(`Tasdiqlash xati ${targetEmail} manziliga qayta yuborildi!`);
      if (res.data?.verificationToken) {
        setRegistrationSuccess({
          name: name.trim() || 'Mijoz',
          email: targetEmail,
          token: res.data.verificationToken,
          previewUrl: res.data.previewUrl,
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatni qayta yuborishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md glass-panel rounded-3xl border border-slate-700/80 bg-slate-900/95 shadow-2xl overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Headers */}
        <div className="flex rounded-xl bg-slate-800/80 p-1 mb-6 border border-slate-700/80">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setRegistrationSuccess(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'login'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kirish
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setRegistrationSuccess(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'register'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ro'yxatdan O'tish
          </button>
        </div>

        {/* Post-Registration Feedback State */}
        {registrationSuccess ? (
          <div className="py-4 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Xush kelibsiz, {registrationSuccess.name}!</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Hisobingiz muvaffaqiyatli yaratildi: <strong className="text-slate-200">{registrationSuccess.email}</strong>.
              </p>
            </div>

            {/* Quick 1-Click Instant Activation Button */}
            {registrationSuccess.token && (
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-left">
                <span className="text-xs font-semibold text-indigo-300 block mb-1">
                  ⚡ Tezkor faollashtirish:
                </span>
                <p className="text-[11px] text-slate-400 mb-2.5">
                  Tugmani bosing va darhol tizimga kiring:
                </p>
                <button
                  type="button"
                  onClick={() => handleInstantActivateAndLogin(registrationSuccess.token)}
                  className="w-full py-2.5 px-3 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Hisobni faollashtirish va tizimga kirish
                </button>
              </div>
            )}

            {registrationSuccess.previewUrl && (
              <a
                href={registrationSuccess.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs text-indigo-400 hover:underline"
              >
                Ethereal Email qutisini ochish ↗
              </a>
            )}

            <button
              onClick={() => {
                setRegistrationSuccess(null);
                setActiveTab('login');
              }}
              className="text-xs text-slate-400 hover:text-white block mx-auto"
            >
              Kirish sahifasiga qaytish
            </button>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  To'liq Ismingiz
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masalan: Azizbek Aliyev"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Elektron Pochta (Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nomi@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Maxfiy Parol
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Unverified Email Warning & Action */}
            {unverifiedEmail && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
                <span>Email tasdiqlanmagan.</span>
                <button
                  type="button"
                  onClick={handleResend}
                  className="underline font-semibold hover:text-white flex items-center gap-1"
                >
                  <Send className="w-3 h-3" /> Qayta yuborish
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {activeTab === 'login' ? 'Tizimga Kirish' : 'Ro\'yxatdan O\'tish'}
            </button>

            {/* Quick Demo Credentials Autofill */}
            <div className="pt-4 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                Tezkor Demo Hisoblar
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin')}
                  className="py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-indigo-300 border border-indigo-500/20 transition-all"
                >
                  Admin sifatida kirish
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('user')}
                  className="py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                >
                  Xaridor sifatida kirish
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
