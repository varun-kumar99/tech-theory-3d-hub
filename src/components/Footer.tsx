import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Footer = () => {
  const [logoError, setLogoError] = useState(false);

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6 px-6 mb-20">
      <div className="container mx-auto">
        <div className="flex flex-col items-center text-center mb-4">
          {/* Brand Section */}
          <div className="max-w-md flex flex-col items-center">
            {!logoError ? (
              <img 
                src="/logo.png" 
                alt="TECH Theory" 
                className="h-12 w-auto object-contain mb-4 invert"
                onError={() => setLogoError(true)}
              />
            ) : (
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4 font-['Space_Grotesk']">
                TECH Theory
              </h3>
            )}
            <p className="text-gray-300 text-sm leading-relaxed">
              Your ultimate destination for the latest in technology, reviews, and innovation insights.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="w-5 h-5" />
                <span className="text-sm font-medium">Facebook</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
                <span className="text-sm font-medium">Twitter</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors">
                <Instagram className="w-5 h-5" />
                <span className="text-sm font-medium">Instagram</span>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors">
                <Youtube className="w-5 h-5" />
                <span className="text-sm font-medium">Youtube</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section - Moved Up */}
        <div className="border-t border-gray-700 pt-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 TECH Theory. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</Link>
            <Link to="/admin" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;