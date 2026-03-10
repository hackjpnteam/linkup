'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Student {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function CoachStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/coach/students')
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.students || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">受講生一覧</h1>

      {students.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-primary/20 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">名前</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">メール</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">登録日</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student._id}>
                  <td className="py-4 px-6 font-medium text-gray-900">{student.name}</td>
                  <td className="py-4 px-6 text-gray-600">{student.email}</td>
                  <td className="py-4 px-6 text-gray-500">
                    {new Date(student.createdAt).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="py-4 px-6">
                    <Link
                      href={`/coach/students/${student._id}`}
                      className="text-primary-dark hover:text-primary"
                    >
                      詳細を見る
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-primary/20 text-center">
          <p className="text-gray-500">担当受講生がいません</p>
        </div>
      )}
    </div>
  );
}
