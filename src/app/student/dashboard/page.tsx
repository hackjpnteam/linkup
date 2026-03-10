'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
  weeklyStudyMinutes: number;
  monthlyStudyMinutes: number;
  goals: Array<{
    _id: string;
    type: string;
    title: string;
    targetHours: number;
    endDate: string;
    isCompleted: boolean;
  }>;
  pendingAssignments: Array<{
    id: string;
    assignment: {
      title: string;
      dueDate: string;
    };
    status: string;
  }>;
  upcomingSessions: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
  }>;
  studyByType: Record<string, number>;
}

export default function StudentDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-zinc-500">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          読み込み中...
        </div>
      </div>
    );
  }

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}時間${mins}分` : `${mins}分`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">ダッシュボード</h1>
        <p className="text-zinc-400">学習の進捗を確認しましょう</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-zinc-400">今週の学習時間</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatMinutes(data?.weeklyStudyMinutes || 0)}
          </p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm text-zinc-400">今月の学習時間</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatMinutes(data?.monthlyStudyMinutes || 0)}
          </p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-sm text-zinc-400">未完了の課題</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {data?.pendingAssignments?.length || 0}件
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Pending Assignments */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">課題</h2>
            <Link href="/student/assignments" className="text-sm text-zinc-400 hover:text-white transition-colors">
              すべて見る
            </Link>
          </div>
          {data?.pendingAssignments && data.pendingAssignments.length > 0 ? (
            <ul className="space-y-3">
              {data.pendingAssignments.map((item) => (
                <li key={item.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{item.assignment?.title}</p>
                    <p className="text-sm text-zinc-500">
                      期限: {item.assignment?.dueDate ? formatDate(item.assignment.dueDate) : '-'}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs rounded-full ${
                    item.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {item.status === 'pending' ? '未着手' : '進行中'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-zinc-500">課題はありません</p>
            </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">コーチングセッション</h2>
            <Link href="/student/calendar" className="text-sm text-zinc-400 hover:text-white transition-colors">
              カレンダー
            </Link>
          </div>
          {data?.upcomingSessions && data.upcomingSessions.length > 0 ? (
            <ul className="space-y-3">
              {data.upcomingSessions.map((session) => (
                <li key={session.id} className="p-4 bg-zinc-800/50 rounded-lg">
                  <p className="font-medium text-white">{session.title}</p>
                  <p className="text-sm text-zinc-500">
                    {formatDate(session.startTime)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-zinc-500">予定されたセッションはありません</p>
            </div>
          )}
        </div>

        {/* Study by Type */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <h2 className="text-lg font-semibold text-white mb-4">学習内訳（今月）</h2>
          <div className="space-y-4">
            {[
              { key: 'vocab', label: '単語', color: 'bg-white' },
              { key: 'grammar', label: '文法', color: 'bg-zinc-400' },
              { key: 'pronunciation', label: '発音', color: 'bg-zinc-500' },
              { key: 'assignment', label: '課題', color: 'bg-zinc-600' },
            ].map(({ key, label, color }) => {
              const minutes = data?.studyByType?.[key] || 0;
              const total = Object.values(data?.studyByType || {}).reduce((a, b) => a + b, 0) || 1;
              const percentage = Math.round((minutes / total) * 100);
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400">{label}</span>
                    <span className="text-white">{formatMinutes(minutes)}</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goals */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <h2 className="text-lg font-semibold text-white mb-4">目標</h2>
          {data?.goals && data.goals.length > 0 ? (
            <ul className="space-y-3">
              {data.goals.map((goal) => (
                <li key={goal._id} className="p-4 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white">{goal.title}</p>
                    {goal.isCompleted && (
                      <span className="text-emerald-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500">
                    目標: {goal.targetHours}時間 / 期限: {new Date(goal.endDate).toLocaleDateString('ja-JP')}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <p className="text-zinc-500">目標を設定してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
