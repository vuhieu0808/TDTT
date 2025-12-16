const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <div className="relative">
        {/* Vòng tròn nền mờ */}
        <div className="w-12 h-12 rounded-full border-4 border-purple-100"></div>
        {/* Vòng tròn xoay chính */}
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-t-purple-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
      <p className="mt-3 text-sm font-medium text-purple-600 animate-pulse">
        Loading...
      </p>
      <p className="mt-1 text-xs text-purple-400 animate-pulse">
        It may takes up to a minute
      </p>
    </div>
  );
};

export default Loading;
