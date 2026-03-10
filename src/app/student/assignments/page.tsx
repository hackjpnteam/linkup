'use client';

import { useEffect, useState } from 'react';

interface Assignment {
  id: string;
  assignment: {
    _id: string;
    title: string;
    description: string;
    type: string;
    dueDate: string;
  };
  status: string;
  score?: number;
  feedback?: string;
  submittedAt?: string;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    fetch('/api/student/assignments')
      .then((res) => res.json())
      .then((data) => {
        setAssignments(data.assignments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredAssignments = assignments.filter((a) => {
    if (filter === 'pending') return ['pending', 'in_progress'].includes(a.status);
    if (filter === 'completed') return ['completed', 'reviewed'].includes(a.status);
    return true;
  });

  const statusLabel = {
    pending: '未着手',
    in_progress: '進行中',
    completed: '完了',
    reviewed: 'レビュー済み',
  };

  const typeLabel = {
    vocab: '単語',
    grammar: '文法',
    pronunciation: '発音',
    mixed: '総合',
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">課題</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary text-white'
                : 'bg-cream text-gray-600 hover:bg-cream-dark'
            }`}
          >
            {f === 'all' ? 'すべて' : f === 'pending' ? '未完了' : '完了'}
          </button>
        ))}
      </div>

      {filteredAssignments.length > 0 ? (
        <div className="space-y-4">
          {filteredAssignments.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-primary/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {item.assignment?.title}
                    </h2>
                    <span className={`px-2 py-1 text-xs rounded ${
                      item.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                      item.status === 'completed' ? 'bg-primary/20 text-primary-dark' :
                      item.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {statusLabel[item.status as keyof typeof statusLabel]}
                    </span>
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                      {typeLabel[item.assignment?.type as keyof typeof typeLabel]}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{item.assignment?.description}</p>
                  <p className="text-sm text-gray-500">
                    期限: {item.assignment?.dueDate
                      ? new Date(item.assignment.dueDate).toLocaleDateString('ja-JP')
                      : '-'}
                  </p>
                </div>
                {item.score !== undefined && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-dark">{item.score}%</p>
                    <p className="text-xs text-gray-500">スコア</p>
                  </div>
                )}
              </div>
              {item.feedback && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">フィードバック:</span> {item.feedback}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-primary/20 text-center">
          <p className="text-gray-500">課題がありません</p>
        </div>
      )}
    </div>
  );
}
