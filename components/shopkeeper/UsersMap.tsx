'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Navigation, MapPin, RefreshCw, Loader2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface UserLocation {
  uid: string;
  name: string;
  phone: string;
  address?: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    location?: {
      lat: number;
      lng: number;
    };
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const MapInner = dynamic(
  () => import('./UsersMapInner'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px] bg-gray-100 rounded-2xl">
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }
);
export default function UsersMap() {
  const { isDark } = useTheme();
  const [users, setUsers] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/users`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const usersWithLocation = users.filter(u => u.address?.location?.lat && u.address?.location?.lng);

  if (!mounted) {
    return (
      <div className={`flex flex-col items-center justify-center h-96 rounded-[2rem] border ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100/50'}`}>
        <Loader2 className={`w-8 h-8 animate-spin mb-4 ${isDark ? 'text-indigo-400' : 'text-orange-500'}`} />
        <p className={`font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Loading map...</p>
      </div>
    );
  }

  return (
    <div className={`rounded-[2rem] border overflow-hidden ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100/50'}`}>
      {/* Header */}
      <div className={`px-6 py-5 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDark ? 'border-[#2d2450] bg-[#13102a]/50' : 'border-orange-100 bg-orange-50/30'}`}>
        <div>
          <h3 className={`font-black text-xl flex items-center gap-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            <span className="text-2xl">🗺️</span> Customer Map Explorer
          </h3>
          <p className={`text-sm font-medium mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Visualizing {usersWithLocation.length} delivery locations
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all active:scale-95 ${isDark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className={`flex flex-col items-center justify-center h-96 ${isDark ? 'bg-[#1a1535]' : 'bg-white'}`}>
          <Loader2 className={`w-8 h-8 animate-spin mb-4 ${isDark ? 'text-indigo-400' : 'text-orange-500'}`} />
          <p className={`font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Loading customer data...</p>
        </div>
      ) : usersWithLocation.length === 0 ? (
        <div className={`flex flex-col items-center justify-center p-12 text-center ${isDark ? 'bg-[#1a1535]' : 'bg-white'}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-orange-50 text-orange-400'}`}>
            <MapPin size={32} />
          </div>
          <h4 className={`text-xl font-bold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>No customer locations</h4>
          <p className={`text-sm max-w-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Customers need to provide their exact location on the map during checkout or signup.
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row h-[600px] divide-y lg:divide-y-0 lg:divide-x border-t-0">
          {/* Map Section */}
          <div className={`flex-[2] relative z-0 h-full ${isDark ? 'bg-[#13102a]' : 'bg-gray-100'}`}>
            <MapInner usersWithLocation={usersWithLocation} isDark={isDark} />
          </div>

          {/* Sidebar List Section */}
          <div className={`flex-1 flex flex-col h-full z-10 ${isDark ? 'bg-[#1a1535] border-l-[#2d2450]' : 'bg-white border-l-orange-100/50'}`}>
            <div className={`px-5 py-4 border-b ${isDark ? 'border-[#2d2450] bg-[#13102a]/30' : 'border-gray-100 bg-white'}`}>
              <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Location Directory
              </h4>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {usersWithLocation.map((user) => (
                <div
                  key={user.uid}
                  className={`flex flex-col gap-3 p-4 rounded-2xl border transition-colors ${isDark ? 'bg-[#13102a] border-[#2d2450] hover:border-indigo-500/30' : 'bg-gray-50/50 border-gray-100 hover:border-orange-200/50 hover:bg-white'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-100 text-orange-600'}`}>
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{user.name}</p>
                        <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{user.uid}</p>
                      </div>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${user.address?.location?.lat},${user.address?.location?.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-xl border transition-all active:scale-95 shadow-sm ${isDark ? 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500 shadow-indigo-900/20' : 'bg-orange-500 text-white border-orange-400 hover:bg-orange-400 shadow-orange-500/20'}`}
                      title="Navigate"
                    >
                      <Navigation size={16} strokeWidth={2.5} />
                    </a>
                  </div>

                  <div className={`flex flex-col gap-1.5 pt-3 border-t ${isDark ? 'border-[#2d2450]' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">📞</span>
                      <p className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{user.phone}</p>
                    </div>
                    {user.address?.city && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs">📍</span>
                        <p className={`text-xs font-medium leading-tight ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {[user.address.street, user.address.area, user.address.city].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
