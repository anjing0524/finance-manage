import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并classname
 * @param  {...any} inputs class name
 * @returns 
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
