import React, { useState } from 'react';
import { NationalEmblem } from '../../components/judicial-ecosystem/NationalEmblem';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminInput } from '../components/ui/AdminInput';
import { AdminButton } from '../components/ui/AdminButton';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('admin@sud.tj');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // SEC-05: session lives in the httpOnly cookie; nothing is stored in JS.
      await login(email, password);
    } catch (err: any) {
      if (String(err?.message || '').includes('429')) {
        setError('Слишком много попыток. Повторите позже.');
      } else if (String(err?.message || '').includes('Failed to fetch')) {
        setError('Ошибка соединения с защищенным сервером');
      } else {
        setError('Неверный логин или пароль');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#02050e] text-slate-100 flex flex-col md:flex-row overflow-hidden select-none">
      {/* LEFT SECTION (55%): INSTITUTIONAL BRANDING & ARCHITECTURAL IDENTITY */}
      <div className="relative w-full md:w-[55%] min-h-[360px] md:min-h-screen bg-[#040813] border-b md:border-b-0 md:border-r border-[#dfbe7e]/20 flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden">
        {/* Subtle Background Circuit Mesh */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(223, 190, 126, 0.15) 0%, transparent 60%)',
          }}
        />
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-10"
          viewBox="0 0 800 800"
        >
          <path d="M 50 100 L 200 100 L 250 150 L 500 150" fill="none" stroke="#dfbe7e" strokeWidth="1" />
          <path d="M 100 600 L 250 600 L 300 550 L 700 550" fill="none" stroke="#00e5ff" strokeWidth="1" />
          <circle cx="250" cy="150" r="4" fill="#dfbe7e" />
          <circle cx="300" cy="550" r="4" fill="#00e5ff" />
        </svg>

        {/* Top Header Badge */}
        <div className="relative z-10 flex items-center gap-2.5 text-xs font-mono tracking-widest text-[#dfbe7e]">
          <span className="w-2 h-2 rounded-full bg-[#dfbe7e] animate-pulse" />
          <span>SUD.TJ / SECURE ADMINISTRATIVE NODE</span>
        </div>

        {/* Center Institutional Identity */}
        <div className="relative z-10 my-auto py-8 text-left max-w-lg">
          <div className="inline-flex p-3 rounded-2xl border border-[#dfbe7e]/40 bg-[#070e20]/80 shadow-[0_0_30px_rgba(223,190,126,0.25)] mb-6 drop-shadow-xl">
            <NationalEmblem size={64} />
          </div>

          <h1 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-white tracking-wide leading-tight">
            СУДИ ОЛИИ ҶУМҲУРИИ ТОҶИКИСТОН
          </h1>
          <h2 className="font-serif text-sm sm:text-base text-[#e8c679] tracking-widest uppercase mt-2">
            ВЕРХОВНЫЙ СУД РЕСПУБЛИКИ ТАДЖИКИСТАН
          </h2>

          <p className="font-sans text-xs sm:text-sm text-slate-400 mt-6 leading-relaxed border-l-2 border-[#dfbe7e]/50 pl-4">
            Единый цифровой центр управления судебной информацией, электронным правосудием и обращениями граждан.
          </p>
        </div>

        {/* Bottom Security Telemetry Status */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-800/80 pt-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck size={14} />
            <span className="uppercase tracking-wider">SECURE CONNECTION ENFORCED</span>
          </div>
          <span>SESSION AUTH: JWT-256</span>
        </div>
      </div>

      {/* RIGHT SECTION (45%): LUXURY AUTHENTICATION CARD */}
      <div className="w-full md:w-[45%] flex items-center justify-center p-6 sm:p-10 lg:p-12 relative bg-[#02050e]">
        <div className="w-full max-w-md rounded-3xl border border-slate-800/90 bg-[#070d1a]/95 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl shadow-black/90 text-left">
          {/* Card Title */}
          <div className="pb-5 mb-6 border-b border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Lock size={15} />
              <span className="font-mono text-xs uppercase tracking-wider font-semibold">
                Авторизация сотрудника
              </span>
            </div>
            <h3 className="font-serif font-bold text-2xl text-white">Вход в систему</h3>
            <p className="font-sans text-xs text-slate-400 mt-1">
              Введите служебный логин и пароль администратора
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl border border-red-500/30 bg-red-950/40 text-red-300 text-xs font-mono flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle size={16} className="shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <AdminInput
              label="Служебный Email / Логин"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sud.tj"
              leftIcon={<Mail size={16} />}
            />

            <AdminInput
              label="Пароль доступа"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Запомнить устройство</span>
              </label>

              <a
                href="#help"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Для восстановления доступа обратитесь в Административное управление Верховного суда РТ.');
                }}
                className="font-mono text-amber-400/80 hover:text-amber-300 hover:underline"
              >
                Забыли пароль?
              </a>
            </div>

            {/* Submit Button */}
            <AdminButton
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-4"
              leftIcon={<Sparkles size={16} />}
            >
              {isLoading ? 'ВХОД В СИСТЕМУ...' : 'ВОЙТИ В ПАНЕЛЬ УПРАВЛЕНИЯ'}
            </AdminButton>
          </form>

          {/* Institutional Compliance Notice */}
          <div className="mt-8 pt-4 border-t border-slate-800/80 text-center">
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block">
              ОФИЦИАЛЬНАЯ ИНФОРМАЦИОННАЯ СИСТЕМА ВЕРХОВНОГО СУДА РТ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
