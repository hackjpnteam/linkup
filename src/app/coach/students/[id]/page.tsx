'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface StudentDetail {
  student: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  dailyStudy: Record<string, number>;
  goals: Array<{
    id: string;
    type: string;
    title: string;
    targetHours: number;
    isCompleted: boolean;
  }>;
  assignments: Array<{
    id: string;
    assignment: { title: string; type: string };
    status: string;
    score?: number;
    feedback?: string;
  }>;
  totalStudyMinutes: number;
}

export default function StudentDetailPage() {
  const params = useParams();
  const [data, setData] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({ score: 0, feedback: '' });

  useEffect(() => {
    fetch(`/api/coach/students/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleSubmitFeedback = async () => {
    if (!selectedAssignment) return;

    await fetch(`/api/coach/students/${params.id}/assignments/${selectedAssignment}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackForm),
    });

    setSelectedAssignment(null);
    window.location.reload();
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}時間${mins}分` : `${mins}分`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">受講生が見つかりません</p>
        <Link href="/coach/students" className="text-primary-dark hover:text-primary mt-4 inline-block">
          戻る
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/coach/students" className="text-primary-dark hover:text-primary text-sm mb-2 inline-block">
        ← 受講生一覧
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-primary-dark">
            {data.student.name.charAt(0)}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{data.student.name}</h1>
          <p className="text-gray-500">{data.student.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
          <h3 className="text-sm font-medium text-gray-500 mb-2">過去30日の学習時間</h3>
          <p className="text-3xl font-bold text-primary-dark">
            {formatMinutes(data.totalStudyMinutes)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
          <h3 className="text-sm font-medium text-gray-500 mb-2">完了課題</h3>
          <p className="text-3xl font-bold text-green-600">
            {data.assignments.filter(a => ['completed', 'reviewed'].includes(a.status)).length}件
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
          <h3 className="text-sm font-medium text-gray-500 mb-2">目標達成</h3>
          <p className="text-3xl font-bold text-primary">
            {data.goals.filter(g => g.isCompleted).length}/{data.goals.length}
          </p>
        </div>
      </div>

      {/* Assignments */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">課題</h2>
        {data.assignments.length > 0 ? (
          <div className="space-y-4">
            {data.assignments.map((item) => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.assignment?.title}</p>
                    <p className="text-sm text-gray-500">
                      状態: {item.status === 'completed' ? '提出済み' : item.status === 'reviewed' ? 'レビュー済み' : '未完了'}
                    </p>
                    {item.score !== undefined && (
                      <p className="text-sm text-gray-600">スコア: {item.score}%</p>
                    )}
                    {item.feedback && (
                      <p className="text-sm text-gray-600 mt-2">フィードバック: {item.feedback}</p>
                    )}
                  </div>
                  {item.status === 'completed' && !item.feedback && (
                    <button
                      onClick={() => setSelectedAssignment(item.id)}
                      className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary-dark"
                    >
                      レビュー
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">課題がありません</p>
        )}
      </div>

      {/* Goals */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">目標</h2>
        {data.goals.length > 0 ? (
          <div className="space-y-3">
            {data.goals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {goal.isCompleted ? (
                    <span className="text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      </svg>
                    </span>
                  )}
                  <span className={goal.isCompleted ? 'text-gray-500' : 'text-gray-900'}>
                    {goal.title}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{goal.targetHours}時間</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">目標が設定されていません</p>
        )}
      </div>

      {/* Feedback Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">課題レビュー</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  スコア (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={feedbackForm.score}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, score: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  フィードバック
                </label>
                <textarea
                  value={feedbackForm.feedback}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                送信
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
