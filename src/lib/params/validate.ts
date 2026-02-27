import { ParamsSchema, ParamSchemaEntry } from "./types";

export function validateSchema(schema: any): schema is ParamsSchema {
  if (!Array.isArray(schema)) return false;
  for (const s of schema) {
    if (typeof s !== "object" || typeof s.key !== "string" || typeof s.type !== "string") return false;
  }
  return true;
}

export function applyDefaults(schema: ParamsSchema, params?: Record<string, any>) {
  const out: Record<string, any> = Object.assign({}, params || {});
  for (const e of schema) {
    if (out[e.key] === undefined) {
      out[e.key] = e.default !== undefined ? e.default : defaultForType(e);
    }
  }
  return out;
}

function defaultForType(entry: ParamSchemaEntry) {
  switch (entry.type) {
    case "number":
      return entry.default ?? entry.min ?? 0;
    case "color":
      return entry.default ?? "#ffffff";
    case "select":
      return entry.default ?? (entry.options && entry.options[0] ? entry.options[0] : null);
    case "boolean":
      return entry.default ?? false;
    case "text":
      return entry.default ?? "";
    default:
      return null;
  }
}
