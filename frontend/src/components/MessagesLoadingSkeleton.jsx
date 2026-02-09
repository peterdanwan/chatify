// frontend/src/components/MessagesLoadingSkeleton.jsx

function MessagesLoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className={`chat ${index % 2 === 0 ? 'chat-start' : 'chat-end'} animate-pulse`}
        >
          <div className="chat-bubble relative bg-slate-800 text-white w-32">
            <p className="mt-1">&nbsp;</p>
            <p className="text-xs mt-1 opacity-75 flex items-center gap-1">&nbsp;</p>
          </div>
        </div>
      ))}
    </div>
  );
}
export default MessagesLoadingSkeleton;
