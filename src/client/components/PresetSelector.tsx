"use client";
import React from "react";

type Preset = {
  id: string;
  title: string;
  params: Record<string, any>;
  thumbnail?: string;
};

type Props = {
  presets?: Preset[];
  onApply?: (preset: Preset) => void;
};

const PresetSelector: React.FC<Props> = ({ presets = [], onApply }) => {
  if (!presets || presets.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">Presets</div>
      <div className="grid grid-cols-3 gap-2">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => onApply?.(p)}
            className="flex flex-col items-start gap-2 rounded border p-2 text-left hover:bg-[rgba(255,255,255,0.02)]"
          >
            {p.thumbnail ? <img src={p.thumbnail} alt={p.title} className="h-16 w-full object-cover" /> : <div className="h-16 w-full bg-muted-foreground/6" />}
            <div className="text-sm font-medium">{p.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PresetSelector;
