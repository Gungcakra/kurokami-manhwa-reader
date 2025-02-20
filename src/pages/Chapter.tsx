import { useEffect, useState } from "react";
import { fetchChapterDetail, fetchManhwaDetail } from "../utils/api";
import { changeToSlug, removeTextTitle } from "../utils/function";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

interface DetailProps {
  idChapter: string;
  idManhwa: string;
}
const Chapter = ({ idChapter, idManhwa }: DetailProps) => {
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
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const manhwaDetail = await fetchManhwaDetail(idManhwa);
        setManhwa(manhwaDetail);
      } catch (error) {
        console.error("Error fetching manhwa data:", error);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="bg-[#09090B] min-w-full text-white w-full min-h-full pt-20 flex  flex-col items-center">
      {loading ? (
        <p className="text-center">loading</p>
      ) : (
        <p className="text-center xl:text-5xl text-xl font-bold">
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
        <div></div>
      ) : (
        <div className="flex justify-between w-full p-4">
          <select
            className="bg-[#18181B] text-white py-1 px-4 rounded-full"
            onChange={(e) => {
              const selectedChapter = e.target.value;
              window.location.href = `${selectedChapter}?idManhwa=${idManhwa}`;
            }}
            value={chapter.chapterLink?.split("/")[3]}
          >
            {manhwa?.chapters?.map((chap: any) => (
              <option key={chap.id} value={chap.chapterLink?.split("/")[3]}>
                {chap.chapterNum}
              </option>
            ))}
          </select>
          <div className="flex gap-4">
            
            {chapter.prevChapter ? (
              <a
                href={`${
                  chapter.prevChapter?.split("/")[3]
                }?idManhwa=${idManhwa}`}
                className="text-white py-1 px-4 bg-[#C11B25] rounded-full"
              >
                <FontAwesomeIcon icon={faArrowLeft} /> Prev
              </a>
            ) : (
              <div></div>
            )}

            {chapter.nextChapter ? (
              <a
                href={`${
                  chapter.nextChapter?.split("/")[3]
                }?idManhwa=${idManhwa}`}
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
          <div></div>
        ) : (
          chapter.images.map((image: string, index: number) => (
            <img key={index} src={image} alt="chapter" className="w-2/3" />
          ))
        )}
      </div>
    </div>
  );
};
export default Chapter;
