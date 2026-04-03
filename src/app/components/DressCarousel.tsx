import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Ad } from '../data/mockData';
import { AdCardHorizontal } from './AdCardHorizontal';

interface DressCarouselProps {
  ads: Ad[];
  onToggleFavorite?: (id: string) => void;
}

interface SliderArrowProps {
  onClick?: () => void;
}

function NextArrow({ onClick }: SliderArrowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group absolute -right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-all duration-300 hover:bg-pink-50 hover:shadow-xl"
      aria-label="Next slides"
    >
      <ChevronRight className="h-6 w-6 text-gray-600 group-hover:text-pink-600" />
    </button>
  );
}

function PrevArrow({ onClick }: SliderArrowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group absolute -left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-all duration-300 hover:bg-pink-50 hover:shadow-xl"
      aria-label="Previous slides"
    >
      <ChevronLeft className="h-6 w-6 text-gray-600 group-hover:text-pink-600" />
    </button>
  );
}

export function DressCarousel({ ads, onToggleFavorite }: DressCarouselProps) {
  if (ads.length === 0) {
    return null;
  }

  const hasMultipleSlides = ads.length > 2;
  const settings = {
    dots: true,
    infinite: hasMultipleSlides,
    speed: 500,
    slidesToShow: Math.min(2, Math.max(ads.length, 1)),
    slidesToScroll: 1,
    nextArrow: hasMultipleSlides ? <NextArrow /> : undefined,
    prevArrow: hasMultipleSlides ? <PrevArrow /> : undefined,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="relative px-8">
      <Slider {...settings}>
        {ads.map((ad) => (
          <div key={ad.id} className="px-3">
            <AdCardHorizontal ad={ad} onToggleFavorite={onToggleFavorite} />
          </div>
        ))}
      </Slider>
    </div>
  );
}
