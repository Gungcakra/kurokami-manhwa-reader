import { useEffect, useState } from "react";
import { fetchChapterListDetailShinigami, fetchDetailShinigami, fetchManhwaDetail } from "../utils/api";
import { removeTextTitle, timeStampToTime } from "../utils/function";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDownUpAcrossLine,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import ButtonCorner from "../components/ui/ButtonCorner";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import kuru from "../assets/images/kuru.webp";
interface DetailProps {
  id: string;
}

const Detail = ({ id }: DetailProps) => {
  const [manhwa, setManhwa] = useState<any>(null);
  const [chapterList, setChapterList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingChapter, setLoadingChapter] = useState(true);
  const [isReversed, setIsReversed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const manhwaDetail = await fetchDetailShinigami(id);
        setManhwa(manhwaDetail.data);
        
      } catch (error) {
        console.error("Error fetching manhwa data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const chapterData = await fetchChapterListDetailShinigami(id);
        setChapterList(chapterData.data);
        
      } catch (error) {
        console.error("Error fetching manhwa data:", error);
      } finally {
        setLoadingChapter(false);
      }
    };

    fetchData();
  }, []);

  const toggleOrder = () => {
    setIsReversed(!isReversed);
  };
  let chapters = [];
  if (chapterList != null) {
    chapters = isReversed ? [...chapterList].reverse() : chapterList;
  }

  return (
    <div className="bg-[#09090B] min-w-full text-white w-full min-h-full flex flex-col items-center">
      {loading ? (
        <div className="w-full min-h-screen flex justify-center items-center">
          <img src={kuru.src} alt="loading" width={300} height={300} />
        </div>
      ) : (
        <>
          <div className="bg-accent flex flex-col xl:flex-row lg:flex-row w-full m-4 p-4 rounded-2xl justify-center items-center lg:items-start gap-6">
            <div className="flex-shrink-0 flex justify-center lg:justify-start xl:w-auto lg:w-auto w-full">
              <img
              src={manhwa.cover_image_url}
              alt="cover"
              className="xl:w-56 lg:w-56 w-70 max-h-auto rounded-2xl object-cover"
              />
            </div>
            <div className="flex flex-col justify-start flex-grow min-w-0 text-center lg:text-left">
              <p className="xl:text-2xl lg:text-2xl text-xl w-full text-wrap font-bold m-1 break-words">
              {manhwa.title}
              </p>
              <div className="flex flex-col m-1 rounded-lg w-full gap-y-2 text-start max-w-2/3">
              <p className="text-white xl:text-lg md:text-md text-sm">
                Alternative {manhwa.alternative_title}
              </p>
              <p className="text-white xl:text-lg md:text-md text-sm">
                Rating {manhwa.user_rate}
              </p>
              <p className="text-white xl:text-lg md:text-md text-sm">
                Author(s) {manhwa.taxonomy?.Author.map((author) => author.name).join(", ")}
              </p>
              <p className="text-white xl:text-lg md:text-md text-sm">
                Artist(s) {manhwa.taxonomy?.Artist?.map((artist) => artist.name).join(", ")}
              </p>
              <p className="text-white xl:text-lg md:text-md text-sm">
                Genre(s){" "}
                {manhwa.taxonomy?.Genre?.map((genre, index) => (
                <span key={genre.slug}>
                  {index > 0 && ", "}
                  <a href={`#${genre.slug}`} className="hover:underline">
                  {genre.name}
                  </a>
                </span>
                ))}
              </p>
              <p className="text-white xl:text-lg md:text-md text-sm">
                Type {manhwa.taxonomy?.Type?.map((type) => type.name).join(", ")}
              </p>
              <p className="text-white xl:text-lg md:text-md text-sm">
                Status {manhwa.status === 1 ? "Ongoing" : "Completed"}
              </p>
              </div>
            </div>
          </div>
          <div className="w-full mx-4 bg-secondary rounded-2xl p-4 m-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-xl font-bold">All Chapters</p>
              <button
                onClick={toggleOrder}
                className="text-white font-bold py-2 px-4 text-lg hover:cursor-pointer rounded-md bg-primary"
              >
                Sort <FontAwesomeIcon icon={faArrowDownUpAcrossLine} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
              {chapters?.map((chapter) => (
                <div
                  key={chapter.chapter_id}
                  className="bg-accent duration-300 ease-in-out text-white hocver:text-primarys rounded-md p-3 flex justify-between items-center border-1 border-gray-400"
                >
                  <div className="flex w-2/4">
                  <img src={chapter.thumbnail_image_url} alt="" className="rounded-md w-40"/>

                  </div>
                  <div className="flex flex-col w-2/4 h-full ">
                    <a
                      className="xl:text-md lg:text-md text-md font-semibold duration-300 hover:text-[#6B69F1]"
                      href={`/chapter/${chapter.chapter_id}`}
                    >
                      Chapter {chapter.chapter_number}
                    </a>
                    <p className="text-gray-400 xl:text-md lg:text-md text-md">
                        {new Date(chapter.release_date).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                        })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <ButtonCorner />
      <Footer />
    </div>
  );
};

export default Detail;
