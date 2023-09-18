/* tslint:disable */
/* eslint-disable */
/**
 * 获取指定 id 的 canvas 元素
 * @param {string} id
 * @returns {HTMLCanvasElement}
 */
export function get_canvas(id: string): HTMLCanvasElement;
/**
 * 获取全局 window 对象
 * @returns {Window}
 */
export function get_window(): Window;
/**
 * @param {HTMLCanvasElement} canvas
 * @returns {CanvasRenderingContext2D}
 */
export function get_context(
  canvas: HTMLCanvasElement,
): CanvasRenderingContext2D;
/**
 * @param {string} id
 */
export function draw_test(id: string): void;
/**
 * @param {string} id
 * @param {any} data
 */
export function draw_kline(id: string, data: any): void;
/**
 * @param {Loan} loan
 * @returns {any}
 */
export function calculate_repayment_equal_principal(loan: Loan): any;
/**
 * @param {Loan} loan
 * @returns {any}
 */
export function calculate_repayment_equal_installment(loan: Loan): any;
/**
 * @param {Loan} loan
 * @returns {any}
 */
export function calculate_repayment_interest_first(loan: Loan): any;
/**
 * @param {string} name
 */
export function greet(name: string): void;
/**
 */
export class Loan {
  free(): void;
  /**
   * @param {number} total_loan
   * @param {number} repayment_period
   * @param {number} annual_interest_rate
   * @param {bigint} loan_duration
   */
  constructor(
    total_loan: number,
    repayment_period: number,
    annual_interest_rate: number,
    loan_duration: bigint,
  );
}
/**
 */
export class RepaymentDetail {
  free(): void;
}
