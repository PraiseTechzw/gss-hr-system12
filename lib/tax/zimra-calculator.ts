/**
 * ZIMRA Tax Calculator for Zimbabwe
 * Implements 2025 USD tax brackets and calculations
 * Compliant with Zimbabwe Revenue Authority requirements
 */

export interface ZimraTaxResult {
  grossSalary: number;
  paye: number;
  aidsLevy: number;
  nssa: number;
  totalDeductions: number;
  netSalary: number;
  breakdown: {
    basicSalary: number;
    allowances: number;
    grossTotal: number;
    payeBreakdown: string;
    aidsLevyBreakdown: string;
    nssaBreakdown: string;
  };
}

export interface PayrollComponents {
  basicSalary: number;
  transportAllowance: number;
  housingAllowance: number;
  otherAllowances: number;
  bonuses: number;
  overtime: number;
}

/**
 * 2025 ZIMRA USD Tax Brackets
 * From | To     | Rate | Deduct
 * 0.00 | 100.00 | 0%   | 0
 * 100.01 | 300.00 | 20% | 20
 * 300.01 | 1000.00 | 25% | 35
 * 1000.01 | 2000.00 | 30% | 85
 * 2000.01 | 3000.00 | 35% | 185
 * 3000.01+ | ∞ | 40% | 335
 */
export class ZimraTaxCalculator {
  private static readonly TAX_BRACKETS = [
    { min: 0, max: 100, rate: 0.00, deduct: 0 },
    { min: 100.01, max: 300, rate: 0.20, deduct: 20 },
    { min: 300.01, max: 1000, rate: 0.25, deduct: 35 },
    { min: 1000.01, max: 2000, rate: 0.30, deduct: 85 },
    { min: 2000.01, max: 3000, rate: 0.35, deduct: 185 },
    { min: 3000.01, max: Infinity, rate: 0.40, deduct: 335 }
  ];

  private static readonly AIDS_LEVY_RATE = 0.03; // 3% of PAYE
  private static readonly NSSA_RATE = 0.045; // 4.5% of gross salary

  /**
   * Calculate PAYE based on 2025 ZIMRA USD brackets
   */
  static calculatePAYE(grossSalary: number): number {
    if (grossSalary <= 0) return 0;

    for (const bracket of this.TAX_BRACKETS) {
      if (grossSalary > bracket.min && grossSalary <= bracket.max) {
        return Math.round((grossSalary * bracket.rate - bracket.deduct) * 100) / 100;
      }
    }

    // For salaries above the highest bracket
    const highestBracket = this.TAX_BRACKETS[this.TAX_BRACKETS.length - 1];
    return Math.round((grossSalary * highestBracket.rate - highestBracket.deduct) * 100) / 100;
  }

  /**
   * Calculate AIDS Levy (3% of PAYE)
   */
  static calculateAidsLevy(paye: number): number {
    return Math.round(paye * this.AIDS_LEVY_RATE * 100) / 100;
  }

  /**
   * Calculate NSSA (4.5% of gross salary)
   */
  static calculateNSSA(grossSalary: number): number {
    return Math.round(grossSalary * this.NSSA_RATE * 100) / 100;
  }

  /**
   * Comprehensive Zimbabwe tax calculation
   */
  static calculateZimbabweTax(components: PayrollComponents): ZimraTaxResult {
    const grossSalary = 
      components.basicSalary + 
      components.transportAllowance + 
      components.housingAllowance + 
      components.otherAllowances + 
      components.bonuses + 
      components.overtime;

    const paye = this.calculatePAYE(grossSalary);
    const aidsLevy = this.calculateAidsLevy(paye);
    const nssa = this.calculateNSSA(grossSalary);
    const totalDeductions = paye + aidsLevy + nssa;
    const netSalary = grossSalary - totalDeductions;

    return {
      grossSalary,
      paye,
      aidsLevy,
      nssa,
      totalDeductions,
      netSalary,
      breakdown: {
        basicSalary: components.basicSalary,
        allowances: components.transportAllowance + components.housingAllowance + components.otherAllowances,
        grossTotal: grossSalary,
        payeBreakdown: this.getPayeBreakdown(grossSalary),
        aidsLevyBreakdown: `${aidsLevy.toFixed(2)} (3% of PAYE)`,
        nssaBreakdown: `${nssa.toFixed(2)} (4.5% of gross salary)`
      }
    };
  }

  /**
   * Get detailed PAYE breakdown for display
   */
  private static getPayeBreakdown(grossSalary: number): string {
    if (grossSalary <= 100) {
      return "0% (First $100 tax-free)";
    } else if (grossSalary <= 300) {
      return `20% on amount over $100`;
    } else if (grossSalary <= 1000) {
      return `25% on amount over $300`;
    } else if (grossSalary <= 2000) {
      return `30% on amount over $1,000`;
    } else if (grossSalary <= 3000) {
      return `35% on amount over $2,000`;
    } else {
      return `40% on amount over $3,000`;
    }
  }

  /**
   * Calculate monthly payroll for an employee
   */
  static calculateMonthlyPayroll(
    employeeId: string,
    payrollPeriodId: string,
    components: PayrollComponents
  ): ZimraTaxResult {
    return this.calculateZimbabweTax(components);
  }

  /**
   * Validate tax calculation against ZIMRA requirements
   */
  static validateTaxCalculation(result: ZimraTaxResult): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate PAYE calculation
    const expectedPaye = this.calculatePAYE(result.grossSalary);
    if (Math.abs(result.paye - expectedPaye) > 0.01) {
      errors.push(`PAYE calculation error: expected ${expectedPaye}, got ${result.paye}`);
    }

    // Validate AIDS Levy calculation
    const expectedAidsLevy = this.calculateAidsLevy(result.paye);
    if (Math.abs(result.aidsLevy - expectedAidsLevy) > 0.01) {
      errors.push(`AIDS Levy calculation error: expected ${expectedAidsLevy}, got ${result.aidsLevy}`);
    }

    // Validate NSSA calculation
    const expectedNSSA = this.calculateNSSA(result.grossSalary);
    if (Math.abs(result.nssa - expectedNSSA) > 0.01) {
      errors.push(`NSSA calculation error: expected ${expectedNSSA}, got ${result.nssa}`);
    }

    // Validate net salary calculation
    const expectedNet = result.grossSalary - result.totalDeductions;
    if (Math.abs(result.netSalary - expectedNet) > 0.01) {
      errors.push(`Net salary calculation error: expected ${expectedNet}, got ${result.netSalary}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get tax bracket information for a given salary
   */
  static getTaxBracketInfo(grossSalary: number): {
    bracket: string;
    rate: number;
    taxableAmount: number;
    taxAmount: number;
  } {
    for (const bracket of this.TAX_BRACKETS) {
      if (grossSalary > bracket.min && grossSalary <= bracket.max) {
        const taxableAmount = grossSalary - bracket.min;
        const taxAmount = taxableAmount * bracket.rate;
        
        return {
          bracket: `$${bracket.min} - $${bracket.max === Infinity ? '∞' : bracket.max}`,
          rate: bracket.rate * 100,
          taxableAmount,
          taxAmount
        };
      }
    }

    // Default to highest bracket
    const highestBracket = this.TAX_BRACKETS[this.TAX_BRACKETS.length - 1];
    return {
      bracket: `$${highestBracket.min}+`,
      rate: highestBracket.rate * 100,
      taxableAmount: grossSalary - highestBracket.min,
      taxAmount: (grossSalary - highestBracket.min) * highestBracket.rate
    };
  }

  /**
   * Generate tax summary for reporting
   */
  static generateTaxSummary(results: ZimraTaxResult[]): {
    totalGrossSalary: number;
    totalPAYE: number;
    totalAidsLevy: number;
    totalNSSA: number;
    totalDeductions: number;
    totalNetSalary: number;
    employeeCount: number;
  } {
    return {
      totalGrossSalary: results.reduce((sum, r) => sum + r.grossSalary, 0),
      totalPAYE: results.reduce((sum, r) => sum + r.paye, 0),
      totalAidsLevy: results.reduce((sum, r) => sum + r.aidsLevy, 0),
      totalNSSA: results.reduce((sum, r) => sum + r.nssa, 0),
      totalDeductions: results.reduce((sum, r) => sum + r.totalDeductions, 0),
      totalNetSalary: results.reduce((sum, r) => sum + r.netSalary, 0),
      employeeCount: results.length
    };
  }
}

/**
 * Utility functions for payroll processing
 */
export class PayrollUtils {
  /**
   * Format currency for display
   */
  static formatCurrency(amount: number, currency: 'USD' | 'ZWL' = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Calculate prorated salary for partial month
   */
  static calculateProratedSalary(
    fullSalary: number,
    daysWorked: number,
    totalDaysInMonth: number
  ): number {
    return Math.round((fullSalary * daysWorked / totalDaysInMonth) * 100) / 100;
  }

  /**
   * Calculate overtime pay
   */
  static calculateOvertimePay(
    hourlyRate: number,
    overtimeHours: number,
    overtimeMultiplier: number = 1.5
  ): number {
    return Math.round(hourlyRate * overtimeHours * overtimeMultiplier * 100) / 100;
  }

  /**
   * Validate payroll components
   */
  static validatePayrollComponents(components: PayrollComponents): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (components.basicSalary < 0) {
      errors.push('Basic salary cannot be negative');
    }

    if (components.transportAllowance < 0) {
      errors.push('Transport allowance cannot be negative');
    }

    if (components.housingAllowance < 0) {
      errors.push('Housing allowance cannot be negative');
    }

    if (components.otherAllowances < 0) {
      errors.push('Other allowances cannot be negative');
    }

    if (components.bonuses < 0) {
      errors.push('Bonuses cannot be negative');
    }

    if (components.overtime < 0) {
      errors.push('Overtime cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default ZimraTaxCalculator;
