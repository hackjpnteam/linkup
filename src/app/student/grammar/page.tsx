'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface GrammarLesson {
  id: string;
  title: string;
  description: string;
  level: string;
  order: number;
  questionCount: number;
  hasVideo: boolean;
  isCompleted: boolean;
  quizScore?: number;
}

export default function GrammarPage() {
  const [lessons, setLessons] = useState<GrammarLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/grammar')
      .then((res) => res.json())
      .then((data) => {
        setLessons(data.lessons || []);
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">文法学習</h1>
        <p className="text-zinc-400">レッスンを選んで文法を学びましょう</p>
      </div>

      {lessons.length > 0 ? (
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <Link
              key={lesson.id}
              href={`/student/grammar/${lesson.id}`}
              className="block bg-zinc-900 rounded-xl p-4 lg:p-6 border border-zinc-800 hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  lesson.isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {lesson.isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-white group-hover:text-white/90 truncate">{lesson.title}</h2>
                  <p className="text-sm text-zinc-500 truncate">{lesson.description}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-2.5 py-1 text-xs rounded-full border hidden sm:block ${
                    levelColor[lesson.level as keyof typeof levelColor]
                  }`}>
                    {levelLabel[lesson.level as keyof typeof levelLabel]}
                  </span>
                  {lesson.hasVideo && (
                    <span className="text-white hidden sm:block">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  )}
                  {lesson.quizScore !== undefined && (
                    <span className="text-sm font-medium text-white bg-zinc-800 px-2.5 py-1 rounded-full">
                      {lesson.quizScore}%
                    </span>
                  )}
                  <svg className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl p-12 border border-zinc-800 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-zinc-400">利用可能なレッスンがありません</p>
        </div>
      )}
    </div>
  );
}
