// @ts-nocheck
import React, { useEffect, useState } from "react";
import { apiService } from "../utils/api";
import Card from "../components/ui/Card";
import ListCard from "../components/ui/ListCard";
import CardSkeleton from "../components/ui/CardSkeleton";
import ListCardSkeleton from "../components/ui/ListCardSkeleton";
import CardSlider from "../components/ui/CardSlider";
import CardSliderSkeleton from "../components/ui/CardSliderSkeleton";
import UpdateRow from "../components/ui/UpdateRow";
import Hero from "../components/ui/Hero";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import ButtonCorner from "../components/ui/ButtonCorner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFire,
  faStar,
  faBolt,
  faCompass,
  faChevronRight,
  faThumbsUp,
  faCircleCheck,
  faTableCellsLarge,
  faList,
} from "@fortawesome/free-solid-svg-icons";

const FORMATS = [
  { label: "Semua", value: "all" },
  { label: "Manhwa", value: "manhwa" },
  { label: "Manga", value: "manga" },
  { label: "Manhua", value: "manhua" },
];

/** Section heading: short red rule + icon + title, optional "see all" link. */
const SectionHead = ({ icon, iconClass = "text-[#EF4444]", title, href, hrefLabel, children }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
    <div className="flex items-center gap-2.5 min-w-0">
      <span className="w-1 h-5 bg-[#EF4444] rounded-full flex-shrink-0" />
      {icon && <FontAwesomeIcon icon={icon} className={`${iconClass} text-sm`} />}
      <h2 className="font-black text-sm sm:text-base tracking-tight truncate">{title}</h2>
    </div>
    <div className="flex items-center gap-2">
      {children}
      {href && (
        <a
          href={href}
          className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-[#EF4444] transition-colors whitespace-nowrap"
        >
          {hrefLabel ?? "Lihat semua"}
          <FontAwesomeIcon icon={faChevronRight} className="text-[8px]" />
        </a>
      )}
    </div>
  </div>
);

/** Horizontal poster rail with skeleton support. */
const Rail = ({ loading, items, count = 8, rank = false }) => (
  <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
    {loading
      ? Array(count).fill(0).map((_, i) => <CardSliderSkeleton key={i} />)
      : items?.map((m, i) => (
          <CardSlider key={m.manga_id} manga={m} rank={rank ? i + 1 : undefined} />
        ))}
  </div>
);

const Panel = ({ children }) => (
  <div className="bg-[#141417] rounded-2xl border border-zinc-800/60 overflow-hidden">{children}</div>
);

const PanelHead = ({ icon, iconClass = "text-[#EF4444]", title, href }) => (
  <div className="flex items-center justify-between px-3.5 py-3 border-b border-zinc-800/60 bg-white/[0.02]">
    <div className="flex items-center gap-2">
      <FontAwesomeIcon icon={icon} className={`${iconClass} text-xs`} />
      <h3 className="font-bold text-xs">{title}</h3>
    </div>
    {href && (
      <a href={href} className="text-[10px] font-semibold text-zinc-500 hover:text-[#EF4444] transition-colors">
        Semua →
      </a>
    )}
  </div>
);

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [updates, setUpdates] = useState(null);
  const [popular, setPopular] = useState(null);
  const [recommend, setRecommend] = useState(null);
  const [top, setTop] = useState(null);
  const [completed, setCompleted] = useState(null);
  const [genres, setGenres] = useState([]);

  const [activeFormat, setActiveFormat] = useState("all");
  const [view, setView] = useState("grid");

  const [loadingHero, setLoadingHero] = useState(true);
  const [loadingUpd, setLoadingUpd] = useState(true);
  const [loadingPop, setLoadingPop] = useState(true);
  const [loadingRec, setLoadingRec] = useState(true);
  const [loadingTop, setLoadingTop] = useState(true);
  const [loadingDone, setLoadingDone] = useState(true);
  const [loadingGenres, setLoadingGenres] = useState(true);

  useEffect(() => {
    apiService.getPopular(1, 12).then((d) => {
      setPopular(d);
      setFeatured(d?.data ?? []);
      setLoadingPop(false);
      setLoadingHero(false);
    });
    apiService.getRecommend(1, 12).then((d) => { setRecommend(d); setLoadingRec(false); });
    apiService.getTop(1, 12).then((d) => { setTop(d); setLoadingTop(false); });
    apiService.getCompleted(1, 12).then((d) => { setCompleted(d); setLoadingDone(false); });
    apiService.getGenres().then((d) => { setGenres(d?.data ?? []); setLoadingGenres(false); });
  }, []);

  useEffect(() => {
    setLoadingUpd(true);
    apiService.getNewUpdate(1, 24, activeFormat).then((d) => {
      setUpdates(d);
      setLoadingUpd(false);
    });
  }, [activeFormat]);

  const GenrePills = ({ limit }) =>
    loadingGenres ? (
      Array(12).fill(0).map((_, i) => (
        <div key={i} className="h-6 w-14 bg-zinc-800/60 rounded-lg animate-pulse" />
      ))
    ) : (
      <>
        {genres.slice(0, limit).map((g) => (
          <a
            key={g.taxonomy_id ?? g.slug}
            href={`/explore?genre=${g.slug}`}
            className="px-2 py-1 text-[10px] font-medium bg-zinc-800/60 hover:bg-[#EF4444]/15 hover:text-[#EF4444] hover:border-[#EF4444]/30 text-zinc-400 border border-zinc-700/40 rounded-lg transition-all"
          >
            {g.name}
          </a>
        ))}
        <a
          href="/genres"
          className="px-2 py-1 text-[10px] font-bold bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/25 rounded-lg hover:bg-[#EF4444] hover:text-white transition-all"
        >
          Semua →
        </a>
      </>
    );

  return (
    <div className="bg-[#09090b] text-white min-h-screen flex flex-col">
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-3 sm:px-4 pt-4 pb-10 w-full flex-1 flex flex-col gap-7">
        <Hero items={featured} loading={loadingHero} />

        {/* ── Rekomendasi ── */}
        <section>
          <SectionHead icon={faThumbsUp} title="Rekomendasi" href="/explore" />
          <Rail loading={loadingRec} items={recommend?.data} />
        </section>

        {/* ── Update Terbaru + sidebar ── */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <div className="flex-1 min-w-0 w-full">
            <SectionHead icon={faBolt} title="Update Terbaru" href="/updates">
              <div className="flex items-center gap-0.5 bg-zinc-800/60 border border-zinc-700/40 rounded-lg p-0.5">
                <button
                  onClick={() => setView("grid")}
                  aria-label="Tampilan grid"
                  className={`w-6 h-6 flex items-center justify-center rounded-md text-[10px] transition-all hover:cursor-pointer ${
                    view === "grid" ? "bg-[#EF4444] text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faTableCellsLarge} />
                </button>
                <button
                  onClick={() => setView("list")}
                  aria-label="Tampilan daftar"
                  className={`w-6 h-6 flex items-center justify-center rounded-md text-[10px] transition-all hover:cursor-pointer ${
                    view === "list" ? "bg-[#EF4444] text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faList} />
                </button>
              </div>
            </SectionHead>

            <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActiveFormat(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all hover:cursor-pointer whitespace-nowrap ${
                    activeFormat === f.value
                      ? "bg-[#EF4444] text-white border-[#EF4444] shadow-md shadow-[#EF4444]/20"
                      : "bg-zinc-800/60 text-zinc-400 border-zinc-700/40 hover:text-white hover:border-zinc-600"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {view === "grid" ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5">
                {loadingUpd
                  ? Array(18).fill(0).map((_, i) => <CardSkeleton key={i} />)
                  : updates?.data?.map((m) => <Card key={m.manga_id} manga={m} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                {loadingUpd
                  ? Array(9).fill(0).map((_, i) => (
                      <div
                        key={i}
                        className="h-[104px] rounded-xl bg-[#141417] border border-zinc-800/60 animate-pulse"
                      />
                    ))
                  : updates?.data?.map((m) => <UpdateRow key={m.manga_id} manga={m} />)}
              </div>
            )}
          </div>

          <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-4">
            <Panel>
              <PanelHead icon={faFire} iconClass="text-orange-400" title="Terpopuler" href="/popular" />
              {loadingPop
                ? Array(6).fill(0).map((_, i) => <ListCardSkeleton key={i} />)
                : popular?.data?.slice(0, 10).map((m, i) => (
                    <ListCard key={m.manga_id} index={i} manga={m} />
                  ))}
            </Panel>

            <Panel>
              <PanelHead icon={faStar} iconClass="text-yellow-400" title="Rating Tertinggi" href="/top" />
              {loadingTop
                ? Array(5).fill(0).map((_, i) => <ListCardSkeleton key={i} />)
                : top?.data?.slice(0, 8).map((m, i) => (
                    <ListCard key={m.manga_id} index={i} manga={m} />
                  ))}
            </Panel>

            <Panel>
              <PanelHead icon={faCompass} title="Genre" href="/genres" />
              <div className="flex flex-wrap gap-1.5 p-3">
                <GenrePills limit={22} />
              </div>
            </Panel>
          </aside>
        </div>

        {/* ── Rating tertinggi ── */}
        <section>
          <SectionHead icon={faStar} iconClass="text-yellow-400" title="Rating Tertinggi" href="/top" />
          <Rail loading={loadingTop} items={top?.data} rank />
        </section>

        {/* ── Komik tamat ── */}
        <section>
          <SectionHead
            icon={faCircleCheck}
            iconClass="text-emerald-400"
            title="Komik Tamat"
            href="/completed"
          />
          <Rail loading={loadingDone} items={completed?.data} />
        </section>
      </main>

      <ButtonCorner />
      <Footer />
    </div>
  );
};

export default Home;
