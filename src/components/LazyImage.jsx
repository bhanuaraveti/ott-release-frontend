import { useState, useEffect, useRef } from 'react';

/**
 * LazyImage component for optimized image loading
 * Uses Intersection Observer API for native lazy loading
 */
export default function LazyImage({
  src,
  alt,
  className = '',
  placeholderSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3C/svg%3E',
  ...props
}) {
  const [imageSrc, setImageSrc] = useState(placeholderSrc);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Use native lazy loading if supported
    if ('loading' in HTMLImageElement.prototype) {
      setImageSrc(src);
      return;
    }

    // Fallback to Intersection Observer for older browsers
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px' // Start loading 50px before image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${!imageLoaded ? 'blur-sm' : 'blur-0'} transition-all duration-300`}
      onLoad={handleLoad}
      loading="lazy"
      {...props}
    />
  );
}
