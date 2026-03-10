'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
  students: Array<{
    id: string;
    name: string;
    email: string;
    weeklyStudyMinutes: number;
    pendingAssignments: number;
    completedAssignments: number;
  }>;
  upcomingSessions: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    student: { name: string };
    status: string;
  }>;
  pendingRequests: Array<{
    id: string;
    title: string;
    student: { name: string };
    currentTime: { start: string; end: string };
    requestedTime: { start: string; end: string };
    reason: string;
  }>;
  totalStudents: number;
}

export default function CoachDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/coach/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRequestAction = async (eventId: string, action: 'approve' | 'reject') => {
    await fetch(`/api/coach/calendar/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    window.location.reload();
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">コーチダッシュボード</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
          <h3 className="text-sm font-medium text-gray-500 mb-2">担当受講生</h3>
          <p className="text-3xl font-bold text-primary-dark">{data?.totalStudents || 0}人</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
          <h3 className="text-sm font-medium text-gray-500 mb-2">今後のセッション</h3>
          <p className="text-3xl font-bold text-primary">{data?.upcomingSessions?.length || 0}件</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
          <h3 className="text-sm font-medium text-gray-500 mb-2">変更リクエスト</h3>
          <p className="text-3xl font-bold text-primary-dark">{data?.pendingRequests?.length || 0}件</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        {data?.pendingRequests && data.pendingRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">変更リクエスト</h2>
            <div className="space-y-4">
              {data.pendingRequests.map((request) => (
                <div key={request.id} className="p-4 bg-cream rounded-lg">
                  <p className="font-medium text-gray-900">{request.title}</p>
                  <p className="text-sm text-gray-600">受講生: {request.student?.name}</p>
                  <p className="text-sm text-gray-500">
                    希望: {formatDateTime(request.requestedTime?.start)}
                  </p>
                  <p className="text-sm text-gray-500">理由: {request.reason}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleRequestAction(request.id, 'approve')}
                      className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary-dark"
                    >
                      承認
                    </button>
                    <button
                      onClick={() => handleRequestAction(request.id, 'reject')}
                      className="px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
                    >
                      拒否
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">今後のセッション</h2>
            <Link href="/coach/calendar" className="text-sm text-primary-dark hover:text-primary">
              カレンダー
            </Link>
          </div>
          {data?.upcomingSessions && data.upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingSessions.map((session) => (
                <div key={session.id} className="p-3 bg-cream rounded-lg">
                  <p className="font-medium text-gray-900">{session.title}</p>
                  <p className="text-sm text-gray-600">{session.student?.name}</p>
                  <p className="text-sm text-gray-500">{formatDateTime(session.startTime)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">予定されたセッションはありません</p>
          )}
        </div>

        {/* Students */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">受講生一覧</h2>
            <Link href="/coach/students" className="text-sm text-primary-dark hover:text-primary">
              すべて見る
            </Link>
          </div>
          {data?.students && data.students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/20">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">名前</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">今週の学習</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">未完了課題</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">完了課題</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((student) => (
                    <tr key={student.id} className="border-b border-primary/10">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatMinutes(student.weeklyStudyMinutes)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded ${
                          student.pendingAssignments > 0 ? 'bg-primary/20 text-primary-dark' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {student.pendingAssignments}件
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{student.completedAssignments}件</td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/coach/students/${student.id}`}
                          className="text-primary-dark hover:text-primary text-sm"
                        >
                          詳細
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">担当受講生がいません</p>
          )}
        </div>
      </div>
    </div>
  );
}
