import { truncateTitle } from "../../utils/function";
interface CardSliderProps {
  img: string;
  title: string;
  link: string;
  chapter?: string;
}

const CardSlider: React.FC<CardSliderProps> = ({ img, title, link, chapter }) => {
  return (
    <a href={`manhwa/${link.split("/")[4]}`} className="flex flex-col items-center rounded-md xl:w-[250px] w-[150px] bg-accent overflow-hidden mb-4">
        <img src={img.split('?')[0]} alt="image" className="rounded-t-md xl:h-[300px]  h-[200px] w-full object-cover hover:scale-105 duration-300 hover:cursor-pointer" />
        <p className="text-center text-white font-semibold mt-2 xl:text-lg text-xs transition-all 300 ease-in-out hover:text-[#6B69F1] hover:cursor-pointer">{truncateTitle(title)}</p>
        {chapter && <p className="text-center text-white font-medium mt-1 xl:text-lg text-xs">{chapter}</p>}
    </a>
  );
};

export default CardSlider;
