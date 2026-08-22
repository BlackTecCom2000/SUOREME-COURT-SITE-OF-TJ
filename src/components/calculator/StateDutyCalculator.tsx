import { useState, useEffect } from 'react';
import { DutyCalculationEngine, DutyRule, DutyExemption, CalculationResult } from './DutyCalculationEngine';

interface Category {
  id: number;
  name_ru: string;
  name_tj: string;
  name_en: string;
  requires_amount: number;
}

export function StateDutyCalculator({ language }: { language: 'ru' | 'tj' | 'en' }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rules, setRules] = useState<DutyRule[]>([]);
  const [exemptions, setExemptions] = useState<DutyExemption[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [selectedExemption, setSelectedExemption] = useState<number | null>(null);
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:8787/api/duty/config')
      .then(r => r.json())
      .then(data => {
        setCategories(data.categories || []);
        setRules(data.rules || []);
        setExemptions(data.exemptions || []);
      })
      .catch(console.error);
  }, []);

  const t = {
    title: { ru: 'Государственная пошлина', tj: 'Боҷи давлатӣ', en: 'State Duty' },
    selectAction: { ru: 'Выберите вид обращения', tj: 'Намуди муроҷиатро интихоб кунед', en: 'Select action type' },
    amountLabel: { ru: 'Цена иска (сомонӣ)', tj: 'Арзиши даъво (сомонӣ)', en: 'Claim amount (TJS)' },
    exemptionLabel: { ru: 'Льготы и освобождения', tj: 'Имтиёзҳо ва озодкунӣ', en: 'Exemptions' },
    calculate: { ru: 'Рассчитать', tj: 'Ҳисоб кардан', en: 'Calculate' },
    reset: { ru: 'Сбросить', tj: 'Тоза кардан', en: 'Reset' },
    resultTitle: { ru: 'ИТОГОВАЯ СУММА', tj: 'МАБЛАҒИ НИҲОӢ', en: 'TOTAL AMOUNT' },
    formulaTitle: { ru: 'Детали расчёта', tj: 'Тафсилоти ҳисоб', en: 'Calculation details' },
    legalBasisTitle: { ru: 'Правовое основание', tj: 'Асоси ҳуқуқӣ', en: 'Legal basis' },
    noData: { ru: 'Недостаточно данных для расчёта', tj: 'Маълумот барои ҳисоб кофӣ нест', en: 'Insufficient data for calculation' },
    disclaimer: {
      ru: 'Расчёт носит информационный характер. Окончательный размер государственной пошлины определяется в соответствии с действующим законодательством.',
      tj: 'Ҳисоб хусусияти иттилоотӣ дорад. Андозаи ниҳоии боҷи давлатӣ тибқи қонунгузории амалкунанда муайян карда мешавад.',
      en: 'This calculation is for informational purposes. The final amount is determined in accordance with applicable legislation.'
    }
  };

  const activeCategory = categories.find(c => c.id === selectedCategory);
  const activeRule = rules.find(r => r.category_id === selectedCategory);

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    if (!activeCategory || !activeRule) {
      setError(t.noData[language]);
      return;
    }

    try {
      const exemption = exemptions.find(e => e.id === selectedExemption);
      const res = DutyCalculationEngine.calculate({
        rule: activeRule,
        amount: amount === '' ? undefined : Number(amount),
        exemption
      });
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setAmount('');
    setSelectedExemption(null);
    setResult(null);
    setError(null);
  };

  const getName = (obj: any) => obj[`name_${language}`] || obj[`title_${language}`];

  return (
    <div className="bg-[#f8f9fa] dark:bg-[#0a0f16] p-6 lg:p-12 font-serif text-gray-900 dark:text-gray-100">
      <h2 className="text-3xl font-bold mb-8 text-[#1a2b49] dark:text-[#b88a24]">
        {t.title[language]}
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">{t.selectAction[language]}</label>
            <select 
              className="w-full p-3 border rounded-md dark:bg-gray-800 dark:border-gray-700 font-sans"
              value={selectedCategory || ''}
              onChange={e => {
                setSelectedCategory(Number(e.target.value));
                setResult(null);
              }}
            >
              <option value="">--</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{getName(c)}</option>
              ))}
            </select>
          </div>

          {activeCategory?.requires_amount === 1 && (
            <div>
              <label className="block text-sm font-semibold mb-2">{t.amountLabel[language]}</label>
              <input 
                type="number"
                min="0"
                step="0.01"
                className="w-full p-3 border rounded-md dark:bg-gray-800 dark:border-gray-700 font-sans"
                value={amount}
                onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          )}

          {exemptions.length > 0 && (
            <div>
              <label className="block text-sm font-semibold mb-2">{t.exemptionLabel[language]}</label>
              <select 
                className="w-full p-3 border rounded-md dark:bg-gray-800 dark:border-gray-700 font-sans"
                value={selectedExemption || ''}
                onChange={e => setSelectedExemption(Number(e.target.value) || null)}
              >
                <option value="">--</option>
                {exemptions.map(e => (
                  <option key={e.id} value={e.id}>{getName(e)}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button 
              onClick={handleCalculate}
              className="px-6 py-3 bg-[#b88a24] text-white font-semibold rounded shadow hover:bg-[#9c751e] transition-colors"
            >
              {t.calculate[language]}
            </button>
            <button 
              onClick={handleReset}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {t.reset[language]}
            </button>
          </div>
          
          {error && <div className="text-red-600 dark:text-red-400 mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">{error}</div>}
        </div>

        {/* Right Column: Results */}
        <div className="bg-white dark:bg-[#1a2b49] p-8 rounded-lg shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              {t.resultTitle[language]}
            </h3>
            
            {result ? (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="text-5xl lg:text-6xl font-bold text-[#1a2b49] dark:text-[#b88a24] mb-8 font-sans">
                  {result.amount.toLocaleString('ru-RU')} <span className="text-2xl">{result.currency}</span>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{t.formulaTitle[language]}</h4>
                    <pre className="font-mono text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded whitespace-pre-wrap text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800">
                      {result.formula}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{t.legalBasisTitle[language]}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-100 dark:border-blue-800/30">
                      {result.exemption ? result.exemption.legal_basis : result.rule.legal_basis}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500 italic">
                {t.selectAction[language]}
              </div>
            )}
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              * {t.disclaimer[language]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
