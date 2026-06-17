import React, { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, Tag, ChevronRight, ArrowLeft, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface CartPageProps {
  onNavigate: (page: string, params?: Record<string, unknown>) => void;
}

const GST_RATE = 0.05;
const DELIVERY_CHARGE = 40;
const FREE_DELIVERY_THRESHOLD = 500;

export default function CartPage({ onNavigate }: CartPageProps) {
  const { items, removeItem, updateItem, clearCart, subtotal, loading } = useCart();
  const { user } = useAuth();
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">Sign in to view cart</h2>
          <button onClick={() => onNavigate('auth')} className="btn-primary mt-2">Sign In</button>
        </div>
      </div>
    );
  }

  const applyValidCoupons: Record<string, number> = {
    'FIRST50': 50,
    'BIRYANI20': 20,
    'FLAT100': 100,
    'NEWUSER': 30,
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = coupon.toUpperCase().trim();
    if (code === 'FIRST50') {
      setAppliedCoupon({ code, discount: Math.min(subtotal * 0.5, 150) });
    } else if (code === 'BIRYANI20') {
      setAppliedCoupon({ code, discount: Math.min(subtotal * 0.2, 100) });
    } else if (code === 'FLAT100' && subtotal >= 500) {
      setAppliedCoupon({ code, discount: 100 });
    } else if (code === 'NEWUSER') {
      setAppliedCoupon({ code, discount: Math.min(subtotal * 0.3, 120) });
    } else {
      setCouponError('Invalid or expired coupon code');
    }
  };

  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const discountAmount = appliedCoupon?.discount || 0;
  const gstAmount = Math.round((subtotal - discountAmount) * GST_RATE);
  const total = subtotal - discountAmount + deliveryCharge + gstAmount;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="text-7xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold font-display text-neutral-800 dark:text-neutral-200 mb-2">Your cart is empty</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">Add some delicious items to get started!</p>
          <button onClick={() => onNavigate('menu')} className="btn-primary">
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => onNavigate('menu')} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5 text-neutral-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-display text-neutral-900 dark:text-neutral-100">Your Cart</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.id} className="card p-4 flex gap-4 animate-fade-in">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={item.food_image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'}
                    alt={item.food_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className={`w-3.5 h-3.5 border-2 ${item.is_veg ? 'border-success-500' : 'border-error-500'} rounded flex items-center justify-center flex-shrink-0`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${item.is_veg ? 'bg-success-500' : 'bg-error-500'}`} />
                        </div>
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm truncate">{item.food_name}</h3>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {item.order_type === 'weight'
                          ? `${item.quantity_grams}g`
                          : `${item.persons_count} person${(item.persons_count || 1) > 1 ? 's' : ''}`
                        }
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-neutral-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">₹{item.unit_price}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Coupon */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-primary-500" />
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Apply Coupon</h3>
              </div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-success-50 dark:bg-success-900/30 p-3 rounded-xl">
                  <div>
                    <span className="font-semibold text-success-700 dark:text-success-300 text-sm">{appliedCoupon.code}</span>
                    <p className="text-xs text-success-600 dark:text-success-400">Saved ₹{Math.round(appliedCoupon.discount)}</p>
                  </div>
                  <button onClick={() => setAppliedCoupon(null)} className="text-success-600 hover:text-error-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponError(''); }}
                    placeholder="Enter coupon code"
                    className="input-field flex-1 text-sm py-2.5"
                  />
                  <button onClick={handleApplyCoupon} className="btn-primary py-2.5 px-4 text-sm">Apply</button>
                </div>
              )}
              {couponError && <p className="text-xs text-error-500 mt-1">{couponError}</p>}
              <div className="flex gap-2 flex-wrap mt-2">
                {['FIRST50', 'BIRYANI20', 'FLAT100'].map(c => (
                  <button
                    key={c}
                    onClick={() => { setCoupon(c); setCouponError(''); }}
                    className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-lg font-medium hover:bg-primary-100 transition-all"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-3">
            <div className="card p-4">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4">Order Summary</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-success-600 dark:text-success-400">
                    <span>Coupon Discount</span>
                    <span>-₹{Math.round(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Delivery Charges</span>
                  <span className={deliveryCharge === 0 ? 'text-success-600 dark:text-success-400 font-medium' : ''}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
                {deliveryCharge > 0 && (
                  <p className="text-xs text-neutral-400">Add ₹{FREE_DELIVERY_THRESHOLD - subtotal} more for free delivery</p>
                )}
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>GST (5%)</span>
                  <span>₹{gstAmount}</span>
                </div>
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2.5 flex justify-between font-bold text-base text-neutral-900 dark:text-neutral-100">
                  <span>Total</span>
                  <span>₹{Math.round(total)}</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('checkout', {
                  subtotal,
                  discount: Math.round(discountAmount),
                  delivery: deliveryCharge,
                  gst: gstAmount,
                  total: Math.round(total),
                  coupon: appliedCoupon?.code,
                })}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Delivery Info */}
            <div className="card p-4 flex items-start gap-3">
              <Package className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-neutral-800 dark:text-neutral-200 text-sm">Estimated Delivery</p>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">30-45 minutes from order confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
