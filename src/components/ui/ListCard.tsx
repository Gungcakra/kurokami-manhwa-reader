import { truncateTitle } from "../../utils/function";

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
      href={`/manhwa/${link.split("/")[4]}`}
      className="flex items-start justify-start m-1 w-[280px] max-h-[120px] rounded-md text-center"
    >
      <p className="text-white h-full px-1 border-2 text-center flex items-center justify-center">
        {index}
      </p>
      <img
        src={img}
        alt="cover"
        className="max-w-[60px] max-h[80px] rounded-md"
      />

      <div className="flex flex-col items-start ml-1">
        <p className="text-wrap font-bold truncate">
          {truncateTitle(title)}
        </p>
        <p>{chapter}</p>
        <p>{rating}</p>
        {/* <p className="ListCard-description">Description</p> */}
      </div>
    </a>
  );
};

export default ListCard;
