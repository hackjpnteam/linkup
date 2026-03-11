'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PronunciationExercise {
  id: string;
  title: string;
  description: string;
  targetText: string;
  level: string;
  category: string;
  attemptCount: number;
  bestScore: number | null;
}

export default function PronunciationPage() {
  const [exercises, setExercises] = useState<PronunciationExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/pronunciation')
      .then((res) => res.json())
      .then((data) => {
        setExercises(data.exercises || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const levelLabel = {
    beginner: '初級',
    intermediate: '中級',
    advanced: '上級',
  };

  const levelColor = {
    beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">発音練習</h1>
        <p className="text-gray-500">ネイティブの発音を目指して練習しましょう</p>
      </div>

      {exercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {exercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/student/pronunciation/${exercise.id}`}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 shadow-sm transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg font-semibold text-gray-800 group-hover:text-gray-700">{exercise.title}</h2>
                <span className={`px-2.5 py-1 text-xs rounded-full border ${
                  levelColor[exercise.level as keyof typeof levelColor]
                }`}>
                  {levelLabel[exercise.level as keyof typeof levelLabel]}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{exercise.description}</p>
              <div className="p-4 bg-cream-dark rounded-lg mb-4">
                <p className="text-gray-800 font-medium text-center">"{exercise.targetText}"</p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  練習回数: <span className="text-gray-600">{exercise.attemptCount}回</span>
                </span>
                {exercise.bestScore !== null && (
                  <span className={`font-medium px-2.5 py-1 rounded-full ${
                    exercise.bestScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                    exercise.bestScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    ベスト: {exercise.bestScore}%
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <p className="text-gray-500">利用可能な練習がありません</p>
        </div>
      )}
    </div>
  );
}
