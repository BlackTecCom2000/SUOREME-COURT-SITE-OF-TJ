import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  FileCheck2, 
  ShieldCheck, 
  Download
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface DigitalDocument {
  id: string;
  name: string;
  category: string;
  size: string;
  uploadDate: string;
  status: 'draft' | 'submitted' | 'signed' | 'accepted' | 'rejected' | 'archived';
  statusRu: string;
  statusTj: string;
  statusEn: string;
  signatory?: string;
  hash: string;
}

interface DocumentCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentCenter: React.FC<DocumentCenterProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [docs, setDocs] = useState<DigitalDocument[]>([
    {
      id: 'doc-1',
      name: 'Исковое_заявление_01-1234.pdf',
      category: 'Исковые заявления',
      size: '1.4 MB',
      uploadDate: '12.02.2026',
      status: 'signed',
      statusRu: 'Подписан ЭЦП',
      statusTj: 'Бо ЭЦП имзо шуд',
      statusEn: 'E-Signed',
      signatory: 'Раҳимов Д. (Адвокат)',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    {
      id: 'doc-2',
      name: 'Ходатайство_об_истребовании_доказательств.docx',
      category: 'Ходатайства',
      size: '420 KB',
      uploadDate: '20.02.2026',
      status: 'accepted',
      statusRu: 'Принят судом',
      statusTj: 'Аз ҷониби суд қабул шуд',
      statusEn: 'Accepted by Court',
      signatory: 'ООО «Сомон Строй»',
      hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4'
    },
    {
      id: 'doc-3',
      name: 'Проект_мирового_соглашения.pdf',
      category: 'Соглашения',
      size: '880 KB',
      uploadDate: '01.03.2026',
      status: 'draft',
      statusRu: 'Черновик',
      statusTj: 'Лоиҳа',
      statusEn: 'Draft',
      hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
    }
  ]);
  const [signingDocId, setSigningDocId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateSign = (id: string) => {
    setSigningDocId(id);
    setTimeout(() => {
      setDocs(prev => prev.map(d => {
        if (d.id === id) {
          return {
            ...d,
            status: 'signed',
            statusRu: 'Подписан ЭЦП',
            statusTj: 'Бо ЭЦП имзо шуд',
            statusEn: 'E-Signed',
            signatory: 'Сертификат заявителя (PKI TJ)'
          };
        }
        return d;
      }));
      setSigningDocId(null);
    }, 1200);
  };

  const getStatusBadge = (status: DigitalDocument['status'], d: DigitalDocument) => {
    const label = language === 'tj' ? d.statusTj : language === 'en' ? d.statusEn : d.statusRu;
    switch (status) {
      case 'signed': return <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono">{label}</span>;
      case 'accepted': return <span className="bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono">{label}</span>;
      case 'draft': return <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono">{label}</span>;
      case 'rejected': return <span className="bg-rose-500/15 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono">{label}</span>;
      default: return <span className="bg-theme-bg text-theme-textMuted border border-theme-border px-2.5 py-0.5 rounded-full text-[10px] font-mono">{label}</span>;
    }
  };

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
        className="w-full max-w-4xl max-h-[85vh] glass glass-premium flex flex-col overflow-hidden text-theme-text"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-theme-border bg-theme-surface/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-theme-gold/15 border border-theme-gold/30 text-theme-gold">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-theme-text">
                  {language === 'tj' ? 'Маркази ҳуҷҷатҳои электронӣ' : language === 'en' ? 'Digital Document Center' : 'Центр электронных документов'}{' '}
                  <span
                    title={
                      language === 'tj'
                        ? 'Намоиш: рӯйхат ба ҳисоби корбар вобаста нест'
                        : language === 'en'
                          ? 'Showcase: list is not tied to a user account'
                          : 'Витрина: список не привязан к учётной записи'
                    }
                    className="align-middle ml-1 px-2 py-0.5 rounded-full border border-theme-gold/40 text-theme-gold font-mono text-[10px] uppercase tracking-widest"
                  >
                    Demo
                  </span>
                </h3>
              <p className="text-xs text-theme-textMuted font-mono">
                {language === 'tj' ? 'Боргузорӣ, имзои ЭЦП ва ирсоли бевосита ба суд' : language === 'en' ? 'Upload, E-Sign & Direct Court Submission' : 'Загрузка, подписание ЭЦП и прямая отправка в суд'}
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

        {/* Body content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Drag & Drop Upload Zone */}
          <div className="p-6 rounded-2xl border-2 border-dashed border-theme-border/80 hover:border-theme-gold bg-theme-surface/40 hover:bg-theme-surface/70 transition-all text-center cursor-pointer group">
            <UploadCloud size={36} className="text-theme-textMuted group-hover:text-theme-gold mx-auto mb-2 transition-colors" />
            <h4 className="text-sm font-semibold text-theme-text mb-1">
              {language === 'tj' ? 'Ҳуҷҷатҳоро ба ин ҷо кашед ё бор кунед' : language === 'en' ? 'Drop files here or click to browse' : 'Перетащите файлы сюда или нажмите для выбора'}
            </h4>
            <p className="text-xs text-theme-textMuted font-mono">
              PDF/A, DOCX, TIFF • Max 50MB • Cryptographic Hash Validation
            </p>
          </div>

          {/* Document list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between font-mono text-xs text-theme-textMuted">
              <span>{language === 'tj' ? 'Ҳуҷҷатҳои корбар' : language === 'en' ? 'User Documents' : 'Документы в производстве'}</span>
              <span className="text-theme-gold">E-SIGN READY</span>
            </div>

            {docs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 glass glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-theme-bg border border-theme-border text-theme-gold">
                    <FileCheck2 size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-medium text-theme-text">{doc.name}</h5>
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-theme-textMuted mt-0.5">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.uploadDate}</span>
                      <span>•</span>
                      {getStatusBadge(doc.status, doc)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {doc.status === 'draft' && (
                    <button
                      type="button"
                      onClick={() => handleSimulateSign(doc.id)}
                      disabled={signingDocId === doc.id}
                      className="btn-primary text-xs px-3 py-1.5 h-auto"
                    >
                      <ShieldCheck size={13} />
                      <span>{signingDocId === doc.id ? 'Signing...' : language === 'tj' ? 'Имзои ЭЦП' : language === 'en' ? 'Sign PKI' : 'Подписать ЭЦП'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="p-2 rounded-xl border border-theme-border bg-theme-bg text-theme-textMuted hover:text-theme-text"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-theme-border bg-theme-surface/60 flex items-center justify-between text-xs font-mono">
          <span className="text-theme-textMuted">PKI AUTHORITY: REPUBLIC OF TAJIKISTAN</span>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary text-xs"
          >
            {language === 'tj' ? 'Тайёр' : language === 'en' ? 'Done' : 'Готово'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
