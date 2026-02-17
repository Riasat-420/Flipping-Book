import React from 'react';
import ImageSlider from '../components/BackGroundImageSlider.jsx';
import PDFUploadForm from '../components/pdfflipBook.jsx';

const HomePage = () => {
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Slider */}
      <div className="absolute inset-0 z-0">
        <ImageSlider />
      </div>
      
      {/* Form Container - Better responsive spacing */}
      <div className="relative z-10 h-full flex items-center justify-center lg:justify-start">
        <div className="w-full max-w-lg mx-4 lg:mx-12">
          <PDFUploadForm/>
        </div>
      </div>
    </div>
  );
};

export default HomePage;