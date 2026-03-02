"use client";

import { categoryGroups } from "../../data/categories";
import type { CategoryGroup } from "../../data/categories";
import { Search, X } from "lucide-react";

interface CategoryFilterProps {
  selected: string[];
  onChange: (next: string[]) => void;
  groups?: CategoryGroup[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const CategoryFilter = ({ selected, onChange, groups, searchQuery = "", onSearchChange }: CategoryFilterProps) => {
  const toggle = (category: string) => {
    if (category === "All") {
      onChange(["All"]);
      return;
    }

    let next = [...selected];
    if (next.includes("All")) next = next.filter((c) => c !== "All");

    if (next.includes(category)) {
      next = next.filter((c) => c !== category);
    } else {
      next.push(category);
    }

    if (next.length === 0) next = ["All"];
    onChange(next);
  };

  const categoryGroupsToUse = groups || categoryGroups;

  return (
    <div className="flex flex-col gap-5">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Search animations..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full rounded-lg border border-[rgba(216,178,110,0.24)] bg-[rgba(19,26,35,0.5)] py-2 pl-10 pr-10 text-sm placeholder-muted-foreground transition-all focus:border-[rgba(216,178,110,0.6)] focus:bg-[rgba(19,26,35,0.75)] focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange?.("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-5">
        {categoryGroupsToUse.map((group) => (
          <div key={group.group}>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {group.group}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.categories.map((category) => (
                <button
                  key={category}
                  onClick={() => toggle(category)}
                  className={`inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold transition-all ${
                    selected.includes(category)
                      ? "border border-[rgba(216,178,110,0.6)] bg-[rgba(216,178,110,0.18)] text-primary"
                      : "border border-[rgba(216,178,110,0.24)] bg-[rgba(19,26,35,0.75)] text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
