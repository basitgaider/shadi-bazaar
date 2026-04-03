import { Link } from 'react-router';
import { Heart, Eye, MapPin, Calendar } from 'lucide-react';
import type { Ad } from '../data/mockData';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AdListItemProps {
  ad: Ad;
  onToggleFavorite?: (id: string) => void;
  disabled?: boolean;
}

export function AdListItem({ ad, onToggleFavorite, disabled = false }: AdListItemProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image Container */}
        <Link to={`/post/${ad.id}`} className="relative sm:w-64 flex-shrink-0">
          <div className="aspect-video sm:aspect-square overflow-hidden bg-gray-100">
            <ImageWithFallback
              src={ad.image}
              alt={ad.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Type Badge */}
          <div
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
              ad.type === 'Sale'
                ? 'bg-green-500 text-white'
                : ad.type === 'Rent'
                ? 'bg-blue-500 text-white'
                : 'bg-purple-500 text-white'
            }`}
          >
            {ad.type}
          </div>

          {/* Views Counter */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs">
            <Eye className="w-3 h-3" />
            <span className="text-xs">{ad.views}</span>
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <Link to={`/post/${ad.id}`}>
                <h3 className="font-bold text-xl text-gray-900 hover:text-pink-600 transition-colors line-clamp-2">
                  {ad.title}
                </h3>
              </Link>
              
              {/* Favorite Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (disabled) return;
                  onToggleFavorite?.(ad.id);
                }}
                disabled={disabled}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors flex-shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Heart
                  className={`w-5 h-5 ${
                    ad.isFavorite ? 'fill-pink-600 text-pink-600' : 'text-gray-600'
                  }`}
                />
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ad.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {ad.city}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {ad.createdAt}
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
                {ad.condition}
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
                {ad.category}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-pink-600">
              PKR {ad.price.toLocaleString()}
            </p>
            <Link
              to={`/post/${ad.id}`}
              className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow text-sm"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
