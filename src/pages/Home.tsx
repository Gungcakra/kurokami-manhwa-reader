import React, { useEffect, useState } from "react";
import { fetchNewManhwa, fetchPopularManhwa } from "../utils/api";
import Navbar from "../components/common/Navbar";
import Card from "../components/ui/Card";
import ListCard from "../components/ui/ListCard";
import CardSkeleton from "../components/ui/CardSkeleton";
import ListCardSkeleton from "../components/ui/ListCardSkeleton";

interface Manhwa {
  link: string;
  imageSrc: string;
  title: string;
  chapter?: string;
  rating?: string;
}

const Home = () => {
  const [newManhwa, setNewManhwa] = useState<Manhwa[]>([]);
  const [popularManhwa, setPopularManhwa] = useState<Manhwa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const newManhwaData = await fetchNewManhwa();
        const popularManhwaData = await fetchPopularManhwa();
        setNewManhwa(newManhwaData);
        setPopularManhwa(popularManhwaData);
      } catch (error) {
        console.error("Error fetching manhwa data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-[#09090B] text-white w-full min-h-full m-auto pt-7">
      <Navbar />
      <div className="grid xl:grid-cols-5 grid-rows-5 md:grid-cols-1 mt-4 px-4 gap-2">
        <div className="xl:col-span-4 xl:row-span-5 md:col-span-1 md:row-span-1 w-full new-manhwa-container rounded-xl bg-[#18181B]">
          <p className="text-2xl text-white m-1 text-center">Manhwa Baru</p>
          <div className="flex flex-wrap justify-center">
            {loading
              ? Array.from({ length: 28 }).map((_, index) => <CardSkeleton />)
              : newManhwa
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
            <a className="bg-[#C11B25] text-white rounded-md p-2 m-2 mt-4  text-xl font-bold">
              Lihat Semua
            </a>
          </div>
        </div>
        <div className="xl:row-span-5 xl:col-start-5 md:col-span-1 md:row-span-1 w-full popular-container overflow-hidden rounded-xl bg-[#18181B]">
          <p className="text-2xl text-white m-1 md:text-center lg:text-center xl:text-start sm:text-center text-center">
            Populer
          </p>
          <div className="flex flex-col">
            {loading
              ? Array.from({ length: 10 }).map((_, index) => (
                  <ListCardSkeleton />
                ))
              : popularManhwa
                  ?.slice(0, 10)
                  .map((manhwa: Manhwa, index) => (
                    <ListCard
                      key={manhwa.link}
                      index={index}
                      img={manhwa.imageSrc}
                      title={manhwa.title}
                      link={manhwa.link}
                      chapter={manhwa.chapter || "-"}
                      rating={manhwa.rating || "-"}
                    />
                  ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
