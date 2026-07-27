// @ts-nocheck
import { normalizeManga, formatCount } from "../../utils/function";
import CountryBadge from "./CountryBadge";

const rankStyle = (i: number) =>
  i === 0
    ? "bg-[#EF4444] text-white"
    : i === 1
    ? "bg-zinc-500 text-white"
    : i === 2
    ? "bg-amber-700 text-white"
    : "bg-zinc-800 text-zinc-500";

/** Ranked row used in the "Terpopuler" sidebar panel. */
const ListCard = ({ index, manga, img, title, link, chapter }) => {
  const m = manga
    ? normalizeManga(manga)
    : {
        id: link,
        title: title ?? "",
        cover: img ?? "",
        views: 0,
        country: "",
        chapterNumber: chapter?.[0]?.chapter_number ?? null,
      };

  return (
    <a
      href={`/manhwa/${m.id}`}
      className="group flex items-center gap-2.5 px-3 py-2.5 border-b border-zinc-800/40 hover:bg-[#EF4444]/5 transition-all duration-200 last:border-b-0"
    >
      <span
        className={`w-5 h-5 flex items-center justify-center rounded-md text-[10px] font-black flex-shrink-0 ${rankStyle(
          index
        )}`}
      >
        {index + 1}
      </span>
      <img
        src={(m.cover || "").split("?")[0]}
        alt=""
        loading="lazy"
        className="w-9 h-12 rounded-md object-cover flex-shrink-0 bg-zinc-900"
      />
      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
        <p className="text-white text-[11px] font-semibold line-clamp-2 leading-snug group-hover:text-[#EF4444] transition-colors">
          {m.title}
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 leading-none">
          {m.chapterNumber != null && (
            <span className="text-[#EF4444] font-bold">Ch {m.chapterNumber}</span>
          )}
          {m.views > 0 && <span>{formatCount(m.views)}</span>}
          <CountryBadge code={m.country} />
        </div>
      </div>
    </a>
  );
};

export default ListCard;
