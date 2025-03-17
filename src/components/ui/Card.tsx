// @ts-nocheck
import { truncateTitle } from "../../utils/function";
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
  return (
    <div className="flex items-start gap-4 border-t border-gray-500 bg-accent p-3">
      <a
        className="w-24 h-28 flex-shrink-0 relative"
        href={`/manhwa/${link}`}
      >
        <img
          src={img}
          alt={title}
          className="h-full w-full object-fill rounded-lg transition-transform transform hover:scale-105 duration-300"
        />
      </a>
      <div className="flex flex-col w-full justify-between overflow-hidden">
        <a
          className="text-sm font-semibold cursor-pointer text-white truncate transition-all 300 ease-in-out hover:text-[#6B69F1]"
          href={`/manhwa/${link}`}
        >
          {truncateTitle(title)}
        </a>
        {chapter &&
          chapter.map((ch, index) => (
            <div className="mt-2" key={index}>
              <a
                className="flex items-center justify-between text-gray-200 transition-all 300 ease-in-out hover:text-[#6B69F1] text-xs"
                href={`/chapter/${ch.chapter_id}`}
              >
                <div className="flex gap-1 items-center">
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 24 24"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 7a5 5 0 1 1 -4.995 5.217l-.005 -.217l.005 -.217a5 5 0 0 1 4.995 -4.783z"></path>
                  </svg>
                  <span>Chapter {ch.chapter_number}</span>
                </div>
                <span>
                  {(() => {
                  const now = new Date();
                  const createdAt = new Date(ch.created_at);
                  const diff = now.getTime() - createdAt.getTime();
                  const diffInHours = Math.floor(diff / (1000 * 60 * 60));
                  const diffInMinutes = Math.floor(diff / (1000 * 60));
                  const diffInSeconds = Math.floor(diff / 1000);

                  if (diffInHours < 24) {
                    if (diffInMinutes < 60) {
                    if (diffInSeconds < 60) {
                      return `${diffInSeconds} detik yang lalu`;
                    }
                    return `${diffInMinutes} menit yang lalu`;
                    }
                    return `${diffInHours} jam yang lalu`;
                  }

                  return createdAt.toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                  })()}
                </span>
              </a>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Card;
