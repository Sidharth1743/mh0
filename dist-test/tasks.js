"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// convex/tasks.ts
var tasks_exports = {};
__export(tasks_exports, {
  addTaskItem: () => addTaskItem,
  completePhase: () => completePhase,
  getMatchTasks: () => getMatchTasks,
  getMessages: () => getMessages,
  sendMessage: () => sendMessage
});
module.exports = __toCommonJS(tasks_exports);

// node_modules/convex/dist/esm/values/base64.js
var lookup = [];
var revLookup = [];
var Arr = Uint8Array;
var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
}
var i;
var len;
revLookup["-".charCodeAt(0)] = 62;
revLookup["_".charCodeAt(0)] = 63;
function getLens(b64) {
  var len = b64.length;
  if (len % 4 > 0) {
    throw new Error("Invalid string. Length must be a multiple of 4");
  }
  var validLen = b64.indexOf("=");
  if (validLen === -1) validLen = len;
  var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
  return [validLen, placeHoldersLen];
}
function _byteLength(_b64, validLen, placeHoldersLen) {
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function toByteArray(b64) {
  var tmp;
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  var arr2 = new Arr(_byteLength(b64, validLen, placeHoldersLen));
  var curByte = 0;
  var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
  var i;
  for (i = 0; i < len; i += 4) {
    tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
    arr2[curByte++] = tmp >> 16 & 255;
    arr2[curByte++] = tmp >> 8 & 255;
    arr2[curByte++] = tmp & 255;
  }
  if (placeHoldersLen === 2) {
    tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
    arr2[curByte++] = tmp & 255;
  }
  if (placeHoldersLen === 1) {
    tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
    arr2[curByte++] = tmp >> 8 & 255;
    arr2[curByte++] = tmp & 255;
  }
  return arr2;
}
function tripletToBase64(num) {
  return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
}
function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16 & 16711680) + (uint8[i + 1] << 8 & 65280) + (uint8[i + 2] & 255);
    output.push(tripletToBase64(tmp));
  }
  return output.join("");
}
function fromByteArray(uint8) {
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3;
  var parts = [];
  var maxChunkLength = 16383;
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(
      encodeChunk(
        uint8,
        i,
        i + maxChunkLength > len2 ? len2 : i + maxChunkLength
      )
    );
  }
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    parts.push(
      lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
    );
  }
  return parts.join("");
}

// node_modules/convex/dist/esm/common/index.js
function parseArgs(args) {
  if (args === void 0) {
    return {};
  }
  if (!isSimpleObject(args)) {
    throw new Error(
      `The arguments to a Convex function must be an object. Received: ${args}`
    );
  }
  return args;
}
function isSimpleObject(value) {
  const isObject = typeof value === "object";
  const prototype = Object.getPrototypeOf(value);
  const isSimple = prototype === null || prototype === Object.prototype || // Objects generated from other contexts (e.g. across Node.js `vm` modules) will not satisfy the previous
  // conditions but are still simple objects.
  prototype?.constructor?.name === "Object";
  return isObject && isSimple;
}

// node_modules/convex/dist/esm/values/value.js
var LITTLE_ENDIAN = true;
var MIN_INT64 = BigInt("-9223372036854775808");
var MAX_INT64 = BigInt("9223372036854775807");
var ZERO = BigInt("0");
var EIGHT = BigInt("8");
var TWOFIFTYSIX = BigInt("256");
function isSpecial(n) {
  return Number.isNaN(n) || !Number.isFinite(n) || Object.is(n, -0);
}
function slowBigIntToBase64(value) {
  if (value < ZERO) {
    value -= MIN_INT64 + MIN_INT64;
  }
  let hex = value.toString(16);
  if (hex.length % 2 === 1) hex = "0" + hex;
  const bytes = new Uint8Array(new ArrayBuffer(8));
  let i = 0;
  for (const hexByte of hex.match(/.{2}/g).reverse()) {
    bytes.set([parseInt(hexByte, 16)], i++);
    value >>= EIGHT;
  }
  return fromByteArray(bytes);
}
function slowBase64ToBigInt(encoded) {
  const integerBytes = toByteArray(encoded);
  if (integerBytes.byteLength !== 8) {
    throw new Error(
      `Received ${integerBytes.byteLength} bytes, expected 8 for $integer`
    );
  }
  let value = ZERO;
  let power = ZERO;
  for (const byte of integerBytes) {
    value += BigInt(byte) * TWOFIFTYSIX ** power;
    power++;
  }
  if (value > MAX_INT64) {
    value += MIN_INT64 + MIN_INT64;
  }
  return value;
}
function modernBigIntToBase64(value) {
  if (value < MIN_INT64 || MAX_INT64 < value) {
    throw new Error(
      `BigInt ${value} does not fit into a 64-bit signed integer.`
    );
  }
  const buffer = new ArrayBuffer(8);
  new DataView(buffer).setBigInt64(0, value, true);
  return fromByteArray(new Uint8Array(buffer));
}
function modernBase64ToBigInt(encoded) {
  const integerBytes = toByteArray(encoded);
  if (integerBytes.byteLength !== 8) {
    throw new Error(
      `Received ${integerBytes.byteLength} bytes, expected 8 for $integer`
    );
  }
  const intBytesView = new DataView(integerBytes.buffer);
  return intBytesView.getBigInt64(0, true);
}
var bigIntToBase64 = DataView.prototype.setBigInt64 ? modernBigIntToBase64 : slowBigIntToBase64;
var base64ToBigInt = DataView.prototype.getBigInt64 ? modernBase64ToBigInt : slowBase64ToBigInt;
var MAX_IDENTIFIER_LEN = 1024;
function validateObjectField(k) {
  if (k.length > MAX_IDENTIFIER_LEN) {
    throw new Error(
      `Field name ${k} exceeds maximum field name length ${MAX_IDENTIFIER_LEN}.`
    );
  }
  if (k.startsWith("$")) {
    throw new Error(`Field name ${k} starts with a '$', which is reserved.`);
  }
  for (let i = 0; i < k.length; i += 1) {
    const charCode = k.charCodeAt(i);
    if (charCode < 32 || charCode >= 127) {
      throw new Error(
        `Field name ${k} has invalid character '${k[i]}': Field names can only contain non-control ASCII characters`
      );
    }
  }
}
function jsonToConvex(value) {
  if (value === null) {
    return value;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((value2) => jsonToConvex(value2));
  }
  if (typeof value !== "object") {
    throw new Error(`Unexpected type of ${value}`);
  }
  const entries = Object.entries(value);
  if (entries.length === 1) {
    const key = entries[0][0];
    if (key === "$bytes") {
      if (typeof value.$bytes !== "string") {
        throw new Error(`Malformed $bytes field on ${value}`);
      }
      return toByteArray(value.$bytes).buffer;
    }
    if (key === "$integer") {
      if (typeof value.$integer !== "string") {
        throw new Error(`Malformed $integer field on ${value}`);
      }
      return base64ToBigInt(value.$integer);
    }
    if (key === "$float") {
      if (typeof value.$float !== "string") {
        throw new Error(`Malformed $float field on ${value}`);
      }
      const floatBytes = toByteArray(value.$float);
      if (floatBytes.byteLength !== 8) {
        throw new Error(
          `Received ${floatBytes.byteLength} bytes, expected 8 for $float`
        );
      }
      const floatBytesView = new DataView(floatBytes.buffer);
      const float = floatBytesView.getFloat64(0, LITTLE_ENDIAN);
      if (!isSpecial(float)) {
        throw new Error(`Float ${float} should be encoded as a number`);
      }
      return float;
    }
    if (key === "$set") {
      throw new Error(
        `Received a Set which is no longer supported as a Convex type.`
      );
    }
    if (key === "$map") {
      throw new Error(
        `Received a Map which is no longer supported as a Convex type.`
      );
    }
  }
  const out = {};
  for (const [k, v2] of Object.entries(value)) {
    validateObjectField(k);
    out[k] = jsonToConvex(v2);
  }
  return out;
}
var MAX_VALUE_FOR_ERROR_LEN = 16384;
function stringifyValueForError(value) {
  const str = JSON.stringify(value, (_key, value2) => {
    if (value2 === void 0) {
      return "undefined";
    }
    if (typeof value2 === "bigint") {
      return `${value2.toString()}n`;
    }
    return value2;
  });
  if (str.length > MAX_VALUE_FOR_ERROR_LEN) {
    const rest = "[...truncated]";
    let truncateAt = MAX_VALUE_FOR_ERROR_LEN - rest.length;
    const codePoint = str.codePointAt(truncateAt - 1);
    if (codePoint !== void 0 && codePoint > 65535) {
      truncateAt -= 1;
    }
    return str.substring(0, truncateAt) + rest;
  }
  return str;
}
function convexToJsonInternal(value, originalValue, context, includeTopLevelUndefined) {
  if (value === void 0) {
    const contextText = context && ` (present at path ${context} in original object ${stringifyValueForError(
      originalValue
    )})`;
    throw new Error(
      `undefined is not a valid Convex value${contextText}. To learn about Convex's supported types, see https://docs.convex.dev/using/types.`
    );
  }
  if (value === null) {
    return value;
  }
  if (typeof value === "bigint") {
    if (value < MIN_INT64 || MAX_INT64 < value) {
      throw new Error(
        `BigInt ${value} does not fit into a 64-bit signed integer.`
      );
    }
    return { $integer: bigIntToBase64(value) };
  }
  if (typeof value === "number") {
    if (isSpecial(value)) {
      const buffer = new ArrayBuffer(8);
      new DataView(buffer).setFloat64(0, value, LITTLE_ENDIAN);
      return { $float: fromByteArray(new Uint8Array(buffer)) };
    } else {
      return value;
    }
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof ArrayBuffer) {
    return { $bytes: fromByteArray(new Uint8Array(value)) };
  }
  if (Array.isArray(value)) {
    return value.map(
      (value2, i) => convexToJsonInternal(value2, originalValue, context + `[${i}]`, false)
    );
  }
  if (value instanceof Set) {
    throw new Error(
      errorMessageForUnsupportedType(context, "Set", [...value], originalValue)
    );
  }
  if (value instanceof Map) {
    throw new Error(
      errorMessageForUnsupportedType(context, "Map", [...value], originalValue)
    );
  }
  if (!isSimpleObject(value)) {
    const theType = value?.constructor?.name;
    const typeName = theType ? `${theType} ` : "";
    throw new Error(
      errorMessageForUnsupportedType(context, typeName, value, originalValue)
    );
  }
  const out = {};
  const entries = Object.entries(value);
  entries.sort(([k1, _v1], [k2, _v2]) => k1 === k2 ? 0 : k1 < k2 ? -1 : 1);
  for (const [k, v2] of entries) {
    if (v2 !== void 0) {
      validateObjectField(k);
      out[k] = convexToJsonInternal(v2, originalValue, context + `.${k}`, false);
    } else if (includeTopLevelUndefined) {
      validateObjectField(k);
      out[k] = convexOrUndefinedToJsonInternal(
        v2,
        originalValue,
        context + `.${k}`
      );
    }
  }
  return out;
}
function errorMessageForUnsupportedType(context, typeName, value, originalValue) {
  if (context) {
    return `${typeName}${stringifyValueForError(
      value
    )} is not a supported Convex type (present at path ${context} in original object ${stringifyValueForError(
      originalValue
    )}). To learn about Convex's supported types, see https://docs.convex.dev/using/types.`;
  } else {
    return `${typeName}${stringifyValueForError(
      value
    )} is not a supported Convex type.`;
  }
}
function convexOrUndefinedToJsonInternal(value, originalValue, context) {
  if (value === void 0) {
    return { $undefined: null };
  } else {
    if (originalValue === void 0) {
      throw new Error(
        `Programming error. Current value is ${stringifyValueForError(
          value
        )} but original value is undefined`
      );
    }
    return convexToJsonInternal(value, originalValue, context, false);
  }
}
function convexToJson(value) {
  return convexToJsonInternal(value, value, "", false);
}
function convexOrUndefinedToJson(value) {
  return convexOrUndefinedToJsonInternal(value, value, "");
}
function patchValueToJson(value) {
  return convexToJsonInternal(value, value, "", true);
}

// node_modules/convex/dist/esm/values/validators.js
var __defProp2 = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var UNDEFINED_VALIDATOR_ERROR_URL = "https://docs.convex.dev/error#undefined-validator";
function throwUndefinedValidatorError(context, fieldName) {
  const fieldInfo = fieldName !== void 0 ? ` for field "${fieldName}"` : "";
  throw new Error(
    `A validator is undefined${fieldInfo} in ${context}. This is often caused by circular imports. See ${UNDEFINED_VALIDATOR_ERROR_URL} for details.`
  );
}
var BaseValidator = class {
  constructor({ isOptional }) {
    __publicField(this, "type");
    __publicField(this, "fieldPaths");
    __publicField(this, "isOptional");
    __publicField(this, "isConvexValidator");
    this.isOptional = isOptional;
    this.isConvexValidator = true;
  }
};
var VId = class _VId extends BaseValidator {
  /**
   * Usually you'd use `v.id(tableName)` instead.
   */
  constructor({
    isOptional,
    tableName
  }) {
    super({ isOptional });
    __publicField(this, "tableName");
    __publicField(this, "kind", "id");
    if (typeof tableName !== "string") {
      throw new Error("v.id(tableName) requires a string");
    }
    this.tableName = tableName;
  }
  /** @internal */
  get json() {
    return { type: "id", tableName: this.tableName };
  }
  /** @internal */
  asOptional() {
    return new _VId({
      isOptional: "optional",
      tableName: this.tableName
    });
  }
};
var VFloat64 = class _VFloat64 extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "float64");
  }
  /** @internal */
  get json() {
    return { type: "number" };
  }
  /** @internal */
  asOptional() {
    return new _VFloat64({
      isOptional: "optional"
    });
  }
};
var VInt64 = class _VInt64 extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "int64");
  }
  /** @internal */
  get json() {
    return { type: "bigint" };
  }
  /** @internal */
  asOptional() {
    return new _VInt64({ isOptional: "optional" });
  }
};
var VBoolean = class _VBoolean extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "boolean");
  }
  /** @internal */
  get json() {
    return { type: this.kind };
  }
  /** @internal */
  asOptional() {
    return new _VBoolean({
      isOptional: "optional"
    });
  }
};
var VBytes = class _VBytes extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "bytes");
  }
  /** @internal */
  get json() {
    return { type: this.kind };
  }
  /** @internal */
  asOptional() {
    return new _VBytes({ isOptional: "optional" });
  }
};
var VString = class _VString extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "string");
  }
  /** @internal */
  get json() {
    return { type: this.kind };
  }
  /** @internal */
  asOptional() {
    return new _VString({
      isOptional: "optional"
    });
  }
};
var VNull = class _VNull extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "null");
  }
  /** @internal */
  get json() {
    return { type: this.kind };
  }
  /** @internal */
  asOptional() {
    return new _VNull({ isOptional: "optional" });
  }
};
var VAny = class _VAny extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "any");
  }
  /** @internal */
  get json() {
    return {
      type: this.kind
    };
  }
  /** @internal */
  asOptional() {
    return new _VAny({
      isOptional: "optional"
    });
  }
};
var VObject = class _VObject extends BaseValidator {
  /**
   * Usually you'd use `v.object({ ... })` instead.
   */
  constructor({
    isOptional,
    fields
  }) {
    super({ isOptional });
    __publicField(this, "fields");
    __publicField(this, "kind", "object");
    globalThis.Object.entries(fields).forEach(([fieldName, validator]) => {
      if (validator === void 0) {
        throwUndefinedValidatorError("v.object()", fieldName);
      }
      if (!validator.isConvexValidator) {
        throw new Error("v.object() entries must be validators");
      }
    });
    this.fields = fields;
  }
  /** @internal */
  get json() {
    return {
      type: this.kind,
      value: globalThis.Object.fromEntries(
        globalThis.Object.entries(this.fields).map(([k, v2]) => [
          k,
          {
            fieldType: v2.json,
            optional: v2.isOptional === "optional" ? true : false
          }
        ])
      )
    };
  }
  /** @internal */
  asOptional() {
    return new _VObject({
      isOptional: "optional",
      fields: this.fields
    });
  }
  /**
   * Create a new VObject with the specified fields omitted.
   * @param fields The field names to omit from this VObject.
   */
  omit(...fields) {
    const newFields = { ...this.fields };
    for (const field of fields) {
      delete newFields[field];
    }
    return new _VObject({
      isOptional: this.isOptional,
      fields: newFields
    });
  }
  /**
   * Create a new VObject with only the specified fields.
   * @param fields The field names to pick from this VObject.
   */
  pick(...fields) {
    const newFields = {};
    for (const field of fields) {
      newFields[field] = this.fields[field];
    }
    return new _VObject({
      isOptional: this.isOptional,
      fields: newFields
    });
  }
  /**
   * Create a new VObject with all fields marked as optional.
   */
  partial() {
    const newFields = {};
    for (const [key, validator] of globalThis.Object.entries(this.fields)) {
      newFields[key] = validator.asOptional();
    }
    return new _VObject({
      isOptional: this.isOptional,
      fields: newFields
    });
  }
  /**
   * Create a new VObject with additional fields merged in.
   * @param fields An object with additional validators to merge into this VObject.
   */
  extend(fields) {
    return new _VObject({
      isOptional: this.isOptional,
      fields: { ...this.fields, ...fields }
    });
  }
};
var VLiteral = class _VLiteral extends BaseValidator {
  /**
   * Usually you'd use `v.literal(value)` instead.
   */
  constructor({ isOptional, value }) {
    super({ isOptional });
    __publicField(this, "value");
    __publicField(this, "kind", "literal");
    if (typeof value !== "string" && typeof value !== "boolean" && typeof value !== "number" && typeof value !== "bigint") {
      throw new Error("v.literal(value) must be a string, number, or boolean");
    }
    this.value = value;
  }
  /** @internal */
  get json() {
    return {
      type: this.kind,
      value: convexToJson(this.value)
    };
  }
  /** @internal */
  asOptional() {
    return new _VLiteral({
      isOptional: "optional",
      value: this.value
    });
  }
};
var VArray = class _VArray extends BaseValidator {
  /**
   * Usually you'd use `v.array(element)` instead.
   */
  constructor({
    isOptional,
    element
  }) {
    super({ isOptional });
    __publicField(this, "element");
    __publicField(this, "kind", "array");
    if (element === void 0) {
      throwUndefinedValidatorError("v.array()");
    }
    this.element = element;
  }
  /** @internal */
  get json() {
    return {
      type: this.kind,
      value: this.element.json
    };
  }
  /** @internal */
  asOptional() {
    return new _VArray({
      isOptional: "optional",
      element: this.element
    });
  }
};
var VRecord = class _VRecord extends BaseValidator {
  /**
   * Usually you'd use `v.record(key, value)` instead.
   */
  constructor({
    isOptional,
    key,
    value
  }) {
    super({ isOptional });
    __publicField(this, "key");
    __publicField(this, "value");
    __publicField(this, "kind", "record");
    if (key === void 0) {
      throwUndefinedValidatorError("v.record()", "key");
    }
    if (value === void 0) {
      throwUndefinedValidatorError("v.record()", "value");
    }
    if (key.isOptional === "optional") {
      throw new Error("Record validator cannot have optional keys");
    }
    if (value.isOptional === "optional") {
      throw new Error("Record validator cannot have optional values");
    }
    if (!key.isConvexValidator || !value.isConvexValidator) {
      throw new Error("Key and value of v.record() but be validators");
    }
    this.key = key;
    this.value = value;
  }
  /** @internal */
  get json() {
    return {
      type: this.kind,
      // This cast is needed because TypeScript thinks the key type is too wide
      keys: this.key.json,
      values: {
        fieldType: this.value.json,
        optional: false
      }
    };
  }
  /** @internal */
  asOptional() {
    return new _VRecord({
      isOptional: "optional",
      key: this.key,
      value: this.value
    });
  }
};
var VUnion = class _VUnion extends BaseValidator {
  /**
   * Usually you'd use `v.union(...members)` instead.
   */
  constructor({ isOptional, members }) {
    super({ isOptional });
    __publicField(this, "members");
    __publicField(this, "kind", "union");
    members.forEach((member, index) => {
      if (member === void 0) {
        throwUndefinedValidatorError("v.union()", `member at index ${index}`);
      }
      if (!member.isConvexValidator) {
        throw new Error("All members of v.union() must be validators");
      }
    });
    this.members = members;
  }
  /** @internal */
  get json() {
    return {
      type: this.kind,
      value: this.members.map((v2) => v2.json)
    };
  }
  /** @internal */
  asOptional() {
    return new _VUnion({
      isOptional: "optional",
      members: this.members
    });
  }
};

// node_modules/convex/dist/esm/values/validator.js
function isValidator(v2) {
  return !!v2.isConvexValidator;
}
function asObjectValidator(obj) {
  if (isValidator(obj)) {
    return obj;
  } else {
    return v.object(obj);
  }
}
var v = {
  /**
   * Validates that the value corresponds to an ID of a document in given table.
   * @param tableName The name of the table.
   */
  id: (tableName) => {
    return new VId({
      isOptional: "required",
      tableName
    });
  },
  /**
   * Validates that the value is of type Null.
   */
  null: () => {
    return new VNull({ isOptional: "required" });
  },
  /**
   * Validates that the value is of Convex type Float64 (Number in JS).
   *
   * Alias for `v.float64()`
   */
  number: () => {
    return new VFloat64({ isOptional: "required" });
  },
  /**
   * Validates that the value is of Convex type Float64 (Number in JS).
   */
  float64: () => {
    return new VFloat64({ isOptional: "required" });
  },
  /**
   * @deprecated Use `v.int64()` instead
   */
  bigint: () => {
    return new VInt64({ isOptional: "required" });
  },
  /**
   * Validates that the value is of Convex type Int64 (BigInt in JS).
   */
  int64: () => {
    return new VInt64({ isOptional: "required" });
  },
  /**
   * Validates that the value is of type Boolean.
   */
  boolean: () => {
    return new VBoolean({ isOptional: "required" });
  },
  /**
   * Validates that the value is of type String.
   */
  string: () => {
    return new VString({ isOptional: "required" });
  },
  /**
   * Validates that the value is of Convex type Bytes (constructed in JS via `ArrayBuffer`).
   */
  bytes: () => {
    return new VBytes({ isOptional: "required" });
  },
  /**
   * Validates that the value is equal to the given literal value.
   * @param literal The literal value to compare against.
   */
  literal: (literal) => {
    return new VLiteral({ isOptional: "required", value: literal });
  },
  /**
   * Validates that the value is an Array of the given element type.
   * @param element The validator for the elements of the array.
   */
  array: (element) => {
    return new VArray({ isOptional: "required", element });
  },
  /**
   * Validates that the value is an Object with the given properties.
   * @param fields An object specifying the validator for each property.
   */
  object: (fields) => {
    return new VObject({ isOptional: "required", fields });
  },
  /**
   * Validates that the value is a Record with keys and values that match the given types.
   * @param keys The validator for the keys of the record. This cannot contain string literals.
   * @param values The validator for the values of the record.
   */
  record: (keys, values) => {
    return new VRecord({
      isOptional: "required",
      key: keys,
      value: values
    });
  },
  /**
   * Validates that the value matches one of the given validators.
   * @param members The validators to match against.
   */
  union: (...members) => {
    return new VUnion({
      isOptional: "required",
      members
    });
  },
  /**
   * Does not validate the value.
   */
  any: () => {
    return new VAny({ isOptional: "required" });
  },
  /**
   * Allows not specifying a value for a property in an Object.
   * @param value The property value validator to make optional.
   *
   * ```typescript
   * const objectWithOptionalFields = v.object({
   *   requiredField: v.string(),
   *   optionalField: v.optional(v.string()),
   * });
   * ```
   */
  optional: (value) => {
    return value.asOptional();
  },
  /**
   * Allows specifying a value or null.
   */
  nullable: (value) => {
    return v.union(value, v.null());
  }
};

// node_modules/convex/dist/esm/values/errors.js
var __defProp3 = Object.defineProperty;
var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField2 = (obj, key, value) => __defNormalProp2(obj, typeof key !== "symbol" ? key + "" : key, value);
var _a;
var _b;
var IDENTIFYING_FIELD = Symbol.for("ConvexError");
var ConvexError = class extends (_b = Error, _a = IDENTIFYING_FIELD, _b) {
  constructor(data) {
    super(typeof data === "string" ? data : stringifyValueForError(data));
    __publicField2(this, "name", "ConvexError");
    __publicField2(this, "data");
    __publicField2(this, _a, true);
    this.data = data;
  }
};

// node_modules/convex/dist/esm/values/compare_utf8.js
var arr = () => Array.from({ length: 4 }, () => 0);
var aBytes = arr();
var bBytes = arr();

// node_modules/convex/dist/esm/index.js
var version = "1.31.7";

// node_modules/convex/dist/esm/server/impl/syscall.js
function performSyscall(op, arg) {
  if (typeof Convex === "undefined" || Convex.syscall === void 0) {
    throw new Error(
      "The Convex database and auth objects are being used outside of a Convex backend. Did you mean to use `useQuery` or `useMutation` to call a Convex function?"
    );
  }
  const resultStr = Convex.syscall(op, JSON.stringify(arg));
  return JSON.parse(resultStr);
}
async function performAsyncSyscall(op, arg) {
  if (typeof Convex === "undefined" || Convex.asyncSyscall === void 0) {
    throw new Error(
      "The Convex database and auth objects are being used outside of a Convex backend. Did you mean to use `useQuery` or `useMutation` to call a Convex function?"
    );
  }
  let resultStr;
  try {
    resultStr = await Convex.asyncSyscall(op, JSON.stringify(arg));
  } catch (e) {
    if (e.data !== void 0) {
      const rethrown = new ConvexError(e.message);
      rethrown.data = jsonToConvex(e.data);
      throw rethrown;
    }
    throw new Error(e.message);
  }
  return JSON.parse(resultStr);
}

// node_modules/convex/dist/esm/server/functionName.js
var functionName = Symbol.for("functionName");

// node_modules/convex/dist/esm/server/components/paths.js
var toReferencePath = Symbol.for("toReferencePath");
function extractReferencePath(reference) {
  return reference[toReferencePath] ?? null;
}
function isFunctionHandle(s) {
  return s.startsWith("function://");
}
function getFunctionAddress(functionReference) {
  let functionAddress;
  if (typeof functionReference === "string") {
    if (isFunctionHandle(functionReference)) {
      functionAddress = { functionHandle: functionReference };
    } else {
      functionAddress = { name: functionReference };
    }
  } else if (functionReference[functionName]) {
    functionAddress = { name: functionReference[functionName] };
  } else {
    const referencePath = extractReferencePath(functionReference);
    if (!referencePath) {
      throw new Error(`${functionReference} is not a functionReference`);
    }
    functionAddress = { reference: referencePath };
  }
  return functionAddress;
}

// node_modules/convex/dist/esm/server/impl/validate.js
function validateArg(arg, idx, method, argName) {
  if (arg === void 0) {
    throw new TypeError(
      `Must provide arg ${idx} \`${argName}\` to \`${method}\``
    );
  }
}
function validateArgIsNonNegativeInteger(arg, idx, method, argName) {
  if (!Number.isInteger(arg) || arg < 0) {
    throw new TypeError(
      `Arg ${idx} \`${argName}\` to \`${method}\` must be a non-negative integer`
    );
  }
}

// node_modules/convex/dist/esm/server/impl/authentication_impl.js
function setupAuth(requestId) {
  return {
    getUserIdentity: async () => {
      return await performAsyncSyscall("1.0/getUserIdentity", {
        requestId
      });
    }
  };
}

// node_modules/convex/dist/esm/server/filter_builder.js
var __defProp4 = Object.defineProperty;
var __defNormalProp3 = (obj, key, value) => key in obj ? __defProp4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField3 = (obj, key, value) => __defNormalProp3(obj, typeof key !== "symbol" ? key + "" : key, value);
var Expression = class {
  /**
   * @internal
   */
  constructor() {
    __publicField3(this, "_isExpression");
    __publicField3(this, "_value");
  }
};

// node_modules/convex/dist/esm/server/impl/filter_builder_impl.js
var __defProp5 = Object.defineProperty;
var __defNormalProp4 = (obj, key, value) => key in obj ? __defProp5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField4 = (obj, key, value) => __defNormalProp4(obj, typeof key !== "symbol" ? key + "" : key, value);
var ExpressionImpl = class extends Expression {
  constructor(inner) {
    super();
    __publicField4(this, "inner");
    this.inner = inner;
  }
  serialize() {
    return this.inner;
  }
};
function serializeExpression(expr) {
  if (expr instanceof ExpressionImpl) {
    return expr.serialize();
  } else {
    return { $literal: convexOrUndefinedToJson(expr) };
  }
}
var filterBuilderImpl = {
  //  Comparisons  /////////////////////////////////////////////////////////////
  eq(l, r) {
    return new ExpressionImpl({
      $eq: [serializeExpression(l), serializeExpression(r)]
    });
  },
  neq(l, r) {
    return new ExpressionImpl({
      $neq: [serializeExpression(l), serializeExpression(r)]
    });
  },
  lt(l, r) {
    return new ExpressionImpl({
      $lt: [serializeExpression(l), serializeExpression(r)]
    });
  },
  lte(l, r) {
    return new ExpressionImpl({
      $lte: [serializeExpression(l), serializeExpression(r)]
    });
  },
  gt(l, r) {
    return new ExpressionImpl({
      $gt: [serializeExpression(l), serializeExpression(r)]
    });
  },
  gte(l, r) {
    return new ExpressionImpl({
      $gte: [serializeExpression(l), serializeExpression(r)]
    });
  },
  //  Arithmetic  //////////////////////////////////////////////////////////////
  add(l, r) {
    return new ExpressionImpl({
      $add: [serializeExpression(l), serializeExpression(r)]
    });
  },
  sub(l, r) {
    return new ExpressionImpl({
      $sub: [serializeExpression(l), serializeExpression(r)]
    });
  },
  mul(l, r) {
    return new ExpressionImpl({
      $mul: [serializeExpression(l), serializeExpression(r)]
    });
  },
  div(l, r) {
    return new ExpressionImpl({
      $div: [serializeExpression(l), serializeExpression(r)]
    });
  },
  mod(l, r) {
    return new ExpressionImpl({
      $mod: [serializeExpression(l), serializeExpression(r)]
    });
  },
  neg(x) {
    return new ExpressionImpl({ $neg: serializeExpression(x) });
  },
  //  Logic  ///////////////////////////////////////////////////////////////////
  and(...exprs) {
    return new ExpressionImpl({ $and: exprs.map(serializeExpression) });
  },
  or(...exprs) {
    return new ExpressionImpl({ $or: exprs.map(serializeExpression) });
  },
  not(x) {
    return new ExpressionImpl({ $not: serializeExpression(x) });
  },
  //  Other  ///////////////////////////////////////////////////////////////////
  field(fieldPath) {
    return new ExpressionImpl({ $field: fieldPath });
  }
};

// node_modules/convex/dist/esm/server/index_range_builder.js
var __defProp6 = Object.defineProperty;
var __defNormalProp5 = (obj, key, value) => key in obj ? __defProp6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField5 = (obj, key, value) => __defNormalProp5(obj, typeof key !== "symbol" ? key + "" : key, value);
var IndexRange = class {
  /**
   * @internal
   */
  constructor() {
    __publicField5(this, "_isIndexRange");
  }
};

// node_modules/convex/dist/esm/server/impl/index_range_builder_impl.js
var __defProp7 = Object.defineProperty;
var __defNormalProp6 = (obj, key, value) => key in obj ? __defProp7(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField6 = (obj, key, value) => __defNormalProp6(obj, typeof key !== "symbol" ? key + "" : key, value);
var IndexRangeBuilderImpl = class _IndexRangeBuilderImpl extends IndexRange {
  constructor(rangeExpressions) {
    super();
    __publicField6(this, "rangeExpressions");
    __publicField6(this, "isConsumed");
    this.rangeExpressions = rangeExpressions;
    this.isConsumed = false;
  }
  static new() {
    return new _IndexRangeBuilderImpl([]);
  }
  consume() {
    if (this.isConsumed) {
      throw new Error(
        "IndexRangeBuilder has already been used! Chain your method calls like `q => q.eq(...).eq(...)`. See https://docs.convex.dev/using/indexes"
      );
    }
    this.isConsumed = true;
  }
  eq(fieldName, value) {
    this.consume();
    return new _IndexRangeBuilderImpl(
      this.rangeExpressions.concat({
        type: "Eq",
        fieldPath: fieldName,
        value: convexOrUndefinedToJson(value)
      })
    );
  }
  gt(fieldName, value) {
    this.consume();
    return new _IndexRangeBuilderImpl(
      this.rangeExpressions.concat({
        type: "Gt",
        fieldPath: fieldName,
        value: convexOrUndefinedToJson(value)
      })
    );
  }
  gte(fieldName, value) {
    this.consume();
    return new _IndexRangeBuilderImpl(
      this.rangeExpressions.concat({
        type: "Gte",
        fieldPath: fieldName,
        value: convexOrUndefinedToJson(value)
      })
    );
  }
  lt(fieldName, value) {
    this.consume();
    return new _IndexRangeBuilderImpl(
      this.rangeExpressions.concat({
        type: "Lt",
        fieldPath: fieldName,
        value: convexOrUndefinedToJson(value)
      })
    );
  }
  lte(fieldName, value) {
    this.consume();
    return new _IndexRangeBuilderImpl(
      this.rangeExpressions.concat({
        type: "Lte",
        fieldPath: fieldName,
        value: convexOrUndefinedToJson(value)
      })
    );
  }
  export() {
    this.consume();
    return this.rangeExpressions;
  }
};

// node_modules/convex/dist/esm/server/search_filter_builder.js
var __defProp8 = Object.defineProperty;
var __defNormalProp7 = (obj, key, value) => key in obj ? __defProp8(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField7 = (obj, key, value) => __defNormalProp7(obj, typeof key !== "symbol" ? key + "" : key, value);
var SearchFilter = class {
  /**
   * @internal
   */
  constructor() {
    __publicField7(this, "_isSearchFilter");
  }
};

// node_modules/convex/dist/esm/server/impl/search_filter_builder_impl.js
var __defProp9 = Object.defineProperty;
var __defNormalProp8 = (obj, key, value) => key in obj ? __defProp9(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField8 = (obj, key, value) => __defNormalProp8(obj, typeof key !== "symbol" ? key + "" : key, value);
var SearchFilterBuilderImpl = class _SearchFilterBuilderImpl extends SearchFilter {
  constructor(filters) {
    super();
    __publicField8(this, "filters");
    __publicField8(this, "isConsumed");
    this.filters = filters;
    this.isConsumed = false;
  }
  static new() {
    return new _SearchFilterBuilderImpl([]);
  }
  consume() {
    if (this.isConsumed) {
      throw new Error(
        "SearchFilterBuilder has already been used! Chain your method calls like `q => q.search(...).eq(...)`."
      );
    }
    this.isConsumed = true;
  }
  search(fieldName, query2) {
    validateArg(fieldName, 1, "search", "fieldName");
    validateArg(query2, 2, "search", "query");
    this.consume();
    return new _SearchFilterBuilderImpl(
      this.filters.concat({
        type: "Search",
        fieldPath: fieldName,
        value: query2
      })
    );
  }
  eq(fieldName, value) {
    validateArg(fieldName, 1, "eq", "fieldName");
    if (arguments.length !== 2) {
      validateArg(value, 2, "search", "value");
    }
    this.consume();
    return new _SearchFilterBuilderImpl(
      this.filters.concat({
        type: "Eq",
        fieldPath: fieldName,
        value: convexOrUndefinedToJson(value)
      })
    );
  }
  export() {
    this.consume();
    return this.filters;
  }
};

// node_modules/convex/dist/esm/server/impl/query_impl.js
var __defProp10 = Object.defineProperty;
var __defNormalProp9 = (obj, key, value) => key in obj ? __defProp10(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField9 = (obj, key, value) => __defNormalProp9(obj, typeof key !== "symbol" ? key + "" : key, value);
var MAX_QUERY_OPERATORS = 256;
var QueryInitializerImpl = class {
  constructor(tableName) {
    __publicField9(this, "tableName");
    this.tableName = tableName;
  }
  withIndex(indexName, indexRange) {
    validateArg(indexName, 1, "withIndex", "indexName");
    let rangeBuilder = IndexRangeBuilderImpl.new();
    if (indexRange !== void 0) {
      rangeBuilder = indexRange(rangeBuilder);
    }
    return new QueryImpl({
      source: {
        type: "IndexRange",
        indexName: this.tableName + "." + indexName,
        range: rangeBuilder.export(),
        order: null
      },
      operators: []
    });
  }
  withSearchIndex(indexName, searchFilter) {
    validateArg(indexName, 1, "withSearchIndex", "indexName");
    validateArg(searchFilter, 2, "withSearchIndex", "searchFilter");
    const searchFilterBuilder = SearchFilterBuilderImpl.new();
    return new QueryImpl({
      source: {
        type: "Search",
        indexName: this.tableName + "." + indexName,
        filters: searchFilter(searchFilterBuilder).export()
      },
      operators: []
    });
  }
  fullTableScan() {
    return new QueryImpl({
      source: {
        type: "FullTableScan",
        tableName: this.tableName,
        order: null
      },
      operators: []
    });
  }
  order(order) {
    return this.fullTableScan().order(order);
  }
  // This is internal API and should not be exposed to developers yet.
  async count() {
    const syscallJSON = await performAsyncSyscall("1.0/count", {
      table: this.tableName
    });
    const syscallResult = jsonToConvex(syscallJSON);
    return syscallResult;
  }
  filter(predicate) {
    return this.fullTableScan().filter(predicate);
  }
  limit(n) {
    return this.fullTableScan().limit(n);
  }
  collect() {
    return this.fullTableScan().collect();
  }
  take(n) {
    return this.fullTableScan().take(n);
  }
  paginate(paginationOpts) {
    return this.fullTableScan().paginate(paginationOpts);
  }
  first() {
    return this.fullTableScan().first();
  }
  unique() {
    return this.fullTableScan().unique();
  }
  [Symbol.asyncIterator]() {
    return this.fullTableScan()[Symbol.asyncIterator]();
  }
};
function throwClosedError(type) {
  throw new Error(
    type === "consumed" ? "This query is closed and can't emit any more values." : "This query has been chained with another operator and can't be reused."
  );
}
var QueryImpl = class _QueryImpl {
  constructor(query2) {
    __publicField9(this, "state");
    __publicField9(this, "tableNameForErrorMessages");
    this.state = { type: "preparing", query: query2 };
    if (query2.source.type === "FullTableScan") {
      this.tableNameForErrorMessages = query2.source.tableName;
    } else {
      this.tableNameForErrorMessages = query2.source.indexName.split(".")[0];
    }
  }
  takeQuery() {
    if (this.state.type !== "preparing") {
      throw new Error(
        "A query can only be chained once and can't be chained after iteration begins."
      );
    }
    const query2 = this.state.query;
    this.state = { type: "closed" };
    return query2;
  }
  startQuery() {
    if (this.state.type === "executing") {
      throw new Error("Iteration can only begin on a query once.");
    }
    if (this.state.type === "closed" || this.state.type === "consumed") {
      throwClosedError(this.state.type);
    }
    const query2 = this.state.query;
    const { queryId } = performSyscall("1.0/queryStream", { query: query2, version });
    this.state = { type: "executing", queryId };
    return queryId;
  }
  closeQuery() {
    if (this.state.type === "executing") {
      const queryId = this.state.queryId;
      performSyscall("1.0/queryCleanup", { queryId });
    }
    this.state = { type: "consumed" };
  }
  order(order) {
    validateArg(order, 1, "order", "order");
    const query2 = this.takeQuery();
    if (query2.source.type === "Search") {
      throw new Error(
        "Search queries must always be in relevance order. Can not set order manually."
      );
    }
    if (query2.source.order !== null) {
      throw new Error("Queries may only specify order at most once");
    }
    query2.source.order = order;
    return new _QueryImpl(query2);
  }
  filter(predicate) {
    validateArg(predicate, 1, "filter", "predicate");
    const query2 = this.takeQuery();
    if (query2.operators.length >= MAX_QUERY_OPERATORS) {
      throw new Error(
        `Can't construct query with more than ${MAX_QUERY_OPERATORS} operators`
      );
    }
    query2.operators.push({
      filter: serializeExpression(predicate(filterBuilderImpl))
    });
    return new _QueryImpl(query2);
  }
  limit(n) {
    validateArg(n, 1, "limit", "n");
    const query2 = this.takeQuery();
    query2.operators.push({ limit: n });
    return new _QueryImpl(query2);
  }
  [Symbol.asyncIterator]() {
    this.startQuery();
    return this;
  }
  async next() {
    if (this.state.type === "closed" || this.state.type === "consumed") {
      throwClosedError(this.state.type);
    }
    const queryId = this.state.type === "preparing" ? this.startQuery() : this.state.queryId;
    const { value, done } = await performAsyncSyscall("1.0/queryStreamNext", {
      queryId
    });
    if (done) {
      this.closeQuery();
    }
    const convexValue = jsonToConvex(value);
    return { value: convexValue, done };
  }
  return() {
    this.closeQuery();
    return Promise.resolve({ done: true, value: void 0 });
  }
  async paginate(paginationOpts) {
    validateArg(paginationOpts, 1, "paginate", "options");
    if (typeof paginationOpts?.numItems !== "number" || paginationOpts.numItems < 0) {
      throw new Error(
        `\`options.numItems\` must be a positive number. Received \`${paginationOpts?.numItems}\`.`
      );
    }
    const query2 = this.takeQuery();
    const pageSize = paginationOpts.numItems;
    const cursor = paginationOpts.cursor;
    const endCursor = paginationOpts?.endCursor ?? null;
    const maximumRowsRead = paginationOpts.maximumRowsRead ?? null;
    const { page, isDone, continueCursor, splitCursor, pageStatus } = await performAsyncSyscall("1.0/queryPage", {
      query: query2,
      cursor,
      endCursor,
      pageSize,
      maximumRowsRead,
      maximumBytesRead: paginationOpts.maximumBytesRead,
      version
    });
    return {
      page: page.map((json) => jsonToConvex(json)),
      isDone,
      continueCursor,
      splitCursor,
      pageStatus
    };
  }
  async collect() {
    const out = [];
    for await (const item of this) {
      out.push(item);
    }
    return out;
  }
  async take(n) {
    validateArg(n, 1, "take", "n");
    validateArgIsNonNegativeInteger(n, 1, "take", "n");
    return this.limit(n).collect();
  }
  async first() {
    const first_array = await this.take(1);
    return first_array.length === 0 ? null : first_array[0];
  }
  async unique() {
    const first_two_array = await this.take(2);
    if (first_two_array.length === 0) {
      return null;
    }
    if (first_two_array.length === 2) {
      throw new Error(`unique() query returned more than one result from table ${this.tableNameForErrorMessages}:
 [${first_two_array[0]._id}, ${first_two_array[1]._id}, ...]`);
    }
    return first_two_array[0];
  }
};

// node_modules/convex/dist/esm/server/impl/database_impl.js
async function get(table, id, isSystem) {
  validateArg(id, 1, "get", "id");
  if (typeof id !== "string") {
    throw new Error(
      `Invalid argument \`id\` for \`db.get\`, expected string but got '${typeof id}': ${id}`
    );
  }
  const args = {
    id: convexToJson(id),
    isSystem,
    version,
    table
  };
  const syscallJSON = await performAsyncSyscall("1.0/get", args);
  return jsonToConvex(syscallJSON);
}
function setupReader() {
  const reader = (isSystem = false) => {
    return {
      get: async (arg0, arg1) => {
        return arg1 !== void 0 ? await get(arg0, arg1, isSystem) : await get(void 0, arg0, isSystem);
      },
      query: (tableName) => {
        return new TableReader(tableName, isSystem).query();
      },
      normalizeId: (tableName, id) => {
        validateArg(tableName, 1, "normalizeId", "tableName");
        validateArg(id, 2, "normalizeId", "id");
        const accessingSystemTable = tableName.startsWith("_");
        if (accessingSystemTable !== isSystem) {
          throw new Error(
            `${accessingSystemTable ? "System" : "User"} tables can only be accessed from db.${isSystem ? "" : "system."}normalizeId().`
          );
        }
        const syscallJSON = performSyscall("1.0/db/normalizeId", {
          table: tableName,
          idString: id
        });
        const syscallResult = jsonToConvex(syscallJSON);
        return syscallResult.id;
      },
      // We set the system reader on the next line
      system: null,
      table: (tableName) => {
        return new TableReader(tableName, isSystem);
      }
    };
  };
  const { system: _, ...rest } = reader(true);
  const r = reader();
  r.system = rest;
  return r;
}
async function insert(tableName, value) {
  if (tableName.startsWith("_")) {
    throw new Error("System tables (prefixed with `_`) are read-only.");
  }
  validateArg(tableName, 1, "insert", "table");
  validateArg(value, 2, "insert", "value");
  const syscallJSON = await performAsyncSyscall("1.0/insert", {
    table: tableName,
    value: convexToJson(value)
  });
  const syscallResult = jsonToConvex(syscallJSON);
  return syscallResult._id;
}
async function patch(table, id, value) {
  validateArg(id, 1, "patch", "id");
  validateArg(value, 2, "patch", "value");
  await performAsyncSyscall("1.0/shallowMerge", {
    id: convexToJson(id),
    value: patchValueToJson(value),
    table
  });
}
async function replace(table, id, value) {
  validateArg(id, 1, "replace", "id");
  validateArg(value, 2, "replace", "value");
  await performAsyncSyscall("1.0/replace", {
    id: convexToJson(id),
    value: convexToJson(value),
    table
  });
}
async function delete_(table, id) {
  validateArg(id, 1, "delete", "id");
  await performAsyncSyscall("1.0/remove", {
    id: convexToJson(id),
    table
  });
}
function setupWriter() {
  const reader = setupReader();
  return {
    get: reader.get,
    query: reader.query,
    normalizeId: reader.normalizeId,
    system: reader.system,
    insert: async (table, value) => {
      return await insert(table, value);
    },
    patch: async (arg0, arg1, arg2) => {
      return arg2 !== void 0 ? await patch(arg0, arg1, arg2) : await patch(void 0, arg0, arg1);
    },
    replace: async (arg0, arg1, arg2) => {
      return arg2 !== void 0 ? await replace(arg0, arg1, arg2) : await replace(void 0, arg0, arg1);
    },
    delete: async (arg0, arg1) => {
      return arg1 !== void 0 ? await delete_(arg0, arg1) : await delete_(void 0, arg0);
    },
    table: (tableName) => {
      return new TableWriter(tableName, false);
    }
  };
}
var TableReader = class {
  constructor(tableName, isSystem) {
    this.tableName = tableName;
    this.isSystem = isSystem;
  }
  async get(id) {
    return get(this.tableName, id, this.isSystem);
  }
  query() {
    const accessingSystemTable = this.tableName.startsWith("_");
    if (accessingSystemTable !== this.isSystem) {
      throw new Error(
        `${accessingSystemTable ? "System" : "User"} tables can only be accessed from db.${this.isSystem ? "" : "system."}query().`
      );
    }
    return new QueryInitializerImpl(this.tableName);
  }
};
var TableWriter = class extends TableReader {
  async insert(value) {
    return insert(this.tableName, value);
  }
  async patch(id, value) {
    return patch(this.tableName, id, value);
  }
  async replace(id, value) {
    return replace(this.tableName, id, value);
  }
  async delete(id) {
    return delete_(this.tableName, id);
  }
};

// node_modules/convex/dist/esm/server/impl/scheduler_impl.js
function setupMutationScheduler() {
  return {
    runAfter: async (delayMs, functionReference, args) => {
      const syscallArgs = runAfterSyscallArgs(delayMs, functionReference, args);
      return await performAsyncSyscall("1.0/schedule", syscallArgs);
    },
    runAt: async (ms_since_epoch_or_date, functionReference, args) => {
      const syscallArgs = runAtSyscallArgs(
        ms_since_epoch_or_date,
        functionReference,
        args
      );
      return await performAsyncSyscall("1.0/schedule", syscallArgs);
    },
    cancel: async (id) => {
      validateArg(id, 1, "cancel", "id");
      const args = { id: convexToJson(id) };
      await performAsyncSyscall("1.0/cancel_job", args);
    }
  };
}
function runAfterSyscallArgs(delayMs, functionReference, args) {
  if (typeof delayMs !== "number") {
    throw new Error("`delayMs` must be a number");
  }
  if (!isFinite(delayMs)) {
    throw new Error("`delayMs` must be a finite number");
  }
  if (delayMs < 0) {
    throw new Error("`delayMs` must be non-negative");
  }
  const functionArgs = parseArgs(args);
  const address = getFunctionAddress(functionReference);
  const ts = (Date.now() + delayMs) / 1e3;
  return {
    ...address,
    ts,
    args: convexToJson(functionArgs),
    version
  };
}
function runAtSyscallArgs(ms_since_epoch_or_date, functionReference, args) {
  let ts;
  if (ms_since_epoch_or_date instanceof Date) {
    ts = ms_since_epoch_or_date.valueOf() / 1e3;
  } else if (typeof ms_since_epoch_or_date === "number") {
    ts = ms_since_epoch_or_date / 1e3;
  } else {
    throw new Error("The invoke time must a Date or a timestamp");
  }
  const address = getFunctionAddress(functionReference);
  const functionArgs = parseArgs(args);
  return {
    ...address,
    ts,
    args: convexToJson(functionArgs),
    version
  };
}

// node_modules/convex/dist/esm/server/impl/storage_impl.js
function setupStorageReader(requestId) {
  return {
    getUrl: async (storageId) => {
      validateArg(storageId, 1, "getUrl", "storageId");
      return await performAsyncSyscall("1.0/storageGetUrl", {
        requestId,
        version,
        storageId
      });
    },
    getMetadata: async (storageId) => {
      return await performAsyncSyscall("1.0/storageGetMetadata", {
        requestId,
        version,
        storageId
      });
    }
  };
}
function setupStorageWriter(requestId) {
  const reader = setupStorageReader(requestId);
  return {
    generateUploadUrl: async () => {
      return await performAsyncSyscall("1.0/storageGenerateUploadUrl", {
        requestId,
        version
      });
    },
    delete: async (storageId) => {
      await performAsyncSyscall("1.0/storageDelete", {
        requestId,
        version,
        storageId
      });
    },
    getUrl: reader.getUrl,
    getMetadata: reader.getMetadata
  };
}

// node_modules/convex/dist/esm/server/impl/registration_impl.js
async function invokeMutation(func, argsStr) {
  const requestId = "";
  const args = jsonToConvex(JSON.parse(argsStr));
  const mutationCtx = {
    db: setupWriter(),
    auth: setupAuth(requestId),
    storage: setupStorageWriter(requestId),
    scheduler: setupMutationScheduler(),
    runQuery: (reference, args2) => runUdf("query", reference, args2),
    runMutation: (reference, args2) => runUdf("mutation", reference, args2)
  };
  const result = await invokeFunction(func, mutationCtx, args);
  validateReturnValue(result);
  return JSON.stringify(convexToJson(result === void 0 ? null : result));
}
function validateReturnValue(v2) {
  if (v2 instanceof QueryInitializerImpl || v2 instanceof QueryImpl) {
    throw new Error(
      "Return value is a Query. Results must be retrieved with `.collect()`, `.take(n), `.unique()`, or `.first()`."
    );
  }
}
async function invokeFunction(func, ctx, args) {
  let result;
  try {
    result = await Promise.resolve(func(ctx, ...args));
  } catch (thrown) {
    throw serializeConvexErrorData(thrown);
  }
  return result;
}
function dontCallDirectly(funcType, handler) {
  return (ctx, args) => {
    globalThis.console.warn(
      `Convex functions should not directly call other Convex functions. Consider calling a helper function instead. e.g. \`export const foo = ${funcType}(...); await foo(ctx);\` is not supported. See https://docs.convex.dev/production/best-practices/#use-helper-functions-to-write-shared-code`
    );
    return handler(ctx, args);
  };
}
function serializeConvexErrorData(thrown) {
  if (typeof thrown === "object" && thrown !== null && Symbol.for("ConvexError") in thrown) {
    const error = thrown;
    error.data = JSON.stringify(
      convexToJson(error.data === void 0 ? null : error.data)
    );
    error.ConvexErrorSymbol = Symbol.for("ConvexError");
    return error;
  } else {
    return thrown;
  }
}
function assertNotBrowser() {
  if (typeof window === "undefined" || window.__convexAllowFunctionsInBrowser) {
    return;
  }
  const isRealBrowser = Object.getOwnPropertyDescriptor(globalThis, "window")?.get?.toString().includes("[native code]") ?? false;
  if (isRealBrowser) {
    console.error(
      "Convex functions should not be imported in the browser. This will throw an error in future versions of `convex`. If this is a false negative, please report it to Convex support."
    );
  }
}
function strictReplacer(key, value) {
  if (value === void 0) {
    throw new Error(
      `A validator is undefined for field "${key}". This is often caused by circular imports. See https://docs.convex.dev/error#undefined-validator for details.`
    );
  }
  return value;
}
function exportArgs(functionDefinition) {
  return () => {
    let args = v.any();
    if (typeof functionDefinition === "object" && functionDefinition.args !== void 0) {
      args = asObjectValidator(functionDefinition.args);
    }
    return JSON.stringify(args.json, strictReplacer);
  };
}
function exportReturns(functionDefinition) {
  return () => {
    let returns;
    if (typeof functionDefinition === "object" && functionDefinition.returns !== void 0) {
      returns = asObjectValidator(functionDefinition.returns);
    }
    return JSON.stringify(returns ? returns.json : null, strictReplacer);
  };
}
var mutationGeneric = ((functionDefinition) => {
  const handler = typeof functionDefinition === "function" ? functionDefinition : functionDefinition.handler;
  const func = dontCallDirectly("mutation", handler);
  assertNotBrowser();
  func.isMutation = true;
  func.isPublic = true;
  func.invokeMutation = (argsStr) => invokeMutation(handler, argsStr);
  func.exportArgs = exportArgs(functionDefinition);
  func.exportReturns = exportReturns(functionDefinition);
  func._handler = handler;
  return func;
});
async function invokeQuery(func, argsStr) {
  const requestId = "";
  const args = jsonToConvex(JSON.parse(argsStr));
  const queryCtx = {
    db: setupReader(),
    auth: setupAuth(requestId),
    storage: setupStorageReader(requestId),
    runQuery: (reference, args2) => runUdf("query", reference, args2)
  };
  const result = await invokeFunction(func, queryCtx, args);
  validateReturnValue(result);
  return JSON.stringify(convexToJson(result === void 0 ? null : result));
}
var queryGeneric = ((functionDefinition) => {
  const handler = typeof functionDefinition === "function" ? functionDefinition : functionDefinition.handler;
  const func = dontCallDirectly("query", handler);
  assertNotBrowser();
  func.isQuery = true;
  func.isPublic = true;
  func.invokeQuery = (argsStr) => invokeQuery(handler, argsStr);
  func.exportArgs = exportArgs(functionDefinition);
  func.exportReturns = exportReturns(functionDefinition);
  func._handler = handler;
  return func;
});
async function runUdf(udfType, f, args) {
  const queryArgs = parseArgs(args);
  const syscallArgs = {
    udfType,
    args: convexToJson(queryArgs),
    ...getFunctionAddress(f)
  };
  const result = await performAsyncSyscall("1.0/runUdf", syscallArgs);
  return jsonToConvex(result);
}

// node_modules/convex/dist/esm/server/pagination.js
var paginationOptsValidator = v.object({
  numItems: v.number(),
  cursor: v.union(v.string(), v.null()),
  endCursor: v.optional(v.union(v.string(), v.null())),
  id: v.optional(v.number()),
  maximumRowsRead: v.optional(v.number()),
  maximumBytesRead: v.optional(v.number())
});

// node_modules/convex/dist/esm/server/api.js
function createApi(pathParts = []) {
  const handler = {
    get(_, prop) {
      if (typeof prop === "string") {
        const newParts = [...pathParts, prop];
        return createApi(newParts);
      } else if (prop === functionName) {
        if (pathParts.length < 2) {
          const found = ["api", ...pathParts].join(".");
          throw new Error(
            `API path is expected to be of the form \`api.moduleName.functionName\`. Found: \`${found}\``
          );
        }
        const path = pathParts.slice(0, -1).join("/");
        const exportName = pathParts[pathParts.length - 1];
        if (exportName === "default") {
          return path;
        } else {
          return path + ":" + exportName;
        }
      } else if (prop === Symbol.toStringTag) {
        return "FunctionReference";
      } else {
        return void 0;
      }
    }
  };
  return new Proxy({}, handler);
}
var anyApi = createApi();

// node_modules/convex/dist/esm/server/schema.js
var __defProp11 = Object.defineProperty;
var __defNormalProp10 = (obj, key, value) => key in obj ? __defProp11(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField10 = (obj, key, value) => __defNormalProp10(obj, typeof key !== "symbol" ? key + "" : key, value);
var TableDefinition = class {
  /**
   * @internal
   */
  constructor(documentType) {
    __publicField10(this, "indexes");
    __publicField10(this, "stagedDbIndexes");
    __publicField10(this, "searchIndexes");
    __publicField10(this, "stagedSearchIndexes");
    __publicField10(this, "vectorIndexes");
    __publicField10(this, "stagedVectorIndexes");
    __publicField10(this, "validator");
    this.indexes = [];
    this.stagedDbIndexes = [];
    this.searchIndexes = [];
    this.stagedSearchIndexes = [];
    this.vectorIndexes = [];
    this.stagedVectorIndexes = [];
    this.validator = documentType;
  }
  /**
   * This API is experimental: it may change or disappear.
   *
   * Returns indexes defined on this table.
   * Intended for the advanced use cases of dynamically deciding which index to use for a query.
   * If you think you need this, please chime in on ths issue in the Convex JS GitHub repo.
   * https://github.com/get-convex/convex-js/issues/49
   */
  " indexes"() {
    return this.indexes;
  }
  index(name, indexConfig) {
    if (Array.isArray(indexConfig)) {
      this.indexes.push({
        indexDescriptor: name,
        fields: indexConfig
      });
    } else if (indexConfig.staged) {
      this.stagedDbIndexes.push({
        indexDescriptor: name,
        fields: indexConfig.fields
      });
    } else {
      this.indexes.push({
        indexDescriptor: name,
        fields: indexConfig.fields
      });
    }
    return this;
  }
  searchIndex(name, indexConfig) {
    if (indexConfig.staged) {
      this.stagedSearchIndexes.push({
        indexDescriptor: name,
        searchField: indexConfig.searchField,
        filterFields: indexConfig.filterFields || []
      });
    } else {
      this.searchIndexes.push({
        indexDescriptor: name,
        searchField: indexConfig.searchField,
        filterFields: indexConfig.filterFields || []
      });
    }
    return this;
  }
  vectorIndex(name, indexConfig) {
    if (indexConfig.staged) {
      this.stagedVectorIndexes.push({
        indexDescriptor: name,
        vectorField: indexConfig.vectorField,
        dimensions: indexConfig.dimensions,
        filterFields: indexConfig.filterFields || []
      });
    } else {
      this.vectorIndexes.push({
        indexDescriptor: name,
        vectorField: indexConfig.vectorField,
        dimensions: indexConfig.dimensions,
        filterFields: indexConfig.filterFields || []
      });
    }
    return this;
  }
  /**
   * Work around for https://github.com/microsoft/TypeScript/issues/57035
   */
  self() {
    return this;
  }
  /**
   * Export the contents of this definition.
   *
   * This is called internally by the Convex framework.
   * @internal
   */
  export() {
    const documentType = this.validator.json;
    if (typeof documentType !== "object") {
      throw new Error(
        "Invalid validator: please make sure that the parameter of `defineTable` is valid (see https://docs.convex.dev/database/schemas)"
      );
    }
    return {
      indexes: this.indexes,
      stagedDbIndexes: this.stagedDbIndexes,
      searchIndexes: this.searchIndexes,
      stagedSearchIndexes: this.stagedSearchIndexes,
      vectorIndexes: this.vectorIndexes,
      stagedVectorIndexes: this.stagedVectorIndexes,
      documentType
    };
  }
};
function defineTable(documentSchema) {
  if (isValidator(documentSchema)) {
    return new TableDefinition(documentSchema);
  } else {
    return new TableDefinition(v.object(documentSchema));
  }
}
var SchemaDefinition = class {
  /**
   * @internal
   */
  constructor(tables, options) {
    __publicField10(this, "tables");
    __publicField10(this, "strictTableNameTypes");
    __publicField10(this, "schemaValidation");
    this.tables = tables;
    this.schemaValidation = options?.schemaValidation === void 0 ? true : options.schemaValidation;
  }
  /**
   * Export the contents of this definition.
   *
   * This is called internally by the Convex framework.
   * @internal
   */
  export() {
    return JSON.stringify({
      tables: Object.entries(this.tables).map(([tableName, definition]) => {
        const {
          indexes,
          stagedDbIndexes,
          searchIndexes,
          stagedSearchIndexes,
          vectorIndexes,
          stagedVectorIndexes,
          documentType
        } = definition.export();
        return {
          tableName,
          indexes,
          stagedDbIndexes,
          searchIndexes,
          stagedSearchIndexes,
          vectorIndexes,
          stagedVectorIndexes,
          documentType
        };
      }),
      schemaValidation: this.schemaValidation
    });
  }
};
function defineSchema(schema, options) {
  return new SchemaDefinition(schema, options);
}
var _systemSchema = defineSchema({
  _scheduled_functions: defineTable({
    name: v.string(),
    args: v.array(v.any()),
    scheduledTime: v.float64(),
    completedTime: v.optional(v.float64()),
    state: v.union(
      v.object({ kind: v.literal("pending") }),
      v.object({ kind: v.literal("inProgress") }),
      v.object({ kind: v.literal("success") }),
      v.object({ kind: v.literal("failed"), error: v.string() }),
      v.object({ kind: v.literal("canceled") })
    )
  }),
  _storage: defineTable({
    sha256: v.string(),
    size: v.float64(),
    contentType: v.optional(v.string())
  })
});

// convex/_generated/server.js
var query = queryGeneric;
var mutation = mutationGeneric;

// convex/tasks.ts
var getMatchTasks = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    return await ctx.db.query("tasks").withIndex("by_match", (q) => q.eq("matchId", args.matchId)).collect();
  }
});
var getMessages = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    return await ctx.db.query("messages").withIndex("by_match", (q) => q.eq("matchId", args.matchId)).collect();
  }
});
var sendMessage = mutation({
  args: { matchId: v.id("matches"), senderId: v.id("users"), text: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      matchId: args.matchId,
      senderId: args.senderId,
      text: args.text,
      type: "text",
      createdAt: Date.now()
    });
  }
});
var addTaskItem = mutation({
  args: { matchId: v.id("matches"), text: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    let task = await ctx.db.query("tasks").withIndex("by_match", (q) => q.eq("matchId", args.matchId)).first();
    if (!task) {
      const taskId = await ctx.db.insert("tasks", {
        matchId: args.matchId,
        type: "shared_list",
        title: "Initial Task",
        description: "Collaborative list building",
        data: { items: [] },
        completedByIds: []
      });
      task = await ctx.db.get(taskId);
    }
    if (task) {
      const items = task.data?.items || [];
      await ctx.db.patch(task._id, {
        data: {
          ...task.data,
          items: [...items, {
            id: Date.now().toString(),
            text: args.text,
            userId: args.userId,
            timestamp: "Just now"
          }]
        }
      });
    }
  }
});
var completePhase = mutation({
  args: { matchId: v.id("matches"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found");
    await ctx.db.patch(args.matchId, {
      matchLevel: (match.matchLevel || 1) + 1
    });
    const tasks = await ctx.db.query("tasks").withIndex("by_match", (q) => q.eq("matchId", args.matchId)).collect();
    for (const task of tasks) {
      await ctx.db.patch(task._id, {
        data: { items: [] }
        // Reset items for next phase in this simple model
      });
    }
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addTaskItem,
  completePhase,
  getMatchTasks,
  getMessages,
  sendMessage
});
