import { truncateTitle } from "../../utils/function";

interface CardProps {
  img: string;
  title: string;
  link: string;
}

const Card: React.FC<CardProps> = ({ img, title, link }) => {
  return (
    <a
      href={`/manhwa/${link.split("/")[4]}`}
      className="flex flex-wrap flex-col items-center m-1 w-[150px] max-h-[280px] rounded-md text-center"
    >
      <img src={img.split('?')[0]} alt="cover" className="min-w-full max-w-full min-h-[200px] max-h-[200px] rounded-md" />

      <div className="card-content">
      <h2 className="card-title text-wrap font-bold truncate">{truncateTitle(title)}</h2>
      {/* <p className="card-description">Description</p> */}
      </div>
    </a>
  );
};

export default Card;
