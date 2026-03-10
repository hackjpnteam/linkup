'use client';

import { useEffect, useState } from 'react';

interface Student {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Coach {
  id: string;
  name: string;
  email: string;
  studentCount: number;
}

export default function AdminMatchingPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/matching')
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.unmatchedStudents || []);
        setCoaches(data.coaches || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleMatch = async () => {
    if (!selectedStudent || !selectedCoach) return;

    await fetch('/api/admin/matching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: selectedStudent,
        coachId: selectedCoach,
      }),
    });

    setSelectedStudent(null);
    setSelectedCoach(null);
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">コーチマッチング</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unmatched Students */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            未マッチングの受講生 ({students.length})
          </h2>
          {students.length > 0 ? (
            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedStudent === student.id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-cream hover:bg-cream-dark'
                  }`}
                >
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.email}</p>
                  <p className="text-xs text-gray-400">
                    登録日: {new Date(student.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">未マッチングの受講生はいません</p>
          )}
        </div>

        {/* Coaches */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-primary/20">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            コーチ一覧 ({coaches.length})
          </h2>
          {coaches.length > 0 ? (
            <div className="space-y-3">
              {coaches.map((coach) => (
                <div
                  key={coach.id}
                  onClick={() => setSelectedCoach(coach.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedCoach === coach.id
                      ? 'bg-primary/10 border-2 border-primary-dark'
                      : 'bg-cream hover:bg-cream-dark'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{coach.name}</p>
                      <p className="text-sm text-gray-500">{coach.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{coach.studentCount}</p>
                      <p className="text-xs text-gray-500">担当受講生</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">コーチがいません</p>
          )}
        </div>
      </div>

      {/* Match Button */}
      {selectedStudent && selectedCoach && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleMatch}
            className="px-8 py-4 bg-primary text-white rounded-xl shadow-lg hover:bg-primary-dark font-medium"
          >
            マッチングを確定する
          </button>
        </div>
      )}
    </div>
  );
}
