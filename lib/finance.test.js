import { calRepaymentMode, calculateEqualPrincipalAndInterestRepayment, calculateInterestOnlyRepayment, calculateEqualPrincipalRepayment } from './finance';


// 等额本金
test('calculateEqualPrincipalRepayment should return the correct repayment list', () => {
  const amount = 10000;
  const rate = 0.05;
  const installment = 12;
  const borrowDate = new Date(2022, 0, 1);

  const result = calculateEqualPrincipalRepayment({ amount, rate, installment, borrowDate });

  // Add your expected result here
  const expectedResult = [
    { amount: 875, date: new Date(2022, 1, 1) },
    { amount: 871.53, date: new Date(2022, 2, 1) },
    { amount: 868.06, date: new Date(2022, 3, 1) },
    { amount: 864.58, date: new Date(2022, 4, 1) },
    { amount: 861.11, date: new Date(2022, 5, 1) },
    { amount: 857.64, date: new Date(2022, 6, 1) },
    { amount: 854.17, date: new Date(2022, 7, 1) },
    { amount: 850.69, date: new Date(2022, 8, 1) },
    { amount: 847.22, date: new Date(2022, 9, 1) },
    { amount: 843.75, date: new Date(2022, 10, 1) },
    { amount: 840.28, date: new Date(2022, 11, 1) },
    { amount: 836.81, date: new Date(2023, 0, 1) }
  ];

  expect(result).toEqual(expectedResult);
});

// 等额本息
test('calculateEqualPrincipalAndInterestRepayment should return the correct repayment list', () => {
  const amount = 10000;
  const rate = 0.05;
  const installment = 12;
  const borrowDate = new Date(2022, 0, 1);

  const result = calculateEqualPrincipalAndInterestRepayment({ amount, rate, installment, borrowDate });

  // Add your expected result here

  const expectedResult = [
    { amount: 856.07, date: new Date(2022, 1, 1) },
    { amount: 856.07, date: new Date(2022, 2, 1) },
    { amount: 856.07, date: new Date(2022, 3, 1) },
    { amount: 856.07, date: new Date(2022, 4, 1) },
    { amount: 856.07, date: new Date(2022, 5, 1) },
    { amount: 856.07, date: new Date(2022, 6, 1) },
    { amount: 856.07, date: new Date(2022, 7, 1) },
    { amount: 856.07, date: new Date(2022, 8, 1) },
    { amount: 856.07, date: new Date(2022, 9, 1) },
    { amount: 856.07, date: new Date(2022, 10, 1) },
    { amount: 856.07, date: new Date(2022, 11, 1) },
    { amount: 856.07, date: new Date(2023, 0, 1) }
  ];

  expect(result).toEqual(expectedResult);
});

test('calculateInterestOnlyRepayment should return the correct repayment list', () => {
  const amount = 10000;
  const rate = 0.05;
  const installment = 12;
  const borrowDate = new Date(2022, 0, 1);

  const result = calculateInterestOnlyRepayment({ amount, rate, installment, borrowDate });

  const expectedResult = [
    { amount: 41.67, date: new Date(2022, 1, 1) },
    { amount: 41.67, date: new Date(2022, 2, 1) },
    { amount: 41.67, date: new Date(2022, 3, 1) },
    { amount: 41.67, date: new Date(2022, 4, 1) },
    { amount: 41.67, date: new Date(2022, 5, 1) },
    { amount: 41.67, date: new Date(2022, 6, 1) },
    { amount: 41.67, date: new Date(2022, 7, 1) },
    { amount: 41.67, date: new Date(2022, 8, 1) },
    { amount: 41.67, date: new Date(2022, 9, 1) },
    { amount: 41.67, date: new Date(2022, 10, 1) },
    { amount: 41.67, date: new Date(2022, 11, 1) },
    { amount: 10041.67, date: new Date(2023, 0, 1) },
  ]

  expect(result).toEqual(expectedResult);
});
test('calRepaymentMode should throw an error for an invalid mode', () => {
  const amount = 10000;
  const rate = 0.05;
  const installment = 12;
  const borrowDate = new Date(2022, 0, 1);
  const invalidMode = 'invalidMode';

  expect(() => {
    calRepaymentMode({ invalidMode, amount, rate, installment, borrowDate });
  }).toThrow('Invalid mode');
});