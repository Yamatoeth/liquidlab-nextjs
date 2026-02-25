"use client";

import { categoryGroups } from "../../data/categories";
import type { CategoryGroup } from "../../data/categories";

interface CategoryFilterProps {
  selected: string[];
  onChange: (next: string[]) => void;
  groups?: CategoryGroup[]; // optionnel, fallback sur categoryGroups
}


const CategoryFilter = ({ selected, onChange, groups }: CategoryFilterProps) => {
  const toggle = (category: string) => {
    if (category === 'All') {
      onChange(['All'])
      return
    }

    let next = [...selected]
    if (next.includes('All')) next = next.filter((c) => c !== 'All')

    if (next.includes(category)) {
      next = next.filter((c) => c !== category)
    } else {
      next.push(category)
    }

    if (next.length === 0) next = ['All']
    onChange(next)
  }

  const categoryGroupsToUse = groups || categoryGroups;
  return (
    <div className="flex flex-col gap-4">
      {categoryGroupsToUse.map((group) => (
        <div key={group.group}>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.group}</div>
          <div className="flex flex-wrap gap-2">
            {group.categories.map((category) => (
              <button
                key={category}
                onClick={() => toggle(category)}
                className={`inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-all ${
                  selected.includes(category)
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CategoryFilter;
