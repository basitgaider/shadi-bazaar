import { Link } from 'react-router';
import { Eye, Heart, MapPin } from 'lucide-react';
import { ROUTES } from '@/core/constants';
import type { Ad } from '../data/mockData';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AdCardFeaturedProps {
  ad: Ad;
  onToggleFavorite?: (id: string) => void;
}

export function AdCardFeatured({ ad, onToggleFavorite }: AdCardFeaturedProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <Link to={ROUTES.POST(ad.id)} className="relative block aspect-[4/3] overflow-hidden bg-gray-100">
        <ImageWithFallback
          src={ad.image}
          alt={ad.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite?.(ad.id);
          }}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur-sm transition-colors hover:bg-white"
        >
          <Heart className={`h-5 w-5 ${ad.isFavorite ? 'fill-pink-600 text-pink-600' : 'text-gray-600'}`} />
        </button>

        <div
          className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg ${
            ad.type === 'Sale'
              ? 'bg-green-500 text-white'
              : ad.type === 'Rent'
                ? 'bg-blue-500 text-white'
                : 'bg-rose-500 text-white'
          }`}
        >
          {ad.type}
        </div>

        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-lg bg-black/70 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
          <Eye className="h-4 w-4" />
          <span>{ad.views}</span>
        </div>
      </Link>

      <div className="p-5">
        <Link to={ROUTES.POST(ad.id)}>
          <h3 className="mb-3 min-h-[3.5rem] line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-pink-600">
            {ad.title}
          </h3>
        </Link>

        <p className="mb-3 text-2xl font-bold text-pink-600">PKR {ad.price.toLocaleString()}</p>

        <div className="flex items-center justify-between gap-3 text-sm text-gray-600">
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0 text-pink-500" />
            <span className="truncate">{ad.city}</span>
          </span>
          <span className="rounded-lg bg-gray-100 px-3 py-1.5 font-medium text-gray-700">{ad.condition}</span>
        </div>
      </div>
    </div>
  );
}
