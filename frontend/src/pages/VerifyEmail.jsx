import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Mail, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const VerifyEmail = ({ tokenFromUrl = null, onVerificationSuccess, onGoToStore }) => {
  const { verifyEmail, resendVerification } = useAuth();
  const toast = useToast();

  const [tokenInput, setTokenInput] = useState(tokenFromUrl || '');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) {
      handleVerify(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleVerify = async (tokenToUse) => {
    const token = tokenToUse || tokenInput;
    if (!token || !token.trim()) {
      toast.error('Iltimos, tasdiqlash tokenini kiriting');
      return;
    }

    setLoading(true);
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await verifyEmail(token.trim());
      setStatus('success');
      toast.success('Emailingiz tasdiqlandi va hisobingiz faollashtirildi!');
      if (onVerificationSuccess) {
        onVerificationSuccess(res.data?.user);
      }
    } catch (err) {
      setStatus('error');
      const msg = err.response?.data?.message || err.message || 'Tasdiqlash tokeni yaroqsiz yoki muddati o\'tgan';
      setErrorMessage(msg);
      toast.error(msg, 'Tasdiqlashda Xato');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setResending(true);
    try {
      await resendVerification(resendEmail.trim());
      toast.success(`Yangi tasdiqlash xati ${resendEmail.trim()} manziliga yuborildi!`);
      setResendEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatni yuborishda xatolik yuz berdi');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-12 px-4 animate-fade-in">
      <div className="glass-panel rounded-3xl border border-slate-700/80 bg-slate-900/95 p-8 shadow-2xl text-center space-y-6">
        {/* Loading State */}
        {status === 'loading' && (
          <div className="space-y-4 py-8">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-white">Emailingiz Tasdiqlanmoqda...</h2>
            <p className="text-xs text-slate-400">
              Iltimos kuting, xavfsizlik tokeni tekshirilmoqda.
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">Hisob Faollashtirildi!</h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Tabriklaymiz! Sizning emailingiz tasdiqlandi. Endi MiniStore xizmatlaridan to'liq foydalanishingiz mumkin.
              </p>
            </div>
            <button
              onClick={onGoToStore}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-98"
            >
              Do'konga o'tish
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">Tasdiqlashda Xatolik</h2>
              <p className="text-sm text-rose-300 mt-2 leading-relaxed">{errorMessage}</p>
            </div>

            {/* Resend Verification Form */}
            <div className="pt-4 border-t border-slate-800 text-left">
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Yangi havola so'rash:</h4>
              <form onSubmit={handleResend} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Ro'yxatdan o'tgan emailingiz"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resending}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Yuborish
                </button>
              </form>
            </div>

            <button
              onClick={onGoToStore}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Do'kon katalogiga qaytish
            </button>
          </div>
        )}

        {/* Idle State: Enter Token Manually */}
        {status === 'idle' && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Email Manzilni Tasdiqlash</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Pochtaga kelgan xatdagi tasdiqlash tokenini kiriting yoki xatdagi havolani bosing.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="64-belgili tokenni shu yerga joylang..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                onClick={() => handleVerify(tokenInput)}
                disabled={loading || !tokenInput.trim()}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50"
              >
                Tasdiqlash va Faollashtirish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
