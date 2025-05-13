import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [reducedMotion, setReducedMotion] = useState(false);
  
  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    // Add listener for changes
    const handleMotionPreferenceChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionPreferenceChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleMotionPreferenceChange);
    };
  }, []);
  
  // Don't render animations if reduced motion is preferred
  if (reducedMotion) {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900 opacity-50"></div>
    );
  }
  
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Animated Circles with improved performance */}
      <div className="absolute w-32 h-32 bg-blue-400 rounded-full opacity-30 dark:opacity-20 animate-bounce top-10 left-10 will-change-transform"></div>
      <div className="absolute w-40 h-40 bg-red-400 rounded-full opacity-30 dark:opacity-20 animate-spin bottom-10 right-10 will-change-transform"></div>
      <div className="absolute w-48 h-48 bg-green-400 rounded-full opacity-30 dark:opacity-20 animate-ping left-[50%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 will-change-transform"></div>
      
      {/* Additional subtle background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900 opacity-30 z-[-1]"></div>
    </div>
  );
}