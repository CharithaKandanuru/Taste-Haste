import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/layout/Navbar';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanel from './pages/admin/AdminPanel';

type Page =
  | 'home' | 'menu' | 'cart' | 'checkout' | 'order-success'
  | 'orders' | 'profile' | 'auth' | 'admin';

interface NavState {
  page: Page;
  params?: Record<string, unknown>;
}

function AppContent() {
  const [navState, setNavState] = useState<NavState>({ page: 'home' });

  const navigate = (page: string, params?: Record<string, unknown>) => {
    setNavState({ page: page as Page, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdminPage = navState.page === 'admin';
  const isAuthPage = navState.page === 'auth';

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-200">
      {!isAdminPage && !isAuthPage && (
        <Navbar currentPage={navState.page} onNavigate={navigate} />
      )}

      <main>
        {navState.page === 'home' && <HomePage onNavigate={navigate} />}
        {navState.page === 'menu' && <MenuPage initialCategory={navState.params?.category as string | undefined} />}
        {navState.page === 'cart' && <CartPage onNavigate={navigate} />}
        {navState.page === 'checkout' && (
          <CheckoutPage
            params={navState.params as { subtotal: number; discount: number; delivery: number; gst: number; total: number; coupon?: string }}
            onNavigate={navigate}
          />
        )}
        {navState.page === 'order-success' && (
          <OrderSuccessPage
            params={navState.params as { orderId: string; orderNumber: string }}
            onNavigate={navigate}
          />
        )}
        {navState.page === 'orders' && <OrdersPage onNavigate={navigate} />}
        {navState.page === 'profile' && <ProfilePage onNavigate={navigate} />}
        {navState.page === 'auth' && <AuthPage onNavigate={navigate} />}
        {navState.page === 'admin' && <AdminPanel onNavigate={navigate} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
