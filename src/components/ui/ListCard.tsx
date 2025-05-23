// @ts-nocheck
import { truncateTitle } from "../../utils/function";

interface ListCardProps {
  index: number;
  img: string;
  title: string;
  link: string;
  chapter: {
    chapter_id: string;
    chapter_number: string;
  };
}

const ListCard: React.FC<ListCardProps> = ({
  index,
  img,
  title,
  link,
  chapter,
}) => {
  return (
    <a
      href={`/manhwa/${link}`}
      className="flex border-t border-gray-500 items-start justify-start m-1 xl:w-[280px] xl:max-h-[120px] rounded-md text-center"
    >
 
      <img
        src={img.split('?')[0]}
        alt="cover"
        className="xl:max-w-[60px] lg:max-w-[100px] md:max-w-[100px] sm:max-w-[80px] max-w-[80px] min-h-full max-h-full rounded-md"
      />

      <div className="flex flex-col items-start ml-2">
        <p className="font-semibold duration-300 ease-in-out hover:text-[#6B69F1]">{truncateTitle(title, 20)}</p>
        <a href={`/chapter/${chapter[0].chapter_id}`} className="duration-300 ease-in-out hover:text-[#6B69F1]">Chapter {chapter[0].chapter_number}</a>
        {/* <p className="ListCard-description">Description</p> */}
      </div>
    </a>
  );
};

export default ListCard;
