import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X, Loader2, Star, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Food {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_per_kg: number | null;
  price_per_person: number | null;
  is_veg: boolean;
  spice_level: string;
  is_available: boolean;
  is_today_special: boolean;
  category_id: string | null;
  native_regions: string[] | null;
  tags: string[] | null;
  categories?: { name: string };
}

interface Category {
  id: string;
  name: string;
}

const emptyForm = {
  name: '', description: '', image_url: '',
  price_per_kg: '', price_per_person: '',
  is_veg: true, spice_level: 'medium',
  category_id: '', native_regions: '', tags: '',
  is_available: true, is_today_special: false,
};

export default function AdminFoodsTab() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    const [foodsRes, catsRes] = await Promise.all([
      supabase.from('foods').select('*, categories(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('id, name').order('sort_order'),
    ]);
    if (foodsRes.data) setFoods(foodsRes.data as Food[]);
    if (catsRes.data) setCategories(catsRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (food: Food) => {
    setEditId(food.id);
    setForm({
      name: food.name,
      description: food.description || '',
      image_url: food.image_url || '',
      price_per_kg: food.price_per_kg?.toString() || '',
      price_per_person: food.price_per_person?.toString() || '',
      is_veg: food.is_veg,
      spice_level: food.spice_level,
      category_id: food.category_id || '',
      native_regions: food.native_regions?.join(', ') || '',
      tags: food.tags?.join(', ') || '',
      is_available: food.is_available,
      is_today_special: food.is_today_special,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description || null,
      image_url: form.image_url || null,
      price_per_kg: form.price_per_kg ? parseFloat(form.price_per_kg) : null,
      price_per_person: form.price_per_person ? parseFloat(form.price_per_person) : null,
      is_veg: form.is_veg,
      spice_level: form.spice_level,
      category_id: form.category_id || null,
      native_regions: form.native_regions ? form.native_regions.split(',').map(r => r.trim()).filter(Boolean) : [],
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      is_available: form.is_available,
      is_today_special: form.is_today_special,
      updated_at: new Date().toISOString(),
    };

    if (editId) {
      await supabase.from('foods').update(payload).eq('id', editId);
    } else {
      await supabase.from('foods').insert(payload);
    }

    setSaving(false);
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this food item?')) return;
    await supabase.from('foods').update({ is_available: false }).eq('id', id);
    await load();
  };

  const toggleSpecial = async (id: string, current: boolean) => {
    await supabase.from('foods').update({ is_today_special: !current }).eq('id', id);
    await load();
  };

  const filtered = foods.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.categories?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-3">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search food items..."
            className="input-field text-sm py-2.5"
          />
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}
          className="btn-primary flex items-center gap-2 text-sm py-2.5 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Food
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-5 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100">{editId ? 'Edit Food Item' : 'Add New Food Item'}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
              <X className="w-4 h-4 text-neutral-500" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">Food Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Hyderabadi Biryani" className="input-field text-sm py-2.5" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe this dish..." className="input-field text-sm py-2.5 resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">Image URL</label>
              <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://images.pexels.com/..." className="input-field text-sm py-2.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">Price per KG (₹)</label>
              <input type="number" value={form.price_per_kg} onChange={e => setForm(p => ({ ...p, price_per_kg: e.target.value }))} placeholder="450" className="input-field text-sm py-2.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">Price per Person (₹)</label>
              <input type="number" value={form.price_per_person} onChange={e => setForm(p => ({ ...p, price_per_person: e.target.value }))} placeholder="180" className="input-field text-sm py-2.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">Category</label>
              <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))} className="input-field text-sm py-2.5">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">Spice Level</label>
              <select value={form.spice_level} onChange={e => setForm(p => ({ ...p, spice_level: e.target.value }))} className="input-field text-sm py-2.5">
                <option value="mild">🌿 Mild</option>
                <option value="medium">🌶️ Medium</option>
                <option value="hot">🔥 Hot</option>
                <option value="extra_hot">💥 Extra Hot</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">Native Regions (comma separated)</label>
              <input value={form.native_regions} onChange={e => setForm(p => ({ ...p, native_regions: e.target.value }))} placeholder="andhra_pradesh, telangana" className="input-field text-sm py-2.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="bestseller, spicy, veg" className="input-field text-sm py-2.5" />
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_veg} onChange={e => setForm(p => ({ ...p, is_veg: e.target.checked }))} className="w-4 h-4 accent-success-500" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">🌿 Vegetarian</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_today_special} onChange={e => setForm(p => ({ ...p, is_today_special: e.target.checked }))} className="w-4 h-4 accent-primary-500" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">⚡ Today's Special</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_available} onChange={e => setForm(p => ({ ...p, is_available: e.target.checked }))} className="w-4 h-4 accent-primary-500" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">✅ Available</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={saving || !form.name} className="btn-primary flex items-center gap-2 text-sm py-2.5">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : editId ? 'Update Food' : 'Add Food'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }} className="btn-secondary text-sm py-2.5">Cancel</button>
          </div>
        </div>
      )}

      {/* Foods Table */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 shimmer rounded-xl" />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Food</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3">Price</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Status</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Special</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filtered.map(food => (
                  <tr key={food.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={food.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'}
                          alt={food.name}
                          className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="font-medium text-sm text-neutral-800 dark:text-neutral-200 max-w-[150px] truncate">{food.name}</p>
                          <div className={`w-3 h-3 border-2 ${food.is_veg ? 'border-success-500' : 'border-error-500'} rounded mt-0.5 flex items-center justify-center`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${food.is_veg ? 'bg-success-500' : 'bg-error-500'}`} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{food.categories?.name || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {food.price_per_kg && <span className="text-neutral-700 dark:text-neutral-300">₹{food.price_per_kg}/kg</span>}
                        {food.price_per_person && <span className="text-neutral-700 dark:text-neutral-300 block">₹{food.price_per_person}/p</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${food.is_available ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' : 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400'}`}>
                        {food.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <button onClick={() => toggleSpecial(food.id, food.is_today_special)} className="transition-all">
                        {food.is_today_special
                          ? <span className="text-xs font-semibold bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-2 py-1 rounded-full">⚡ Special</span>
                          : <span className="text-xs text-neutral-400 hover:text-primary-500">Set Special</span>
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(food)} className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-neutral-400 hover:text-primary-600 rounded-lg transition-all">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(food.id)} className="p-2 hover:bg-error-50 dark:hover:bg-error-900/20 text-neutral-400 hover:text-error-500 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
