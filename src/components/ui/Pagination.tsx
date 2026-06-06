interface PaginationProps {
  page: number;
  onPageChange: (p: number) => void;
  /** Total pages — enables exact numbered pagination */
  totalPages?: number;
  /** Fallback when total is unknown */
  hasNext?: boolean;
}

/** Build page numbers when total is known */
function buildWithTotal(current: number, total: number): (number | "...")[] {
  if (total <= 1) return [1];

  const range = new Set<number>();
  range.add(1);
  range.add(total);
  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    range.add(i);
  }

  const sorted = Array.from(range).sort((a, b) => a - b);
  const result: (number | "...")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("...");
    result.push(sorted[i]);
  }
  return result;
}

/** Sliding window when total is unknown */
function buildSliding(current: number, hasNext: boolean): (number | "...")[] {
  const result: (number | "...")[] = [];
  const lo = Math.max(1, current - 2);
  const hi = hasNext ? current + 1 : current;
  if (lo > 1) {
    result.push(1);
    if (lo > 2) result.push("...");
  }
  for (let p = lo; p <= hi; p++) result.push(p);
  return result;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  onPageChange,
  totalPages,
  hasNext = false,
}) => {
  const pages =
    totalPages != null
      ? buildWithTotal(page, totalPages)
      : buildSliding(page, hasNext);

  const canPrev = page > 1;
  const canNext = totalPages != null ? page < totalPages : hasNext;

  return (
    <div className="flex justify-center items-center gap-1.5 mt-8 flex-wrap">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!canPrev}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#18181b] border border-zinc-700/50 text-zinc-300 text-sm disabled:opacity-30 hover:bg-[#e63946] hover:border-[#e63946] hover:text-white transition-all hover:cursor-pointer disabled:cursor-default"
      >
        ←
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`dots-${i}`}
            className="w-9 h-9 flex items-center justify-center text-zinc-500 text-sm select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all hover:cursor-pointer border ${
              p === page
                ? "bg-[#e63946] border-[#e63946] text-white shadow-md shadow-[#e63946]/20"
                : "bg-[#18181b] border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/60 hover:text-white"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!canNext}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#18181b] border border-zinc-700/50 text-zinc-300 text-sm disabled:opacity-30 hover:bg-[#e63946] hover:border-[#e63946] hover:text-white transition-all hover:cursor-pointer disabled:cursor-default"
      >
        →
      </button>
    </div>
  );
};

export default Pagination;
