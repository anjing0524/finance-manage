/**
 *
 * @param {URLSearchParams} searchParam
 * @param {number} page
 * @returns {String}
 */
export default function merge(searchParam, page) {
  const p = new URLSearchParams(searchParam.toString());
  p.set('page', page);
  return p.toString();
}
