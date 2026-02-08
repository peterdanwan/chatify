// frontend/src/components/UsersLoadingSkeleton.jsx

function UsersLoadingSkeleton() {
  return (
    <div>
      {[1, 2, 3, 4, 5, 6, 7].map((item) => (
        <div key={item} className="bg-slate-800/30 p-4 rounded-lg animate-pulse">
          <div className="flex items-center space-x-3">
            {/* Circle */}
            <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
            <div className="flex-1">
              {/* Long div */}
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
              {/* Short div */}
              <div className="h-3 bg-slate-700/70 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export default UsersLoadingSkeleton;
