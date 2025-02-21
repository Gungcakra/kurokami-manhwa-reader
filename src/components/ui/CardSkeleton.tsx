const CardSkeleton: React.FC = () => {
  return (
    <div className="flex items-start gap-4 border-t border-gray-500 bg-gray-800 p-3 animate-pulse">
      {/* Placeholder untuk gambar */}
      <div className="w-24 h-28 flex-shrink-0 bg-gray-700 rounded-lg"></div>

      {/* Placeholder untuk teks */}
      <div className="flex flex-col w-full justify-between">
        <div className="h-4 w-3/4 bg-gray-700 rounded-md"></div>
        <div className="mt-2">
          <div className="h-3 w-1/2 bg-gray-700 rounded-md mb-1"></div>
          <div className="h-3 w-1/4 bg-gray-700 rounded-md"></div>
        </div>
      </div>
    </div>
  );
};

export default CardSkeleton;
