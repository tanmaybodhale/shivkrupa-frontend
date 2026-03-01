'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Navigation } from 'lucide-react';

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
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-2xl">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-lg text-gray-900">Customer Locations</h3>
          <p className="text-xs text-gray-500">{usersWithLocation.length} customers with location data</p>
        </div>
        <button
          onClick={fetchUsers}
          className="px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100"
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-2xl">
          <p className="text-gray-500">Loading users...</p>
        </div>
      ) : usersWithLocation.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-2xl">
          <span className="text-5xl mb-4">🗺️</span>
          <p className="text-gray-500 font-medium">No customer locations found</p>
          <p className="text-xs text-gray-400 mt-1">Customers need to pick location on map during signup</p>
        </div>
      ) : (
        <MapInner usersWithLocation={usersWithLocation} />
      )}

      {usersWithLocation.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Customers List ({usersWithLocation.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {usersWithLocation.map((user) => (
              <div
                key={user.uid}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">📞 {user.phone}</p>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${user.address?.location?.lat},${user.address?.location?.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-orange-600 hover:text-orange-700"
                >
                  <Navigation size={16} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
