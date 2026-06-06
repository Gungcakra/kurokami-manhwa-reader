import { truncateTitle } from "../../utils/function";

interface CardSliderProps {
  img: string;
  title: string;
  link: string;
  chapter?: string;
  rating?: string | null;
}

const CardSlider: React.FC<CardSliderProps> = ({ img, title, link, chapter, rating }) => {
  return (
    <a
      href={`/manhwa/${link}`}
      className="group flex-shrink-0 w-[130px] md:w-[160px] rounded-xl overflow-hidden bg-[#18181b] border border-zinc-800/50 hover:border-[#e63946]/40 hover:shadow-lg hover:shadow-[#e63946]/10 transition-all duration-300"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {rating && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
            <svg className="w-2.5 h-2.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white text-[10px]">{rating}</span>
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="text-white text-xs font-semibold truncate group-hover:text-[#e63946] transition-colors">
          {truncateTitle(title, 22)}
        </p>
        {chapter && (
          <p className="text-zinc-400 text-[10px] mt-0.5">Ch. {chapter}</p>
        )}
      </div>
    </a>
  );
};

export default CardSlider;
