import React, { useState } from 'react';
import { X, Star, ShoppingCart, Minus, Plus, Weight, Users, Flame, Leaf, Info, Check } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

interface Food {
  id: string;
  name: string;
  name_te?: string | null;
  description: string | null;
  image_url: string | null;
  price_per_kg: number | null;
  price_per_person: number | null;
  min_weight_grams?: number | null;
  max_weight_kg?: number | null;
  min_persons?: number | null;
  max_persons?: number | null;
  is_veg: boolean;
  spice_level: string;
  ingredients?: string[] | null;
  native_regions?: string[] | null;
  avg_rating?: number | null;
  total_reviews?: number | null;
  categories?: { name: string };
}

interface FoodDetailModalProps {
  food: Food;
  onClose: () => void;
  onRequireAuth?: () => void;
}

const weightOptions = [250, 500, 1000, 2000];
const personOptions = [1, 2, 4, 6, 10, 20];

export default function FoodDetailModal({ food, onClose, onRequireAuth }: FoodDetailModalProps) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [orderType, setOrderType] = useState<'weight' | 'persons'>(food.price_per_person ? 'persons' : 'weight');
  const [weightGrams, setWeightGrams] = useState(500);
  const [customWeight, setCustomWeight] = useState('');
  const [persons, setPersons] = useState(2);
  const [customPersons, setCustomPersons] = useState('');
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'ingredients' | 'reviews'>('details');

  const calcPrice = () => {
    if (orderType === 'weight' && food.price_per_kg) {
      const w = customWeight ? parseInt(customWeight) : weightGrams;
      return Math.round((food.price_per_kg / 1000) * w);
    }
    if (orderType === 'persons' && food.price_per_person) {
      const p = customPersons ? parseInt(customPersons) : persons;
      return Math.round(food.price_per_person * p);
    }
    return 0;
  };

  const handleAddToCart = async () => {
    if (!user) {
      onClose();
      onRequireAuth?.();
      return;
    }
    const price = calcPrice();
    const w = customWeight ? parseInt(customWeight) : weightGrams;
    const p = customPersons ? parseInt(customPersons) : persons;

    await addItem({
      food_id: food.id,
      food_name: food.name,
      food_image_url: food.image_url,
      is_veg: food.is_veg,
      order_type: orderType,
      quantity_grams: orderType === 'weight' ? w : null,
      persons_count: orderType === 'persons' ? p : null,
      unit_price: price,
      total_price: price,
    });
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 1200);
  };

  const displayPrice = calcPrice();

  const spiceLabels: Record<string, string> = { mild: 'Mild', medium: 'Medium', hot: 'Hot', extra_hot: 'Extra Hot' };
  const spiceColors: Record<string, string> = {
    mild: 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300',
    medium: 'bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300',
    hot: 'bg-error-100 text-error-600 dark:bg-error-900/40 dark:text-error-300',
    extra_hot: 'bg-error-200 text-error-700 dark:bg-error-900/60 dark:text-error-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-neutral-900 w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl max-h-[95vh] overflow-hidden flex flex-col animate-slide-up shadow-modal">
        {/* Image Header */}
        <div className="relative h-56 sm:h-64 flex-shrink-0">
          <img
            src={food.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'}
            alt={food.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-white/90 dark:bg-neutral-900/90 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-neutral-800 transition-all shadow-md"
          >
            <X className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
          </button>
          <div className="absolute bottom-4 left-4 right-16">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-4 h-4 border-2 ${food.is_veg ? 'border-success-500' : 'border-error-500'} rounded flex items-center justify-center bg-white flex-shrink-0`}>
                <div className={`w-2 h-2 rounded-full ${food.is_veg ? 'bg-success-500' : 'bg-error-500'}`} />
              </div>
              {food.categories && (
                <span className="text-white/80 text-xs bg-black/30 px-2 py-0.5 rounded-full">{food.categories.name}</span>
              )}
            </div>
            <h2 className="text-xl font-bold font-display text-white">{food.name}</h2>
            {food.name_te && <p className="text-white/70 text-sm">{food.name_te}</p>}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-5">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {food.avg_rating && food.avg_rating > 0 ? (
                <div className="flex items-center gap-1.5 bg-success-50 dark:bg-success-900/30 px-3 py-1.5 rounded-full">
                  <Star className="w-4 h-4 text-secondary-500 fill-secondary-500" />
                  <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">{food.avg_rating.toFixed(1)}</span>
                  {food.total_reviews && <span className="text-neutral-500 dark:text-neutral-400 text-xs">({food.total_reviews})</span>}
                </div>
              ) : null}
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${spiceColors[food.spice_level] || ''}`}>
                {food.spice_level === 'mild' ? '🌿' : food.spice_level === 'medium' ? '🌶️' : food.spice_level === 'hot' ? '🔥' : '💥'} {spiceLabels[food.spice_level] || food.spice_level}
              </span>
              {food.native_regions && food.native_regions.length > 0 && food.native_regions[0] !== 'all' && (
                <span className="bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 px-3 py-1.5 rounded-full text-xs font-semibold">
                  📍 {food.native_regions[0].replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1 mb-4">
              {(['details', 'ingredients', 'reviews'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${activeTab === tab ? 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-neutral-500 dark:text-neutral-400'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'details' && (
              <div>
                {food.description && (
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-4">{food.description}</p>
                )}
              </div>
            )}
            {activeTab === 'ingredients' && food.ingredients && (
              <div className="flex flex-wrap gap-2">
                {food.ingredients.map(ing => (
                  <span key={ing} className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-3 py-1.5 rounded-full text-xs">
                    {ing}
                  </span>
                ))}
              </div>
            )}
            {activeTab === 'reviews' && (
              <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center py-4">No reviews yet. Be the first to review!</p>
            )}

            {/* Order Configuration */}
            <div className="mt-5 pt-5 border-t border-neutral-100 dark:border-neutral-800">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">How would you like to order?</h3>

              {/* Order Type Toggle */}
              <div className="flex gap-2 mb-4">
                {food.price_per_kg && (
                  <button
                    onClick={() => setOrderType('weight')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${orderType === 'weight' ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'}`}
                  >
                    <Weight className="w-4 h-4" /> By Weight
                  </button>
                )}
                {food.price_per_person && (
                  <button
                    onClick={() => setOrderType('persons')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${orderType === 'persons' ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'}`}
                  >
                    <Users className="w-4 h-4" /> By Persons
                  </button>
                )}
              </div>

              {/* Weight Selector */}
              {orderType === 'weight' && (
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Select quantity (₹{food.price_per_kg}/kg)</p>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {weightOptions.map(w => (
                      <button
                        key={w}
                        onClick={() => { setWeightGrams(w); setCustomWeight(''); }}
                        className={`py-2 rounded-xl text-xs font-medium border-2 transition-all ${!customWeight && weightGrams === w ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'}`}
                      >
                        {w < 1000 ? `${w}g` : `${w/1000}kg`}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number" placeholder="Custom weight (grams)"
                    value={customWeight}
                    onChange={e => setCustomWeight(e.target.value)}
                    className="input-field text-sm"
                    min={food.min_weight_grams || 100}
                    max={(food.max_weight_kg || 5) * 1000}
                  />
                </div>
              )}

              {/* Persons Selector */}
              {orderType === 'persons' && (
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Select number of persons (₹{food.price_per_person}/person)</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                    {personOptions.map(p => (
                      <button
                        key={p}
                        onClick={() => { setPersons(p); setCustomPersons(''); }}
                        className={`py-2 rounded-xl text-xs font-medium border-2 transition-all ${!customPersons && persons === p ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'}`}
                      >
                        {p === 1 ? '1' : `${p}`}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number" placeholder="Custom number of persons"
                    value={customPersons}
                    onChange={e => setCustomPersons(e.target.value)}
                    className="input-field text-sm"
                    min={food.min_persons || 1}
                    max={food.max_persons || 100}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="flex-shrink-0 p-4 sm:p-5 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {orderType === 'weight'
                  ? `${customWeight || weightGrams}g`
                  : `${customPersons || persons} person${(parseInt(customPersons) || persons) > 1 ? 's' : ''}`}
              </p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {displayPrice > 0 ? `₹${displayPrice}` : 'Select quantity'}
              </p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={displayPrice === 0}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 ${
                added
                  ? 'bg-success-500 text-white'
                  : displayPrice === 0
                  ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              {added ? 'Added!' : user ? 'Add to Cart' : 'Login to Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
