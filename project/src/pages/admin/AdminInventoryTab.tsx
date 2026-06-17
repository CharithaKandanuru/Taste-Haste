import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Save, X, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface InventoryItem {
  id: string;
  ingredient_name: string;
  unit: string;
  current_stock: number;
  min_stock_alert: number;
  cost_per_unit: number | null;
  supplier: string | null;
  last_restocked_at: string | null;
}

export default function AdminInventoryTab() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({ ingredient_name: '', unit: 'kg', current_stock: '', min_stock_alert: '', cost_per_unit: '', supplier: '' });

  const load = async () => {
    const { data } = await supabase.from('inventory').select('*').order('ingredient_name');
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStock = async (id: string) => {
    setSaving(true);
    await supabase.from('inventory').update({
      current_stock: parseFloat(editStock),
      last_restocked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    setEditId(null);
    setEditStock('');
    setSaving(false);
    await load();
  };

  const addItem = async () => {
    if (!newItem.ingredient_name) return;
    setSaving(true);
    await supabase.from('inventory').insert({
      ingredient_name: newItem.ingredient_name,
      unit: newItem.unit,
      current_stock: parseFloat(newItem.current_stock) || 0,
      min_stock_alert: parseFloat(newItem.min_stock_alert) || 5,
      cost_per_unit: newItem.cost_per_unit ? parseFloat(newItem.cost_per_unit) : null,
      supplier: newItem.supplier || null,
    });
    setSaving(false);
    setShowAdd(false);
    setNewItem({ ingredient_name: '', unit: 'kg', current_stock: '', min_stock_alert: '', cost_per_unit: '', supplier: '' });
    await load();
  };

  const lowStock = items.filter(i => i.current_stock <= i.min_stock_alert);
  const outOfStock = items.filter(i => i.current_stock === 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Alerts */}
      {outOfStock.length > 0 && (
        <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-error-500" />
            <h3 className="font-bold text-error-700 dark:text-error-400 text-sm">Out of Stock!</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {outOfStock.map(i => (
              <span key={i.id} className="bg-error-100 dark:bg-error-900/40 text-error-700 dark:text-error-300 text-xs px-2 py-1 rounded-full">{i.ingredient_name}</span>
            ))}
          </div>
        </div>
      )}

      {lowStock.length > 0 && outOfStock.length < lowStock.length && (
        <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-warning-500" />
            <h3 className="font-bold text-warning-700 dark:text-warning-400 text-sm">Low Stock Alert</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.filter(i => i.current_stock > 0).map(i => (
              <span key={i.id} className="bg-warning-100 dark:bg-warning-900/40 text-warning-700 dark:text-warning-300 text-xs px-2 py-1 rounded-full">
                {i.ingredient_name} ({i.current_stock}{i.unit})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{items.length} ingredients tracked</p>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2 text-sm py-2.5">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {showAdd && (
        <div className="card p-5 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">Add Inventory Item</h3>
            <button onClick={() => setShowAdd(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"><X className="w-4 h-4 text-neutral-400" /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">Ingredient Name *</label>
              <input value={newItem.ingredient_name} onChange={e => setNewItem(p => ({ ...p, ingredient_name: e.target.value }))} className="input-field text-sm py-2" placeholder="e.g. Basmati Rice" />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">Unit</label>
              <select value={newItem.unit} onChange={e => setNewItem(p => ({ ...p, unit: e.target.value }))} className="input-field text-sm py-2">
                <option value="kg">kg</option>
                <option value="litre">litre</option>
                <option value="pieces">pieces</option>
                <option value="grams">grams</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">Current Stock</label>
              <input type="number" value={newItem.current_stock} onChange={e => setNewItem(p => ({ ...p, current_stock: e.target.value }))} className="input-field text-sm py-2" placeholder="50" />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">Min Alert Level</label>
              <input type="number" value={newItem.min_stock_alert} onChange={e => setNewItem(p => ({ ...p, min_stock_alert: e.target.value }))} className="input-field text-sm py-2" placeholder="10" />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">Cost/Unit (₹)</label>
              <input type="number" value={newItem.cost_per_unit} onChange={e => setNewItem(p => ({ ...p, cost_per_unit: e.target.value }))} className="input-field text-sm py-2" placeholder="80" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addItem} disabled={saving || !newItem.ingredient_name} className="btn-primary text-sm py-2 flex items-center gap-1">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              {saving ? 'Saving...' : 'Add'}
            </button>
            <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm py-2">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-14 shimmer rounded-xl" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Ingredient</th>
                <th className="text-left px-4 py-3">Stock</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Min Alert</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Status</th>
                <th className="text-right px-4 py-3">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {items.map(item => {
                const isOut = item.current_stock === 0;
                const isLow = !isOut && item.current_stock <= item.min_stock_alert;
                return (
                  <tr key={item.id} className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${isOut ? 'bg-error-50/50 dark:bg-error-900/10' : isLow ? 'bg-warning-50/50 dark:bg-warning-900/10' : ''}`}>
                    <td className="px-4 py-3 font-medium text-sm text-neutral-800 dark:text-neutral-200">{item.ingredient_name}</td>
                    <td className="px-4 py-3">
                      {editId === item.id ? (
                        <input
                          type="number" value={editStock}
                          onChange={e => setEditStock(e.target.value)}
                          className="w-20 px-2 py-1 border border-primary-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">{item.current_stock} {item.unit}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-neutral-500 dark:text-neutral-400">{item.min_stock_alert} {item.unit}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        isOut ? 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400' :
                        isLow ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400' :
                        'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                      }`}>
                        {isOut ? '⛔ Out of Stock' : isLow ? '⚠️ Low Stock' : '✅ In Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {editId === item.id ? (
                          <>
                            <button onClick={() => updateStock(item.id)} disabled={saving} className="p-2 hover:bg-success-50 dark:hover:bg-success-900/20 text-success-600 rounded-lg transition-all">
                              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </button>
                            <button onClick={() => { setEditId(null); setEditStock(''); }} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 rounded-lg transition-all">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => { setEditId(item.id); setEditStock(item.current_stock.toString()); }} className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-neutral-400 hover:text-primary-600 rounded-lg transition-all">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
