import React, { useState, useEffect } from 'react';
import { MapPin, Plus, CreditCard, Wallet, Smartphone, Banknote, Check, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface CheckoutPageProps {
  params: {
    subtotal: number;
    discount: number;
    delivery: number;
    gst: number;
    total: number;
    coupon?: string;
  };
  onNavigate: (page: string, params?: Record<string, unknown>) => void;
}

interface Address {
  id: string;
  label: string;
  full_address: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

const paymentMethods = [
  { id: 'upi', label: 'UPI', icon: '📱', desc: 'Pay via any UPI app' },
  { id: 'gpay', label: 'Google Pay', icon: '🟢', desc: 'Quick & secure' },
  { id: 'phonepe', label: 'PhonePe', icon: '🟣', desc: 'Fast UPI payments' },
  { id: 'paytm', label: 'Paytm', icon: '🔵', desc: 'Wallet & UPI' },
  { id: 'credit_card', label: 'Credit Card', icon: '💳', desc: 'Visa, Mastercard' },
  { id: 'debit_card', label: 'Debit Card', icon: '💳', desc: 'All bank cards' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when delivered' },
];

export default function CheckoutPage({ params, onNavigate }: CheckoutPageProps) {
  const { user, profile } = useAuth();
  const { items, clearCart } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'Home', full_address: '', city: '', state: '', pincode: '' });

  useEffect(() => {
    if (!user) return;
    supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }).then(({ data }) => {
      if (data) {
        setAddresses(data);
        const def = data.find(a => a.is_default) || data[0];
        if (def) setSelectedAddress(def);
      }
    });
  }, [user]);

  const handleAddAddress = async () => {
    if (!user) return;
    const { data } = await supabase.from('addresses').insert({
      ...newAddr,
      user_id: user.id,
      is_default: addresses.length === 0,
    }).select().single();
    if (data) {
      setAddresses(prev => [...prev, data]);
      setSelectedAddress(data);
      setShowNewAddress(false);
      setNewAddr({ label: 'Home', full_address: '', city: '', state: '', pincode: '' });
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress || items.length === 0) return;
    setPlacing(true);

    const orderNumber = `TH${Date.now().toString().slice(-8)}`;
    const { data: order, error } = await supabase.from('orders').insert({
      order_number: orderNumber,
      user_id: user.id,
      address_id: selectedAddress.id,
      delivery_address: selectedAddress,
      status: 'pending',
      payment_method: selectedPayment,
      payment_status: selectedPayment === 'cod' ? 'pending' : 'paid',
      subtotal: params.subtotal,
      delivery_charge: params.delivery,
      gst_amount: params.gst,
      discount_amount: params.discount,
      total_amount: params.total,
      coupon_code: params.coupon || null,
      estimated_delivery_minutes: 45,
    }).select().single();

    if (error || !order) {
      setPlacing(false);
      return;
    }

    // Insert order items
    await supabase.from('order_items').insert(
      items.map(item => ({
        order_id: order.id,
        food_id: item.food_id,
        food_name: item.food_name,
        food_image_url: item.food_image_url,
        order_type: item.order_type,
        quantity_grams: item.quantity_grams,
        persons_count: item.persons_count,
        unit_price: item.unit_price,
        total_price: item.unit_price,
      }))
    );

    // Add initial status history
    await supabase.from('order_status_history').insert({
      order_id: order.id,
      status: 'pending',
      message: 'Order placed successfully',
      changed_by: user.id,
    });

    await clearCart();
    setPlacing(false);
    onNavigate('order-success', { orderId: order.id, orderNumber });
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => onNavigate('cart')} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5 text-neutral-500" />
          </button>
          <h1 className="text-2xl font-bold font-display text-neutral-900 dark:text-neutral-100">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Delivery Address */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-500" />
                  Delivery Address
                </h2>
                <button
                  onClick={() => setShowNewAddress(!showNewAddress)}
                  className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700"
                >
                  <Plus className="w-4 h-4" /> Add New
                </button>
              </div>

              {addresses.length === 0 && !showNewAddress && (
                <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center py-4">No saved addresses. Add one to continue.</p>
              )}

              <div className="space-y-2">
                {addresses.map(addr => (
                  <button
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selectedAddress?.id === addr.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase">{addr.label}</span>
                        {addr.is_default && <span className="ml-2 text-xs text-neutral-400">(Default)</span>}
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5">{addr.full_address}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                      {selectedAddress?.id === addr.id && (
                        <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {showNewAddress && (
                <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-3 animate-slide-down">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">Label</label>
                      <select value={newAddr.label} onChange={e => setNewAddr(p => ({ ...p, label: e.target.value }))} className="input-field text-sm py-2">
                        <option>Home</option>
                        <option>Work</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">Pincode</label>
                      <input value={newAddr.pincode} onChange={e => setNewAddr(p => ({ ...p, pincode: e.target.value }))} className="input-field text-sm py-2" placeholder="500001" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">Full Address</label>
                    <input value={newAddr.full_address} onChange={e => setNewAddr(p => ({ ...p, full_address: e.target.value }))} className="input-field text-sm py-2" placeholder="Street, Area" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">City</label>
                      <input value={newAddr.city} onChange={e => setNewAddr(p => ({ ...p, city: e.target.value }))} className="input-field text-sm py-2" placeholder="Hyderabad" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">State</label>
                      <input value={newAddr.state} onChange={e => setNewAddr(p => ({ ...p, state: e.target.value }))} className="input-field text-sm py-2" placeholder="Telangana" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddAddress} className="btn-primary flex-1 py-2 text-sm">Save Address</button>
                    <button onClick={() => setShowNewAddress(false)} className="btn-secondary flex-1 py-2 text-sm">Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="card p-5">
              <h2 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary-500" />
                Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${selectedPayment === method.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300'}`}
                  >
                    <span className="text-xl">{method.icon}</span>
                    <div>
                      <p className="font-medium text-sm text-neutral-800 dark:text-neutral-200">{method.label}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{method.desc}</p>
                    </div>
                    {selectedPayment === method.id && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card p-5 sticky top-24">
              <h2 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm mb-4">
                {items.slice(0, 3).map(item => (
                  <div key={item.id} className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span className="truncate flex-1 mr-2">{item.food_name}</span>
                    <span className="font-medium">₹{item.unit_price}</span>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-xs text-neutral-400">+{items.length - 3} more items</p>
                )}
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2 space-y-1.5">
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Subtotal</span><span>₹{params.subtotal}</span>
                  </div>
                  {params.discount > 0 && (
                    <div className="flex justify-between text-success-600 dark:text-success-400">
                      <span>Discount</span><span>-₹{params.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Delivery</span>
                    <span className={params.delivery === 0 ? 'text-success-600 dark:text-success-400 font-medium' : ''}>
                      {params.delivery === 0 ? 'FREE' : `₹${params.delivery}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>GST (5%)</span><span>₹{params.gst}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-neutral-900 dark:text-neutral-100 border-t border-neutral-100 dark:border-neutral-800 pt-2">
                    <span>Total</span><span>₹{params.total}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing || !selectedAddress || items.length === 0}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {placing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {placing ? 'Placing Order...' : `Place Order • ₹${params.total}`}
              </button>

              {!selectedAddress && (
                <p className="text-xs text-error-500 text-center mt-2">Please add a delivery address</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
