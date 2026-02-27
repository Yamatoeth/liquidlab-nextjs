"use client";
import React, { useState, useEffect, useRef } from "react";
import { ParamsSchema, Params } from "@/lib/params/types";

type Props = {
  schema: ParamsSchema;
  params?: Params;
  onChange?: (params: Params) => void;
};

const ParameterControls: React.FC<Props> = ({ schema, params = {}, onChange }) => {
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
        window.postMessage({ type: "params:update", params: local }, "*");
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
                  value={typeof local[s.key] === "number" ? local[s.key] : Number(range.min)}
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
              <input
                type="color"
                value={local[s.key] ?? "#ffffff"}
                onChange={(e) => {
                  const v = (e.target as HTMLInputElement).value;
                  const next = { ...local, [s.key]: v };
                  setLocal(next);
                }}
              />
            )}

            {s.type === "select" && (
              <select
                value={local[s.key]}
                onChange={(e) => {
                  const v = e.target.value;
                  const next = { ...local, [s.key]: v };
                  setLocal(next);
                }}
              >
                {s.options?.map((o) => (
                  <option key={String(o.value)} value={String(o.value)}>
                    {o.label}
                  </option>
                ))}
              </select>
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
