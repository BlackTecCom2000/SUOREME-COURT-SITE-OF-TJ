export type CalcMode = 
  | 'FIXED_AMOUNT'
  | 'PERCENT_OF_CLAIM'
  | 'PROGRESSIVE_RATE'
  | 'PERCENT_WITH_MINMAX'
  | 'COMBINATION'
  | 'NO_DUTY';

export interface DutyRule {
  id: number;
  category_id: number;
  calc_mode: CalcMode;
  base_rate: number | null; // e.g. 0.01 for 1%
  min_amount: number | null;
  max_amount: number | null;
  legal_basis: string;
}

export interface DutyExemption {
  id: number;
  title_ru: string;
  title_tj: string;
  title_en: string;
  legal_basis: string;
  description: string;
}

export interface CalculationInput {
  rule: DutyRule;
  amount?: number;
  exemption?: DutyExemption;
}

export interface CalculationResult {
  amount: number;
  currency: string;
  formula: string;
  rule: DutyRule;
  exemption?: DutyExemption;
}

export class DutyCalculationEngine {
  /**
   * Safely rounds to 2 decimal places (standard for TJS currency)
   */
  static round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  static calculate(input: CalculationInput): CalculationResult {
    const { rule, amount, exemption } = input;
    
    // If an exemption applies that fully waives the fee, return 0
    if (exemption) {
      return {
        amount: 0,
        currency: 'TJS',
        formula: 'Освобождено по льготе',
        rule,
        exemption
      };
    }

    let result = 0;
    let formula = '';

    switch (rule.calc_mode) {
      case 'NO_DUTY':
        result = 0;
        formula = 'Пошлина не взимается';
        break;

      case 'FIXED_AMOUNT':
        result = rule.base_rate || 0;
        formula = `${result} сомонӣ (Фиксированная ставка)`;
        break;

      case 'PERCENT_OF_CLAIM':
        if (amount === undefined || amount <= 0) {
          throw new Error('Недостаточно данных для расчёта. Укажите сумму.');
        }
        result = amount * (rule.base_rate || 0);
        formula = `${amount} × ${(rule.base_rate! * 100).toFixed(2)}% = ${this.round(result)} сомонӣ`;
        break;

      case 'PERCENT_WITH_MINMAX':
        if (amount === undefined || amount <= 0) {
          throw new Error('Недостаточно данных для расчёта. Укажите сумму.');
        }
        let calculated = amount * (rule.base_rate || 0);
        formula = `${amount} × ${(rule.base_rate! * 100).toFixed(2)}% = ${this.round(calculated)} сомонӣ`;
        
        result = calculated;
        
        if (rule.min_amount !== null && result < rule.min_amount) {
          result = rule.min_amount;
          formula += `\nПрименен минимум: ${rule.min_amount} сомонӣ`;
        } else if (rule.max_amount !== null && result > rule.max_amount) {
          result = rule.max_amount;
          formula += `\nПрименен максимум: ${rule.max_amount} сомонӣ`;
        }
        break;
        
      default:
        throw new Error('Неизвестный режим расчета');
    }

    return {
      amount: this.round(result),
      currency: 'TJS',
      formula,
      rule,
      exemption
    };
  }
}
