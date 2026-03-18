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
      <div className={`rounded-3xl border p-8 text-center ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
        <p className="text-gray-500 font-bold">Loading users...</p>
      </div>
    );
  }

  return (
    <div className={`rounded-[2rem] border overflow-hidden ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100/50'}`}>
      <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-[#2d2450] bg-[#13102a]/50' : 'border-gray-100 bg-orange-50/30'}`}>
        <div>
          <h3 className={`font-black text-xl ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Customers</h3>
          <p className="text-xs text-gray-500 font-semibold">{users.length} customer accounts</p>
        </div>
        <button
          onClick={fetchUsers}
          className={`px-3 py-1.5 text-xs font-black rounded-lg border ${isDark ? 'border-[#2d2450] text-indigo-300 bg-indigo-500/10' : 'border-orange-200 text-orange-600 bg-orange-50'}`}
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className={`${isDark ? 'bg-[#13102a]/50' : 'bg-gray-50/80'}`}>
              <th className="px-5 py-3 text-xs text-gray-400 font-black uppercase tracking-wider text-left">UID</th>
              <th className="px-5 py-3 text-xs text-gray-400 font-black uppercase tracking-wider text-left">Name</th>
              <th className="px-5 py-3 text-xs text-gray-400 font-black uppercase tracking-wider text-left">Phone</th>
              <th className="px-5 py-3 text-xs text-gray-400 font-black uppercase tracking-wider text-left">Email</th>
              <th className="px-5 py-3 text-xs text-gray-400 font-black uppercase tracking-wider text-left">Address</th>
              <th className="px-5 py-3 text-xs text-gray-400 font-black uppercase tracking-wider text-left">Joined</th>
              <th className="px-5 py-3 text-xs text-gray-400 font-black uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className={`${isDark ? 'divide-y divide-[#2d2450]' : 'divide-y divide-gray-100'}`}>
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
                <tr key={user.uid} className={isDark ? 'hover:bg-indigo-500/5' : 'hover:bg-orange-50/30'}>
                  <td className="px-5 py-4 text-sm font-bold text-gray-500">{user.uid}</td>
                  <td className="px-5 py-4 text-sm font-bold text-gray-900 dark:text-gray-100">{user.name}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{user.phone}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">{user.email || '-'}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-600 dark:text-gray-400 max-w-xs">
                    <div className="line-clamp-2">{addressText || '-'}</div>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">{joined}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleDelete(user.uid)}
                      disabled={deletingUid === user.uid}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-60"
                    >
                      <Trash2 size={14} />
                      {deletingUid === user.uid ? 'Removing...' : 'Remove'}
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
