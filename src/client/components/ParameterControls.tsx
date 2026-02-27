"use client";
import React, { useState, useEffect, useRef } from "react";
import { ParamsSchema, Params } from "@/lib/params/types";

type Props = {
  schema: ParamsSchema;
  params?: Params;
  onChange?: (params: Params) => void;
  targetId?: string;
};

const ParameterControls: React.FC<Props> = ({ schema, params = {}, onChange, targetId }) => {
  const [local, setLocal] = useState<Params>(() => {
    const out: Params = {};
    for (const e of schema) out[e.key] = params[e.key] ?? e.default ?? (e.type === "boolean" ? false : "");
    return out;
  });

  // compare only the keys defined in the schema with basic coercion
  const equalForSchema = (a: Params = {}, b: Params = {}) => {
    for (const e of schema) {
      let av = a[e.key];
      let bv = b[e.key];
      if (e.type === "number") {
        av = typeof av === "number" ? av : Number(av ?? 0);
        bv = typeof bv === "number" ? bv : Number(bv ?? 0);
      }
      if (e.type === "boolean") {
        av = !!av;
        bv = !!bv;
      }
      if (av !== bv) return false;
    }
    return true;
  };

  // guard against runaway sync attempts: allow N attempts per window
  const MAX_SYNC_ATTEMPTS = 6;
  const SYNC_WINDOW_MS = 1000;
  const syncAttemptsRef = React.useRef(0);
  const syncWindowStartRef = React.useRef<number>(Date.now());
  // keep local in sync with incoming `params` but avoid triggering
  // a state update unless values actually differ (prevents update loop)
  // depend only on `params` (schema is expected to be stable)
  useEffect(() => {
    const resolved: Params = {};
    for (const e of schema) {
      let v = params[e.key];
      if (v === undefined) v = e.default;
      if (v === undefined) v = e.type === "boolean" ? false : "";
      // coerce numbers sent as strings
      if (e.type === "number") v = typeof v === "number" ? v : Number(v ?? 0);
      if (e.type === "boolean") v = !!v;
      resolved[e.key] = v;
    }

    if (!equalForSchema(resolved, local)) {
      const now = Date.now();
      if (now - syncWindowStartRef.current > SYNC_WINDOW_MS) {
        syncWindowStartRef.current = now;
        syncAttemptsRef.current = 0;
      }
      if (syncAttemptsRef.current >= MAX_SYNC_ATTEMPTS) {
        if (process.env.NODE_ENV !== "production")
          console.warn("ParameterControls: max sync attempts reached — skipping setLocal to avoid update loop");
      } else {
        syncAttemptsRef.current++;
        setLocal(resolved);
      }
    }
  }, [params]);

  // keep a stable reference to parent's onChange to avoid
  // re-running effects when parent passes an unstable callback
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // refs for hidden color inputs keyed by param key
  const colorInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  // notify parent and broadcast to iframe/children on every local change
  useEffect(() => {
    // avoid echoing identical values back to the parent which can
    // cause an update cycle if the parent resends the same object
    if (!equalForSchema(local, params)) {
      try {
        onChangeRef.current?.(local);
      } catch (e) {
        if (process.env.NODE_ENV !== "production") console.warn("ParameterControls: onChange threw", e);
      }
      try {
        // broadcast params so embedded animations can react immediately
        const message: Record<string, unknown> = { type: "params:update", params: local };
        // include explicit targetId prop when provided by parent
        if (targetId) message.animationId = targetId;
        // fallback: some callers may attach a __animationId on params
        if (!message.animationId && (params as any).__animationId) message.animationId = (params as any).__animationId;
        window.postMessage(message, "*");
      } catch (e) {
        if (process.env.NODE_ENV !== "production") console.warn("ParameterControls: postMessage failed", e);
      }
    }
  }, [local, params]);

  return (
    <div className="space-y-4">
      {schema.length === 0 && <div className="text-sm text-muted-foreground">No adjustable parameters.</div>}
      {schema.map((s) => {
        // sensible defaults for controls when schema doesn't provide ranges
        const fallback = {
          speed: { min: 0.1, max: 5, step: 0.01 },
          intensity: { min: 0, max: 3, step: 0.01 },
          particleSize: { min: 0.2, max: 3, step: 0.01 },
          offsetY: { min: -0.5, max: 0.5, step: 0.01 },
          particleCount: { min: 1, max: 2000, step: 1 },
          hueShift: { min: 0, max: 360, step: 1 },
        } as Record<string, { min: number; max: number; step: number }>;

        const range = {
          min: s.min ?? (fallback[s.key]?.min ?? 0),
          max: s.max ?? (fallback[s.key]?.max ?? 1),
          step: s.step ?? (fallback[s.key]?.step ?? 0.01),
        };
        const currentValue = local[s.key];
        const numberValue = typeof currentValue === "number" ? currentValue : Number(range.min);
        const colorValue = typeof currentValue === "string" ? currentValue : "#ffffff";

        return (
          <div key={s.key} className="flex flex-col">
            <label className="mb-1 text-sm font-medium">{s.label || s.key}</label>

            {s.type === "number" && (
              <div className="flex items-center gap-3">
                <input
                  aria-label={s.key}
                  type="range"
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={numberValue}
                  onChange={(e) => {
                    const v = Number((e.target as HTMLInputElement).value);
                    const next = { ...local, [s.key]: v };
                    setLocal(next);
                  }}
                  className="flex-1"
                />
                <div className="w-20 text-right text-sm font-mono">{Number(local[s.key]).toFixed(range.step >= 1 ? 0 : 2)}</div>
              </div>
            )}

            {s.type === "color" && (
              <div className="flex items-center gap-3">
                <input
                  aria-hidden
                  style={{ position: "absolute", left: -9999 }}
                  type="color"
                  value={colorValue}
                  onChange={(e) => {
                    const v = (e.target as HTMLInputElement).value;
                    const next = { ...local, [s.key]: v };
                    setLocal(next);
                  }}
                  ref={(el) => {
                    // store ref for the key so the swatch can trigger it
                    (colorInputsRef.current as any)[s.key] = el;
                  }}
                />
                <button
                  type="button"
                  onClick={() => (colorInputsRef.current as any)[s.key]?.click?.()}
                  aria-label={s.label || s.key}
                  className="inline-flex items-center gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-md border border-[rgba(255,255,255,0.06)] shadow-inner"
                    style={{ background: colorValue }}
                  />
                </button>
                <div className="text-sm font-mono">{String(local[s.key] ?? "#ffffff").toUpperCase()}</div>
              </div>
            )}

            {s.type === "select" && (() => {
              // Normalize options into { value, label }
              const normalized = (s.options || []).map((o: any, i: number) => {
                if (o && typeof o === "object") return { value: String(o.value), label: String(o.label ?? o.value) };
                return { value: String(o), label: String(o) };
              });

              // Special UI for palette selection: show swatch preview buttons
              if (s.key === "palette") {
                const paletteMap: Record<string, string[]> = {
                  neon: ['#7df9ff','#ff64ff','#ffdc32','#50ff78'],
                  cool: ['#7df9ff','#66d9ff','#3cc8ff','#7fffd4'],
                  warm: ['#ff7a7a','#ffb86b','#ffd36b','#fff08a'],
                  monochrome: ['#ffffff','#dddddd','#aaaaaa','#777777'],
                };

                return (
                  <div className="flex gap-2">
                    {normalized.map((opt, i) => {
                      const cols = paletteMap[opt.value] || paletteMap[opt.label.toLowerCase()] || ['#000','#333','#666','#999'];
                      const selected = String(local[s.key]) === opt.value;
                      return (
                        <button
                          key={`${s.key}-pal-${opt.value}-${i}`}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setLocal({ ...local, [s.key]: opt.value })}
                          className={`flex items-center gap-2 px-2 py-1 rounded border ${selected ? 'ring-2 ring-offset-1 ring-primary' : 'border-[rgba(255,255,255,0.04)]'}`}>
                          <div className="flex -space-x-1">
                            {cols.slice(0,4).map((c, j) => (
                              <span key={j} className="w-5 h-5 rounded-sm border" style={{ background: c, display: 'inline-block', marginLeft: j === 0 ? 0 : -6 }} />
                            ))}
                          </div>
                          <div className="text-sm ml-2">{opt.label}</div>
                        </button>
                      );
                    })}
                  </div>
                );
              }

              // Fallback: simple select for other keys
              return (
                <select
                  value={String(local[s.key] ?? "")}
                  onChange={(e) => {
                    const v = e.target.value;
                    const next = { ...local, [s.key]: v };
                    setLocal(next);
                  }}
                >
                  {normalized.map((opt, i) => (
                    <option key={`${s.key}-opt-${opt.value}-${i}`} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              );
            })()}

            {s.type === "text" && (
              <input
                type="text"
                value={String(local[s.key] ?? "")}
                onChange={(e) => {
                  const v = e.target.value;
                  const next = { ...local, [s.key]: v };
                  setLocal(next);
                }}
                className="rounded border border-[rgba(216,178,110,0.2)] bg-[rgba(16,22,30,0.75)] px-3 py-2 text-sm"
              />
            )}

            {s.type === "boolean" && (
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!local[s.key]}
                  onChange={(e) => {
                    const v = e.target.checked;
                    const next = { ...local, [s.key]: v };
                    setLocal(next);
                  }}
                />
                <span className="text-sm">{local[s.key] ? 'On' : 'Off'}</span>
              </label>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ParameterControls;
