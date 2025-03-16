import React, { useEffect, useState } from "react";
import { fetchHome, fetchNewShinigami } from "../utils/api";
import Card from "../components/ui/Card";
import ListCard from "../components/ui/ListCard";
import CardSkeleton from "../components/ui/CardSkeleton";
import ListCardSkeleton from "../components/ui/ListCardSkeleton";
import Navbar from "../components/common/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faLineChart } from "@fortawesome/free-solid-svg-icons";
import CardSliderSkeleton from "../components/ui/CardSliderSkeleton";
import CardSlider from "../components/ui/CardSlider";

interface Manhwa {
  link: string;
  imageSrc: string;
  title: string;
  chapter?: string;
  rating?: string;
}

const Home = () => {
  const [home, setHome] = useState<Manhwa[]>([]);
  const [popularManhwa, setPopularManhwa] = useState<Manhwa[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const homeData = await fetchHome();
        setHome(homeData);
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
        const data = await fetchNewShinigami();
        setPopularManhwa(data);
      } catch (error) {
        console.error("Error fetching manhwa data:", error);
      } finally {
        setLoadingNew(false);
      }
    };

    fetchData();
  }, []);


  return (
    <div className="bg-secondary text-white w-full min-h-full m-auto overflow-hidden">
      <Navbar />

      {/* NEW */}
      <div className="grid xl:grid-cols-5 grid-cols-1 mt-4 px-4 gap-2 bg-secondary">
        <div className="xl:col-span-4 md:col-span-1 w-full new-manhwa-container rounded-xl bg-secondary-light p-4 mb-2">
          {/* TOP */}
          <div className="flex items-center gap-2 text-white text-xl font-semibold mb-4">
            <h1>
              <FontAwesomeIcon icon={faLineChart} /> Trending
            </h1>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide px-2">
            {loading
              ? Array(5)
                  .fill(0)
                  .map((_, index) => <CardSliderSkeleton key={index} />)
              : home.trending.map((manga, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-[150px] xl:w-[250px]"
                  >
                    <CardSlider
                      img={manga.imageSrc}
                      title={manga.title}
                      link={manga.link}
                      chapter={manga.latestChapter}
                    />
                  </div>
                ))}
          </div>

          <div className="flex items-center gap-2 text-white text-xl font-semibold my-4 ">
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="none" d="M0 0h24v24H0z"></path>
              <path d="m23 12-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-10 5h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
            </svg>
            <h1>Komik Baru</h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {loadingNew
              ? Array.from({ length: 28 }).map((_, index) => (
                  <CardSkeleton key={index} />
                ))
              : popularManhwa.data.map((manhwa) => (
                  <Card
                    key={manhwa.manga_id}
                    img={manhwa.cover_image_url}
                    title={manhwa.title}
                    link={manhwa.manga_id}
                    chapter={manhwa.chapters}
                    time={manhwa.created_at}
                  />
                ))}
          </div>
        </div>

        {/* POPULER */}
        <div className="xl:col-span-1 md:col-span-1 w-full popular-container overflow-hidden rounded-xl ">
          <div className="flex items-center gap-2 text-white text-xl font-semibold pb-4 p-4 bg-secondary-light">
            <FontAwesomeIcon icon={faFire} className="w-5 h-5" />
            <h1>Populer</h1>
          </div>
          <div className="flex flex-col bg-accent">
            {loading
              ? Array.from({ length: 10 }).map((_, index) => (
                  <ListCardSkeleton />
                ))
              : home.popularManhwa?.map((manhwa: Manhwa, index) => (
                  <ListCard
                    key={manhwa.link}
                    index={index}
                    img={manhwa.imageSrc}
                    title={manhwa.title}
                    link={manhwa.link}
                    chapter={manhwa.chapter || " "}
                    rating={manhwa.rating || "-"}
                  />
                ))}
          </div>

          {/* GENRE */}
          <div className="bg-accent p-4 rounded-lg shadow-md text-white mt-4">
            <div className="flex items-center mb-3">
              <h3 className="text-lg font-semibold">Genre</h3>
            </div>
            <ul className="grid grid-cols-3 gap-2">
              {loading
                ? Array.from({ length: 8 }).map((_, index) => (
                    <li
                      key={index}
                      className="block px-3 py-1 bg-gray-700 rounded text-sm animate-pulse"
                    >
                      &nbsp;
                    </li>
                  ))
                : home.genres?.map((genre, index) => (
                    <li key={index}>
                      <a
                        href={genre.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block xl:text-xs text-md transition-all duration-300 ease-in-out hover:cursor-pointer hover:text-[#6B69F1] text-start "
                      >
                        {genre.title}
                      </a>
                    </li>
                  ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
