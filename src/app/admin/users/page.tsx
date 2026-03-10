'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  coach?: { name: string };
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'student' | 'coach' | 'admin'>('all');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });

  useEffect(() => {
    fetchUsers();
  }, [filter, search]);

  const fetchUsers = async () => {
    const params = new URLSearchParams();
    if (filter !== 'all') params.append('role', filter);
    if (search) params.append('search', search);

    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createForm),
    });
    setShowCreateModal(false);
    setCreateForm({ name: '', email: '', password: '', role: 'student' });
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このユーザーを削除しますか？')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  const roleLabel = {
    student: '受講生',
    coach: 'コーチ',
    admin: '管理者',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          新規作成
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex gap-2">
          {(['all', 'student', 'coach', 'admin'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-cream text-gray-600 hover:bg-cream-dark'
              }`}
            >
              {f === 'all' ? 'すべて' : roleLabel[f]}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg flex-1 max-w-xs"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-primary/20 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">名前</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">メール</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">役割</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">コーチ</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">登録日</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="py-4 px-6 font-medium text-gray-900">{user.name}</td>
                <td className="py-4 px-6 text-gray-600">{user.email}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 text-xs rounded ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'coach' ? 'bg-primary/20 text-primary-dark' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {roleLabel[user.role as keyof typeof roleLabel]}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-600">{user.coach?.name || '-'}</td>
                <td className="py-4 px-6 text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">新規ユーザー作成</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メール</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">役割</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="student">受講生</option>
                  <option value="coach">コーチ</option>
                  <option value="admin">管理者</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
