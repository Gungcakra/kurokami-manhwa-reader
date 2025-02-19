import { useEffect, useState } from "react";
import { fetchManhwaDetail } from "../utils/api";
import { removeTextTitle } from "../utils/function";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDownUpAcrossLine } from "@fortawesome/free-solid-svg-icons";
import ButtonCorner from "../components/ui/ButtonCorner";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
interface DetailProps {
  id: string;
}

const Detail = ({ id }: DetailProps) => {
  const [manhwa, setManhwa] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isReversed, setIsReversed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const manhwaDetail = await fetchManhwaDetail(id);
        setManhwa(manhwaDetail);
      } catch (error) {
        console.error("Error fetching manhwa data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleOrder = () => {
    setIsReversed(!isReversed);
  };
  let chapters = [];
  if (manhwa != null) {
    chapters = isReversed ? [...manhwa.chapters].reverse() : manhwa.chapters;
  }

  return (
    <div className="bg-[#09090B] min-w-full text-white w-full min-h-full pt-20 flex  flex-col items-center">
      <Navbar />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-[#18181B] flex flex-col lg:flex-row w-full m-4 p-4 rounded-2xl justify-center items-center lg:items-start gap-6">
            
          <div className="flex-shrink-0 flex justify-center lg:justify-start xl:w-auto lg:w-auto w-full">
            <img
              src={manhwa.imageSrc}
              alt="cover"
              className="xl:w-56 lg:w-48 w-40 max-h-auto rounded-2xl object-cover"
            />
          </div>

          <div className="flex flex-col justify-start flex-grow min-w-0 text-center lg:text-left">
            <p className="xl:text-4xl lg:text-2xl text-xl w-full text-wrap font-bold m-1 break-words">
              {removeTextTitle(manhwa.title, "Bahasa Indonesia")}
            </p>

            <div className="flex flex-col p-4 rounded-lg w-full gap-y-2 text-start max-w-2/3">
              <p className="text-white font-semibold xl:text-xl md:text-md text-sm">
                <b>Alternative </b> {manhwa.alternative}
              </p>
              <p className="text-white font-semibold xl:text-xl md:text-md text-sm">
                <b>Rating </b> {manhwa.rating}
              </p>
              <p className="text-white font-semibold xl:text-xl md:text-md text-sm">
                <b>Author(s) </b> {manhwa.author}
              </p>
              <p className="text-white font-semibold xl:text-xl md:text-md text-sm">
                <b>Artist(s) </b> {manhwa.artist}
              </p>
              <p className="text-white font-semibold xl:text-xl md:text-md text-sm">
                <b>Genre(s) </b>
                {manhwa.genres
                  ?.map((genre: { genreName: string; genreLink: string }) => (
                    <a
                      key={genre.genreName}
                      href={genre.genreLink}
                      className="hover:underline"
                    >
                      {genre.genreName}
                    </a>
                  ))
                  .reduce((prev, curr) => [prev, ", ", curr])}
              </p>
              <p className="text-white font-semibold xl:text-xl md:text-md text-sm">
                <b>Type </b> {manhwa.type}
              </p>
              <p className="text-white font-semibold xl:text-xl md:text-md text-sm">
                <b>Status </b> {manhwa.status}
              </p>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="w-full mx-4 bg-[#18181B] rounded-2xl p-4 m-4 ">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xl font-bold">All Chapters</p>
            <button
              onClick={toggleOrder}
              className="text-white font-bold py-2 px-4 text-lg hover:cursor-pointer rounded-md"
            >
              <FontAwesomeIcon icon={faArrowDownUpAcrossLine} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {chapters?.map((chapter) => (
              <a
                key={chapter.chapterTitle}
                href={chapter.chapterLink}
                className="bg-[#C11B25] duration-300 ease-in-out hover:bg-[#c11b26ae] text-white rounded-md p-3 text-xl font-bold text-center"
              >
                {chapter.chapterNum}
              </a>
            ))}
          </div>
        </div>
      )}
      <ButtonCorner />
      <Footer />
    </div>
  );
};

export default Detail;
