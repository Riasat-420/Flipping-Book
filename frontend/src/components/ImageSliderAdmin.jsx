import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const ImageSliderAdmin = () => {
  const { isDarkMode } = useTheme();
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch existing images
  const fetchImages = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/imageslider`);
      const data = await res.json();
      if (res.ok) {
        setImages(data.images);
      }
    } catch (err) {
      console.error('Error fetching images:', err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_BASE}/api/imageslider/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setSuccess('Image uploaded successfully!');
      fetchImages(); // Refresh the list
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (id) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/imageslider/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Delete failed');
      }

      setSuccess('Image deleted successfully!');
      fetchImages(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-3 sm:p-4 md:p-6 min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 ' : 'bg-gray-50'
    }`}>
      {/* Header Section */}
      <div className="mb-4 sm:mb-6 ">
        <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold transition-colors mt-20 duration-300 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Image Slider Managment
        </h1>
        <p className={`mt-1 sm:mt-2 text-xs sm:text-sm md:text-base transition-colors duration-300 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Manage images for your homepage slider
        </p>
      </div>

      {/* Upload Section */}
      <div className={`rounded-lg shadow-md p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="mb-3 sm:mb-4">
          <h2 className={`text-lg sm:text-xl font-semibold transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Upload New Image
          </h2>
          <p className={`mt-1 text-xs sm:text-sm transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Add images to your homepage slider
          </p>
        </div>
        
        {/* Messages */}
        {error && (
          <div className={`border px-3 sm:px-4 py-2 sm:py-3 rounded mb-3 sm:mb-4 text-xs sm:text-sm transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-red-900/50 border-red-700 text-red-200' 
              : 'bg-red-100 border-red-400 text-red-700'
          }`}>
            {error}
          </div>
        )}
        
        {success && (
          <div className={`border px-3 sm:px-4 py-2 sm:py-3 rounded mb-3 sm:mb-4 text-xs sm:text-sm transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-green-900/50 border-green-700 text-green-200' 
              : 'bg-green-100 border-green-400 text-green-700'
          }`}>
            {success}
          </div>
        )}

        {/* Upload Area */}
        <label className={`
          flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 cursor-pointer 
          transition-all duration-300
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          ${isDarkMode 
            ? 'border-gray-600 hover:border-purple-500 bg-gray-700/50' 
            : 'border-gray-300 hover:border-purple-400 bg-gray-50'
          }
        `}>
          <Upload className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mb-2 sm:mb-3 md:mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <span className={`text-sm sm:text-base md:text-lg mb-1 sm:mb-2 text-center transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Click to upload image
          </span>
          <span className={`text-xs sm:text-sm text-center transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            PNG, JPG, JPEG up to 5MB
          </span>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="hidden" 
            disabled={isLoading}
          />
        </label>
        
        {/* Loading State */}
        {isLoading && (
          <div className="text-center mt-3 sm:mt-4">
            <div className={`inline-block animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 transition-colors duration-300 ${
              isDarkMode ? 'border-purple-400' : 'border-purple-600'
            }`}></div>
            <p className={`mt-1 sm:mt-2 text-xs sm:text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Uploading image...
            </p>
          </div>
        )}
      </div>

      {/* Images List Section */}
      <div className={`rounded-lg shadow-md p-4 sm:p-5 md:p-6 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className={`text-lg sm:text-xl font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Current Slider Images
              </h2>
              <p className={`mt-1 text-xs sm:text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {images.length} image{images.length !== 1 ? 's' : ''}
              </p>
            </div>
            {images.length > 0 && (
              <div className={`text-xs sm:text-sm px-2 py-1 rounded-full transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                Tap images to preview
              </div>
            )}
          </div>
        </div>
        
        {/* Empty State */}
        {images.length === 0 ? (
          <div className={`text-center py-6 sm:py-8 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <ImageIcon className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-300'
            }`} />
            <p className="text-sm sm:text-base mb-1">No images uploaded yet</p>
            <p className={`text-xs sm:text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Upload your first image using the upload section above
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Grid - Single Column */}
            <div className="md:hidden grid grid-cols-1 gap-3">
              {images.map((image) => (
                <div 
                  key={image.id} 
                  className={`border rounded-lg overflow-hidden shadow-sm transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img 
                      src={image.imageUrl} 
                      alt={image.originalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {image.originalName}
                        </p>
                        <p className={`text-xs transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Added {new Date(image.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className={`ml-2 flex items-center text-xs sm:text-sm transition-colors duration-300 ${
                          isDarkMode 
                            ? 'text-red-400 hover:text-red-300' 
                            : 'text-red-600 hover:text-red-800'
                        }`}
                        aria-label="Delete image"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                    <div className="flex justify-end">
                      <a 
                        href={image.imageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`text-xs px-2 py-1 rounded transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        View Full Image
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tablet Grid - 2 Columns */}
            <div className="hidden md:block lg:hidden grid grid-cols-2 gap-4">
              {images.map((image) => (
                <div 
                  key={image.id} 
                  className={`border rounded-lg overflow-hidden shadow-sm transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img 
                      src={image.imageUrl} 
                      alt={image.originalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className={`text-sm truncate mb-1 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {image.originalName}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {new Date(image.createdAt).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className={`flex items-center text-sm transition-colors duration-300 ${
                          isDarkMode 
                            ? 'text-red-400 hover:text-red-300' 
                            : 'text-red-600 hover:text-red-800'
                        }`}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Grid - 3 Columns */}
            <div className="hidden lg:grid grid-cols-3 gap-4">
              {images.map((image) => (
                <div 
                  key={image.id} 
                  className={`border rounded-lg overflow-hidden shadow-sm transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}
                >
                  <img 
                    src={image.imageUrl} 
                    alt={image.originalName}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-3">
                    <p className={`text-sm truncate transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {image.originalName}
                    </p>
                    <p className={`text-xs transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {new Date(image.createdAt).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className={`mt-2 flex items-center text-sm transition-colors duration-300 ${
                        isDarkMode 
                          ? 'text-red-400 hover:text-red-300' 
                          : 'text-red-600 hover:text-red-800'
                      }`}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination/Info Footer */}
            {images.length > 0 && (
              <div className={`mt-4 sm:mt-6 pt-3 sm:pt-4 border-t text-center text-xs sm:text-sm transition-colors duration-300 ${
                isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
              }`}>
                <p>Images are displayed in the homepage slider in the order they were uploaded</p>
                <p className="mt-1">Newest images appear first</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ImageSliderAdmin;