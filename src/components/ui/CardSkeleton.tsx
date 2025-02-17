const CardSkeleton = () => {
    return (
        <div className="flex flex-col items-center m-1 w-[150px] h-[260px] rounded-md text-center bg-gray-700 animate-pulse">
            <div className="bg-gray-300 min-w-full max-w-full max-h-[200px] rounded-md animate-pulse"></div>
            <div className="card-content mt-2">
                <div className="bg-gray-300 h-6 w-3/4 rounded-md "></div>
            </div>
        </div>
    );
};

export default CardSkeleton;