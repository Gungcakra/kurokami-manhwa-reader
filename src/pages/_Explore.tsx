import { faFire, faLineChart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

const ExploreComponent: React.FC = () => {
    return (
        <div className="bg-secondary text-white w-full min-h-full m-auto overflow-hidden">
      
  
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
              
            </div>
          </div>
  
          {/* POPULER */}
          <div className="xl:col-span-1 md:col-span-1 w-full popular-container overflow-hidden rounded-xl ">
            <div className="flex items-center gap-2 text-white text-xl font-semibold pb-4 p-4 bg-secondary-light">
              <FontAwesomeIcon icon={faFire} className="w-5 h-5" />
              <h1>Rekomendasi</h1>
            </div>
            <div className="flex flex-col bg-accent">
              
            </div>
  
            {/* GENRE */}
            <div className="bg-accent p-4 rounded-lg shadow-md text-white mt-4">
              <div className="flex items-center mb-3">
                <h3 className="text-lg font-semibold">Genre</h3>
              </div>
             
            </div>
          </div>
        </div>
      </div>
    );
}

export default ExploreComponent;