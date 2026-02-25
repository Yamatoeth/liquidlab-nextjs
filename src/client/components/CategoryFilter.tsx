"use client";
import { categories } from "@/data/snippets";

interface CategoryFilterProps {
  selected: string[];
  onChange: (next: string[]) => void;
}

const CategoryFilter = ({ selected, onChange }: CategoryFilterProps) => {
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

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
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
  )
}

export default CategoryFilter;
