import { Link } from 'react-router';
import { Heart, Eye } from 'lucide-react';
import type { Ad } from '../data/mockData';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AdCardProps {
  ad: Ad;
  onToggleFavorite?: (id: string) => void;
}

export function AdCard({ ad, onToggleFavorite }: AdCardProps) {
  return (
    <Link
      to={`/post/${ad.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <ImageWithFallback
          src={ad.image}
          alt={ad.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite?.(ad.id);
          }}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
        >
          <Heart
            className={`w-5 h-5 ${
              ad.isFavorite ? 'fill-pink-600 text-pink-600' : 'text-gray-600'
            }`}
          />
        </button>

        {/* Views Counter */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs">
          <Eye className="w-3 h-3" />
          <span className="text-xs">{ad.views}</span>
        </div>

        {/* Type Badge */}
        <div
          className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
            ad.type === 'Sale'
              ? 'bg-green-500 text-white'
              : ad.type === 'Rent'
              ? 'bg-blue-500 text-white'
              : 'bg-purple-500 text-white'
          }`}
        >
          {ad.type}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
          {ad.title}
        </h3>
        
        <div className="flex items-center justify-between mb-2">
          <p className="text-lg font-bold text-pink-600">
            PKR {ad.price.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="flex items-center gap-1">
            📍 {ad.city}
          </span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {ad.condition}
          </span>
        </div>
      </div>
    </Link>
  );
}
