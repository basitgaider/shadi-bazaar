import { Link } from 'react-router';
import { Eye, Heart, MapPin } from 'lucide-react';
import { ROUTES } from '@/core/constants';
import type { Ad } from '../data/mockData';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AdCardHorizontalProps {
  ad: Ad;
  onToggleFavorite?: (id: string) => void;
}

export function AdCardHorizontal({ ad, onToggleFavorite }: AdCardHorizontalProps) {
  return (
    <div className="group h-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex h-full flex-col">
        <Link to={ROUTES.POST(ad.id)} className="relative aspect-[4/3] flex-shrink-0 overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={ad.image}
            alt={ad.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite?.(ad.id);
            }}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-colors hover:bg-white"
          >
            <Heart className={`h-4 w-4 ${ad.isFavorite ? 'fill-pink-600 text-pink-600' : 'text-gray-600'}`} />
          </button>

          <div
            className={`absolute left-3 top-3 rounded-full px-2 py-1 text-xs font-medium ${
              ad.type === 'Sale'
                ? 'bg-green-500 text-white'
                : ad.type === 'Rent'
                  ? 'bg-blue-500 text-white'
                  : 'bg-rose-500 text-white'
            }`}
          >
            {ad.type}
          </div>

          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-white backdrop-blur-sm">
            <Eye className="h-3 w-3" />
            <span className="text-xs">{ad.views}</span>
          </div>
        </Link>

        <div className="flex flex-1 flex-col p-3">
          <Link to={ROUTES.POST(ad.id)}>
            <h3 className="mb-2 min-h-[2.5rem] line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-pink-600">
              {ad.title}
            </h3>
          </Link>

          <div className="mt-auto">
            <p className="mb-2 text-lg font-bold text-pink-600">PKR {ad.price.toLocaleString()}</p>

            <div className="flex items-center justify-between gap-2 text-xs text-gray-600">
              <span className="flex min-w-0 items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-pink-500" />
                <span className="truncate">{ad.city}</span>
              </span>
              <span className="whitespace-nowrap rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                {ad.condition}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
