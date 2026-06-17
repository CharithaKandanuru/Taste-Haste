import React, { useState } from 'react';
import { ShoppingCart, Sun, Moon, Menu, X, Bell, Search, ChevronDown, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const languages = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'hi', label: 'हिंदी' },
];

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user, profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme, language, setLanguage } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Menu' },
    { id: 'orders', label: 'My Orders' },
  ];

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
    setShowProfile(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800 shadow-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
              <span className="text-lg">🍛</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold font-display text-neutral-900 dark:text-white">Taste &amp; Haste</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  currentPage === item.id
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                {item.label}
              </button>
            ))}
            {profile?.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  currentPage === 'admin'
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                Admin
              </button>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => onNavigate('menu')}
              className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-150"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Language Picker */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowLang(!showLang)}
                className="flex items-center gap-1 p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-150"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">{language}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showLang && (
                <div className="absolute right-0 mt-1 w-36 card py-1 z-50 animate-scale-in">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code as 'en' | 'te' | 'ta' | 'hi'); setShowLang(false); }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${language === lang.code ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-neutral-700 dark:text-neutral-300'}`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-150"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Cart */}
            {user && (
              <button
                onClick={() => onNavigate('cart')}
                className={`relative p-2 rounded-lg transition-all duration-150 ${
                  currentPage === 'cart'
                    ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-950'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            )}

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-150"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-neutral-700 dark:text-neutral-300 max-w-[80px] truncate">
                    {profile?.full_name?.split(' ')[0] || 'Me'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>
                {showProfile && (
                  <div className="absolute right-0 mt-1 w-48 card py-1 z-50 animate-scale-in">
                    <button onClick={() => { onNavigate('profile'); setShowProfile(false); }} className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      Profile
                    </button>
                    <button onClick={() => { onNavigate('orders'); setShowProfile(false); }} className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      My Orders
                    </button>
                    {profile?.role === 'admin' && (
                      <button onClick={() => { onNavigate('admin'); setShowProfile(false); }} className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                        Admin Panel
                      </button>
                    )}
                    <div className="border-t border-neutral-100 dark:border-neutral-800 my-1" />
                    <button onClick={handleSignOut} className="w-full px-4 py-2.5 text-left text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => onNavigate('auth')} className="btn-primary py-2 px-4 text-sm">
                Sign In
              </button>
            )}

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-neutral-100 dark:border-neutral-800 animate-slide-down">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg mb-1 transition-all ${
                  currentPage === item.id
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="flex gap-2 px-4 py-2">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as 'en' | 'te' | 'ta' | 'hi')}
                  className={`px-2 py-1 rounded text-xs font-medium ${language === lang.code ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-neutral-500 dark:text-neutral-400'}`}
                >
                  {lang.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {(showLang || showProfile) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowLang(false); setShowProfile(false); }} />
      )}
    </nav>
  );
}
