'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
  users: {
    totalStudents: number;
    totalCoaches: number;
    newStudentsThisMonth: number;
    unmatchedStudents: number;
  };
  study: {
    totalStudyMinutes: number;
    averageMinutesPerStudent: number;
  };
  content: {
    totalAssignments: number;
    totalVocabDecks: number;
    totalGrammarLessons: number;
  };
  assignments: {
    completed: number;
    pending: number;
  };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours}時間`;
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">管理者ダッシュボード</h1>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
          <h3 className="text-sm font-medium text-gray-500 mb-2">総受講生数</h3>
          <p className="text-3xl font-bold text-primary-dark">{data?.users.totalStudents || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
          <h3 className="text-sm font-medium text-gray-500 mb-2">総コーチ数</h3>
          <p className="text-3xl font-bold text-primary">{data?.users.totalCoaches || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
          <h3 className="text-sm font-medium text-gray-500 mb-2">今月の新規登録</h3>
          <p className="text-3xl font-bold text-primary-dark">{data?.users.newStudentsThisMonth || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
          <h3 className="text-sm font-medium text-gray-500 mb-2">未マッチング</h3>
          <p className="text-3xl font-bold text-primary">{data?.users.unmatchedStudents || 0}</p>
          {(data?.users.unmatchedStudents || 0) > 0 && (
            <Link href="/admin/matching" className="text-sm text-primary-dark hover:text-primary">
              マッチングする →
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">学習統計（過去30日）</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-cream rounded-lg">
              <span className="text-gray-600">総学習時間</span>
              <span className="font-bold text-gray-900">
                {formatMinutes(data?.study.totalStudyMinutes || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-cream rounded-lg">
              <span className="text-gray-600">平均学習時間/人</span>
              <span className="font-bold text-gray-900">
                {formatMinutes(data?.study.averageMinutesPerStudent || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Content Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">コンテンツ</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-cream rounded-lg">
              <span className="text-gray-600">課題数</span>
              <span className="font-bold text-gray-900">{data?.content.totalAssignments || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-cream rounded-lg">
              <span className="text-gray-600">単語帳数</span>
              <span className="font-bold text-gray-900">{data?.content.totalVocabDecks || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-cream rounded-lg">
              <span className="text-gray-600">文法レッスン数</span>
              <span className="font-bold text-gray-900">{data?.content.totalGrammarLessons || 0}</span>
            </div>
          </div>
        </div>

        {/* Assignment Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">課題状況</h2>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{data?.assignments.completed || 0}</p>
              <p className="text-sm text-gray-500">完了</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-dark">{data?.assignments.pending || 0}</p>
              <p className="text-sm text-gray-500">未完了</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックリンク</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/users" className="p-3 bg-primary/10 text-primary-dark rounded-lg hover:bg-primary/20 text-center">
              ユーザー管理
            </Link>
            <Link href="/admin/materials" className="p-3 bg-primary/10 text-primary-dark rounded-lg hover:bg-primary/20 text-center">
              教材管理
            </Link>
            <Link href="/admin/assignments" className="p-3 bg-primary/10 text-primary-dark rounded-lg hover:bg-primary/20 text-center">
              課題管理
            </Link>
            <Link href="/admin/exports" className="p-3 bg-cream text-primary-dark rounded-lg hover:bg-cream-dark text-center">
              データ出力
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
