import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Loader2, User, MapPin, CreditCard } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  delivery_address: Record<string, unknown>;
  special_instructions: string | null;
  order_items?: { food_name: string; quantity_grams: number | null; persons_count: number | null; total_price: number }[];
}

const allStatuses = ['pending', 'confirmed', 'preparing', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];
const statusColors: Record<string, string> = {
  pending: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400',
  confirmed: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  preparing: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
  packed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  out_for_delivery: 'bg-primary-100 text-primary-700',
  delivered: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
  cancelled: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
};

interface AdminOrdersTabProps {
  onRefresh: () => void;
}

export default function AdminOrdersTab({ onRefresh }: AdminOrdersTabProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    const query = supabase.from('orders').select('*, order_items(food_name, quantity_grams, persons_count, total_price)').order('created_at', { ascending: false });
    if (statusFilter) query.eq('status', statusFilter);
    const { data } = await query;
    if (data) setOrders(data as Order[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    await supabase.from('order_status_history').insert({ order_id: id, status, message: `Status updated to ${status}` });
    await load();
    onRefresh();
    setUpdatingId(null);
  };

  const paymentLabels: Record<string, string> = {
    upi: 'UPI', gpay: 'Google Pay', phonepe: 'PhonePe', paytm: 'Paytm',
    credit_card: 'Credit Card', debit_card: 'Debit Card', cod: 'Cash on Delivery',
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filter Bar */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setStatusFilter('')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all border ${!statusFilter ? 'bg-primary-500 text-white border-primary-500' : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'}`}
        >
          All Orders ({orders.length})
        </button>
        {allStatuses.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s === statusFilter ? '' : s)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all border capitalize ${statusFilter === s ? 'bg-primary-500 text-white border-primary-500' : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'}`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 shimmer rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-neutral-500 dark:text-neutral-400">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="card overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                <div className="flex items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">#{order.order_number}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[order.status] || ''}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {paymentLabels[order.payment_method]} • <span className={order.payment_status === 'paid' ? 'text-success-600 dark:text-success-400' : 'text-warning-600 dark:text-warning-400'}>{order.payment_status}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">₹{order.total_amount}</span>
                  {expandedId === order.id ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                </div>
              </div>

              {expandedId === order.id && (
                <div className="px-4 pb-4 pt-0 border-t border-neutral-100 dark:border-neutral-800 animate-slide-down">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {/* Items */}
                    <div>
                      <h4 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 mb-2">Order Items</h4>
                      <div className="space-y-1.5">
                        {order.order_items?.map((item, i) => (
                          <div key={i} className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 rounded-lg">
                            <span>{item.food_name} ({item.quantity_grams ? `${item.quantity_grams}g` : `${item.persons_count}p`})</span>
                            <span className="font-medium">₹{item.total_price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div>
                      <h4 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 mb-2 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary-500" />
                        Delivery Address
                      </h4>
                      <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 text-xs text-neutral-600 dark:text-neutral-400 space-y-0.5">
                        <p className="font-medium text-neutral-800 dark:text-neutral-200">{order.delivery_address?.label as string}</p>
                        <p>{order.delivery_address?.full_address as string}</p>
                        <p>{order.delivery_address?.city as string}, {order.delivery_address?.state as string} - {order.delivery_address?.pincode as string}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 mb-2">Update Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {allStatuses.filter(s => s !== order.status).map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(order.id, s)}
                          disabled={updatingId === order.id}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            s === 'cancelled' ? 'bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400 hover:bg-error-100' : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100'
                          } ${updatingId === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {updatingId === order.id ? '...' : s.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
