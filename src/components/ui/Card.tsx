// @ts-nocheck
import { truncateTitle, timeAgo } from "../../utils/function";

interface Chapter {
  chapter_id: string;
  chapter_number: string;
  created_at: string;
}

interface CardProps {
  img: string;
  title: string;
  link: string;
  chapter?: Chapter[];
}

const Card: React.FC<CardProps> = ({ img, title, link, chapter }) => {
  const latest = chapter?.[0];
  return (
    <a
      href={`/manhwa/${link}`}
      className="group flex flex-col rounded-xl overflow-hidden bg-[#18181b] hover:bg-[#232328] transition-all duration-300 border border-zinc-800/50 hover:border-[#e63946]/40 hover:shadow-lg hover:shadow-[#e63946]/10"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {latest && (
          <div className="absolute bottom-0 left-0 right-0 p-1.5">
            <span className="text-white text-[10px] font-medium bg-[#e63946]/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
              Ch. {latest.chapter_number}
            </span>
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="text-white text-xs font-semibold line-clamp-2 group-hover:text-[#e63946] transition-colors leading-tight">
          {truncateTitle(title, 40)}
        </p>
        {latest?.created_at && (
          <p className="text-zinc-400 text-xs mt-1">{timeAgo(latest.created_at)}</p>
        )}
      </div>
    </a>
  );
};

export default Card;
