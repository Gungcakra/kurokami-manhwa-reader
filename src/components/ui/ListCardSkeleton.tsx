import React from 'react';

const ListCardSkeleton: React.FC = () => {
    return (
        <div className="flex items-center space-x-3 p-3 m-1 xl:w-[280px] xl:max-h-[120px] rounded-md animate-pulse border-gray-500 bg-black">
         
            <div className="w-16 h-16 bg-gray-400 rounded-md"></div>


            <div className="flex flex-col space-y-2 w-full">
                <div className="h-4 bg-gray-300 rounded-md w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded-md w-1/2"></div>
            </div>
        </div>
    );
};

export default ListCardSkeleton;
