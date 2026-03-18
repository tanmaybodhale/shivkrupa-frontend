'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { User } from '@/lib/types';
import { Trash2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function UsersManager({ showToast }: { showToast: (msg: string) => void }) {
  const { isDark } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUid, setDeletingUid] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/users`);
      const data = await res.json();
      if (data.success) setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showToast('❌ Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (uid: string) => {
    if (!confirm('Remove this user from platform? This will also remove their orders.')) return;
    setDeletingUid(uid);
    try {
      const res = await fetch(`${API_URL}/auth/users/${uid}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        showToast(`❌ ${data.message || 'Failed to delete user'}`);
        return;
      }
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
      showToast('✅ User removed');
    } catch (error) {
      console.error('Delete user error:', error);
      showToast('❌ Failed to delete user');
    } finally {
      setDeletingUid(null);
    }
  };

  if (loading) {
    return (
      <div className={`rounded-[2rem] border p-12 text-center flex flex-col items-center justify-center ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100/50'}`}>
        <div className={`w-8 h-8 border-4 rounded-full animate-spin mb-4 ${isDark ? 'border-indigo-900 border-t-indigo-500' : 'border-orange-200 border-t-orange-500'}`} />
        <p className={`font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Loading customers...</p>
      </div>
    );
  }

  return (
    <div className={`rounded-[2rem] border overflow-hidden ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100/50'}`}>
      <div className={`px-6 py-5 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDark ? 'border-[#2d2450] bg-[#13102a]/50' : 'border-orange-100 bg-orange-50/30'}`}>
        <div>
          <h3 className={`font-black text-xl flex items-center gap-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            <span className="text-2xl">👥</span> Customer Directory
          </h3>
          <p className={`text-sm font-medium mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Manage {users.length} registered customers
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all active:scale-95 ${isDark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}
        >
          🔄 Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className={`border-b ${isDark ? 'bg-[#13102a]/50 border-[#2d2450]' : 'bg-gray-50/80 border-gray-100'}`}>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Customer</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Contact</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Address</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Joined</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#2d2450]' : 'divide-gray-100'}`}>
            {users.map((user) => {
              const addressText = [
                user.address?.street,
                user.address?.area,
                user.address?.city,
                user.address?.state,
                user.address?.pincode,
              ]
                .filter(Boolean)
                .join(', ');
              const joined = user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : '-';

              return (
                <tr key={user.uid} className={`transition-colors group ${isDark ? 'hover:bg-indigo-500/5' : 'hover:bg-orange-50/30'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border shadow-sm ${isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className={`font-black text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{user.name}</div>
                        <div className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          ID: <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{user.uid}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <a href={`tel:${user.phone}`} className={`flex items-center gap-1.5 w-fit px-2 py-1 rounded-md text-xs font-bold transition-colors ${isDark ? 'bg-[#13102a] text-gray-300 hover:text-indigo-400 hover:bg-indigo-500/10 border border-[#2d2450]' : 'bg-white text-gray-700 hover:text-orange-600 hover:bg-orange-50 border border-gray-100'}`}>
                        📞 {user.phone}
                      </a>
                      {user.email && user.email !== '-' && (
                        <a href={`mailto:${user.email}`} className={`flex items-center gap-1.5 w-fit px-2 py-1 rounded-md text-xs font-bold transition-colors ${isDark ? 'bg-[#13102a] text-gray-300 hover:text-indigo-400 hover:bg-indigo-500/10 border border-[#2d2450]' : 'bg-white text-gray-700 hover:text-orange-600 hover:bg-orange-50 border border-gray-100'}`}>
                          ✉️ {user.email}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {addressText ? (
                      <div className="flex items-start gap-2 max-w-[250px]">
                        <span className="text-sm">📍</span>
                        <p className={`text-xs font-semibold line-clamp-2 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{addressText}</p>
                      </div>
                    ) : (
                      <span className={`text-xs font-semibold py-1 px-2.5 rounded-lg border ${isDark ? 'bg-[#13102a] text-gray-600 border-[#2d2450]' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                        No address provided
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {joined}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(user.uid)}
                      disabled={deletingUid === user.uid}
                      className={`p-2.5 rounded-xl transition-all active:scale-95 ${isDark ? 'text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white disabled:opacity-50' : 'text-red-500 bg-red-50 hover:bg-red-500 hover:text-white disabled:opacity-50'}`}
                      title="Remove Customer"
                    >
                      {deletingUid === user.uid ? (
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={18} strokeWidth={2.5} />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="p-10 text-center text-gray-500 font-medium">
          No customers found.
        </div>
      )}
    </div>
  );
}
