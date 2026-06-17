import React, { useState, useEffect } from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import FoodCard from '../components/food/FoodCard';
import FoodDetailModal from '../components/food/FoodDetailModal';

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
  is_today_special: boolean;
  native_regions: string[] | null;
  tags: string[] | null;
  is_available: boolean;
  category_id: string | null;
  categories?: { name: string };
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

interface MenuPageProps {
  initialCategory?: string;
}

export default function MenuPage({ initialCategory }: MenuPageProps) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [spiceFilter, setSpiceFilter] = useState('');
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [foodsRes, catsRes] = await Promise.all([
        supabase.from('foods').select('*, categories(name)').eq('is_available', true),
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
      ]);
      if (foodsRes.data) setFoods(foodsRes.data as Food[]);
      if (catsRes.data) setCategories(catsRes.data);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = foods.filter(food => {
    if (selectedCategory && food.category_id !== selectedCategory) return false;
    if (filter === 'veg' && !food.is_veg) return false;
    if (filter === 'nonveg' && food.is_veg) return false;
    if (spiceFilter && food.spice_level !== spiceFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return food.name.toLowerCase().includes(q) ||
        food.description?.toLowerCase().includes(q) ||
        food.categories?.name.toLowerCase().includes(q);
    }
    return true;
  }).sort((a, b) => {
    if (priceSort === 'none') return 0;
    const pa = a.price_per_person || a.price_per_kg || 0;
    const pb = b.price_per_person || b.price_per_kg || 0;
    return priceSort === 'asc' ? pa - pb : pb - pa;
  });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-3">
          {/* Search */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search dishes, cuisines..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-9 py-2.5 text-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${showFilters ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {/* Filter Bar */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 animate-slide-down">
              <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                {(['all', 'veg', 'nonveg'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-neutral-500 dark:text-neutral-400'}`}
                  >
                    {f === 'all' ? 'All' : f === 'veg' ? '🌿 Veg' : '🍗 Non-Veg'}
                  </button>
                ))}
              </div>
              <select
                value={spiceFilter}
                onChange={e => setSpiceFilter(e.target.value)}
                className="text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All Spice Levels</option>
                <option value="mild">🌿 Mild</option>
                <option value="medium">🌶️ Medium</option>
                <option value="hot">🔥 Hot</option>
                <option value="extra_hot">💥 Extra Hot</option>
              </select>
              <select
                value={priceSort}
                onChange={e => setPriceSort(e.target.value as 'none' | 'asc' | 'desc')}
                className="text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="none">Sort by Price</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
              {(filter !== 'all' || spiceFilter || priceSort !== 'none') && (
                <button
                  onClick={() => { setFilter('all'); setSpiceFilter(''); setPriceSort('none'); }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-error-600 dark:text-error-400 border border-error-200 dark:border-error-800 hover:bg-error-50 dark:hover:bg-error-900/20 transition-all"
                >
                  <X className="w-3 h-3" /> Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setSelectedCategory('')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all border ${!selectedCategory ? 'bg-primary-500 text-white border-primary-500' : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all border ${selectedCategory === cat.id ? 'bg-primary-500 text-white border-primary-500' : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-primary-300'}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Result count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {loading ? 'Loading...' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-72 shimmer rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🍽️</div>
            <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">No dishes found</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">Try adjusting your search or filters</p>
            <button
              onClick={() => { setSearch(''); setFilter('all'); setSpiceFilter(''); setSelectedCategory(''); }}
              className="btn-primary mt-4 text-sm py-2"
            >
              Clear All
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(food => (
              <FoodCard
                key={food.id}
                food={food}
                onSelect={() => setSelectedFood(food)}
                isSpecial={food.is_today_special}
              />
            ))}
          </div>
        )}
      </div>

      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      )}
    </div>
  );
}
