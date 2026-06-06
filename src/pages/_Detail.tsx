// @ts-nocheck
import { useEffect, useState } from "react";
import { apiService } from "../utils/api";
import { timeAgo } from "../utils/function";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDownUpAcrossLine,
  faArrowLeft,
  faArrowRight,
  faStar,
  faBook,
  faUser,
  faPen,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import ButtonCorner from "../components/ui/ButtonCorner";
import Footer from "../components/common/Footer";
import kuru from "../assets/images/kuru.webp";

interface DetailProps {
  id: string;
}

const Detail = ({ id }: DetailProps) => {
  const [manhwa, setManhwa] = useState<any>(null);
  const [chapterList, setChapterList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingChapter, setLoadingChapter] = useState(true);
  const [isReversed, setIsReversed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [chapterSearch, setChapterSearch] = useState("");
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);

  useEffect(() => {
    apiService.getDetail(id).then((data) => {
      setManhwa(data?.data || null);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    setLoadingChapter(true);
    apiService
      .getChapterList(id, currentPage, 24, isReversed ? "asc" : "desc", chapterSearch)
      .then((data) => {
        setChapterList(data?.data || []);
        setLoadingChapter(false);
      });
  }, [currentPage, isReversed, chapterSearch]);

  const synopsis = manhwa?.synopsis || manhwa?.description || "";
  const shouldTruncate = synopsis.length > 350;
  const displaySynopsis =
    shouldTruncate && !showFullSynopsis
      ? synopsis.substring(0, 350) + "..."
      : synopsis;

  return (
    <div className="bg-[#09090b] text-white min-h-screen">
      {loading ? (
        <div className="w-full min-h-screen flex justify-center items-center">
          <img src={kuru.src} alt="loading" width={180} />
        </div>
      ) : (
        <>
          {/* Hero */}
          <div className="relative overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-25"
              style={{ backgroundImage: `url(${manhwa.cover_image_url})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/20 via-[#09090b]/60 to-[#09090b]" />
            <div className="relative max-w-screen-xl mx-auto px-4 pt-8 pb-6 flex flex-col md:flex-row gap-6 items-end">
              <img
                src={manhwa.cover_image_url}
                alt={manhwa.title}
                className="w-36 md:w-44 rounded-2xl shadow-2xl shadow-black/60 flex-shrink-0 mx-auto md:mx-0 border border-white/10"
              />
              <div className="flex-1 pb-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold mb-1 leading-tight">
                  {manhwa.title}
                </h1>
                {manhwa.alternative_title && (
                  <p className="text-zinc-400 text-sm mb-3">
                    {manhwa.alternative_title}
                  </p>
                )}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      manhwa.status === 1
                        ? "bg-green-500/15 text-green-400 border-green-500/30"
                        : "bg-zinc-700/50 text-zinc-300 border-zinc-600/30"
                    }`}
                  >
                    {manhwa.status === 1 ? "Ongoing" : "Completed"}
                  </span>
                  {manhwa.taxonomy?.Type?.map((t) => (
                    <span
                      key={t.slug}
                      className="px-2.5 py-1 bg-[#e63946]/15 text-[#e63946] border border-[#e63946]/30 rounded-full text-xs font-semibold"
                    >
                      {t.name}
                    </span>
                  ))}
                  {manhwa.user_rate && (
                    <span className="px-2.5 py-1 bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-semibold flex items-center gap-1">
                      <FontAwesomeIcon icon={faStar} className="text-[10px]" />
                      {manhwa.user_rate}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-zinc-400">
                  {manhwa.taxonomy?.Author?.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faUser} className="text-[10px]" />
                      {manhwa.taxonomy.Author.map((a) => a.name).join(", ")}
                    </span>
                  )}
                  {manhwa.taxonomy?.Artist?.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                      {manhwa.taxonomy.Artist.map((a) => a.name).join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-screen-xl mx-auto px-4 pb-8">
            {/* Genre tags */}
            {manhwa.taxonomy?.Genre?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {manhwa.taxonomy.Genre.map((g) => (
                  <a
                    key={g.slug}
                    href={`/explore?genre=${g.slug}`}
                    className="px-2.5 py-1 bg-zinc-800/60 hover:bg-[#e63946]/15 hover:text-[#e63946] hover:border-[#e63946]/30 text-zinc-400 border border-zinc-700/40 rounded-full text-xs transition-all duration-200"
                  >
                    {g.name}
                  </a>
                ))}
              </div>
            )}

            {/* First chapter button */}
            {chapterList.length > 0 && (
              <div className="flex gap-3 mb-5">
                <a
                  href={`/chapter/${chapterList[chapterList.length - 1]?.chapter_id}`}
                  className="px-5 py-2.5 bg-[#e63946] text-white rounded-xl text-sm font-semibold hover:bg-[#c1121f] transition-all"
                >
                  Baca Dari Awal
                </a>
                <a
                  href={`/chapter/${chapterList[0]?.chapter_id}`}
                  className="px-5 py-2.5 bg-[#18181b] text-white rounded-xl text-sm font-semibold border border-zinc-700/50 hover:border-[#e63946]/50 transition-all"
                >
                  Chapter Terbaru
                </a>
              </div>
            )}

            {/* Synopsis */}
            {synopsis && (
              <div className="bg-[#18181b] rounded-2xl p-4 mb-5 border border-zinc-800/40">
                <h3 className="text-sm font-bold text-zinc-200 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faBook}
                    className="text-[#e63946] text-xs"
                  />
                  Sinopsis
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {displaySynopsis}
                </p>
                {shouldTruncate && (
                  <button
                    onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                    className="text-[#e63946] text-xs mt-2 hover:underline hover:cursor-pointer font-medium"
                  >
                    {showFullSynopsis ? "Sembunyikan ↑" : "Selengkapnya ↓"}
                  </button>
                )}
              </div>
            )}

            {/* Chapter list */}
            <div className="bg-[#18181b] rounded-2xl border border-zinc-800/40">
              <div className="flex items-center justify-between p-4 border-b border-zinc-800/40">
                <h3 className="font-bold text-white text-sm">Daftar Chapter</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Cari chapter..."
                      value={chapterSearch}
                      onChange={(e) => {
                        setChapterSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-7 pr-3 py-1.5 bg-zinc-800/60 border border-zinc-700/40 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e63946]/50 w-32"
                    />
                  </div>
                  <button
                    onClick={() => setIsReversed(!isReversed)}
                    className="p-1.5 bg-zinc-800/60 border border-zinc-700/40 rounded-xl text-zinc-400 hover:text-white hover:bg-[#e63946] hover:border-[#e63946] transition-all hover:cursor-pointer"
                    title="Balik urutan"
                  >
                    <FontAwesomeIcon
                      icon={faArrowDownUpAcrossLine}
                      className="text-xs"
                    />
                  </button>
                </div>
              </div>

              {loadingChapter ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-4">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="h-16 bg-zinc-800/40 rounded-xl animate-pulse"
                      />
                    ))}
                </div>
              ) : chapterList.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-10">
                  Chapter tidak ditemukan
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-4">
                  {chapterList.map((chapter) => (
                    <a
                      key={chapter.chapter_id}
                      href={`/chapter/${chapter.chapter_id}`}
                      className="group flex items-center gap-3 p-3 bg-zinc-800/30 hover:bg-[#e63946]/10 border border-zinc-800/40 hover:border-[#e63946]/30 rounded-xl transition-all duration-200"
                    >
                      {chapter.thumbnail_image_url && (
                        <img
                          src={chapter.thumbnail_image_url}
                          alt=""
                          className="w-9 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex flex-col min-w-0">
                        <p className="text-white text-xs font-semibold group-hover:text-[#e63946] transition-colors">
                          Chapter {chapter.chapter_number}
                        </p>
                        <p className="text-zinc-500 text-[10px] mt-0.5">
                          {timeAgo(chapter.release_date)}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800/40">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-1.5 bg-zinc-800/60 border border-zinc-700/40 rounded-xl text-xs disabled:opacity-30 hover:bg-[#e63946] hover:border-[#e63946] transition-all hover:cursor-pointer"
                >
                  <FontAwesomeIcon icon={faArrowLeft} /> Prev
                </button>
                <span className="text-zinc-500 text-xs">Hal. {currentPage}</span>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!chapterList.length || chapterList.length < 24}
                  className="flex items-center gap-2 px-4 py-1.5 bg-zinc-800/60 border border-zinc-700/40 rounded-xl text-xs disabled:opacity-30 hover:bg-[#e63946] hover:border-[#e63946] transition-all hover:cursor-pointer"
                >
                  Next <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
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
