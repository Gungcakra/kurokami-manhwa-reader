const CardSkeleton = () => {
    return (
        <div className="flex flex-col items-center m-1 w-[150px] h-[260px] rounded-md bg-gray-700 animate-pulse">
            {/* Skeleton untuk Gambar */}
            <div className="bg-gray-500 w-full h-[200px] rounded-md"></div>

            {/* Skeleton untuk Judul */}
            <div className="mt-3 w-3/4 h-5 bg-gray-500 rounded-md"></div>

            {/* Skeleton untuk Subjudul */}
            <div className="mt-2 w-1/2 h-4 bg-gray-500 rounded-md"></div>
        </div>
    );
};

export default CardSkeleton;
