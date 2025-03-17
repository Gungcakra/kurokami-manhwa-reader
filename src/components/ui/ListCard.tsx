import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { truncateTitle } from "../../utils/function";
import { faStar } from "@fortawesome/free-solid-svg-icons";

interface ListCardProps {
  index: number;
  img: string;
  title: string;
  link: string;
  chapter: string;
  rating: string;
}

const ListCard: React.FC<ListCardProps> = ({
  index,
  img,
  title,
  link,
  chapter,
  rating,
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
        <p className="text-wrap text-start truncate text-md transition-all duration-300 ease-in-out hover:text-[#6B69F1] text-white font-semibold">
          {title}
        </p>
        <p>{chapter}</p>
        <p><FontAwesomeIcon icon={faStar} className="text-yellow-300"/> {rating}</p>
        {/* <p className="ListCard-description">Description</p> */}
      </div>
    </a>
  );
};

export default ListCard;
