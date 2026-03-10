'use client';

import { useEffect, useState } from 'react';

interface Material {
  id: string;
  title: string;
  description: string;
  type: string;
  level: string;
  tags: string[];
  isPublic: boolean;
  createdBy: { name: string };
  createdAt: string;
}

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    type: 'vocab',
    content: '',
    level: 'beginner',
    isPublic: true,
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const res = await fetch('/api/admin/materials');
    const data = await res.json();
    setMaterials(data.materials || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    await fetch('/api/admin/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createForm),
    });
    setShowCreateModal(false);
    setCreateForm({
      title: '',
      description: '',
      type: 'vocab',
      content: '',
      level: 'beginner',
      isPublic: true,
    });
    fetchMaterials();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この教材を削除しますか？')) return;
    await fetch(`/api/admin/materials/${id}`, { method: 'DELETE' });
    fetchMaterials();
  };

  const typeLabel = {
    vocab: '単語',
    grammar: '文法',
    pronunciation: '発音',
    video: '動画',
    document: '資料',
  };

  const levelLabel = {
    beginner: '初級',
    intermediate: '中級',
    advanced: '上級',
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
        <h1 className="text-2xl font-bold text-gray-900">教材管理</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          新規作成
        </button>
      </div>

      {materials.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-primary/20 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">タイトル</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">種類</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">レベル</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">公開</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">作成者</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {materials.map((material) => (
                <tr key={material.id}>
                  <td className="py-4 px-6">
                    <p className="font-medium text-gray-900">{material.title}</p>
                    <p className="text-sm text-gray-500">{material.description}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 text-xs bg-primary/20 text-primary-dark rounded">
                      {typeLabel[material.type as keyof typeof typeLabel]}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 text-xs rounded ${
                      material.level === 'beginner' ? 'bg-green-100 text-green-800' :
                      material.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {levelLabel[material.level as keyof typeof levelLabel]}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {material.isPublic ? (
                      <span className="text-green-600">公開</span>
                    ) : (
                      <span className="text-gray-400">非公開</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-gray-600">{material.createdBy?.name}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleDelete(material.id)}
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
          <p className="text-gray-500">教材がありません</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">新規教材作成</h3>
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
                  rows={2}
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
                    <option value="vocab">単語</option>
                    <option value="grammar">文法</option>
                    <option value="pronunciation">発音</option>
                    <option value="video">動画</option>
                    <option value="document">資料</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">レベル</label>
                  <select
                    value={createForm.level}
                    onChange={(e) => setCreateForm({ ...createForm, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="beginner">初級</option>
                    <option value="intermediate">中級</option>
                    <option value="advanced">上級</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">コンテンツ</label>
                <textarea
                  value={createForm.content}
                  onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={4}
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
