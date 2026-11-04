// Minimal JSON Schema validator: supports the keywords used by AOH schemas
// (type, required, enum, properties, additionalProperties, items, minLength,
// minimum, maximum). Zero dependencies on purpose.

const typeOf = (v) =>
  v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v;

const matchesType = (v, t) => typeOf(v) === t || (t === 'number' && typeOf(v) === 'integer');

export function validate(schema, value, path = '$') {
  const errors = [];
  if (schema.type && !matchesType(value, schema.type)) {
    return [`${path}: expected ${schema.type}, got ${typeOf(value)}`];
  }
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${path}: ${JSON.stringify(value)} is not one of ${schema.enum.join(', ')}`);
  }
  if (typeof value === 'string' && schema.minLength != null && value.length < schema.minLength) {
    errors.push(`${path}: shorter than ${schema.minLength}`);
  }
  if (typeof value === 'number') {
    if (schema.minimum != null && value < schema.minimum) errors.push(`${path}: below ${schema.minimum}`);
    if (schema.maximum != null && value > schema.maximum) errors.push(`${path}: above ${schema.maximum}`);
  }
  if (typeOf(value) === 'object') {
    for (const key of schema.required ?? []) {
      if (!(key in value)) errors.push(`${path}: missing required "${key}"`);
    }
    const props = schema.properties ?? {};
    for (const [key, v] of Object.entries(value)) {
      if (props[key]) errors.push(...validate(props[key], v, `${path}.${key}`));
      else if (schema.additionalProperties === false) errors.push(`${path}: unexpected "${key}"`);
    }
  }
  if (Array.isArray(value) && schema.items) {
    value.forEach((item, i) => errors.push(...validate(schema.items, item, `${path}[${i}]`)));
  }
  return errors;
}

const KNOWN = new Set([
  '$schema', '$id', 'title', 'description', 'type', 'required', 'enum', 'properties',
  'additionalProperties', 'items', 'minLength', 'minimum', 'maximum',
]);

// Lists keywords the validator would silently ignore, so a schema edit can't
// quietly weaken the contract.
export function unsupportedKeywords(schema, path = '$') {
  if (typeof schema !== 'object' || schema === null) return [];
  const out = Object.keys(schema).filter((k) => !KNOWN.has(k)).map((k) => `${path}.${k}`);
  for (const [k, sub] of Object.entries(schema.properties ?? {})) {
    out.push(...unsupportedKeywords(sub, `${path}.properties.${k}`));
  }
  if (schema.items) out.push(...unsupportedKeywords(schema.items, `${path}.items`));
  return out;
}
