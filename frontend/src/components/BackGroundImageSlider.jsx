import React, { useState, useEffect } from 'react';
import backgroundImg1 from '../assets/Flipping book Background .jpg';
import backgroundImg2 from '../assets/Flipping book Background Black.jpg';

const ImageSlider = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorLoadingImages, setErrorLoadingImages] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fallback local images
  const localImages = [backgroundImg1, backgroundImg2];

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch images from backend
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/imageslider`);
        const data = await res.json();
        if (res.ok && data.images && Array.isArray(data.images) && data.images.length > 0) {
          // If API returns valid images, use them
          setImages(data.images);
        } else {
          // If API returns error or empty, use local images
         // console.log('Using local images as fallback');
          setImages(localImages);
        }
      } catch (err) {
        // Fallback to local images if API fails
        setImages(localImages);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [API_BASE]);

  // Adjust auto-slide interval based on screen size
  useEffect(() => {
    if (images.length === 0) return;

    // Slower auto-slide on mobile for better UX
    const intervalTime = isMobile ? 7000 : 5000;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, intervalTime);

    return () => clearInterval(interval);
  }, [images.length, isMobile]);

  // Handle image loading errors
  const handleImageError = (index, imageUrl) => {
    console.error(`Failed to load image at index ${index}:`, imageUrl);
    setErrorLoadingImages(prev => ({
      ...prev,
      [index]: true
    }));
  };

  // Helper function to get image source URL
  const getImageSrc = (image) => {
    // If image is an object with imageUrl property (from API)
    if (image && typeof image === 'object' && image.imageUrl) {
      return image.imageUrl;
    }
    // If image is a string (URL from API)
    if (typeof image === 'string') {
      return image;
    }
    // If image is a module object from import (local asset)
    return image;
  };

  // Handle manual navigation (touch/swipe support for mobile)
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Empty state
  if (images.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-sm sm:text-base md:text-lg">No slider images available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Slider Images */}
      {images.map((image, index) => {
        const imageSrc = getImageSrc(image);
        
        // Skip rendering if image failed to load
        if (errorLoadingImages[index]) {
          return null;
        }

        return (
          <div
            key={index}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Optimized image loading for mobile */}
            <img
              src={imageSrc}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
              onError={() => handleImageError(index, imageSrc)}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              // Mobile optimizations
              sizes="100vw"
              srcSet={`${imageSrc}?w=480 480w, ${imageSrc}?w=768 768w, ${imageSrc}?w=1024 1024w, ${imageSrc}?w=1280 1280w`}
            />
          </div>
        );
      })}

      {/* Mobile Navigation Dots - Show on mobile */}
      {isMobile && images.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-20 flex justify-center items-center space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Desktop Navigation Arrows - Show on desktop */}


      {/* Desktop Navigation Dots - Show on desktop */}
      {!isMobile && images.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center items-center space-x-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-110' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Mobile Swipe Indicator (Subtle) */}
      {isMobile && images.length > 1 && (
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center space-x-1">
            <span className="text-xs text-white/70 bg-black/20 px-2 py-1 rounded-full">
              {currentIndex + 1}/{images.length}
            </span>
          </div>
        </div>
      )}

      {/* If all images failed to load, show a fallback background */}
      {Object.keys(errorLoadingImages).length === images.length && images.length > 0 && (
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <p className="text-white text-sm sm:text-base md:text-lg px-4 text-center">
            Unable to load background images
          </p>
        </div>
      )}

      {/* Mobile Touch Swipe Area (for better UX) */}
      {isMobile && images.length > 1 && (
        <>
          <div 
            className="absolute left-0 top-0 bottom-0 w-1/4 z-10"
            onClick={goToPrev}
            style={{ cursor: 'pointer' }}
          />
          <div 
            className="absolute right-0 top-0 bottom-0 w-1/4 z-10"
            onClick={goToNext}
            style={{ cursor: 'pointer' }}
          />
        </>
      )}
    </div>
  );
};

export default ImageSlider;