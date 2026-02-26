"use client";
import { Grid, List, Maximize } from "lucide-react";

type Props = {
  value: "list" | "grid3" | "grid6";
  onChange: (v: "list" | "grid3" | "grid6") => void;
};

export default function DisplayModeToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[rgba(216,178,110,0.3)] bg-[rgba(16,22,30,0.75)] p-1">
      <button
        aria-label="List view"
        onClick={() => onChange("list")}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
          value === "list" ? "bg-[rgba(216,178,110,0.24)] text-primary" : "text-muted-foreground"
        }`}
      >
        <List className="h-4 w-4" />
        List
      </button>

      <button
        aria-label="Grid 3 columns"
        onClick={() => onChange("grid3")}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
          value === "grid3" ? "bg-[rgba(216,178,110,0.24)] text-primary" : "text-muted-foreground"
        }`}
      >
        <Grid className="h-4 w-4" />
        Grid 3
      </button>

      <button
        aria-label="Grid 6 columns"
        onClick={() => onChange("grid6")}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
          value === "grid6" ? "bg-[rgba(216,178,110,0.24)] text-primary" : "text-muted-foreground"
        }`}
      >
        <Maximize className="h-4 w-4" />
        Grid 6
      </button>
    </div>
  );
}
