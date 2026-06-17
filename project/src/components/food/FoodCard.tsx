import React from 'react';
import { Star, Clock, Flame, Leaf, ShoppingCart, Zap } from 'lucide-react';

interface Food {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_per_kg: number | null;
  price_per_person: number | null;
  is_veg: boolean;
  spice_level: string;
  avg_rating: number | null;
  total_reviews: number | null;
  is_today_special?: boolean;
  tags?: string[] | null;
  categories?: { name: string };
}

interface FoodCardProps {
  food: Food;
  onSelect: () => void;
  isSpecial?: boolean;
}

export default function FoodCard({ food, onSelect, isSpecial }: FoodCardProps) {
  const price = food.price_per_person
    ? `₹${food.price_per_person}/person`
    : food.price_per_kg
    ? `₹${food.price_per_kg}/kg`
    : 'Contact for price';

  const spiceColors: Record<string, string> = {
    mild: 'text-success-600 dark:text-success-400',
    medium: 'text-warning-600 dark:text-warning-400',
    hot: 'text-error-500 dark:text-error-400',
    extra_hot: 'text-error-700 dark:text-error-500',
  };

  const spiceEmoji: Record<string, string> = {
    mild: '🌿', medium: '🌶️', hot: '🔥', extra_hot: '💥',
  };

  return (
    <div
      onClick={onSelect}
      className="card-hover overflow-hidden group cursor-pointer"
    >
      {/* Image */}
      <div className="relative overflow-hidden h-44">
        <img
          src={food.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isSpecial && (
            <span className="flex items-center gap-1 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              <Zap className="w-2.5 h-2.5" /> Special
            </span>
          )}
          {food.tags?.includes('bestseller') && (
            <span className="bg-secondary-400 text-neutral-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Bestseller
            </span>
          )}
        </div>

        {/* Veg indicator */}
        <div className="absolute top-2 right-2">
          <div className={`w-5 h-5 border-2 ${food.is_veg ? 'border-success-500' : 'border-error-500'} rounded flex items-center justify-center bg-white`}>
            <div className={`w-2.5 h-2.5 rounded-full ${food.is_veg ? 'bg-success-500' : 'bg-error-500'}`} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {food.categories && (
          <span className="text-[10px] font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">
            {food.categories.name}
          </span>
        )}
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm mt-0.5 line-clamp-1">
          {food.name}
        </h3>
        {food.description && (
          <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-1 line-clamp-2 leading-relaxed">
            {food.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2">
          {food.avg_rating && food.avg_rating > 0 ? (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-secondary-400 fill-secondary-400" />
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {food.avg_rating.toFixed(1)}
              </span>
              {food.total_reviews && food.total_reviews > 0 && (
                <span className="text-xs text-neutral-400">({food.total_reviews})</span>
              )}
            </div>
          ) : null}
          <div className={`flex items-center gap-0.5 text-xs ${spiceColors[food.spice_level] || ''}`}>
            <span>{spiceEmoji[food.spice_level] || '🌶️'}</span>
            <span className="capitalize">{food.spice_level?.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-base font-bold text-neutral-900 dark:text-neutral-100">{price}</span>
            {food.price_per_kg && food.price_per_person && (
              <span className="text-xs text-neutral-400 dark:text-neutral-500 block">or ₹{food.price_per_kg}/kg</span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
