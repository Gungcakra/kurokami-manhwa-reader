import { useEffect, useState } from "react";
import {
  fetchChapterDetail,
  fetchChapterShinigami,
  fetchDetailShinigami,
  fetchManhwaDetail,
} from "../utils/api";
import { changeToSlug, removeTextTitle } from "../utils/function";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Footer from "../components/common/Footer";
import ButtonCorner from "../components/ui/ButtonCorner";
import kuru from "../assets/images/kuru.webp";
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
        const chapterDetail = await fetchChapterShinigami(idChapter);
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

  useEffect(() => {
    if (chapter) {
      const fetchDataManhwa = async () => {
        try {
          const manhwaDetail = await fetchDetailShinigami(chapter.data.manga_id);
          setManhwa(manhwaDetail);
        } catch (error) {
          console.error("Error fetching manhwa data:", error);
        }
      };

      fetchDataManhwa();
    }
  }, [chapter]);
  // const url = "https://freenigami.vercel.app/v1/api/";
  // const manga_id = chapter?.data?.manga_id;
  // const chapter_id = chapter?.data?.chapter_id;
  // const images: string[] = chapter?.data?.chapter?.data || [];

  // if (Array.isArray(images)) {
  //   images.forEach((image) => {
  //     console.log(url + manga_id + "/" + chapter_id + "/" + image);
  //   });
  // } else {
  //   console.error("images is not an array:", images);
  // }

  return (
    <div className="bg-secondary min-w-full text-white w-full min-h-full flex flex-col items-center">
      {loading ? (
        <div className="w-full min-h-screen flex justify-center items-center">
          <img src={kuru.src} alt="loading" width={300} height={300} />
        </div>
      ) : (
        <>
          <p className="pt-2 text-center text-white xl:text-2xl text-xl font-bold text-wrap max-w-1/2">
        {manhwa?.data?.title} Chapter {chapter?.data?.chapter_number}
        </p>
          <div className="flex justify-end w-full p-4">
            <div className="flex gap-4">
              {chapter?.data?.prev_chapter_id ? (
                <a
                  href={`/chapter/${chapter?.data?.prev_chapter_id}`}
                  className="text-white py-1 px-4 bg-primary rounded-full"
                >
                  <FontAwesomeIcon icon={faArrowLeft} /> Prev
                </a>
              ) : (
                <div></div>
              )}
              {chapter?.data?.next_chapter_id ? (
                <a
                  href={`/chapter/${chapter?.data?.next_chapter_id}`}
                  className="text-white py-1 px-4 bg-primary rounded-full"
                >
                  Next <FontAwesomeIcon icon={faArrowRight} />
                </a>
              ) : (
                <div></div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center w-full min-h-screen py-4">
            {chapter?.data?.chapter?.data?.length > 0 ? (
              chapter.data.chapter.data.map((image: string, index: number) => (
                <img
                  key={index}
                  src={`https://freenigami.vercel.app/v1/api/${chapter.data.manga_id}/${chapter.data.chapter_id}/${image}`}
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
          <div className="flex justify-end w-full p-4">
            <div className="flex gap-4">
              {chapter?.data?.prev_chapter_id ? (
                <a
                  href={`/chapter/${chapter?.data?.prev_chapter_id}`}
                  className="text-white py-1 px-4 bg-primary rounded-full"
                >
                  <FontAwesomeIcon icon={faArrowLeft} /> Prev
                </a>
              ) : (
                <div></div>
              )}
              {chapter?.data?.next_chapter_id ? (
                <a
                  href={`/chapter/${chapter?.data?.next_chapter_id}`}
                  className="text-white py-1 px-4 bg-primary rounded-full"
                >
                  Next <FontAwesomeIcon icon={faArrowRight} />
                </a>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        </>
      )}
      <ButtonCorner />
      <Footer />
    </div>
  );
};
export default Chapter;
