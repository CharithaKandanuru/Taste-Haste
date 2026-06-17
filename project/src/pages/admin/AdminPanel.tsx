import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart3,
  TrendingUp, DollarSign, ChefHat, Bell, Settings, Menu, X,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle, Truck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import AdminFoodsTab from './AdminFoodsTab';
import AdminOrdersTab from './AdminOrdersTab';
import AdminInventoryTab from './AdminInventoryTab';

interface AdminPanelProps {
  onNavigate: (page: string) => void;
}

type AdminTab = 'dashboard' | 'foods' | 'orders' | 'inventory' | 'analytics';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  totalFoods: number;
  totalUsers: number;
  avgOrderValue: number;
}

export default function AdminPanel({ onNavigate }: AdminPanelProps) {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0, totalRevenue: 0, todayOrders: 0, todayRevenue: 0,
    pendingOrders: 0, totalFoods: 0, totalUsers: 0, avgOrderValue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const today = new Date().toISOString().split('T')[0];
    const [ordersRes, foodsRes, todayOrdersRes] = await Promise.all([
      supabase.from('orders').select('total_amount, status, created_at, order_number, id').order('created_at', { ascending: false }),
      supabase.from('foods').select('id', { count: 'exact' }),
      supabase.from('orders').select('total_amount, status').gte('created_at', today),
    ]);

    const allOrders = ordersRes.data || [];
    const todayOrds = todayOrdersRes.data || [];

    setStats({
      totalOrders: allOrders.length,
      totalRevenue: allOrders.reduce((s, o) => s + (o.total_amount || 0), 0),
      todayOrders: todayOrds.length,
      todayRevenue: todayOrds.reduce((s, o) => s + (o.total_amount || 0), 0),
      pendingOrders: allOrders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length,
      totalFoods: foodsRes.count || 0,
      totalUsers: Math.floor(allOrders.length * 0.7) + 5,
      avgOrderValue: allOrders.length ? Math.round(allOrders.reduce((s, o) => s + (o.total_amount || 0), 0) / allOrders.length) : 0,
    });
    setRecentOrders(allOrders.slice(0, 8) as Record<string, unknown>[]);
    setLoading(false);
  };

  const handleSelfPromote = async () => {
    if (!user) { onNavigate('auth'); return; }
    await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
    window.location.reload();
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">Admin Access Required</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">You don't have admin permissions yet.</p>
          {user ? (
            <div className="space-y-3">
              <p className="text-xs text-neutral-400">For demo: promote your account to admin</p>
              <button onClick={handleSelfPromote} className="btn-primary w-full">Become Admin (Demo)</button>
              <button onClick={() => onNavigate('home')} className="btn-secondary w-full">Go Home</button>
            </div>
          ) : (
            <div className="space-y-2">
              <button onClick={() => onNavigate('auth')} className="btn-primary w-full">Sign In First</button>
              <button onClick={() => onNavigate('home')} className="btn-secondary w-full">Go Home</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const navItems: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'foods', label: 'Food Menu', icon: ChefHat },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400',
    confirmed: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    preparing: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
    packed: 'bg-primary-100 text-primary-700',
    out_for_delivery: 'bg-primary-100 text-primary-700',
    delivered: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
    cancelled: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} flex-shrink-0 bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className={`p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-lg">🍛</span>
          </div>
          {sidebarOpen && (
            <div>
              <p className="font-bold text-sm font-display text-neutral-900 dark:text-neutral-100 leading-tight">Taste & Haste</p>
              <p className="text-[10px] text-primary-500 font-medium">Admin Portal</p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-3' : 'justify-center px-2'} py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                activeTab === item.id
                  ? 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
              {sidebarOpen && item.id === 'orders' && stats.pendingOrders > 0 && (
                <span className="ml-auto bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pendingOrders}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Toggle */}
        <div className="p-3 border-t border-neutral-100 dark:border-neutral-800">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center py-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <h1 className="text-lg font-bold font-display text-neutral-900 dark:text-neutral-100 capitalize">
            {activeTab === 'dashboard' ? 'Dashboard' : navItems.find(n => n.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse-soft" />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Live</span>
            <button onClick={() => onNavigate('home')} className="text-xs text-neutral-500 hover:text-primary-600 transition-colors">← Back to App</button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, change: '+12%', up: true, color: 'text-success-600 bg-success-50 dark:bg-success-900/30' },
                  { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, change: '+8%', up: true, color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' },
                  { label: "Today's Orders", value: stats.todayOrders.toString(), icon: Clock, change: '+3', up: true, color: 'text-secondary-600 bg-secondary-50 dark:bg-secondary-900/30' },
                  { label: 'Avg Order Value', value: `₹${stats.avgOrderValue}`, icon: TrendingUp, change: '+5%', up: true, color: 'text-warning-600 bg-warning-50 dark:bg-warning-900/30' },
                ].map(stat => (
                  <div key={stat.label} className="card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className={`flex items-center gap-0.5 text-xs font-semibold ${stat.up ? 'text-success-600 dark:text-success-400' : 'text-error-500'}`}>
                        {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold font-display text-neutral-900 dark:text-neutral-100">{stat.value}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Pending Orders', value: stats.pendingOrders, icon: '⏳', color: 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800' },
                  { label: 'Menu Items', value: stats.totalFoods, icon: '🍛', color: 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' },
                  { label: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString()}`, icon: '💰', color: 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800' },
                ].map(item => (
                  <div key={item.label} className={`rounded-2xl p-4 border ${item.color} flex items-center gap-4`}>
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <p className="text-2xl font-bold font-display text-neutral-900 dark:text-neutral-100">{item.value}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue Chart (Visual) */}
              <div className="card p-5">
                <h2 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4">Revenue Overview</h2>
                <div className="flex items-end gap-1 h-32">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-md transition-all duration-700 hover:from-primary-600 hover:to-primary-500"
                        style={{ height: `${h}%` }}
                        title={`Week ${i + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-neutral-400">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                  <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="card">
                <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <h2 className="font-bold text-neutral-900 dark:text-neutral-100">Recent Orders</h2>
                  <button onClick={() => setActiveTab('orders')} className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium">View All</button>
                </div>
                {loading ? (
                  <div className="p-5 space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-12 shimmer rounded-xl" />)}
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {recentOrders.slice(0, 5).map((order) => (
                      <div key={order.id as string} className="flex items-center justify-between px-5 py-3">
                        <div>
                          <p className="font-medium text-sm text-neutral-800 dark:text-neutral-200">#{order.order_number as string}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {new Date(order.created_at as string).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[order.status as string] || ''}`}>
                          {(order.status as string).replace('_', ' ')}
                        </span>
                        <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100">₹{order.total_amount as number}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'foods' && <AdminFoodsTab />}
          {activeTab === 'orders' && <AdminOrdersTab onRefresh={loadDashboard} />}
          {activeTab === 'inventory' && <AdminInventoryTab />}

          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Biryani Orders', pct: 45, color: 'bg-primary-500' },
                  { label: 'Thali Orders', pct: 25, color: 'bg-secondary-500' },
                  { label: 'Curry Orders', pct: 20, color: 'bg-success-500' },
                  { label: 'Snacks', pct: 10, color: 'bg-warning-500' },
                ].map(item => (
                  <div key={item.label} className="card p-4 text-center">
                    <div className="relative w-16 h-16 mx-auto mb-3">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" className="text-neutral-100 dark:text-neutral-800" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15.9" fill="none"
                          stroke="currentColor" className={item.color.replace('bg-', 'text-')}
                          strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={`${item.pct} ${100 - item.pct}`}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-neutral-800 dark:text-neutral-200">{item.pct}%</span>
                    </div>
                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="card p-5">
                <h2 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4">Popular Foods</h2>
                <div className="space-y-3">
                  {[
                    { name: 'Hyderabadi Chicken Biryani', orders: 142, pct: 92 },
                    { name: 'Gongura Mutton Curry', orders: 89, pct: 58 },
                    { name: 'Andhra Meals', orders: 76, pct: 49 },
                    { name: 'Veg Biryani', orders: 65, pct: 42 },
                    { name: 'Masala Chai', orders: 54, pct: 35 },
                  ].map(item => (
                    <div key={item.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-700 dark:text-neutral-300 font-medium">{item.name}</span>
                        <span className="text-neutral-500 dark:text-neutral-400">{item.orders} orders</span>
                      </div>
                      <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full" style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
