"use client";

import { Mode } from "@/lib/rps";

export type ArenaFilter = "all" | "casual" | "ranked";

const FILTERS: Array<[ArenaFilter, string]> = [
  ["all", "All"],
  ["casual", "Casual"],
  ["ranked", "Ranked"],
];

export function matchesFilter(mode: Mode, filter: ArenaFilter): boolean {
  if (filter === "all") return true;
  return filter === "ranked" ? mode === Mode.Ranked : mode === Mode.Casual;
}

export function ArenaFilters({
  value,
  onChange,
}: {
  value: ArenaFilter;
  onChange: (filter: ArenaFilter) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter matches"
      className="inline-flex rounded-xl border border-white/10 bg-white/[0.035] p-1"
    >
      {FILTERS.map(([filter, label]) => (
        <button
          key={filter}
          type="button"
          role="tab"
          aria-selected={value === filter}
          onClick={() => onChange(filter)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            value === filter
              ? "bg-oracle-cyan/15 text-oracle-cyan"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
