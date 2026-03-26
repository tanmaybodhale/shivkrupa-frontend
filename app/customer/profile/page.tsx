'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';
import Toast from '@/components/shared/Toast';
import { Address, Order } from '@/lib/types';
import {
  ChevronLeft, User, MapPin, Plus, Pencil, Trash2, Check, X,
  Package, Clock, Truck, CheckCircle2, XCircle, ShoppingBag,
  Home, Briefcase, Star, ChevronRight,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const ORDER_STEPS = [
  { key: 'pending', label: 'Placed', percent: 25, icon: '📦' },
  { key: 'confirmed', label: 'Confirmed', percent: 50, icon: '✅' },
  { key: 'dispatched', label: 'On the Way', percent: 75, icon: '🚚' },
  { key: 'delivered', label: 'Delivered', percent: 100, icon: '🏠' },
];

function getProgress(status: string): number {
  if (status === 'cancelled') return 0;
  const step = ORDER_STEPS.find(s => s.key === status);
  return step ? step.percent : 25;
}

const ADDRESS_LABELS = ['Home', 'Work', 'Other'];
const ADDRESS_ICONS: Record<string, React.ReactNode> = {
  Home: <Home size={14} />,
  Work: <Briefcase size={14} />,
  Other: <MapPin size={14} />,
};

const EMPTY_ADDRESS: Address = { label: 'Home', street: '', area: '', city: '', state: '', pincode: '' };

function MiniField({ label, value, onChange, placeholder, isDark }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; isDark: boolean;
}) {
  return (
    <div className="mb-2">
      <label className={`block mb-1 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-amber-900/50'}`}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 transition-all ${isDark
          ? 'border-[#2d2450] bg-[#13102a] text-gray-200 placeholder-gray-600 focus:border-indigo-500 focus:ring-indigo-500/10'
          : 'border-orange-200 bg-orange-50/30 text-amber-950 placeholder-amber-900/30 focus:border-orange-400 focus:ring-orange-400/10'
          }`}
      />
    </div>
  );
}

function AddressCard({ address, index, isDark, onEdit, onDelete, isDefault }: {
  address: Address; index: number; isDark: boolean; onEdit: () => void; onDelete: () => void; isDefault: boolean;
}) {
  const label = address.label || 'Home';
  const hasContent = address.street || address.area || address.city;

  return (
    <div className={`relative rounded-2xl border p-4 transition-all ${isDark ? 'bg-[#13102a] border-[#2d2450]' : 'bg-orange-50/40 border-orange-100'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-100 text-orange-600'}`}>
            {ADDRESS_ICONS[label] || <MapPin size={14} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{label}</span>
              {isDefault && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-100 text-orange-600'}`}>
                  DEFAULT
                </span>
              )}
            </div>
            {hasContent ? (
              <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {[address.street, address.area, address.city, address.state, address.pincode].filter(Boolean).join(', ')}
              </p>
            ) : (
              <p className={`text-xs mt-0.5 italic ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>No details filled</p>
            )}
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={onEdit}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={onDelete}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniOrderProgress({ status, isDark }: { status: string; isDark: boolean }) {
  const progress = getProgress(status);
  const isCancelled = status === 'cancelled';

  if (isCancelled) return (
    <div className={`flex items-center gap-1.5 text-[10px] font-bold text-red-500 mt-2`}>
      <XCircle size={11} /> Order Cancelled
    </div>
  );

  return (
    <div className="mt-2">
      <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-[#2d2450]' : 'bg-gray-100'}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${isDark ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gradient-to-r from-orange-400 to-yellow-400'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        {ORDER_STEPS.map(step => (
          <span key={step.key} className={`text-[8px] font-bold ${progress >= step.percent ? (isDark ? 'text-indigo-400' : 'text-orange-500') : (isDark ? 'text-gray-700' : 'text-gray-300')}`}>
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const { currentUser, orders, fetchOrders, showToast, updateProfile, saveAddress, deleteAddress } = useApp();
  const { isDark } = useTheme();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');
  const [loading, setLoading] = useState(true);

  // Name edit
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Address editing
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [addressForm, setAddressForm] = useState<Address>(EMPTY_ADDRESS);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!currentUser) { router.replace('/'); return; }
    if (currentUser.role === 'shopkeeper') { router.replace('/admin'); return; }
    fetchOrders().finally(() => setLoading(false));
  }, [mounted, currentUser, router, fetchOrders]);

  useEffect(() => {
    if (currentUser) setNameVal(currentUser.name || '');
  }, [currentUser]);

  if (!mounted || !currentUser || currentUser.role !== 'customer') return null;

  const addresses = currentUser.addresses || [];

  const handleSaveName = async () => {
    if (!nameVal.trim()) { showToast('❌ Name cannot be empty'); return; }
    setSavingName(true);
    const err = await updateProfile(nameVal.trim(), currentUser.address);
    setSavingName(false);
    if (err) { showToast(`❌ ${err}`); return; }
    showToast('✅ Name updated!');
    setEditingName(false);
  };

  const handleEditAddress = (index: number) => {
    setAddressForm({ ...addresses[index] });
    setEditingAddressIndex(index);
    setAddingNew(false);
  };

  const handleAddNew = () => {
    setAddressForm({ ...EMPTY_ADDRESS });
    setEditingAddressIndex(null);
    setAddingNew(true);
  };

  const handleSaveAddress = async () => {
    if (!addressForm.street && !addressForm.area && !addressForm.city) {
      showToast('❌ Please fill at least one address field');
      return;
    }
    setSavingAddress(true);
    const err = await saveAddress(addressForm, editingAddressIndex !== null ? editingAddressIndex : undefined);
    setSavingAddress(false);
    if (err) { showToast(`❌ ${err}`); return; }
    showToast('✅ Address saved!');
    setEditingAddressIndex(null);
    setAddingNew(false);
  };

  const handleDeleteAddress = async (index: number) => {
    if (!confirm('Remove this address?')) return;
    const err = await deleteAddress(index);
    if (err) { showToast(`❌ ${err}`); return; }
    showToast('✅ Address removed');
  };

  const handleCancelAddressEdit = () => {
    setEditingAddressIndex(null);
    setAddingNew(false);
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={12} /> };
      case 'confirmed': return { color: 'bg-orange-100 text-orange-800', icon: <Package size={12} /> };
      case 'dispatched': return { color: 'bg-cyan-100 text-cyan-800', icon: <Truck size={12} /> };
      case 'delivered': return { color: 'bg-green-100 text-green-800', icon: <CheckCircle2 size={12} /> };
      case 'cancelled': return { color: 'bg-red-100 text-red-800', icon: <XCircle size={12} /> };
      default: return { color: 'bg-gray-100 text-gray-800', icon: <Package size={12} /> };
    }
  };

  const tabStyle = (tab: typeof activeTab) =>
    `flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${activeTab === tab
      ? (isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md')
      : (isDark ? 'text-gray-500 hover:text-indigo-400' : 'text-gray-400 hover:text-orange-600')
    }`;

  const isEditing = editingAddressIndex !== null || addingNew;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0f0d1a]' : 'bg-slate-50/50'}`}>
      <Navbar />

      <div className="max-w-screen-md mx-auto px-4 pb-24 pt-6">

        {/* Back + Title */}
        <div className={`flex items-center gap-4 mb-6 sticky top-[72px] backdrop-blur-md z-10 py-2 ${isDark ? 'bg-[#0f0d1a]/90' : 'bg-slate-50/90'}`}>
          <button
            onClick={() => router.push('/customer')}
            className={`flex items-center justify-center w-10 h-10 rounded-2xl border shadow-sm transition-colors active:scale-95 ${isDark ? 'bg-[#1a1535] border-[#2d2450] text-gray-400 hover:bg-indigo-500/10 hover:text-indigo-400' : 'bg-white border-orange-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600'}`}
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              My Profile
            </h2>
            <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Manage your account
            </p>
          </div>
        </div>

        {/* User avatar + name card */}
        <div className={`rounded-[1.5rem] border p-5 mb-5 shadow-sm ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-orange-100 text-orange-600'}`}>
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameVal}
                    onChange={e => setNameVal(e.target.value)}
                    className={`flex-1 px-3 py-1.5 rounded-lg border text-sm font-bold focus:outline-none focus:ring-2 ${isDark ? 'border-[#2d2450] bg-[#13102a] text-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500' : 'border-orange-200 bg-orange-50 text-gray-800 focus:ring-orange-400/20 focus:border-orange-400'}`}
                    onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                    autoFocus
                  />
                  <button onClick={handleSaveName} disabled={savingName} className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center text-white">
                    <Check size={14} strokeWidth={3} />
                  </button>
                  <button onClick={() => { setEditingName(false); setNameVal(currentUser.name); }} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-[#2d2450] text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className={`text-lg font-black truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{currentUser.name}</h3>
                  <button onClick={() => setEditingName(true)} className={`flex-shrink-0 p-1 rounded-lg transition-colors ${isDark ? 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`}>
                    <Pencil size={13} />
                  </button>
                </div>
              )}
              <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{currentUser.phone}</p>
              {currentUser.email && <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{currentUser.email}</p>}
            </div>
          </div>

          {/* Stats row */}
          <div className={`grid grid-cols-3 gap-3 mt-5 pt-4 border-t ${isDark ? 'border-[#2d2450]' : 'border-orange-100'}`}>
            {[
              { label: 'Total Orders', value: orders.length },
              { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
              { label: 'Addresses', value: addresses.length },
            ].map(stat => (
              <div key={stat.label} className={`text-center px-2 py-2 rounded-xl ${isDark ? 'bg-[#13102a]' : 'bg-orange-50/50'}`}>
                <div className={`text-xl font-black ${isDark ? 'text-indigo-400' : 'text-orange-600'}`}>{stat.value}</div>
                <div className={`text-[10px] font-bold mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1.5 p-1.5 rounded-2xl mb-5 ${isDark ? 'bg-[#1a1535]' : 'bg-white'}`}>
          <button className={tabStyle('profile')} onClick={() => setActiveTab('profile')}><User size={14} className="inline mr-1.5" />Profile</button>
          <button className={tabStyle('addresses')} onClick={() => setActiveTab('addresses')}><MapPin size={14} className="inline mr-1.5" />Addresses</button>
          <button className={tabStyle('orders')} onClick={() => setActiveTab('orders')}><Package size={14} className="inline mr-1.5" />Orders</button>
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && (
          <div className={`rounded-[1.5rem] border p-5 shadow-sm ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
            <h4 className={`text-sm font-black mb-4 uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Account Info</h4>
            <div className="space-y-3">
              {[
                { label: 'Full Name', value: currentUser.name },
                { label: 'Phone', value: currentUser.phone },
                { label: 'Email', value: currentUser.email || '—' },
                { label: 'Customer ID', value: currentUser.uid },
                { label: 'Role', value: currentUser.role },
              ].map(({ label, value }) => (
                <div key={label} className={`flex justify-between items-center py-3 border-b last:border-b-0 ${isDark ? 'border-[#2d2450]' : 'border-orange-50'}`}>
                  <span className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</span>
                  <span className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Addresses Tab ── */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            {/* Address form (edit/add) */}
            {isEditing && (
              <div className={`rounded-[1.5rem] border p-5 shadow-sm ${isDark ? 'bg-[#1a1535] border-indigo-500/30' : 'bg-white border-orange-300/50'}`}>
                <h4 className={`text-sm font-black mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {addingNew ? 'Add New Address' : 'Edit Address'}
                </h4>

                {/* Label select */}
                <div className="flex gap-2 mb-3">
                  {ADDRESS_LABELS.map(lbl => (
                    <button
                      key={lbl}
                      onClick={() => setAddressForm(prev => ({ ...prev, label: lbl }))}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all ${addressForm.label === lbl
                        ? (isDark ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-orange-100 border-orange-400 text-orange-700')
                        : (isDark ? 'border-[#2d2450] text-gray-500 hover:border-indigo-500/30' : 'border-gray-200 text-gray-400 hover:border-orange-200')
                        }`}
                    >
                      {ADDRESS_ICONS[lbl]} {lbl}
                    </button>
                  ))}
                </div>

                <MiniField label="Street / Door No." value={addressForm.street} onChange={v => setAddressForm(p => ({ ...p, street: v }))} placeholder="e.g. 12, MG Road" isDark={isDark} />
                <MiniField label="Area / Locality" value={addressForm.area} onChange={v => setAddressForm(p => ({ ...p, area: v }))} placeholder="e.g. Shivaji Nagar" isDark={isDark} />
                <div className="grid grid-cols-2 gap-2">
                  <MiniField label="City" value={addressForm.city} onChange={v => setAddressForm(p => ({ ...p, city: v }))} placeholder="City" isDark={isDark} />
                  <MiniField label="State" value={addressForm.state} onChange={v => setAddressForm(p => ({ ...p, state: v }))} placeholder="State" isDark={isDark} />
                </div>
                <MiniField label="Pincode" value={addressForm.pincode} onChange={v => setAddressForm(p => ({ ...p, pincode: v }))} placeholder="6-digit pincode" isDark={isDark} />

                <div className="flex gap-2 mt-4">
                  <button onClick={handleCancelAddressEdit} className={`flex-1 py-2.5 rounded-xl font-bold text-sm border ${isDark ? 'border-[#2d2450] text-gray-400 bg-[#13102a]' : 'border-gray-200 text-gray-500 bg-gray-50'}`}>
                    Cancel
                  </button>
                  <button onClick={handleSaveAddress} disabled={savingAddress} className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-60 ${isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-orange-500 to-yellow-500'}`}>
                    {savingAddress ? 'Saving…' : 'Save Address'}
                  </button>
                </div>
              </div>
            )}

            {/* Saved addresses list */}
            {addresses.length === 0 && !isEditing ? (
              <div className={`flex flex-col items-center justify-center py-16 rounded-[1.5rem] border ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
                <MapPin size={40} className={`mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`font-bold text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No addresses saved yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr, idx) => (
                  <AddressCard
                    key={idx}
                    address={addr}
                    index={idx}
                    isDark={isDark}
                    isDefault={idx === 0}
                    onEdit={() => handleEditAddress(idx)}
                    onDelete={() => handleDeleteAddress(idx)}
                  />
                ))}
              </div>
            )}

            {/* Add new button */}
            {!isEditing && (
              <button
                onClick={handleAddNew}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed font-bold text-sm transition-all ${isDark ? 'border-[#2d2450] text-gray-500 hover:border-indigo-500/50 hover:text-indigo-400' : 'border-orange-200 text-gray-400 hover:border-orange-400 hover:text-orange-600'}`}
              >
                <Plus size={18} />
                Add New Address
              </button>
            )}
          </div>
        )}

        {/* ── Orders Tab ── */}
        {activeTab === 'orders' && (
          <div>
            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2].map(i => (
                  <div key={i} className={`h-36 rounded-3xl border ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`} />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-20 rounded-3xl border text-center ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
                <ShoppingBag size={48} className="text-orange-200 mb-4" strokeWidth={1.5} />
                <h4 className={`font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No orders yet</h4>
                <button onClick={() => router.push('/customer')} className={`mt-4 px-6 py-2 rounded-xl font-bold text-white text-sm ${isDark ? 'bg-indigo-600' : 'bg-orange-500'}`}>
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 10).map(order => {
                  const statusCfg = getStatusConfig(order.status);
                  return (
                    <div key={order.orderId} className={`rounded-[1.5rem] border overflow-hidden shadow-sm ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
                      {/* Header */}
                      <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? 'border-[#2d2450] bg-[#13102a]/50' : 'border-orange-50 bg-orange-50/30'}`}>
                        <div>
                          <span className={`text-xs font-black ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>#{order.orderId}</span>
                          <span className={`block text-[10px] mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{order.timeStr}</span>
                        </div>
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusCfg.color}`}>
                          {statusCfg.icon} <span className="ml-1 capitalize">{order.status}</span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className={`px-4 pt-3 pb-2 border-b ${isDark ? 'border-[#2d2450]' : 'border-orange-50'}`}>
                        <MiniOrderProgress status={order.status} isDark={isDark} />
                      </div>

                      {/* Items preview (up to 2) */}
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {(order.items || []).slice(0, 3).map((item, idx) => (
                              <div key={idx} className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center overflow-hidden ${isDark ? 'border-[#1a1535] bg-[#13102a]' : 'border-white bg-gray-50'}`}>
                                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <Package size={16} className="text-gray-300" />}
                              </div>
                            ))}
                            {(order.items || []).length > 3 && (
                              <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-[10px] font-black ${isDark ? 'border-[#1a1535] bg-[#13102a] text-gray-500' : 'border-white bg-gray-50 text-gray-400'}`}>
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {order.items.map(i => i.name).join(', ')}
                            </p>
                          </div>
                          <span className={`text-sm font-black shrink-0 ${isDark ? 'text-indigo-400' : 'text-orange-600'}`}>₹{order.total}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {orders.length > 10 && (
                  <button
                    onClick={() => router.push('/customer/orders')}
                    className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border ${isDark ? 'border-[#2d2450] text-gray-400 hover:text-indigo-400' : 'border-orange-100 text-gray-400 hover:text-orange-600'}`}
                  >
                    View all {orders.length} orders <ChevronRight size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Toast />
    </div>
  );
}
