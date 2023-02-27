const Loader = () => {
  return (
    <div className="flex items-center justify-center gap-1">
      <div className="h-1 w-1 animate-loading-blink rounded-full opacity-100 dark:bg-white"></div>
      <div
        style={{ animationDelay: "0.2s" }}
        className="h-1 w-1 animate-loading-blink rounded-full opacity-100 dark:bg-white"
      ></div>
      <div
        style={{ animationDelay: "0.4s" }}
        className="h-1 w-1 animate-loading-blink rounded-full opacity-100 dark:bg-white"
      ></div>
    </div>
  );
};

export default Loader;
