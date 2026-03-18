'use client';

import { useEffect, useMemo, useState } from 'react';
import { User } from '@/lib/types';
import { useTheme } from '@/context/ThemeContext';
import LocationPicker from '@/components/customer/LocationPicker';
import { X } from 'lucide-react';

type Location = { lat: number; lng: number };

type AddressForm = {
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  location?: Location;
};

interface Props {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (name: string, address: User['address']) => Promise<void>;
}

const EMPTY_ADDRESS: AddressForm = {
  street: '',
  area: '',
  city: '',
  state: '',
  pincode: '',
  location: undefined,
};

export default function ProfileModal({ open, user, onClose, onSave }: Props) {
  const { isDark } = useTheme();
  const [name, setName] = useState('');
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  useEffect(() => {
    if (!open || !user) return;
    const existingLoc = user.address?.location;
    const normalizedLocation =
      existingLoc &&
      Number.isFinite(existingLoc.lat) &&
      Number.isFinite(existingLoc.lng)
        ? { lat: existingLoc.lat, lng: existingLoc.lng }
        : undefined;

    setName(user.name || '');
    setAddress({
      street: user.address?.street || '',
      area: user.address?.area || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      pincode: user.address?.pincode || '',
      location: normalizedLocation,
    });
    setLocationMessage('');
  }, [open, user]);

  const addressQuery = useMemo(() => {
    return [address.street, address.area, address.city, address.state, address.pincode]
      .map((v) => v.trim())
      .filter(Boolean)
      .join(', ');
  }, [address]);

  if (!open || !user) return null;

  const geocodeAddress = async () => {
    if (!addressQuery) {
      setLocationMessage('Enter address details first.');
      return;
    }

    setLocating(true);
    setLocationMessage('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(addressQuery)}`
      );
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setLocationMessage('Address not found on map. Please pin manually.');
        return;
      }

      const loc = {
        lat: Number(data[0].lat),
        lng: Number(data[0].lon),
      };

      if (Number.isNaN(loc.lat) || Number.isNaN(loc.lng)) {
        setLocationMessage('Could not resolve address location.');
        return;
      }

      setAddress((prev) => ({ ...prev, location: loc }));
      setLocationMessage('Address located on map.');
    } catch (error) {
      console.error('Geocode error:', error);
      setLocationMessage('Failed to locate address. Try again or pin manually.');
    } finally {
      setLocating(false);
    }
  };

  const handleSave = async () => {
    const validLocation =
      address.location &&
      Number.isFinite(address.location.lat) &&
      Number.isFinite(address.location.lng)
        ? address.location
        : undefined;

    setSaving(true);
    await onSave(name, {
      street: address.street,
      area: address.area,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      location: validLocation,
    });
    setSaving(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-[209] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`fixed z-[210] inset-x-3 top-6 sm:top-10 mx-auto max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
        <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-[#2d2450]' : 'border-orange-100'}`}>
          <h3 className={`font-black text-lg ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Profile Settings</h3>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center border ${isDark ? 'bg-[#13102a] border-[#2d2450] text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <Field
            label="Full Name"
            placeholder="Your full name"
            value={name}
            onChange={setName}
            isDark={isDark}
          />

          <div className={`mt-4 p-4 rounded-xl border ${isDark ? 'bg-[#13102a] border-[#2d2450]' : 'bg-orange-50 border-orange-100'}`}>
            <Field
              label="Street Address"
              placeholder="House No., Street Name"
              value={address.street}
              onChange={(v) => setAddress((prev) => ({ ...prev, street: v }))}
              isDark={isDark}
            />
            <Field
              label="Area/Locality"
              placeholder="Area, Landmark"
              value={address.area}
              onChange={(v) => setAddress((prev) => ({ ...prev, area: v }))}
              isDark={isDark}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="City"
                placeholder="City"
                value={address.city}
                onChange={(v) => setAddress((prev) => ({ ...prev, city: v }))}
                isDark={isDark}
              />
              <Field
                label="State"
                placeholder="State"
                value={address.state}
                onChange={(v) => setAddress((prev) => ({ ...prev, state: v }))}
                isDark={isDark}
              />
            </div>
            <Field
              label="Pincode"
              placeholder="6-digit pincode"
              value={address.pincode}
              onChange={(v) => setAddress((prev) => ({ ...prev, pincode: v }))}
              isDark={isDark}
            />

            <div className="mt-2">
              <div className="flex items-center justify-between gap-2 mb-2">
                <label className={`text-[11px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-gray-500' : 'text-amber-950/60'}`}>
                  Pick Location on Map
                </label>
                <button
                  type="button"
                  onClick={geocodeAddress}
                  disabled={locating}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${isDark ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-orange-50 border-orange-200 text-orange-600'} disabled:opacity-60`}
                >
                  {locating ? 'Locating...' : 'Show Typed Address'}
                </button>
              </div>

              <LocationPicker
                location={address.location || null}
                onLocationChange={(loc) => setAddress((prev) => ({ ...prev, location: loc || undefined }))}
              />

              {locationMessage && (
                <p className={`mt-2 text-xs font-semibold ${locationMessage.includes('located') ? 'text-green-600' : 'text-amber-600'}`}>
                  {locationMessage}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={saving}
              className={`py-2.5 rounded-xl font-bold border ${isDark ? 'border-[#2d2450] text-gray-300 bg-[#13102a]' : 'border-gray-200 text-gray-600 bg-gray-50'}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`py-2.5 rounded-xl font-bold text-white ${isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-orange-500 hover:bg-orange-600'} disabled:opacity-60`}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  isDark,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  isDark: boolean;
}) {
  return (
    <div className="mb-3 text-left">
      <label className={`block mb-1.5 text-[11px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-gray-500' : 'text-amber-950/60'}`}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border font-medium focus:outline-none focus:ring-4 transition-all ${isDark ? 'border-[#2d2450] bg-[#13102a] text-gray-200 placeholder-gray-600 focus:border-indigo-500 focus:ring-indigo-500/10 focus:bg-[#1a1535]' : 'border-orange-200 bg-orange-50/30 text-amber-950 placeholder-amber-900/30 focus:border-orange-500 focus:ring-orange-500/10 focus:bg-white'}`}
      />
    </div>
  );
}
