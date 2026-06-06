// @ts-nocheck
import { truncateTitle } from "../../utils/function";

interface ListCardProps {
  index: number;
  img: string;
  title: string;
  link: string;
  chapter: { chapter_id: string; chapter_number: string }[];
}

const rankColor = (i: number) =>
  i === 0
    ? "text-yellow-400"
    : i === 1
    ? "text-zinc-300"
    : i === 2
    ? "text-amber-600"
    : "text-zinc-600";

const ListCard: React.FC<ListCardProps> = ({ index, img, title, link, chapter }) => {
  return (
    <a
      href={`/manhwa/${link}`}
      className="group flex items-center gap-3 px-3 py-2.5 border-b border-zinc-800/40 hover:bg-white/5 transition-all duration-200 last:border-b-0"
    >
      <span
        className={`text-sm font-bold w-5 text-center flex-shrink-0 ${rankColor(index)}`}
      >
        {index + 1}
      </span>
      <img
        src={img.split("?")[0]}
        alt="cover"
        className="w-10 h-14 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex flex-col min-w-0">
        <p className="text-white text-xs font-semibold truncate group-hover:text-[#e63946] transition-colors">
          {truncateTitle(title, 24)}
        </p>
        {chapter?.[0] && (
          <span className="text-zinc-500 text-[10px] mt-0.5">
            Ch. {chapter[0].chapter_number}
          </span>
        )}
      </div>
    </a>
  );
};

export default ListCard;
