import { Link } from 'react-router';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* App Download Section */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Download ShadiBazar App</h3>
              <p className="text-pink-100">Get the best experience on mobile</p>
            </div>
            <div className="flex gap-4">
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white text-gray-900 px-6 py-3 rounded-lg hover:shadow-lg transition-shadow"
                aria-label="Download on Google Play"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs">GET IT ON</div>
                  <div className="text-sm font-bold">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-white">ShadiBazar</h1>
                <p className="text-xs text-gray-400">Your Wedding Marketplace</p>
              </div>
            </Link>
            <p className="text-gray-300 leading-relaxed">
              ShadiBazar is Pakistan&apos;s premier online wedding marketplace, connecting buyers and sellers of
              bridal wear, groom attire, jewelry, and wedding services. Make your special day perfect with us!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/signup" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/create-ad" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Post an Ad
                </Link>
              </li>
              <li>
                <Link to="/my-ads" className="text-gray-300 hover:text-pink-400 transition-colors">
                  My Ads
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/#privacy-policy" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/#terms" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/#cookies" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/#contact" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p>© 2026 ShadiBazar. All rights reserved.</p>
            <p>Made with ❤️ for Pakistani weddings</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
