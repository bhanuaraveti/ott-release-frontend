export default function AnimatedBackground() {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Animated Circles */}
        <div className="absolute w-32 h-32 bg-blue-400 rounded-full opacity-50 animate-bounce top-10 left-10"></div>
        <div className="absolute w-40 h-40 bg-red-400 rounded-full opacity-50 animate-spin bottom-10 right-10"></div>
        <div className="absolute w-48 h-48 bg-green-400 rounded-full opacity-50 animate-ping left-[50%] top-[50%] transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    );
  }