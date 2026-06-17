import React, { useState } from 'react';
import { User, MapPin, Star, Heart, Wallet, Gift, LogOut, Edit3, Phone, Mail, ChevronRight, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    state: profile?.state || '',
    city: profile?.city || '',
  });
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="text-center">
          <User className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">Sign in to view profile</h2>
          <button onClick={() => onNavigate('auth')} className="btn-primary mt-2">Sign In</button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    setEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Profile Header */}
        <div className="card p-6 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg">
              {initials}
            </div>
            {profile?.role === 'admin' && (
              <span className="absolute -bottom-1 -right-1 bg-secondary-400 text-neutral-900 text-[10px] font-bold px-2 py-0.5 rounded-full">ADMIN</span>
            )}
          </div>
          <h2 className="text-xl font-bold font-display text-neutral-900 dark:text-neutral-100">
            {profile?.full_name || 'Food Lover'}
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">{user.email}</p>
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="font-bold text-lg text-neutral-900 dark:text-neutral-100">{profile?.loyalty_points || 0}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Points</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-neutral-900 dark:text-neutral-100">₹{profile?.wallet_balance || 0}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Wallet</p>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-primary-500" />
              Personal Info
            </h3>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={saving}
              className={`text-sm font-medium flex items-center gap-1 ${editing ? 'text-success-600 dark:text-success-400' : 'text-primary-600 dark:text-primary-400'} hover:opacity-80 transition-opacity`}
            >
              {editing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {saving ? 'Saving...' : editing ? 'Save' : 'Edit'}
            </button>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Full Name', key: 'full_name', placeholder: 'Your full name', icon: User },
              { label: 'Phone', key: 'phone', placeholder: '+91 9876543210', icon: Phone },
              { label: 'City', key: 'city', placeholder: 'Hyderabad', icon: MapPin },
              { label: 'State', key: 'state', placeholder: 'Telangana', icon: MapPin },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">{field.label}</label>
                {editing ? (
                  <div className="relative">
                    <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      value={form[field.key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="input-field pl-9 py-2.5 text-sm"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-neutral-800 dark:text-neutral-200 py-2.5 px-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    {form[field.key as keyof typeof form] || <span className="text-neutral-400">Not set</span>}
                  </p>
                )}
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Email</label>
              <p className="text-sm text-neutral-800 dark:text-neutral-200 py-2.5 px-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl flex items-center gap-2">
                <Mail className="w-4 h-4 text-neutral-400" />
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="card divide-y divide-neutral-100 dark:divide-neutral-800">
          {[
            { icon: MapPin, label: 'Saved Addresses', action: () => {} },
            { icon: Heart, label: 'Favourite Foods', action: () => {} },
            { icon: Star, label: 'My Reviews', action: () => {} },
            { icon: Gift, label: 'Refer & Earn', action: () => {} },
            { icon: Wallet, label: 'My Wallet', action: () => {} },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-primary-500" />
                </div>
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>
          ))}
        </div>

        {/* Loyalty Points */}
        <div className="bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl p-5 text-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold font-display">Loyalty Rewards</h3>
              <p className="text-sm opacity-80 mt-0.5">You have {profile?.loyalty_points || 0} points</p>
              <p className="text-xs opacity-70 mt-1">50 points = ₹10 discount</p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
          <div className="mt-3 bg-neutral-900/10 rounded-xl p-2.5">
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>0</span>
              <span>500 pts (next reward)</span>
            </div>
            <div className="h-2 bg-neutral-900/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(((profile?.loyalty_points || 0) / 500) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 p-4 text-error-600 dark:text-error-400 border-2 border-error-200 dark:border-error-800 rounded-2xl hover:bg-error-50 dark:hover:bg-error-900/20 transition-all font-semibold text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
