import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { Link } from 'react-router-dom';
import logoBlack from "../assets/logo-black.png";
import logoWhite from "../assets/logo-white.png";

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-300">
      <div className="w-full px-4">
        <div className="flex justify-between items-center h-16">

          {/* Logo (Clickable) - Updated with professional styling and mobile responsiveness */}
          <div className="flex items-center">
            <Link to="/">

              <img
                src={isDarkMode ? logoWhite : logoBlack}
                alt="WeFlipPage Logo"
                className="h-10 w-auto object-contain cursor-pointer transition-opacity duration-300 hover:opacity-80 md:h-12"
              />
            </Link>

          </div>

          <button
            onClick={toggleTheme}
            className="p-2 bg-gray-800/90 hover:bg-gray-700/90 rounded-full transition-colors duration-300
                     shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40
                     backdrop-blur-sm border border-white/10"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <Sun className="w-6 h-6 text-yellow-300" />
            ) : (
              <Moon className="w-6 h-6 text-blue-100" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;