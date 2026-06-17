import React, { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, Truck, ChefHat, X, Receipt } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface OrdersPageProps {
  onNavigate: (page: string) => void;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  estimated_delivery_minutes: number | null;
  order_items?: { food_name: string; quantity_grams: number | null; persons_count: number | null; total_price: number }[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Order Placed', color: 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/30 dark:text-secondary-400', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-primary-600 bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400', icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'text-warning-600 bg-warning-100 dark:bg-warning-900/30 dark:text-warning-400', icon: ChefHat },
  packed: { label: 'Packed', color: 'text-primary-600 bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400', icon: Package },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-primary-700 bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-success-600 bg-success-100 dark:bg-success-900/30 dark:text-success-400', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-error-600 bg-error-100 dark:bg-error-900/30 dark:text-error-400', icon: X },
};

export default function OrdersPage({ onNavigate }: OrdersPageProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(food_name, quantity_grams, persons_count, total_price)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setOrders(data as Order[]);
      setLoading(false);
    };
    load();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center p-8">
          <Package className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">Sign in to view orders</h2>
          <button onClick={() => onNavigate('auth')} className="btn-primary mt-2">Sign In</button>
        </div>
      </div>
    );
  }

  const paymentLabels: Record<string, string> = {
    upi: 'UPI', gpay: 'Google Pay', phonepe: 'PhonePe', paytm: 'Paytm',
    credit_card: 'Credit Card', debit_card: 'Debit Card', cod: 'Cash on Delivery',
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold font-display text-neutral-900 dark:text-neutral-100 mb-6">My Orders</h1>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-32 shimmer rounded-2xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-300 mb-2">No orders yet</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">Place your first order and enjoy delicious food!</p>
            <button onClick={() => onNavigate('menu')} className="btn-primary">Browse Menu</button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const config = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  className="card p-5 cursor-pointer hover:shadow-card-hover transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-neutral-900 dark:text-neutral-100">#{order.order_number}</h3>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${config.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {order.order_items && order.order_items.length > 0 && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          {order.order_items[0]?.food_name}
                          {order.order_items.length > 1 && ` +${order.order_items.length - 1} more`}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-lg text-neutral-900 dark:text-neutral-100">₹{order.total_amount}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{paymentLabels[order.payment_method] || order.payment_method}</p>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedOrder?.id === order.id && (
                    <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 animate-slide-down">
                      <h4 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 mb-2">Order Items</h4>
                      <div className="space-y-2">
                        {order.order_items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <div>
                              <span className="text-neutral-700 dark:text-neutral-300">{item.food_name}</span>
                              <span className="text-neutral-400 dark:text-neutral-500 ml-1">
                                ({item.quantity_grams ? `${item.quantity_grams}g` : `${item.persons_count} persons`})
                              </span>
                            </div>
                            <span className="font-medium text-neutral-800 dark:text-neutral-200">₹{item.total_price}</span>
                          </div>
                        ))}
                      </div>

                      {/* Status Progress */}
                      <div className="mt-4">
                        <div className="flex justify-between items-center text-xs text-neutral-400 dark:text-neutral-600 mb-2">
                          <span>Placed</span>
                          <span>Confirmed</span>
                          <span>Preparing</span>
                          <span>Delivery</span>
                          <span>Done</span>
                        </div>
                        <div className="relative h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          {['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(order.status) && (
                            <div
                              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                              style={{
                                width: {
                                  pending: '10%',
                                  confirmed: '30%',
                                  preparing: '55%',
                                  packed: '65%',
                                  out_for_delivery: '80%',
                                  delivered: '100%',
                                  cancelled: '0%',
                                }[order.status] || '0%'
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
