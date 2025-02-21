import React, { useEffect, useState } from "react";
import { fetchHome } from "../utils/api";
import Card from "../components/ui/Card";
import ListCard from "../components/ui/ListCard";
import CardSkeleton from "../components/ui/CardSkeleton";
import ListCardSkeleton from "../components/ui/ListCardSkeleton";
import Footer from "../components/common/Footer";
import Navbar from "../components/common/Navbar";

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

  return (
    <div className="bg-[#09090B] text-white w-full min-h-full m-auto">
      <Navbar />
      <div className="grid xl:grid-cols-5 grid-cols-1 mt-4 px-4 gap-2 ">
        <div className="xl:col-span-4 md:col-span-1 w-full new-manhwa-container rounded-xl bg-[#18181B]">
          <p className="text-2xl text-white m-1 text-center">Manhwa Baru</p>
          <div className="flex flex-wrap justify-center">
            {loading
              ? Array.from({ length: 28 }).map((_, index) => <CardSkeleton />)
              : home.latestUpdates
                  ?.slice(0, 28)
                  .map((manhwa: Manhwa) => (
                    <Card
                      key={manhwa.link}
                      img={manhwa.imageSrc}
                      title={manhwa.title}
                      link={manhwa.link}
                    />
                  ))}
          </div>
          <div className="flex justify-center">
            <a className="bg-[#C11B25] duration-300 ease-in-out hover:bg-[#c11b26ae] hover:cursor-pointer text-white rounded-md p-2 m-2 mt-4 text-xl font-bold">
              Lihat Semua
            </a>
          </div>
        </div>
        <div className="xl:col-span-1 md:col-span-1 w-full popular-container overflow-hidden rounded-xl bg-[#18181B]">
          <p className="text-2xl text-white m-1 md:text-center lg:text-center xl:text-start sm:text-center text-center">
            Populer
          </p>
          <div className="flex flex-col">
            {loading
              ? Array.from({ length: 10 }).map((_, index) => (
                  <ListCardSkeleton />
                ))
              : home.popularManhwa
                  ?.slice(0, 10)
                  .map((manhwa: Manhwa, index) => (
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
          
          <div className="bg-[#18181B] p-4 rounded-lg shadow-md text-white mt-4">
            <div className="flex items-center mb-3">
              <h3 className="text-lg font-semibold">Genre</h3>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
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
                        className="block xl:text-xs text-md transition-all duration-300 ease-in-out hover:cursor-pointer hover:text-[#C11B25] text-start "
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
