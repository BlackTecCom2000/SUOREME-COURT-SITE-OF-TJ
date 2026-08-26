import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Send,
  BookOpen, 
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { aiClient, ChatMessage, Citation } from '../../services/aiClient';

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
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
                {/* Very basic markdown support could go here. For now just standard text. */}
                <div className="whitespace-pre-wrap">{m.text}</div>

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

        {/* Prompt suggestions */}
        <div className="px-6 py-2 border-t border-theme-border/40 bg-theme-surface/30 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p)}
              className="text-[11px] font-mono px-3 py-1 rounded-xl bg-theme-bg border border-theme-border text-theme-textSec hover:text-theme-text hover:border-theme-gold whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t border-theme-border bg-theme-surface/60 flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isTyping || messages.some(m => m.isGenerating)}
            placeholder={
              language === 'tj'
                ? 'Саволи худро ворид кунед (масалан: боҷи давлатӣ, мӯҳлатҳо)...'
                : language === 'en'
                ? 'Ask legal question (e.g. state fees, deadlines)...'
                : 'Задайте вопрос по законам, срокам или подаче заявления...'
            }
            className="flex-1 h-11 px-4 rounded-xl bg-theme-bg border border-theme-border text-theme-text text-xs focus:outline-none focus:border-theme-gold disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isTyping || messages.some(m => m.isGenerating) || !query.trim()}
            className="btn-primary h-11 px-4 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={14} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};
