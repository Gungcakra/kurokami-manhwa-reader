import { useEffect, useState } from "react";
import { fetchChapterDetail, fetchManhwaDetail } from "../utils/api";
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

  // useEffect(() => {
  //   if (chapter) {
  //     const fetchData = async () => {
  //       try {
  //         const manhwaDetail = await fetchManhwaDetail(
  //           chapter?.manhwaLink.split("/")[4]
  //         );
  //         setManhwa(manhwaDetail);
  //       } catch (error) {
  //         console.error("Error fetching manhwa data:", error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     fetchData();
  //   } else {
  //     console.log("no manhwa");
  //   }
  // }, [chapter]);

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
    <div className="bg-secondary min-w-full text-white w-full min-h-full flex flex-col items-center">
      {loading ? (
      
      <div className="w-full min-h-screen flex justify-center items-center">
        <img src={kuru.src} alt="loading" width={300} height={300} />
      </div>
      ) : (
      <>
        <p className="pt-2 text-center xl:text-2xl text-xl font-bold text-wrap max-w-1/2">
        {chapter.title}
        </p>
        <div className="flex justify-end w-full p-4">
        <div className="flex gap-4">
          {chapter.prevChapter ? (
          <a
            href={`${chapter.prevChapter?.split("/")[3]}`}
            className="text-white py-1 px-4 bg-primary rounded-full"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Prev
          </a>
          ) : (
          <div></div>
          )}
          {chapter.nextChapter ? (
          <a
            href={`${chapter.nextChapter?.split("/")[3]}`}
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
        {chapter?.images.length > 0 ? (
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
        <div className="flex justify-end w-full p-4">
        <div className="flex gap-4">
          {chapter.prevChapter ? (
          <a
            href={`${chapter.prevChapter?.split("/")[3]}`}
            className="text-white py-1 px-4 bg-primary rounded-full"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Prev
          </a>
          ) : (
          <div></div>
          )}
          {chapter.nextChapter ? (
          <a
            href={`${chapter.nextChapter?.split("/")[3]}`}
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
