'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Plus, Pencil, Trash2, Check, X, Wrench, Loader2, Power } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Service {
  _id?: string;
  key: string;
  name: string;
  icon?: string;
  pricing: Record<string, number>;
  active: boolean;
}

// Default Xerox rates, pre-filled the first time it's created so the admin
// doesn't start from a blank sheet — these can be edited/removed freely
// afterwards.
const DEFAULT_XEROX_PRICING: Record<string, number> = {
  'A4 - B&W': 2,
  'A4 - Color': 10,
  'A3 - B&W': 5,
  'A3 - Color': 15,
  'Letter - B&W': 2,
  'Letter - Color': 10,
  'Legal - B&W': 3,
  'Legal - Color': 12,
};

export default function ServicesManager({ showToast }: { showToast: (msg: string) => void }) {
  const { isDark } = useTheme();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editPricing, setEditPricing] = useState<Record<string, number>>({});
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [newRateLabel, setNewRateLabel] = useState('');
  const [newRatePrice, setNewRatePrice] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceKey, setNewServiceKey] = useState('');
  const [newServiceIcon, setNewServiceIcon] = useState('🛠️');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}/services?admin=true`);
      const data = await res.json();
      if (data.success) setServices(data.services);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasXerox = services.some(s => s.key === 'xerox');

  const seedXerox = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'xerox',
          name: 'Xerox / Printing',
          icon: '🖨️',
          pricing: DEFAULT_XEROX_PRICING,
          active: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setServices(prev => [...prev, data.service]);
        showToast('✅ Xerox service created!');
      } else {
        showToast(`❌ ${data.message || 'Failed to create'}`);
      }
    } catch {
      showToast('❌ Failed to create Xerox service');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (service: Service) => {
    setEditingKey(service.key);
    setEditPricing({ ...service.pricing });
    setEditName(service.name);
    setEditIcon(service.icon || '🛠️');
    setNewRateLabel('');
    setNewRatePrice('');
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditPricing({});
  };

  const addRate = () => {
    const label = newRateLabel.trim();
    const price = Number(newRatePrice);
    if (!label) { showToast('❌ Enter a rate label (e.g. "A4 - B&W")'); return; }
    if (isNaN(price) || price < 0) { showToast('❌ Enter a valid price'); return; }
    setEditPricing(prev => ({ ...prev, [label]: price }));
    setNewRateLabel('');
    setNewRatePrice('');
  };

  const removeRate = (label: string) => {
    setEditPricing(prev => {
      const copy = { ...prev };
      delete copy[label];
      return copy;
    });
  };

  const updateRatePrice = (label: string, value: string) => {
    const price = Number(value);
    setEditPricing(prev => ({ ...prev, [label]: isNaN(price) ? 0 : price }));
  };

  const saveEdit = async () => {
    if (!editingKey) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/services/${editingKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, icon: editIcon, pricing: editPricing }),
      });
      const data = await res.json();
      if (data.success) {
        setServices(prev => prev.map(s => s.key === editingKey ? data.service : s));
        showToast('✅ Service updated!');
        cancelEdit();
      } else {
        showToast(`❌ ${data.message || 'Failed to update'}`);
      }
    } catch {
      showToast('❌ Failed to update service');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      const res = await fetch(`${API_URL}/services/${service.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !service.active }),
      });
      const data = await res.json();
      if (data.success) {
        setServices(prev => prev.map(s => s.key === service.key ? data.service : s));
      }
    } catch {
      showToast('❌ Failed to update status');
    }
  };

  const deleteService = async (key: string) => {
    if (!confirm('Delete this service? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_URL}/services/${key}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setServices(prev => prev.filter(s => s.key !== key));
        showToast('✅ Service deleted');
      }
    } catch {
      showToast('❌ Failed to delete service');
    }
  };

  const createService = async () => {
    const key = newServiceKey.trim().toLowerCase().replace(/\s+/g, '-');
    if (!newServiceName.trim() || !key) {
      showToast('❌ Enter a name and key for the new service');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, name: newServiceName, icon: newServiceIcon, pricing: {}, active: true }),
      });
      const data = await res.json();
      if (data.success) {
        setServices(prev => [...prev, data.service]);
        showToast('✅ Service created — add rates below');
        setShowCreateForm(false);
        setNewServiceName('');
        setNewServiceKey('');
        setNewServiceIcon('🛠️');
        startEdit(data.service);
      } else {
        showToast(`❌ ${data.message || 'Failed to create'}`);
      }
    } catch {
      showToast('❌ Failed to create service');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 rounded-3xl border shadow-sm ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
        <div className={`w-8 h-8 border-4 rounded-full animate-spin mb-4 ${isDark ? 'border-indigo-900 border-t-indigo-500' : 'border-orange-200 border-t-orange-500'}`} />
        <p className="font-bold text-gray-500">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className={`rounded-[2rem] shadow-sm overflow-hidden border p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100/50'}`}>
        <div>
          <h3 className={`font-black text-xl ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Services</h3>
          <p className="text-sm font-medium text-gray-500 mt-0.5">
            Xerox, and any future service — set your own rates per option.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(v => !v)}
          className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 ${isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-orange-500 to-yellow-500'}`}
        >
          <Plus size={18} strokeWidth={3} />
          Add Service
        </button>
      </div>

      {/* New service form */}
      {showCreateForm && (
        <div className={`rounded-2xl border p-5 space-y-3 ${isDark ? 'bg-[#13102a] border-[#2d2450]' : 'bg-orange-50/50 border-orange-100'}`}>
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={newServiceIcon}
              onChange={e => setNewServiceIcon(e.target.value)}
              placeholder="Icon (emoji)"
              className={`px-3 py-2 rounded-xl border text-sm font-bold outline-none ${isDark ? 'bg-[#1a1535] border-[#2d2450] text-gray-200' : 'bg-white border-orange-200 text-gray-800'}`}
            />
            <input
              type="text"
              value={newServiceName}
              onChange={e => setNewServiceName(e.target.value)}
              placeholder="Name (e.g. Passport Photos)"
              className={`px-3 py-2 rounded-xl border text-sm font-bold outline-none sm:col-span-2 ${isDark ? 'bg-[#1a1535] border-[#2d2450] text-gray-200' : 'bg-white border-orange-200 text-gray-800'}`}
            />
          </div>
          <input
            type="text"
            value={newServiceKey}
            onChange={e => setNewServiceKey(e.target.value)}
            placeholder="key (e.g. passport-photos — lowercase, no spaces)"
            className={`w-full px-3 py-2 rounded-xl border text-sm font-medium outline-none ${isDark ? 'bg-[#1a1535] border-[#2d2450] text-gray-200' : 'bg-white border-orange-200 text-gray-800'}`}
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreateForm(false)} className={`px-4 py-2 rounded-xl font-bold text-sm ${isDark ? 'text-gray-400 bg-[#1a1535]' : 'text-gray-500 bg-white'}`}>Cancel</button>
            <button
              onClick={createService}
              disabled={saving}
              className={`px-5 py-2 rounded-xl font-bold text-sm text-white disabled:opacity-60 ${isDark ? 'bg-indigo-600' : 'bg-orange-500'}`}
            >
              {saving ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Xerox quick-seed, if not created yet */}
      {!hasXerox && (
        <button
          onClick={seedXerox}
          disabled={saving}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed font-bold text-sm transition-all disabled:opacity-60 ${isDark ? 'border-[#2d2450] text-indigo-400 hover:bg-indigo-500/5' : 'border-orange-200 text-orange-600 hover:bg-orange-50'}`}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Set up Xerox Pricing (pre-filled with default rates)
        </button>
      )}

      {/* Service cards */}
      <div className="space-y-4">
        {services.map(service => (
          <div key={service.key} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
            {/* Card header */}
            <div className={`flex items-center justify-between gap-3 p-4 border-b ${isDark ? 'border-[#2d2450]' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${isDark ? 'bg-indigo-500/10' : 'bg-orange-50'}`}>
                  {service.icon || <Wrench size={18} />}
                </div>
                <div className="min-w-0">
                  <p className={`font-black text-sm truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{service.name}</p>
                  <p className={`text-[11px] font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>key: {service.key}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleActive(service)}
                  title={service.active ? 'Active — click to disable' : 'Disabled — click to enable'}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${service.active
                    ? (isDark ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-700 border-green-200')
                    : (isDark ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-gray-50 text-gray-500 border-gray-200')}`}
                >
                  <Power size={11} />
                  {service.active ? 'ACTIVE' : 'OFF'}
                </button>
                {editingKey !== service.key && (
                  <button onClick={() => startEdit(service)} className={`p-2 rounded-xl ${isDark ? 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white' : 'text-orange-500 bg-orange-50 hover:bg-orange-500 hover:text-white'}`}>
                    <Pencil size={15} strokeWidth={2.5} />
                  </button>
                )}
                <button onClick={() => deleteService(service.key)} className={`p-2 rounded-xl ${isDark ? 'text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white' : 'text-red-500 bg-red-50 hover:bg-red-500 hover:text-white'}`}>
                  <Trash2 size={15} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Card body */}
            <div className="p-4">
              {editingKey === service.key ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={editIcon}
                      onChange={e => setEditIcon(e.target.value)}
                      className={`px-3 py-2 rounded-xl border text-sm font-bold outline-none ${isDark ? 'bg-[#13102a] border-[#2d2450] text-gray-200' : 'bg-orange-50/30 border-orange-200 text-gray-800'}`}
                      placeholder="Icon"
                    />
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className={`px-3 py-2 rounded-xl border text-sm font-bold outline-none sm:col-span-2 ${isDark ? 'bg-[#13102a] border-[#2d2450] text-gray-200' : 'bg-orange-50/30 border-orange-200 text-gray-800'}`}
                      placeholder="Service name"
                    />
                  </div>

                  {/* Rate rows */}
                  <div className="space-y-2">
                    <p className={`text-[10px] uppercase tracking-wider font-black ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Rates</p>
                    {Object.entries(editPricing).length === 0 && (
                      <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>No rates yet — add one below.</p>
                    )}
                    {Object.entries(editPricing).map(([label, price]) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className={`flex-1 text-sm font-semibold px-3 py-2 rounded-lg ${isDark ? 'bg-[#13102a] text-gray-300' : 'bg-gray-50 text-gray-700'}`}>{label}</span>
                        <span className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>₹</span>
                        <input
                          type="number"
                          value={price}
                          onChange={e => updateRatePrice(label, e.target.value)}
                          className={`w-24 px-2 py-2 rounded-lg border text-sm font-bold outline-none ${isDark ? 'bg-[#1a1535] border-[#2d2450] text-gray-200' : 'bg-white border-orange-200 text-gray-900'}`}
                        />
                        <button onClick={() => removeRate(label)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    {/* Add new rate row */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newRateLabel}
                        onChange={e => setNewRateLabel(e.target.value)}
                        placeholder='e.g. "A4 - B&W" or "Matte"'
                        className={`flex-1 px-3 py-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-[#13102a] border-[#2d2450] text-gray-200' : 'bg-white border-dashed border-orange-300 text-gray-700'}`}
                      />
                      <span className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>₹</span>
                      <input
                        type="number"
                        value={newRatePrice}
                        onChange={e => setNewRatePrice(e.target.value)}
                        placeholder="0"
                        className={`w-24 px-2 py-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-[#13102a] border-[#2d2450] text-gray-200' : 'bg-white border-dashed border-orange-300 text-gray-700'}`}
                      />
                      <button onClick={addRate} className={`p-2 rounded-lg text-white ${isDark ? 'bg-indigo-600' : 'bg-orange-500'}`}>
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={cancelEdit} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm ${isDark ? 'text-gray-400 bg-[#13102a]' : 'text-gray-500 bg-gray-100'}`}>
                      <X size={14} /> Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className={`flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold text-sm text-white disabled:opacity-60 ${isDark ? 'bg-green-600' : 'bg-green-500'}`}
                    >
                      <Check size={14} /> {saving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(service.pricing).length === 0 ? (
                    <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>No rates set — click edit to add some.</p>
                  ) : (
                    Object.entries(service.pricing).map(([label, price]) => (
                      <span key={label} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${isDark ? 'bg-[#13102a] text-gray-300' : 'bg-orange-50 text-gray-700'}`}>
                        {label}: ₹{price}
                      </span>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && !showCreateForm && (
        <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
          <Wrench size={32} className="mx-auto text-orange-300 mb-3" />
          <h4 className={`text-lg font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>No services yet</h4>
          <p className="text-gray-500 text-sm mt-1">Use the "Set up Xerox Pricing" button above, or "Add Service" for something new.</p>
        </div>
      )}
    </div>
  );
}
