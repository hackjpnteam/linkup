'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface VocabDeck {
  id: string;
  title: string;
  description: string;
  level: string;
  cardCount: number;
  masteredCount: number;
  learningCount: number;
  progress: number;
}

export default function VocabPage() {
  const [decks, setDecks] = useState<VocabDeck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/vocab')
      .then((res) => res.json())
      .then((data) => {
        setDecks(data.decks || []);
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">単語帳</h1>
        <p className="text-gray-500">単語デッキを選んで学習またはテストを始めましょう</p>
      </div>

      {decks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 shadow-sm transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-gray-800 group-hover:text-gray-700">{deck.title}</h2>
                <span className={`px-2.5 py-1 text-xs rounded-full border ${
                  levelColor[deck.level as keyof typeof levelColor]
                }`}>
                  {levelLabel[deck.level as keyof typeof levelLabel]}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-5 line-clamp-2">{deck.description}</p>

              {/* Progress */}
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">進捗</span>
                  <span className="text-gray-800 font-medium">{deck.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all animate-progress"
                    style={{ width: `${deck.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>{deck.cardCount}単語</span>
                  <span>習得: {deck.masteredCount} / 学習中: {deck.learningCount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link
                  href={`/student/vocab/${deck.id}`}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-medium text-center text-sm hover:bg-primary-dark transition-colors"
                >
                  学習する
                </Link>
                <Link
                  href={`/student/vocab/${deck.id}/test`}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg font-medium text-center text-sm hover:bg-gray-200 transition-colors border border-gray-300"
                >
                  テスト
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-gray-500">利用可能な単語帳がありません</p>
        </div>
      )}
    </div>
  );
}
