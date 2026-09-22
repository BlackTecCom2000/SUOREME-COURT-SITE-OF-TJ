import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Sparkles,
  Paperclip,
  Languages,
  RotateCcw,
  FileText,
  BookOpen,
  AlertCircle,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Copy,
  Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { aiClient, ChatMessage, Citation } from '../../services/aiClient';
import { getBestVoice, splitIntoChunks } from '../../utils/speech';
import './AiChatBox.css';

interface AILegalAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UiMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  citations?: Citation[];
  isGenerating?: boolean;
}

export const AILegalAssistantModal: React.FC<AILegalAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, setLanguage } = useLanguage();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [attachName, setAttachName] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const busy = isTyping || messages.some((m) => m.isGenerating);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chunksRef = useRef<string[]>([]);
  const chunkIdxRef = useRef(0);
  const speakingIdRef = useRef<string | null>(null);

  const stopSpeech = () => {
    try { window.speechSynthesis?.cancel(); } catch {}
    setSpeakingId(null); speakingIdRef.current = null;
    setIsPaused(false); chunkIdxRef.current = 0;
  };
  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch {} }, []);
  useEffect(() => { if (!isOpen) stopSpeech(); }, [isOpen]);

  const speakChunk = (idx: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const chunks = chunksRef.current;
    if (idx >= chunks.length) { stopSpeech(); return; }
    chunkIdxRef.current = idx;
    const utter = new SpeechSynthesisUtterance(chunks[idx]);
    const best = getBestVoice(language);
    if (best) utter.voice = best;
    utter.lang = language === 'tj' ? 'ru-RU' : language === 'en' ? 'en-US' : 'ru-RU';
    utter.rate = 0.95; utter.pitch = 1.02; utter.volume = 1;
    utter.onend = () => setTimeout(() => speakChunk(idx + 1), 120);
    utter.onerror = () => stopSpeech();
    try { window.speechSynthesis.speak(utter); } catch { stopSpeech(); }
  };
  const handleSpeak = (id: string, text: string) => {
    if (speakingId === id && !isPaused) {
      try { window.speechSynthesis.pause(); setIsPaused(true); } catch {}
      return;
    }
    if (speakingId === id && isPaused) {
      try { window.speechSynthesis.resume(); setIsPaused(false); } catch {}
      return;
    }
    try { window.speechSynthesis.cancel(); } catch {}
    const chunks = splitIntoChunks(text.replace(/\s+/g, ' '), 240);
    if (!chunks.length) return;
    chunksRef.current = chunks;
    speakingIdRef.current = id;
    setSpeakingId(id); setIsPaused(false); chunkIdxRef.current = 0;
    // Ensure voices loaded
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => speakChunk(0);
      setTimeout(() => speakChunk(0), 250);
    } else speakChunk(0);
  };
  const handleCopy = async (id: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 1500); } catch {}
  };
  // Auto-stop on language change to re-pick natural voice
  useEffect(() => { if (speakingId) stopSpeech(); }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          text:
            language === 'tj'
              ? 'Салом! Ман ёвари ҳуқуқии низоми электронии суди Ҷумҳурии Тоҷикистон мебошам. Шумо чӣ савол доред?'
              : language === 'en'
              ? 'Hello! I am the AI Legal Assistant of the e-Justice Platform of Tajikistan. What would you like to inquire about?'
              : 'Здравствуйте! Я юридический цифровой консультант платформы «Электронный суд» Республики Таджикистан. Чем могу помочь?',
        },
      ]);
    }
  }, [isOpen, language, messages.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (userText?: string) => {
    const textToSend = userText || query;
    if (!textToSend.trim()) return;

    const userMessage: UiMessage = { id: Date.now().toString(), role: 'user', text: textToSend };
    
    // Prepare history for API
    const history: ChatMessage[] = messages.map(m => ({
      role: m.role,
      content: m.text
    }));

    setMessages((prev) => [...prev, userMessage]);
    if (!userText) setQuery('');
    setIsTyping(true);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantMsgId, role: 'assistant', text: '', isGenerating: true }]);

    await aiClient.streamChat(
      textToSend,
      history,
      (token) => {
        setIsTyping(false);
        setMessages((prev) => prev.map(m => 
          m.id === assistantMsgId ? { ...m, text: m.text + token } : m
        ));
      },
      (citations) => {
        setMessages((prev) => prev.map(m => 
          m.id === assistantMsgId ? { ...m, citations } : m
        ));
      },
      (error) => {
        setIsTyping(false);
        setMessages((prev) => prev.map(m => 
          m.id === assistantMsgId ? { ...m, text: m.text + `\n\n[Error: ${error}]`, isGenerating: false } : m
        ));
      },
      (returnedConvId) => {
        setIsTyping(false);
        if (returnedConvId) setConversationId(returnedConvId);
        setMessages((prev) => prev.map(m => 
          m.id === assistantMsgId ? { ...m, isGenerating: false } : m
        ));
      },
      conversationId
    );
  };

  const cycleLanguage = () => {
    setLanguage(language === 'tj' ? 'ru' : language === 'ru' ? 'en' : 'tj');
  };

  const clearChat = () => {
    if (busy) return;
    setMessages([]);
    setConversationId(undefined);
    setAttachName(null);
  };

  const submitComposer = () => {
    if (busy || !query.trim()) return;
    const prefix = attachName
      ? (language === 'tj' ? `[Файл: ${attachName}] ` : language === 'en' ? `[File: ${attachName}] ` : `[Файл: ${attachName}] `)
      : '';
    setAttachName(null);
    handleSend(prefix + query);
  };

  const samplePrompts = [
    language === 'tj' ? 'Чӣ тавр боҷи давлатиро ҳисоб кунам?' : language === 'en' ? 'How is state court duty calculated?' : 'Как рассчитать госпошлину?',
    language === 'tj' ? 'Мӯҳлати додани шикояти апеллятсионӣ' : language === 'en' ? 'Appellate deadline rules' : 'Срок подачи апелляционной жалобы',
    language === 'tj' ? 'Талабот ба ҳуҷҷатҳои бо ЭЦП имзошуда' : language === 'en' ? 'E-Sign requirements' : 'Требования к электронной подписи',
  ];

  return (
    <div 
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 backdrop-blur-md bg-black/75 transition-opacity duration-300 pointer-events-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl h-[80vh] rounded-3xl border border-theme-border bg-theme-bg shadow-2xl flex flex-col overflow-hidden text-theme-text"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-theme-border bg-theme-surface/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-theme-gold/15 border border-theme-gold/30 text-theme-gold">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-theme-text flex items-center gap-2">
                <span>{language === 'tj' ? 'Ёвари ҳуқуқии рақамӣ' : language === 'en' ? 'AI Legal Assistant' : 'Юридический AI-помощник'}</span>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-theme-gold/20 text-theme-gold border border-theme-gold/30 uppercase">
                  Hybrid RAG Model
                </span>
              </h3>
              <p className="text-xs text-theme-textMuted font-mono">
                {language === 'tj' ? 'Машварати рақамӣ оид ба қонунгузорӣ ва мурофиа' : language === 'en' ? 'Procedural hints & legal norms directory' : 'Навигация по кодексам, законам и процедурам'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-theme-bg border border-theme-border text-theme-textMuted hover:text-theme-text"
          >
            <X size={18} />
          </button>
        </div>

        {/* Notice banner */}
        <div className="px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>
            {language === 'tj'
              ? 'Ёвар қарорҳои судиро иваз намекунад ва танҳо вазифаи иттилоотии машваратиро иҷро мекунад.'
              : language === 'en'
              ? 'AI Assistant provides informational guidance only and does not substitute judicial authority.'
              : 'Помощник носит справочно-информационный характер и не заменяет процессуальные решения суда.'}
          </span>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-theme-gold text-black font-medium'
                    : 'bg-theme-surface border border-theme-border text-theme-text shadow-sm'
                } ${m.isGenerating ? 'border-theme-gold' : ''}`}
              >
                <div className="whitespace-pre-wrap select-text" style={{ userSelect: 'text' } as any}>{m.text}</div>

                {m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-theme-border/40 font-mono text-[10px] text-theme-textMuted">
                    <span className="font-semibold text-theme-gold block mb-1">
                      {language === 'tj' ? 'САРЧАШМАҲОИ ҚОНУНГУЗОРӢ:' : language === 'en' ? 'LEGAL REFERENCES:' : 'НОРМАТИВНЫЕ АКТЫ:'}
                    </span>
                    {m.citations.map((c, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <BookOpen size={10} className="text-theme-gold" />
                        <a href={c.url || '#'} className="hover:underline" target="_blank" rel="noreferrer">
                          {c.title}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                {m.isGenerating && m.text && (
                   <span className="inline-block w-1.5 h-3 ml-1 bg-theme-gold animate-pulse align-middle" />
                )}
                {m.role === 'assistant' && !m.isGenerating && m.text && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSpeak(m.id, m.text)}
                      aria-label={speakingId === m.id && !isPaused ? 'Пауза' : speakingId === m.id && isPaused ? 'Продолжить' : 'Слушать'}
                      title={speakingId === m.id && !isPaused ? 'Пауза' : speakingId === m.id && isPaused ? 'Продолжить' : 'Слушать'}
                      className={`p-1.5 rounded-lg border text-[11px] flex items-center gap-1 ${speakingId===m.id ? 'bg-amber-400/20 border-amber-400 text-amber-400' : 'border-theme-border text-theme-textMuted hover:text-theme-gold hover:border-theme-gold'}`}
                    >
                      {speakingId===m.id && !isPaused ? <Pause size={12}/> : speakingId===m.id && isPaused ? <Play size={12}/> : <Volume2 size={12}/>}
                      <span className="hidden sm:inline font-mono">{speakingId===m.id && !isPaused ? 'Пауза' : speakingId===m.id && isPaused ? 'Продолжить' : 'Слушать'}</span>
                    </button>
                    {speakingId===m.id && (
                      <button type="button" onClick={stopSpeech} className="p-1.5 rounded-lg border border-theme-border text-theme-textMuted hover:text-red-400" aria-label="Стоп" title="Стоп"><VolumeX size={12}/></button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCopy(m.id, m.text)}
                      aria-label="Копировать"
                      title="Копировать"
                      className="p-1.5 rounded-lg border border-theme-border text-theme-textMuted hover:text-theme-gold hover:border-theme-gold"
                    >
                      {copiedId===m.id ? <Check size={12} className="text-emerald-400"/> : <Copy size={12}/>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 font-mono text-xs text-theme-textMuted p-2">
              <span className="w-1.5 h-1.5 rounded-full bg-theme-gold animate-ping" />
              <span>{language === 'tj' ? 'Ёвар дархостро таҳлил мекунад (Hybrid RAG)...' : language === 'en' ? 'Retrieving knowledge...' : 'Поиск в базе знаний...'}</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Composer: chat-box with quick tags */}
        <div className="px-4 sm:px-6 pb-4 pt-3 border-t border-theme-border/40 bg-theme-surface/30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitComposer();
            }}
          >
            <div className="aichat-box">
              <div className="aichat-frame">
                <div className="aichat-inner">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submitComposer();
                      }
                    }}
                    disabled={busy}
                    rows={2}
                    aria-label={
                      language === 'tj' ? 'Савол ба ёвари ҳуқуқӣ' : language === 'en' ? 'Ask the legal assistant' : 'Вопрос юридическому помощнику'
                    }
                    placeholder={
                      language === 'tj'
                        ? 'Саволи худро ворид кунед... (Enter — ирсол)'
                        : language === 'en'
                        ? 'Describe your legal question... (Enter to send)'
                        : 'Опишите вопрос... (Enter — отправить)'
                    }
                    className="aichat-textarea"
                  />
                  {attachName && (
                    <span className="aichat-filechip">
                      <FileText size={12} />
                      <span>{attachName}</span>
                      <button type="button" onClick={() => setAttachName(null)} aria-label="Убрать файл">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  <div className="aichat-options">
                    <div className="aichat-addbtns">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={busy}
                        title={language === 'tj' ? 'Замимаи файл' : language === 'en' ? 'Attach a file' : 'Прикрепить файл'}
                        aria-label={language === 'tj' ? 'Замимаи файл' : language === 'en' ? 'Attach a file' : 'Прикрепить файл'}
                      >
                        <Paperclip size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={clearChat}
                        disabled={busy || messages.length === 0}
                        title={language === 'tj' ? 'Гуфтугӯи нав' : language === 'en' ? 'New chat' : 'Новый чат'}
                        aria-label={language === 'tj' ? 'Гуфтугӯи нав' : language === 'en' ? 'New chat' : 'Новый чат'}
                      >
                        <RotateCcw size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={cycleLanguage}
                        title={`TJ / RU / EN (${language.toUpperCase()})`}
                        aria-label="Сменить язык"
                      >
                        <Languages size={18} />
                      </button>
                    </div>
                    <button type="submit" disabled={busy || !query.trim()} className="aichat-submit" aria-label="Отправить">
                      <span>
                        <svg viewBox="0 0 512 512" width="18" height="18">
                          <path fill="currentColor" d="M473 39.05a24 24 0 0 0-25.5-5.46L47.47 185h-.08a24 24 0 0 0 1 45.16l.41.13l137.3 58.63a16 16 0 0 0 15.54-3.59L422 80a7.07 7.07 0 0 1 10 10L226.66 310.26a16 16 0 0 0-3.59 15.54l58.65 137.38c.06.2.12.38.19.57c3.2 9.27 11.3 15.81 21.09 16.25h1a24.63 24.63 0 0 0 23-15.46L478.39 64.62A24 24 0 0 0 473 39.05" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="aichat-tags">
                {samplePrompts.map((p, idx) => (
                  <button key={idx} type="button" disabled={busy} onClick={() => handleSend(p)}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setAttachName(f.name);
                e.target.value = '';
              }}
            />
          </form>
        </div>
      </motion.div>
    </div>
  );
};
