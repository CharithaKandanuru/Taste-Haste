import React, { useEffect, useState, useCallback } from 'react';
import { MapPin, ChevronLeft, ChevronRight, Star, Clock, Flame, Leaf, TrendingUp, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import FoodCard from '../components/food/FoodCard';
import FoodDetailModal from '../components/food/FoodDetailModal';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  badge_text: string | null;
  badge_color: string | null;
}

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
  categories?: { name: string };
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

interface HomePageProps {
  onNavigate: (page: string, params?: Record<string, unknown>) => void;
}

const regionMap: Record<string, string[]> = {
  'Andhra Pradesh': ['andhra_pradesh', 'telangana', 'all'],
  'Telangana': ['telangana', 'andhra_pradesh', 'all'],
  'Tamil Nadu': ['tamil_nadu', 'all'],
  'Karnataka': ['karnataka', 'all'],
  'Maharashtra': ['maharashtra', 'all'],
  'Kerala': ['kerala', 'all'],
  'West Bengal': ['west_bengal', 'all'],
  'Punjab': ['punjab', 'all'],
  'Rajasthan': ['rajasthan', 'all'],
  'Gujarat': ['gujarat', 'all'],
};

const indianStates = Object.keys(regionMap);

export default function HomePage({ onNavigate }: HomePageProps) {
  const { profile } = useAuth();
  const { t } = useTheme();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [specials, setSpecials] = useState<Food[]>([]);
  const [recommended, setRecommended] = useState<Food[]>([]);
  const [allFoods, setAllFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [userState, setUserState] = useState(profile?.state || '');
  const [detectingLocation, setDetectingLocation] = useState(false);

  const detectLocation = useCallback(() => {
    setDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
            );
            const data = await res.json();
            const state = data.address?.state || '';
            setUserState(state);
          } catch {
            setUserState('Andhra Pradesh');
          }
          setDetectingLocation(false);
        },
        () => {
          setUserState('Andhra Pradesh');
          setDetectingLocation(false);
        }
      );
    } else {
      setUserState('Andhra Pradesh');
      setDetectingLocation(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const [bannersRes, foodsRes, catsRes] = await Promise.all([
        supabase.from('banners').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('foods').select('*, categories(name)').eq('is_available', true),
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
      ]);

      if (bannersRes.data) setBanners(bannersRes.data);
      if (catsRes.data) setCategories(catsRes.data);
      if (foodsRes.data) {
        const foods = foodsRes.data as Food[];
        setAllFoods(foods);
        setSpecials(foods.filter(f => f.is_today_special));
      }
      setLoading(false);
    };
    load();
    if (!profile?.state) detectLocation();
    else setUserState(profile.state);
  }, [detectLocation, profile?.state]);

  useEffect(() => {
    if (!userState || allFoods.length === 0) return;
    const regions = regionMap[userState] || ['all'];
    const regionFoods = allFoods.filter(f =>
      f.native_regions?.some(r => regions.includes(r))
    );
    setRecommended(regionFoods.slice(0, 8));
  }, [userState, allFoods]);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => setCurrentBanner(c => (c + 1) % banners.length), 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const spiceIcon = (level: string) => {
    const icons: Record<string, string> = { mild: '🌿', medium: '🌶️', hot: '🔥', extra_hot: '💥' };
    return icons[level] || '🌶️';
  };

  if (loading) return <HomePageSkeleton />;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-neutral-900">
        <div className="relative h-[280px] sm:h-[360px] md:h-[420px]">
          {banners.length > 0 ? banners.map((banner, i) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === currentBanner ? 'opacity-100' : 'opacity-0'}`}
            >
              <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 max-w-2xl">
                {banner.badge_text && (
                  <span className="inline-flex items-center gap-1 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-3 animate-pulse-soft">
                    <Zap className="w-3 h-3" /> {banner.badge_text}
                  </span>
                )}
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-white mb-2 leading-tight">
                  {banner.title}
                </h2>
                {banner.subtitle && (
                  <p className="text-neutral-200 text-sm sm:text-base mb-4">{banner.subtitle}</p>
                )}
                <button
                  onClick={() => onNavigate('menu')}
                  className="bg-white text-neutral-900 hover:bg-primary-50 font-semibold px-5 py-2.5 rounded-xl text-sm w-fit transition-all duration-200 hover:shadow-lg active:scale-95"
                >
                  Order Now
                </button>
              </div>
            </div>
          )) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-600 to-primary-900 flex items-center px-8 md:px-16">
              <div>
                <span className="inline-flex items-center gap-1 bg-secondary-400 text-neutral-900 text-xs font-bold px-3 py-1 rounded-full w-fit mb-3">
                  <Zap className="w-3 h-3" /> Fresh & Hot
                </span>
                <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-2">
                  {t('home.hero')}
                </h2>
                <p className="text-primary-100 mb-4">{t('home.subtitle')}</p>
                <button onClick={() => onNavigate('menu')} className="bg-white text-primary-700 hover:bg-primary-50 font-semibold px-5 py-2.5 rounded-xl text-sm">
                  Explore Menu
                </button>
              </div>
            </div>
          )}

          {/* Banner Controls */}
          {banners.length > 1 && (
            <>
              <button
                onClick={() => setCurrentBanner(c => (c - 1 + banners.length) % banners.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentBanner(c => (c + 1) % banners.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentBanner(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentBanner ? 'bg-white w-6' : 'bg-white/50 w-1.5'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-10">
        {/* Location Banner */}
        <div className="flex items-center justify-between bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Showing flavors for</p>
              <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                {detectingLocation ? 'Detecting location...' : userState || 'Select your state'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={userState}
              onChange={e => setUserState(e.target.value)}
              className="text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Select State</option>
              {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              onClick={detectLocation}
              className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium border border-primary-200 dark:border-primary-800 px-2 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950 transition-all"
            >
              Auto Detect
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '⚡', label: 'Fast Delivery', value: '30-45 min', color: 'bg-secondary-50 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300' },
            { icon: '🌿', label: 'Fresh Daily', value: 'Farm to Table', color: 'bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-300' },
            { icon: '🏆', label: 'Top Rated', value: '4.8★ Average', color: 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' },
            { icon: '🎁', label: 'Rewards', value: 'Earn Points', color: 'bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-xl p-3 ${stat.color}`}>
              <span className="text-xl block mb-1">{stat.icon}</span>
              <p className="font-semibold text-sm">{stat.value}</p>
              <p className="text-xs opacity-70">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title">{t('home.categories')}</h2>
              <p className="section-subtitle">Browse by your favorites</p>
            </div>
            <button onClick={() => onNavigate('menu')} className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700">See All</button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onNavigate('menu', { category: cat.id })}
                className="flex-shrink-0 flex flex-col items-center gap-2 p-3 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-card-hover transition-all duration-200 min-w-[72px]"
              >
                <span className="text-2xl">{cat.icon || '🍽️'}</span>
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Today's Specials */}
        {specials.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title flex items-center gap-2">
                  <Flame className="w-5 h-5 text-primary-500" />
                  {t('home.specials')}
                </h2>
                <p className="section-subtitle">Limited time offers</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {specials.map(food => (
                <FoodCard key={food.id} food={food} onSelect={() => setSelectedFood(food)} isSpecial />
              ))}
            </div>
          </section>
        )}

        {/* Recommended For You */}
        {recommended.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-500" />
                  {t('home.recommended')}
                </h2>
                <p className="section-subtitle">
                  {userState ? `Native dishes from ${userState}` : 'Popular picks near you'}
                </p>
              </div>
              <button onClick={() => onNavigate('menu')} className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700">View All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recommended.map(food => (
                <FoodCard key={food.id} food={food} onSelect={() => setSelectedFood(food)} />
              ))}
            </div>
          </section>
        )}

        {/* All Foods */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title">Our Full Menu</h2>
              <p className="section-subtitle">{allFoods.length} delicious items</p>
            </div>
            <button onClick={() => onNavigate('menu')} className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700">See All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allFoods.slice(0, 8).map(food => (
              <FoodCard key={food.id} food={food} onSelect={() => setSelectedFood(food)} />
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-8 text-white">
          <h2 className="text-2xl font-bold font-display mb-6 text-center">Why Taste &amp; Haste?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { emoji: '🍱', title: 'Regional Specialties', desc: 'Authentic local dishes from across India' },
              { emoji: '⚖️', title: 'Order by Weight', desc: 'Get exactly the quantity you need' },
              { emoji: '👨‍👩‍👧‍👦', title: 'Serve Your Family', desc: 'Perfect portions for any group size' },
              { emoji: '🌿', title: '100% Fresh', desc: 'Made fresh every day from quality ingredients' },
            ].map(item => (
              <div key={item.title}>
                <div className="text-3xl mb-2">{item.emoji}</div>
                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-primary-200 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {selectedFood && (
        <FoodDetailModal food={selectedFood} onClose={() => setSelectedFood(null)} />
      )}
    </div>
  );
}

function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="h-80 shimmer" />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <div className="h-16 shimmer rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 shimmer rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-64 shimmer rounded-2xl" />)}
        </div>
      </div>
    </div>
  );
}
