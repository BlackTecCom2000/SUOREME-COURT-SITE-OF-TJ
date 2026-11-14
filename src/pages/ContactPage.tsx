import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const L = (language: string, tj: string, ru: string, en: string) =>
  language === 'tj' ? tj : language === 'en' ? en : ru;

export const ContactPage: React.FC = () => {
  const { language } = useLanguage();
  usePageMeta(
    L(language, 'Тамос', 'Контакты', 'Contact'),
    L(language, 'Тамос бо Суди Олӣ', 'Контакты Верховного суда', 'Contact the Supreme Court')
  );
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending'); setErr('');
    try {
      const r = await fetch('/api/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName, phone: form.phone, email: form.email,
          subject: form.subject, message: form.message,
        }),
      });
      if (!r.ok) throw new Error('fail');
      setStatus('ok');
      setForm({ fullName: '', phone: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('err'); setErr(L(language, 'Хато. Дубора кӯшиш кунед.', 'Ошибка. Попробуйте ещё раз.', 'Error. Please try again.'));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Breadcrumbs items={[{ label: L(language,'Асосӣ','Главная','Home'), to: '/' }, { label: L(language,'Тамос','Контакты','Contact') }]} />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-theme-text">{L(language,'Тамос','Контакты','Contact')}</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-theme-text">{L(language,'Маълумоти тамос','Контактная информация','Contact information')}</h2>
        <ul className="space-y-2 text-sm text-theme-textSec">
          <li><strong>{L(language,'Суроға:','Адрес:','Address:')}</strong> {L(language,'ш. Душанбе, хиёбони Рӯдакӣ 17','г. Душанбе, проспект Рудаки 17','Dushanbe, Rudaki Ave. 17')}</li>
          <li><strong>{L(language,'Телефон:','Телефон:','Phone:')}</strong> +992 (37) 233-14-15</li>
          <li><strong>{L(language,'Почтаи электронӣ:','E-mail:','E-mail:')}</strong> info@sud.tj</li>
          <li><strong>{L(language,'Соатҳои қабул:','Часы приёма:','Reception hours:')}</strong> {L(language,'Душанбе–Ҷумъа, 08:00–17:00','Пн–Пт, 08:00–17:00','Mon–Fri, 08:00–17:00')}</li>
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-theme-text">{L(language,'Фиристодани муроҷиат','Отправить обращение','Send an appeal')}</h2>
        {status === 'ok' ? (
          <p className="text-green-600">{L(language,'Муроҷиати шумо қабул шуд.','Ваше обращение принято.','Your appeal has been received.')}</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder={L(language,'Номи пурра','Полное имя','Full name')} required />
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={L(language,'Телефон','Телефон','Phone')} required />
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={L(language,'Почтаи электронӣ','E-mail','E-mail')} type="email" />
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder={L(language,'Мавзӯъ','Тема','Subject')} />
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder={L(language,'Матни муроҷиат','Текст обращения','Message text')}
              required
              rows={5}
              className="w-full rounded-md border border-theme-border bg-theme-bg px-3 py-2 text-sm text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-gold"
            />
            {err && <p className="text-red-500 text-sm">{err}</p>}
            <Button type="submit" variant="primary" disabled={status === 'sending'}>
              {status === 'sending' ? L(language,'Фиристодан...','Отправка...','Sending...') : L(language,'Фиристодан','Отправить','Send')}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};
