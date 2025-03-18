// @ts-nocheck
import { useEffect, useState } from "react";
import {
  fetchChapterListDetailShinigami,
  fetchDetailShinigami,
} from "../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDownUpAcrossLine, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ButtonCorner from "../components/ui/ButtonCorner";
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
  const [currentPage, setCurrentPage] = useState(1);

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
        const chapterData = await fetchChapterListDetailShinigami(id, currentPage);
        setChapterList(chapterData.data);
      } catch (error) {
        console.error("Error fetching manhwa data:", error);
      } finally {
        setLoadingChapter(false);
      }
    };

    fetchData();
  }, [currentPage]);

  const toggleOrder = () => {
    setIsReversed(!isReversed);
  };
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
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
                  Author(s){" "}
                  {manhwa.taxonomy?.Author.map((author) => author.name).join(
                    ", "
                  )}
                </p>
                <p className="text-white xl:text-lg md:text-md text-sm">
                  Artist(s){" "}
                  {manhwa.taxonomy?.Artist?.map((artist) => artist.name).join(
                    ", "
                  )}
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
                  Type{" "}
                  {manhwa.taxonomy?.Type?.map((type) => type.name).join(", ")}
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
                  className="bg-accent duration-300 ease-in-out text-white hocver:text-primarys rounded-md p-3 flex justify-between items-center border-1 border-gray-400 hover:cursor-pointer"
                >
                  <div className="flex w-2/4">
                    <img
                      src={chapter.thumbnail_image_url}
                      alt=""
                      className="rounded-md w-40"
                    />
                  </div>
                  <div className="flex flex-col w-2/4 h-full ">
                    <a
                      className="xl:text-md lg:text-md text-md font-semibol"
                      href={`/chapter/${chapter.chapter_id}`}
                    >
                      Chapter {chapter.chapter_number}
                    </a>
                    <p className="text-gray-400 xl:text-md lg:text-md text-md">
                      {(() => {
                        const now = new Date();
                        const createdAt = new Date(chapter.release_date);
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

                        return createdAt.toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });
                      })()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="text-white font-bold py-2 px-4 text-lg hover:cursor-pointer rounded-md bg-primary mx-2"
              >
              <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <span className="text-white font-bold py-2 px-4 text-lg">
              {currentPage}
              </span>
              <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="text-white font-bold py-2 px-4 text-lg hover:cursor-pointer rounded-md bg-primary mx-2"
              >
              <FontAwesomeIcon icon={faArrowRight} />
              </button>
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
