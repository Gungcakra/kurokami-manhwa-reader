import React from "react";
import { fetchNewManhwa, fetchPopularManhwa } from "../utils/api";
import Navbar from "../components/common/Navbar";
import Card from "../components/ui/Card";
import ListCard from "../components/ui/ListCard";

const Home = async () => {
  const newManhwa = await fetchNewManhwa();
  const popularManhwa = await fetchPopularManhwa();
  return (
    <div className="bg-[#181B20] text-white w-full min-h-full m-auto">
      <Navbar />
      <div className="flex flex-col md:flex-row lg:flex-row xl:flex-row justify-center">
        <div className="flex flex-col new-manhwa-container w-full md:w-8/10 lg:w-8/10 xl:w-8/10">
          <p className="text-2xl text-white m-1 text-center">Manhwa Baru</p>
          <div className="flex flex-wrap justify-center">
        {newManhwa?.map((manhwa) => (
          <Card
            img={manhwa.imageSrc}
            title={manhwa.title}
            link={manhwa.link}
          />
        ))}
          </div>
        </div>
        <div className="flex flex-col popular-container w-full md:w-2/10 lg:w-2/10 xl:w-2/10">
          <p className="text-2xl text-white m-1">Populer</p>
          <div className="flex flex-col">
        {popularManhwa?.slice(0, 10).map((manhwa, index) => (
          <ListCard
            key={index}
            index={index + 1}
            img={manhwa.imageSrc}
            title={manhwa.title}
            link={manhwa.link}
            chapter={manhwa.chapter}
            rating={manhwa.rating}
          />
        ))}
        </div>
      </div>
      </div>
    </div>
  );
};
export default Home;
