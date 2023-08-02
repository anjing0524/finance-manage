import { Loan, calculate_repayment_equal_principal } from '@/finance-cal/pkg';
import { modeEnum } from '@/types/enums';
import { addMonths } from 'date-fns';
/**
 * 根据不同的还款方式，周期、金额生成对应的账单
 * @param {string} mode  模式
 */
export function calRepaymentMode({mode, amount, rate, installment, borrowDate}) {

  const keys = Object.keys(modeEnum)
  if (!keys.includes(mode)) {
    throw new Error("Invalid mode");
  }

  const modeHandle = {
    [keys[0]]: calculateEqualPrincipalRepayment,
    [keys[1]]: calculateEqualPrincipalAndInterestRepayment,
    [keys[2]]: calculateInterestOnlyRepayment,
  }
  return modeHandle[mode]({ amount, rate, installment, borrowDate });
}


// 等额本息
export function calculateEqualPrincipalAndInterestRepayment({ amount, rate, installment, borrowDate }) {
  const monthlyRate = rate / 12;
  const powFactor = Math.pow(1 + monthlyRate, installment);
  const monthlyPayment = (amount * monthlyRate * powFactor) / (powFactor - 1);
  const repaymentList = Array.from({ length: installment }, (_, i) => ({
    date: addMonths(borrowDate, i+1),
    amount: +monthlyPayment.toFixed(2),
  }));
  return repaymentList;
}

// 等额本金
export function calculateEqualPrincipalRepayment({ amount, rate, installment, borrowDate }) {
  console.time("0");
  const loan = new Loan(amount,installment,rate*100,  BigInt(new Date(borrowDate).getTime()));
  const wasmResult = calculate_repayment_equal_principal(loan);
  console.timeEnd("0");
  console.time("1");
  const monthlyRate = rate / 12;
  const principal = amount / installment;
  const repaymentList = Array.from({ length: installment }, (_, i) => {
    const remaining = amount - (principal * i);
    const interest = remaining * monthlyRate;
    return {
      date: addMonths(borrowDate, i+1),
      amount: +(principal + interest).toFixed(2),
    };
  });
  console.timeEnd("1");
  return repaymentList;
}

// 先息后本
export function calculateInterestOnlyRepayment({ amount, rate, installment, borrowDate }) {
  const monthlyRate = rate / 12;
  const interestOnlyPayment = amount * monthlyRate;
  const repaymentList = Array.from({ length: installment }, (_, i) => ({
    date: addMonths(borrowDate, i+1),
    amount: i === installment - 1 ? (interestOnlyPayment + amount) : interestOnlyPayment,
  })).map((e)=>({date:e.date,amount: +e.amount.toFixed(2)}));
  return repaymentList;
}