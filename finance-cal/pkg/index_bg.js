let wasm;
export function __wbg_set_wasm(val) {
  wasm = val;
}

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) {
  return heap[idx];
}

let heap_next = heap.length;

function dropObject(idx) {
  if (idx < 132) return;
  heap[idx] = heap_next;
  heap_next = idx;
}

function takeObject(idx) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}

const lTextDecoder =
  typeof TextDecoder === 'undefined'
    ? (0, module.require)('util').TextDecoder
    : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', {
  ignoreBOM: true,
  fatal: true,
});

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
  if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
    cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];

  heap[idx] = obj;
  return idx;
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder =
  typeof TextEncoder === 'undefined'
    ? (0, module.require)('util').TextEncoder
    : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString =
  typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
        return cachedTextEncoder.encodeInto(arg, view);
      }
    : function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
          read: arg.length,
          written: buf.length,
        };
      };

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length, 1) >>> 0;
    getUint8Memory0()
      .subarray(ptr, ptr + buf.length)
      .set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;

  const mem = getUint8Memory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7f) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, (len = offset + arg.length * 3), 1) >>> 0;
    const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);

    offset += ret.written;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

function isLikeNone(x) {
  return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
  if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
    cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachedInt32Memory0;
}

let cachedFloat64Memory0 = null;

function getFloat64Memory0() {
  if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
    cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
  }
  return cachedFloat64Memory0;
}

function debugString(val) {
  // primitive types
  const type = typeof val;
  if (type == 'number' || type == 'boolean' || val == null) {
    return `${val}`;
  }
  if (type == 'string') {
    return `"${val}"`;
  }
  if (type == 'symbol') {
    const description = val.description;
    if (description == null) {
      return 'Symbol';
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == 'function') {
    const name = val.name;
    if (typeof name == 'string' && name.length > 0) {
      return `Function(${name})`;
    } else {
      return 'Function';
    }
  }
  // objects
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = '[';
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug += ', ' + debugString(val[i]);
    }
    debug += ']';
    return debug;
  }
  // Test for built-in
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    // Failed to match the standard '[object ClassName]'
    return toString.call(val);
  }
  if (className == 'Object') {
    // we're a user defined class or Object
    // JSON.stringify avoids problems with cycles, and is generally much
    // easier than looping through ownProperties of `val`.
    try {
      return 'Object(' + JSON.stringify(val) + ')';
    } catch (_) {
      return 'Object';
    }
  }
  // errors
  if (val instanceof Error) {
    return `${val.name}: ${val.message}\n${val.stack}`;
  }
  // TODO we could test for more things here, like `Set`s and `Map`s.
  return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
  const state = { a: arg0, b: arg1, cnt: 1, dtor };
  const real = (...args) => {
    // First up with a closure we increment the internal reference
    // count. This ensures that the Rust closure environment won't
    // be deallocated while we're invoking it.
    state.cnt++;
    const a = state.a;
    state.a = 0;
    try {
      return f(a, state.b, ...args);
    } finally {
      if (--state.cnt === 0) {
        wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);
      } else {
        state.a = a;
      }
    }
  };
  real.original = state;

  return real;
}
function __wbg_adapter_34(arg0, arg1, arg2) {
  wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h45d246434a2189b5(
    arg0,
    arg1,
    addHeapObject(arg2),
  );
}

/**
 * 获取指定 id 的 canvas 元素
 * @param {string} id
 * @returns {HTMLCanvasElement}
 */
export function get_canvas(id) {
  const ptr0 = passStringToWasm0(
    id,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  );
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.get_canvas(ptr0, len0);
  return takeObject(ret);
}

/**
 * 获取全局 window 对象
 * @returns {Window}
 */
export function get_window() {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.get_window(retptr);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

let stack_pointer = 128;

function addBorrowedObject(obj) {
  if (stack_pointer == 1) throw new Error('out of js stack');
  heap[--stack_pointer] = obj;
  return stack_pointer;
}
/**
 * @param {HTMLCanvasElement} canvas
 * @returns {CanvasRenderingContext2D}
 */
export function get_context(canvas) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.get_context(retptr, addBorrowedObject(canvas));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
    heap[stack_pointer++] = undefined;
  }
}

/**
 * @param {string} id
 */
export function draw_test(id) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passStringToWasm0(
      id,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.draw_test(retptr, ptr0, len0);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    if (r1) {
      throw takeObject(r0);
    }
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * @param {string} id
 * @param {any} data
 */
export function draw_kline(id, data) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passStringToWasm0(
      id,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.draw_kline(retptr, ptr0, len0, addHeapObject(data));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    if (r1) {
      throw takeObject(r0);
    }
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

function _assertClass(instance, klass) {
  if (!(instance instanceof klass)) {
    throw new Error(`expected instance of ${klass.name}`);
  }
  return instance.ptr;
}
/**
 * @param {Loan} loan
 * @returns {any}
 */
export function calculate_repayment_equal_principal(loan) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    _assertClass(loan, Loan);
    wasm.calculate_repayment_equal_principal(retptr, loan.__wbg_ptr);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * @param {Loan} loan
 * @returns {any}
 */
export function calculate_repayment_equal_installment(loan) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    _assertClass(loan, Loan);
    wasm.calculate_repayment_equal_installment(retptr, loan.__wbg_ptr);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * @param {Loan} loan
 * @returns {any}
 */
export function calculate_repayment_interest_first(loan) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    _assertClass(loan, Loan);
    wasm.calculate_repayment_interest_first(retptr, loan.__wbg_ptr);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * @param {string} name
 */
export function greet(name) {
  const ptr0 = passStringToWasm0(
    name,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  );
  const len0 = WASM_VECTOR_LEN;
  wasm.greet(ptr0, len0);
}

function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    wasm.__wbindgen_exn_store(addHeapObject(e));
  }
}
/**
 */
export class Loan {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Loan.prototype);
    obj.__wbg_ptr = ptr;

    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_loan_free(ptr);
  }
  /**
   * @param {number} total_loan
   * @param {number} repayment_period
   * @param {number} annual_interest_rate
   * @param {bigint} loan_duration
   */
  constructor(
    total_loan,
    repayment_period,
    annual_interest_rate,
    loan_duration,
  ) {
    const ret = wasm.loan_new(
      total_loan,
      repayment_period,
      annual_interest_rate,
      loan_duration,
    );
    return Loan.__wrap(ret);
  }
}
/**
 */
export class RepaymentDetail {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;

    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_repaymentdetail_free(ptr);
  }
}

export function __wbindgen_object_drop_ref(arg0) {
  takeObject(arg0);
}

export function __wbg_getElementById_c0bc92e102a7250e(arg0, arg1) {
  const ret = document.getElementById(getStringFromWasm0(arg0, arg1));
  return addHeapObject(ret);
}

export function __wbindgen_string_new(arg0, arg1) {
  const ret = getStringFromWasm0(arg0, arg1);
  return addHeapObject(ret);
}

export function __wbg_log_6095bc93e121ec7f(arg0, arg1) {
  console.log(getStringFromWasm0(arg0, arg1));
}

export function __wbindgen_cb_drop(arg0) {
  const obj = takeObject(arg0).original;
  if (obj.cnt-- == 1) {
    obj.a = 0;
    return true;
  }
  const ret = false;
  return ret;
}

export function __wbindgen_error_new(arg0, arg1) {
  const ret = new Error(getStringFromWasm0(arg0, arg1));
  return addHeapObject(ret);
}

export function __wbindgen_string_get(arg0, arg1) {
  const obj = getObject(arg1);
  const ret = typeof obj === 'string' ? obj : undefined;
  var ptr1 = isLikeNone(ret)
    ? 0
    : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  var len1 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len1;
  getInt32Memory0()[arg0 / 4 + 0] = ptr1;
}

export function __wbindgen_is_object(arg0) {
  const val = getObject(arg0);
  const ret = typeof val === 'object' && val !== null;
  return ret;
}

export function __wbindgen_is_undefined(arg0) {
  const ret = getObject(arg0) === undefined;
  return ret;
}

export function __wbindgen_in(arg0, arg1) {
  const ret = getObject(arg0) in getObject(arg1);
  return ret;
}

export function __wbindgen_number_get(arg0, arg1) {
  const obj = getObject(arg1);
  const ret = typeof obj === 'number' ? obj : undefined;
  getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
  getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
}

export function __wbg_alert_31d12c64b654a976(arg0, arg1) {
  alert(getStringFromWasm0(arg0, arg1));
}

export function __wbg_instanceof_Window_9029196b662bc42a(arg0) {
  let result;
  try {
    result = getObject(arg0) instanceof Window;
  } catch {
    result = false;
  }
  const ret = result;
  return ret;
}

export function __wbg_addEventListener_5651108fc3ffeb6e() {
  return handleError(function (arg0, arg1, arg2, arg3) {
    getObject(arg0).addEventListener(
      getStringFromWasm0(arg1, arg2),
      getObject(arg3),
    );
  }, arguments);
}

export function __wbg_instanceof_CanvasRenderingContext2d_bc0a6635c96eca9b(
  arg0,
) {
  let result;
  try {
    result = getObject(arg0) instanceof CanvasRenderingContext2D;
  } catch {
    result = false;
  }
  const ret = result;
  return ret;
}

export function __wbg_setstrokeStyle_3fe4d1c0d11ed1b6(arg0, arg1) {
  getObject(arg0).strokeStyle = getObject(arg1);
}

export function __wbg_setfillStyle_401fa583a1c8863c(arg0, arg1) {
  getObject(arg0).fillStyle = getObject(arg1);
}

export function __wbg_setfont_3d2943420717ac87(arg0, arg1, arg2) {
  getObject(arg0).font = getStringFromWasm0(arg1, arg2);
}

export function __wbg_beginPath_b3943a4f4af02eac(arg0) {
  getObject(arg0).beginPath();
}

export function __wbg_stroke_ee7601ba7abc0ba2(arg0) {
  getObject(arg0).stroke();
}

export function __wbg_closePath_1ccba0ac1c9b169a(arg0) {
  getObject(arg0).closePath();
}

export function __wbg_lineTo_76baf70710a4f382(arg0, arg1, arg2) {
  getObject(arg0).lineTo(arg1, arg2);
}

export function __wbg_moveTo_d2635b364d869fa8(arg0, arg1, arg2) {
  getObject(arg0).moveTo(arg1, arg2);
}

export function __wbg_fillRect_e285f7b46668b7fa(arg0, arg1, arg2, arg3, arg4) {
  getObject(arg0).fillRect(arg1, arg2, arg3, arg4);
}

export function __wbg_restore_890c3582852dbadf(arg0) {
  getObject(arg0).restore();
}

export function __wbg_save_cdcca9591f027e80(arg0) {
  getObject(arg0).save();
}

export function __wbg_fillText_ba4313e6835ce7ea() {
  return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).fillText(getStringFromWasm0(arg1, arg2), arg3, arg4);
  }, arguments);
}

export function __wbg_clientX_1a480606ab0cabaa(arg0) {
  const ret = getObject(arg0).clientX;
  return ret;
}

export function __wbg_clientY_9c7878f7faf3900f(arg0) {
  const ret = getObject(arg0).clientY;
  return ret;
}

export function __wbg_width_2931aaedd21f1fff(arg0) {
  const ret = getObject(arg0).width;
  return ret;
}

export function __wbg_height_0d36fbbeb60b0661(arg0) {
  const ret = getObject(arg0).height;
  return ret;
}

export function __wbg_getContext_7c5944ea807bf5d3() {
  return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
  }, arguments);
}

export function __wbindgen_jsval_loose_eq(arg0, arg1) {
  const ret = getObject(arg0) == getObject(arg1);
  return ret;
}

export function __wbindgen_boolean_get(arg0) {
  const v = getObject(arg0);
  const ret = typeof v === 'boolean' ? (v ? 1 : 0) : 2;
  return ret;
}

export function __wbindgen_object_clone_ref(arg0) {
  const ret = getObject(arg0);
  return addHeapObject(ret);
}

export function __wbg_getwithrefkey_5e6d9547403deab8(arg0, arg1) {
  const ret = getObject(arg0)[getObject(arg1)];
  return addHeapObject(ret);
}

export function __wbg_get_44be0491f933a435(arg0, arg1) {
  const ret = getObject(arg0)[arg1 >>> 0];
  return addHeapObject(ret);
}

export function __wbg_length_fff51ee6522a1a18(arg0) {
  const ret = getObject(arg0).length;
  return ret;
}

export function __wbindgen_is_function(arg0) {
  const ret = typeof getObject(arg0) === 'function';
  return ret;
}

export function __wbg_newnoargs_581967eacc0e2604(arg0, arg1) {
  const ret = new Function(getStringFromWasm0(arg0, arg1));
  return addHeapObject(ret);
}

export function __wbg_next_526fc47e980da008(arg0) {
  const ret = getObject(arg0).next;
  return addHeapObject(ret);
}

export function __wbg_next_ddb3312ca1c4e32a() {
  return handleError(function (arg0) {
    const ret = getObject(arg0).next();
    return addHeapObject(ret);
  }, arguments);
}

export function __wbg_done_5c1f01fb660d73b5(arg0) {
  const ret = getObject(arg0).done;
  return ret;
}

export function __wbg_value_1695675138684bd5(arg0) {
  const ret = getObject(arg0).value;
  return addHeapObject(ret);
}

export function __wbg_iterator_97f0c81209c6c35a() {
  const ret = Symbol.iterator;
  return addHeapObject(ret);
}

export function __wbg_get_97b561fb56f034b5() {
  return handleError(function (arg0, arg1) {
    const ret = Reflect.get(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
  }, arguments);
}

export function __wbg_call_cb65541d95d71282() {
  return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
  }, arguments);
}

export function __wbg_self_1ff1d729e9aae938() {
  return handleError(function () {
    const ret = self.self;
    return addHeapObject(ret);
  }, arguments);
}

export function __wbg_window_5f4faef6c12b79ec() {
  return handleError(function () {
    const ret = window.window;
    return addHeapObject(ret);
  }, arguments);
}

export function __wbg_globalThis_1d39714405582d3c() {
  return handleError(function () {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
  }, arguments);
}

export function __wbg_global_651f05c6a0944d1c() {
  return handleError(function () {
    const ret = global.global;
    return addHeapObject(ret);
  }, arguments);
}

export function __wbg_isArray_4c24b343cb13cfb1(arg0) {
  const ret = Array.isArray(getObject(arg0));
  return ret;
}

export function __wbg_instanceof_ArrayBuffer_39ac22089b74fddb(arg0) {
  let result;
  try {
    result = getObject(arg0) instanceof ArrayBuffer;
  } catch {
    result = false;
  }
  const ret = result;
  return ret;
}

export function __wbg_buffer_085ec1f694018c4f(arg0) {
  const ret = getObject(arg0).buffer;
  return addHeapObject(ret);
}

export function __wbg_new_8125e318e6245eed(arg0) {
  const ret = new Uint8Array(getObject(arg0));
  return addHeapObject(ret);
}

export function __wbg_set_5cf90238115182c3(arg0, arg1, arg2) {
  getObject(arg0).set(getObject(arg1), arg2 >>> 0);
}

export function __wbg_length_72e2208bbc0efc61(arg0) {
  const ret = getObject(arg0).length;
  return ret;
}

export function __wbg_instanceof_Uint8Array_d8d9cb2b8e8ac1d4(arg0) {
  let result;
  try {
    result = getObject(arg0) instanceof Uint8Array;
  } catch {
    result = false;
  }
  const ret = result;
  return ret;
}

export function __wbg_new_abda76e883ba8a5f() {
  const ret = new Error();
  return addHeapObject(ret);
}

export function __wbg_stack_658279fe44541cf6(arg0, arg1) {
  const ret = getObject(arg1).stack;
  const ptr1 = passStringToWasm0(
    ret,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  );
  const len1 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len1;
  getInt32Memory0()[arg0 / 4 + 0] = ptr1;
}

export function __wbg_error_f851667af71bcfc6(arg0, arg1) {
  let deferred0_0;
  let deferred0_1;
  try {
    deferred0_0 = arg0;
    deferred0_1 = arg1;
    console.error(getStringFromWasm0(arg0, arg1));
  } finally {
    wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
  }
}

export function __wbindgen_debug_string(arg0, arg1) {
  const ret = debugString(getObject(arg1));
  const ptr1 = passStringToWasm0(
    ret,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  );
  const len1 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len1;
  getInt32Memory0()[arg0 / 4 + 0] = ptr1;
}

export function __wbindgen_throw(arg0, arg1) {
  throw new Error(getStringFromWasm0(arg0, arg1));
}

export function __wbindgen_memory() {
  const ret = wasm.memory;
  return addHeapObject(ret);
}

export function __wbindgen_closure_wrapper89(arg0, arg1, arg2) {
  const ret = makeMutClosure(arg0, arg1, 8, __wbg_adapter_34);
  return addHeapObject(ret);
}
