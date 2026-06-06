// @ts-nocheck
import { useEffect, useState } from "react";
import { apiService } from "../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faHome,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import Footer from "../components/common/Footer";
import ButtonCorner from "../components/ui/ButtonCorner";
import kuru from "../assets/images/kuru.webp";

interface ChapterProps {
  idChapter: string;
}

const Chapter = ({ idChapter }: ChapterProps) => {
  const [chapter, setChapter] = useState<any>(null);
  const [manhwa, setManhwa] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiService.getChapterDetail(idChapter).then((data) => {
      setChapter(data);
      setLoading(false);
    });
  }, [idChapter]);

  useEffect(() => {
    if (!chapter?.data?.manga_id) return;
    apiService.getDetail(chapter.data.manga_id).then((data) => {
      setManhwa(data?.data || null);
    });
  }, [chapter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && chapter?.data?.prev_chapter_id) {
        window.location.href = `/chapter/${chapter.data.prev_chapter_id}`;
      } else if (e.key === "ArrowRight" && chapter?.data?.next_chapter_id) {
        window.location.href = `/chapter/${chapter.data.next_chapter_id}`;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chapter]);

  const prevId = chapter?.data?.prev_chapter_id;
  const nextId = chapter?.data?.next_chapter_id;
  const mangaId = chapter?.data?.manga_id;
  const chapterNum = chapter?.data?.chapter_number;
  const images: string[] = chapter?.data?.chapter?.data || [];
  const basePath = chapter?.data?.base_url
    ? `${chapter.data.base_url}/${chapter.data.chapter?.path}`
    : "";

  const NavBar = ({ pos }: { pos: "top" | "bottom" }) => (
    <div
      className={`w-full bg-[#09090b]/90 backdrop-blur-md border-zinc-800/50 z-40 ${
        pos === "top"
          ? "sticky top-0 border-b"
          : "border-t"
      }`}
    >
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {mangaId && (
            <a
              href={`/manhwa/${mangaId}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181b] border border-zinc-700/50 rounded-xl text-xs text-zinc-400 hover:text-white hover:border-[#e63946]/50 transition-all flex-shrink-0"
            >
              <FontAwesomeIcon icon={faList} className="text-[10px]" />
              <span className="hidden sm:inline">Chapter List</span>
            </a>
          )}
          <div className="min-w-0">
            {manhwa?.title && (
              <p className="text-white text-xs font-semibold truncate">
                {manhwa.title}
              </p>
            )}
            {chapterNum && (
              <p className="text-zinc-400 text-[10px]">Chapter {chapterNum}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {prevId ? (
            <a
              href={`/chapter/${prevId}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181b] border border-zinc-700/50 rounded-xl text-xs text-zinc-300 hover:bg-[#e63946] hover:border-[#e63946] hover:text-white transition-all"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />
              <span className="hidden sm:inline">Prev</span>
            </a>
          ) : (
            <div className="px-3 py-1.5 bg-[#18181b]/40 border border-zinc-800/30 rounded-xl text-xs text-zinc-600">
              <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />
            </div>
          )}
          {nextId ? (
            <a
              href={`/chapter/${nextId}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e63946] border border-[#e63946] rounded-xl text-xs text-white hover:bg-[#c1121f] transition-all"
            >
              <span className="hidden sm:inline">Next</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
            </a>
          ) : (
            <div className="px-3 py-1.5 bg-[#18181b]/40 border border-zinc-800/30 rounded-xl text-xs text-zinc-600">
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#09090b] text-white min-h-screen flex flex-col">
      {loading ? (
        <div className="flex-1 flex justify-center items-center min-h-screen">
          <img src={kuru.src} alt="loading" width={160} />
        </div>
      ) : (
        <>
          <NavBar pos="top" />

          {/* Images */}
          <div className="flex flex-col items-center w-full flex-1">
            {images.length > 0 ? (
              images.map((image: string, index: number) => (
                <img
                  key={index}
                  src={`${basePath}/${image}`}
                  alt={`Page ${index + 1}`}
                  className="w-full md:w-[720px] max-w-3xl block"
                  loading="lazy"
                />
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
                <p className="text-zinc-500 text-sm">Gambar tidak ditemukan.</p>
                {mangaId && (
                  <a
                    href={`/manhwa/${mangaId}`}
                    className="text-[#e63946] text-sm hover:underline"
                  >
                    Kembali ke detail
                  </a>
                )}
              </div>
            )}
          </div>

          <NavBar pos="bottom" />
        </>
      )}
      <ButtonCorner />
      <Footer />
    </div>
  );
};

export default Chapter;
