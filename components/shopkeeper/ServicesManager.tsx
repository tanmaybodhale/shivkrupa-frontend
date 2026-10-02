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

// Pricing is still stored as a flat map: { "A4 - B&W": 2, "A4 - Color": 10, ... }
// so the customer-side Xerox page keeps working unchanged.
const PAPER_SIZES = ['A4', 'A3', 'A5', 'Letter', 'Legal'];
const PRINT_TYPES = ['B&W', 'Color'];
const rateKey = (size: string, type: string) => `${size} - ${type}`;

const DEFAULT_XEROX_PRICING: Record<string, number> = {
  'A4 - B&W': 2,
  'A4 - Color': 10,
  'A3 - B&W': 5,
  'A3 - Color': 15,
};

// FIX: backend can return a service without `pricing` (null/undefined).
// Object.entries(undefined) was what crashed the admin page.
const normalize = (s: any): Service => ({
  ...s,
  pricing: s && s.pricing && typeof s.pricing === 'object' ? s.pricing : {},
});

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
      if (data.success) setServices((data.services || []).map(normalize));
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
        setServices(prev => [...prev, normalize(data.service)]);
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
    setEditPricing({ ...(service.pricing || {}) });
    setEditName(service.name);
    setEditIcon(service.icon || '🛠️');
    setNewRateLabel('');
    setNewRatePrice('');
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditPricing({});
  };

  // ---------- Xerox price grid helpers ----------
  const sizesInUse = (pricing: Record<string, number>) =>
    PAPER_SIZES.filter(size => PRINT_TYPES.some(t => rateKey(size, t) in pricing));

  const addPaperSize = (size: string) => {
    if (!size) return;
    setEditPricing(prev => {
      const next = { ...prev };
      PRINT_TYPES.forEach(t => {
        if (!(rateKey(size, t) in next)) next[rateKey(size, t)] = 0;
      });
      return next;
    });
  };

  const removePaperSize = (size: string) => {
    setEditPricing(prev => {
      const next = { ...prev };
      PRINT_TYPES.forEach(t => delete next[rateKey(size, t)]);
      return next;
    });
  };

  const setCellPrice = (size: string, type: string, value: string) => {
    setEditPricing(prev => {
      const next = { ...prev };
      if (value === '') {
        delete next[rateKey(size, type)];
      } else {
        const n = Number(value);
        next[rateKey(size, type)] = isNaN(n) || n < 0 ? 0 : n;
      }
      return next;
    });
  };

  // ---------- Generic rate list helpers (non-Xerox services) ----------
  const addRate = () => {
    const label = newRateLabel.trim();
    const price = Number(newRatePrice);
    if (!label) { showToast('❌ Enter a rate label (e.g. "Matte")'); return; }
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
    // Only keep rates with a price above 0, so options left blank are never offered
    const cleanedPricing = Object.fromEntries(
      Object.entries(editPricing).filter(([, p]) => Number(p) > 0)
    );
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/services/${editingKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, icon: editIcon, pricing: cleanedPricing }),
      });
      const data = await res.json();
      if (data.success) {
        setServices(prev => prev.map(s => (s.key === editingKey ? normalize(data.service) : s)));
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
        setServices(prev => prev.map(s => (s.key === service.key ? normalize(data.service) : s)));
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
        const created = normalize(data.service);
        setServices(prev => [...prev, created]);
        showToast('✅ Service created — add rates below');
        setShowCreateForm(false);
        setNewServiceName('');
        setNewServiceKey('');
        setNewServiceIcon('🛠️');
        startEdit(created);
      } else {
        showToast(`❌ ${data.message || 'Failed to create'}`);
      }
    } catch {
      showToast('❌ Failed to create service');
    } finally {
      setSaving(false);
    }
  };

  // ---------- shared class helpers ----------
  const inputCls = `px-3 py-2 rounded-xl border text-sm font-bold outline-none ${isDark ? 'bg-[#13102a] border-[#2d2450] text-gray-200' : 'bg-white border-orange-200 text-gray-800'}`;
  const mutedText = isDark ? 'text-gray-500' : 'text-gray-400';

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
            Set the price per page for each paper size and print type.
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
            <input type="text" value={newServiceIcon} onChange={e => setNewServiceIcon(e.target.value)} placeholder="Icon (emoji)" className={inputCls} />
            <input type="text" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} placeholder="Name (e.g. Passport Photos)" className={`${inputCls} sm:col-span-2`} />
          </div>
          <input
            type="text"
            value={newServiceKey}
            onChange={e => setNewServiceKey(e.target.value)}
            placeholder="key (e.g. passport-photos — lowercase, no spaces)"
            className={`${inputCls} w-full font-medium`}
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreateForm(false)} className={`px-4 py-2 rounded-xl font-bold text-sm ${isDark ? 'text-gray-400 bg-[#1a1535]' : 'text-gray-500 bg-white'}`}>Cancel</button>
            <button onClick={createService} disabled={saving} className={`px-5 py-2 rounded-xl font-bold text-sm text-white disabled:opacity-60 ${isDark ? 'bg-indigo-600' : 'bg-orange-500'}`}>
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
          Set up Xerox pricing (starts with A4 and A3 rates)
        </button>
      )}

      {/* Service cards */}
      <div className="space-y-4">
        {services.map(service => {
          const pricing = service.pricing || {};
          const isXerox = service.key === 'xerox';
          const isEditing = editingKey === service.key;

          return (
            <div key={service.key} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
              {/* Card header */}
              <div className={`flex items-center justify-between gap-3 p-4 border-b ${isDark ? 'border-[#2d2450]' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${isDark ? 'bg-indigo-500/10' : 'bg-orange-50'}`}>
                    {service.icon || <Wrench size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-black text-sm truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{service.name}</p>
                    <p className={`text-[11px] font-semibold ${mutedText}`}>key: {service.key}</p>
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
                  {!isEditing && (
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
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-3 gap-2">
                      <input type="text" value={editIcon} onChange={e => setEditIcon(e.target.value)} className={inputCls} placeholder="Icon" />
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className={`${inputCls} sm:col-span-2`} placeholder="Service name" />
                    </div>

                    {isXerox ? (
                      /* ---------- Xerox: paper size x print type grid ---------- */
                      <div className="space-y-3">
                        <p className={`text-xs font-bold ${mutedText}`}>Price per page (₹)</p>

                        {sizesInUse(editPricing).length === 0 ? (
                          <p className={`text-xs ${mutedText}`}>No paper sizes yet. Pick one below to start.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className={mutedText}>
                                  <th className="text-left font-bold text-xs pb-2 pr-3">Paper size</th>
                                  {PRINT_TYPES.map(t => (
                                    <th key={t} className="text-left font-bold text-xs pb-2 pr-3">{t}</th>
                                  ))}
                                  <th />
                                </tr>
                              </thead>
                              <tbody>
                                {sizesInUse(editPricing).map(size => (
                                  <tr key={size}>
                                    <td className={`py-1 pr-3 font-black ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{size}</td>
                                    {PRINT_TYPES.map(t => (
                                      <td key={t} className="py-1 pr-3">
                                        <div className="flex items-center gap-1">
                                          <span className={`text-xs font-bold ${mutedText}`}>₹</span>
                                          <input
                                            type="number"
                                            min={0}
                                            value={editPricing[rateKey(size, t)] ?? ''}
                                            onChange={e => setCellPrice(size, t, e.target.value)}
                                            placeholder="—"
                                            className={`w-20 px-2 py-1.5 rounded-lg border text-sm font-bold outline-none ${isDark ? 'bg-[#13102a] border-[#2d2450] text-gray-200' : 'bg-white border-orange-200 text-gray-900'}`}
                                          />
                                        </div>
                                      </td>
                                    ))}
                                    <td className="py-1 text-right">
                                      <button onClick={() => removePaperSize(size)} title={`Remove ${size}`} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                                        <X size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Add a paper size */}
                        {PAPER_SIZES.filter(s => !sizesInUse(editPricing).includes(s)).length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-xs font-bold ${mutedText}`}>Add paper size:</span>
                            {PAPER_SIZES.filter(s => !sizesInUse(editPricing).includes(s)).map(size => (
                              <button
                                key={size}
                                onClick={() => addPaperSize(size)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-dashed ${isDark ? 'border-[#2d2450] text-indigo-400 hover:bg-indigo-500/10' : 'border-orange-300 text-orange-600 hover:bg-orange-50'}`}
                              >
                                <Plus size={12} strokeWidth={3} /> {size}
                              </button>
                            ))}
                          </div>
                        )}
                        <p className={`text-[11px] ${mutedText}`}>Price is per page. Leave a cell empty (or 0) and customers won't see that option.</p>
                      </div>
                    ) : (
                      /* ---------- Other services: simple label + price list ---------- */
                      <div className="space-y-2">
                        <p className={`text-xs font-bold ${mutedText}`}>Rates</p>
                        {Object.entries(editPricing).length === 0 && (
                          <p className={`text-xs ${mutedText}`}>No rates yet — add one below.</p>
                        )}
                        {Object.entries(editPricing).map(([label, price]) => (
                          <div key={label} className="flex items-center gap-2">
                            <span className={`flex-1 text-sm font-semibold px-3 py-2 rounded-lg ${isDark ? 'bg-[#13102a] text-gray-300' : 'bg-gray-50 text-gray-700'}`}>{label}</span>
                            <span className={`text-xs font-bold ${mutedText}`}>₹</span>
                            <input type="number" value={price} onChange={e => updateRatePrice(label, e.target.value)} className={`w-24 px-2 py-2 rounded-lg border text-sm font-bold outline-none ${isDark ? 'bg-[#1a1535] border-[#2d2450] text-gray-200' : 'bg-white border-orange-200 text-gray-900'}`} />
                            <button onClick={() => removeRate(label)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 pt-1">
                          <input type="text" value={newRateLabel} onChange={e => setNewRateLabel(e.target.value)} placeholder='e.g. "Matte"' className={`flex-1 px-3 py-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-[#13102a] border-[#2d2450] text-gray-200' : 'bg-white border-dashed border-orange-300 text-gray-700'}`} />
                          <span className={`text-xs font-bold ${mutedText}`}>₹</span>
                          <input type="number" value={newRatePrice} onChange={e => setNewRatePrice(e.target.value)} placeholder="0" className={`w-24 px-2 py-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-[#13102a] border-[#2d2450] text-gray-200' : 'bg-white border-dashed border-orange-300 text-gray-700'}`} />
                          <button onClick={addRate} className={`p-2 rounded-lg text-white ${isDark ? 'bg-indigo-600' : 'bg-orange-500'}`}>
                            <Plus size={14} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={cancelEdit} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm ${isDark ? 'text-gray-400 bg-[#13102a]' : 'text-gray-500 bg-gray-100'}`}>
                        <X size={14} /> Cancel
                      </button>
                      <button onClick={saveEdit} disabled={saving} className={`flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold text-sm text-white disabled:opacity-60 ${isDark ? 'bg-green-600' : 'bg-green-500'}`}>
                        <Check size={14} /> {saving ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(pricing).length === 0 ? (
                      <p className={`text-xs ${mutedText}`}>No rates set — click edit to add some.</p>
                    ) : (
                      Object.entries(pricing).map(([label, price]) => (
                        <span key={label} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${isDark ? 'bg-[#13102a] text-gray-300' : 'bg-orange-50 text-gray-700'}`}>
                          {label}: ₹{price}
                        </span>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {services.length === 0 && !showCreateForm && (
        <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
          <Wrench size={32} className="mx-auto text-orange-300 mb-3" />
          <h4 className={`text-lg font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>No services yet</h4>
          <p className="text-gray-500 text-sm mt-1">Use "Set up Xerox pricing" above, or "Add Service" for something new.</p>
        </div>
      )}
    </div>
  );
}
