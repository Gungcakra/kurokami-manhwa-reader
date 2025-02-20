import { useEffect, useState } from "react";
import { fetchChapterDetail, fetchManhwaDetail } from "../utils/api";
import { changeToSlug, removeTextTitle } from "../utils/function";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Footer from "../components/common/Footer";
import ButtonCorner from "../components/ui/ButtonCorner";

interface DetailProps {
  idChapter: string;
}
const Chapter = ({ idChapter }: DetailProps) => {
  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [manhwa, setManhwa] = useState<any>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const chapterDetail = await fetchChapterDetail(idChapter);
        setChapter(chapterDetail);
      } catch (error) {
        console.error("Error fetching chapter data:", error);
      } finally {
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (chapter) {
      const fetchData = async () => {
        try {
          const manhwaDetail = await fetchManhwaDetail(
            chapter?.manhwaLink.split("/")[4]
          );
          setManhwa(manhwaDetail);
        } catch (error) {
          console.error("Error fetching manhwa data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
      console.log("no manhwa");
    }
  }, [chapter]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && chapter.prevChapter) {
        window.location.href = chapter.prevChapter?.split("/")[3];
      } else if (event.key === "ArrowRight" && chapter.nextChapter) {
        window.location.href = chapter.nextChapter?.split("/")[3];
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chapter]);

  return (
    <div className="bg-[#09090B] min-w-full text-white w-full min-h-full pt-20 flex  flex-col items-center">
      {loading ? (
        <div className="animate-pulse bg-gray-300 h-10 w-1/2 mx-auto rounded-full"></div>
      ) : (
        <p className="text-center xl:text-5xl text-xl font-bold text-wrap max-w-1/2">
          {chapter.title}
        </p>
      )}

      {/* {loading ? (
        <div></div>
      ) : (
        <nav className="flex items-center space-x-2 text-sm text-white">
          <a href="/" className="hover:text-blue-500">
            Home
          </a>
          <span>/</span>
          <a
            href={`/manhwa/${changeToSlug(removeTextTitle(manhwa.title, "Bahasa Indonesia"))}`}
            className="hover:text-blue-500 capitalize"
          >
            {manhwa.title}
          </a>
          <span>/</span>
          <span className=" font-semibold capitalize">
            {chapter.title}
          </span>
        </nav>
      )} */}

      {loading ? (
        <div className="flex justify-between w-full p-4 animate-pulse">
          <div className="bg-gray-300 h-10 w-1/4 rounded"></div>
          <div className="flex gap-4">
            <div className="bg-gray-300 h-10 w-20 rounded"></div>
            <div className="bg-gray-300 h-10 w-20 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="flex justify-between w-full p-4">
          <select
            className="bg-[#3b3b3d] text-white py-1 px-4 rounded-full"
            onChange={(e) => {
              const selectedChapter = e.target.value;
              window.location.href = `${selectedChapter}`;
            }}
            value={window.location.pathname.split("/")[2] || ""}
          >
            {manhwa?.chapters?.map((chap: any) => {
              const chapId = chap.chapterLink?.split("/")[3];
              return (
                <option key={chap.id} value={chapId}>
                  {chap.chapterNum}
                </option>
              );
            })}
          </select>

          <div className="flex gap-4">
            {chapter.prevChapter ? (
              <a
                href={`${chapter.prevChapter?.split("/")[3]}`}
                className="text-white py-1 px-4 bg-[#C11B25] rounded-full"
              >
                <FontAwesomeIcon icon={faArrowLeft} /> Prev
              </a>
            ) : (
              <div></div>
            )}

            {chapter.nextChapter ? (
              <a
                href={`${chapter.nextChapter?.split("/")[3]}`}
                className="text-white py-1 px-4 bg-[#C11B25] rounded-full"
              >
                Next <FontAwesomeIcon icon={faArrowRight} />
              </a>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col items-center w-full min-h-screen py-4">
        {loading ? (
          <div className="w-full h-screen"></div>
        ) : chapter?.images.length > 0 ? (
          chapter.images.map((image: string, index: number) => (
            <img
              key={index}
              src={image}
              alt={`Chapter Image ${index + 1}`}
              className="w-2/3"
              loading="lazy"
              onLoad={() => console.log(`Image loaded: ${image}`)}
              onError={(e) =>
                console.error(`Failed to load image: ${image}`, e)
              }
            />
          ))
        ) : (
          <p className="text-red-500">No images found.</p>
        )}
      </div>
      {loading ? (
        <div className="flex justify-between w-full p-4 animate-pulse">
          <div className="bg-gray-300 h-10 w-1/4 rounded"></div>
          <div className="flex gap-4">
            <div className="bg-gray-300 h-10 w-20 rounded"></div>
            <div className="bg-gray-300 h-10 w-20 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="flex justify-between w-full p-4">
          <select
            className="bg-[#3b3b3d] text-white py-1 px-4 rounded-full"
            onChange={(e) => {
              const selectedChapter = e.target.value;
              window.location.href = `${selectedChapter}`;
            }}
            value={window.location.pathname.split("/")[2] || ""}
          >
            {manhwa?.chapters?.map((chap: any) => {
              const chapId = chap.chapterLink?.split("/")[3];
              return (
                <option key={chap.id} value={chapId}>
                  {chap.chapterNum}
                </option>
              );
            })}
          </select>

          <div className="flex gap-4">
            {chapter.prevChapter ? (
              <a
                href={`${chapter.prevChapter?.split("/")[3]}`}
                className="text-white py-1 px-4 bg-[#C11B25] rounded-full"
              >
                <FontAwesomeIcon icon={faArrowLeft} /> Prev
              </a>
            ) : (
              <div></div>
            )}

            {chapter.nextChapter ? (
              <a
                href={`${chapter.nextChapter?.split("/")[3]}`}
                className="text-white py-1 px-4 bg-[#C11B25] rounded-full"
              >
                Next <FontAwesomeIcon icon={faArrowRight} />
              </a>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      )}
      <ButtonCorner />
      <Footer />
    </div>
  );
};
export default Chapter;
