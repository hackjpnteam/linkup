'use client';

import { useEffect, useState } from 'react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: string;
  targetRole: string;
  dueDate: string | null;
  createdBy: { name: string };
  createdAt: string;
  _count?: { states: number };
}

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    type: 'general',
    targetRole: 'student',
    dueDate: '',
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    const res = await fetch('/api/admin/assignments');
    const data = await res.json();
    setAssignments(data.assignments || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    await fetch('/api/admin/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...createForm,
        dueDate: createForm.dueDate || null,
      }),
    });
    setShowCreateModal(false);
    setCreateForm({
      title: '',
      description: '',
      type: 'general',
      targetRole: 'student',
      dueDate: '',
    });
    fetchAssignments();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この課題を削除しますか？')) return;
    await fetch(`/api/admin/assignments/${id}`, { method: 'DELETE' });
    fetchAssignments();
  };

  const typeLabel: Record<string, string> = {
    general: '一般',
    pronunciation: '発音',
    vocab: '単語',
    grammar: '文法',
    video: '動画',
  };

  const targetLabel: Record<string, string> = {
    student: '全受講生',
    individual: '個別',
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
        <h1 className="text-2xl font-bold text-gray-900">課題管理</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          新規作成
        </button>
      </div>

      {assignments.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-primary/20 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">タイトル</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">種類</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">対象</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">期限</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">提出数</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">作成者</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="py-4 px-6">
                    <p className="font-medium text-gray-900">{assignment.title}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{assignment.description}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 text-xs bg-primary/20 text-primary-dark rounded">
                      {typeLabel[assignment.type] || assignment.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                      {targetLabel[assignment.targetRole] || assignment.targetRole}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {assignment.dueDate
                      ? new Date(assignment.dueDate).toLocaleDateString('ja-JP')
                      : '-'}
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {assignment._count?.states || 0}件
                  </td>
                  <td className="py-4 px-6 text-gray-600">{assignment.createdBy?.name}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleDelete(assignment.id)}
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
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-primary/20 text-center">
          <p className="text-gray-500">課題がありません</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">新規課題作成</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">種類</label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="general">一般</option>
                    <option value="pronunciation">発音</option>
                    <option value="vocab">単語</option>
                    <option value="grammar">文法</option>
                    <option value="video">動画</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">対象</label>
                  <select
                    value={createForm.targetRole}
                    onChange={(e) => setCreateForm({ ...createForm, targetRole: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="student">全受講生</option>
                    <option value="individual">個別</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">期限（オプション）</label>
                <input
                  type="date"
                  value={createForm.dueDate}
                  onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
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
