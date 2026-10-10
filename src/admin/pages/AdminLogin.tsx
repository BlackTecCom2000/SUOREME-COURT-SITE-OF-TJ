import React, { useState } from 'react';
import { NationalEmblem } from '../../components/judicial-ecosystem/NationalEmblem';
import { GlobalBackground } from '../../components/GlobalBackground';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminInput } from '../components/ui/AdminInput';
import { AdminButton } from '../components/ui/AdminButton';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-[100dvh] w-full bg-transparent text-theme-text flex flex-col-reverse md:flex-row overflow-x-hidden select-none relative">
      <GlobalBackground />
      {/* LEFT — branding panel — NO backdrop-filter here, only glass on inner emblem card */}
      <div className="relative w-full md:w-[55%] min-h-[340px] md:min-h-[100dvh] bg-transparent flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden">
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
          <path d="M 50 100 L 200 100 L 250 150 L 500 150" fill="none" stroke="var(--gold-300)" strokeWidth="1" />
          <path d="M 100 600 L 250 600 L 300 550 L 700 550" fill="none" stroke="#00e5ff" strokeWidth="1" />
          <circle cx="250" cy="150" r="4" fill="var(--gold-300)" />
          <circle cx="300" cy="550" r="4" fill="#00e5ff" />
        </svg>

        {/* Top Header Badge */}
        <div className="relative z-10 flex items-center gap-2.5 text-xs font-mono tracking-widest text-[var(--gold-300)]">
          <span className="w-2 h-2 rounded-full bg-[var(--gold-300)] animate-pulse" />
          <span>SUD.TJ / SECURE ADMINISTRATIVE NODE</span>
        </div>

        {/* Center Institutional Identity — same system */}
        <div className="relative z-10 my-auto py-8 text-left max-w-lg">
          <div className="inline-flex p-3 rounded-2xl glass border border-[var(--glass-border)] shadow-[var(--glass-shadow)] mb-6">
            <NationalEmblem size={64} />
          </div>

          <h1 className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-theme-text leading-tight">
            СУДИ ОЛИИ ҶУМҲУРИИ ТОҶИКИСТОН
          </h1>
          <h2 className="u-label mt-2">
            ВЕРХОВНЫЙ СУД РЕСПУБЛИКИ ТАДЖИКИСТАН
          </h2>

          <p className="font-sans text-xs sm:text-sm text-theme-textMuted mt-6 leading-relaxed border-l-2 border-[var(--court-gold)]/50 pl-4">
            Единый цифровой центр управления судебной информацией, электронным правосудием и обращениями граждан.
          </p>
        </div>

        {/* Bottom Security Telemetry Status */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-theme-textMuted border-t border-[var(--glass-border)] pt-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck size={14} />
            <span className="uppercase tracking-wider">SECURE CONNECTION ENFORCED</span>
          </div>
          <span>SESSION AUTH: JWT-256</span>
        </div>
      </div>

      {/* RIGHT — GlassAuthenticationPanel — same light glass, background synced */}
      <div className="w-full md:w-[45%] flex items-center justify-center p-5 sm:p-8 lg:p-12 relative bg-transparent">
        <div className="w-full max-w-[440px] glass glass-panel glass-login-card p-6 sm:p-8 text-left">
          {/* Card Title — same header as public */}
          <div className="pb-5 mb-6 border-b border-[var(--glass-border)]">
            <div className="flex items-center gap-2 text-[var(--court-gold)] mb-1">
              <Lock size={15} />
              <span className="font-mono text-xs uppercase tracking-wider font-semibold">
                Авторизация сотрудника
              </span>
            </div>
            <h3 className="font-serif font-bold text-2xl text-theme-text">Вход в систему</h3>
            <p className="font-sans text-xs text-theme-textMuted mt-1">
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
                  className="text-theme-textMuted hover:text-theme-text transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 text-theme-textMuted cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-theme-border bg-theme-bg text-theme-gold focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Запомнить устройство</span>
              </label>

              <a
                href="#help"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Для восстановления доступа обратитесь в Административное управление Верховного суда РТ.');
                }}
                className="font-mono text-theme-gold/80 hover:text-theme-gold hover:underline"
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
          <div className="mt-8 pt-4 border-t border-theme-border text-center">
            <span className="font-mono text-2xs text-theme-textMuted uppercase tracking-widest block">
              ОФИЦИАЛЬНАЯ ИНФОРМАЦИОННАЯ СИСТЕМА ВЕРХОВНОГО СУДА РТ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
