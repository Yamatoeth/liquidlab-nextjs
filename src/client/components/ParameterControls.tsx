"use client";
import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    setLocal((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const e of schema) {
        const resolved = params[e.key] ?? e.default ?? next[e.key];
        if (next[e.key] !== resolved) {
          next[e.key] = resolved;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [schema, params]);

  useEffect(() => {
    onChange?.(local);
  }, [local, onChange]);

  return (
    <div className="space-y-4">
      {schema.map((s) => (
        <div key={s.key} className="flex flex-col">
          <label className="mb-1 text-sm font-medium">{s.label || s.key}</label>
          {s.type === "number" && (
            <input
              type="range"
              min={s.min ?? 0}
              max={s.max ?? 1}
              step={s.step ?? 0.01}
              value={local[s.key] as number}
              onChange={(e) => setLocal({ ...local, [s.key]: Number(e.target.value) })}
            />
          )}
          {s.type === "color" && (
            <input type="color" value={local[s.key] ?? "#ffffff"} onChange={(e) => setLocal({ ...local, [s.key]: e.target.value })} />
          )}
          {s.type === "select" && (
            <select value={local[s.key]} onChange={(e) => setLocal({ ...local, [s.key]: e.target.value })}>
              {s.options?.map((o) => (
                <option key={String(o.value)} value={String(o.value)}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
          {s.type === "boolean" && (
            <input type="checkbox" checked={!!local[s.key]} onChange={(e) => setLocal({ ...local, [s.key]: e.target.checked })} />
          )}
        </div>
      ))}
    </div>
  );
};

export default ParameterControls;
