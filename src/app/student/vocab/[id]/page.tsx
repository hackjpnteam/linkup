'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface VocabCard {
  index: number;
  word: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
  status: 'new' | 'learning' | 'mastered';
}

interface DeckData {
  deck: {
    id: string;
    title: string;
    description: string;
    level: string;
  };
  cards: VocabCard[];
}

export default function VocabDeckPage() {
  const params = useParams();
  const [data, setData] = useState<DeckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [mode, setMode] = useState<'list' | 'study'>('list');

  useEffect(() => {
    fetch(`/api/student/vocab/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleAnswer = async (correct: boolean) => {
    await fetch(`/api/student/vocab/${params.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardIndex: data!.cards[currentIndex].index,
        correct,
      }),
    });

    setShowAnswer(false);
    if (currentIndex < data!.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setMode('list');
      const res = await fetch(`/api/student/vocab/${params.id}`);
      const newData = await res.json();
      setData(newData);
    }
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

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">デッキが見つかりません</p>
        <Link href="/student/vocab" className="text-white hover:text-zinc-300 mt-4 inline-block">
          戻る
        </Link>
      </div>
    );
  }

  const currentCard = data.cards[currentIndex];
  const statusLabel = {
    new: '新規',
    learning: '学習中',
    mastered: '習得',
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Link href="/student/vocab" className="text-zinc-400 hover:text-white text-sm mb-2 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            単語帳一覧
          </Link>
          <h1 className="text-2xl font-bold text-white">{data.deck.title}</h1>
        </div>
        {mode === 'list' && (
          <div className="flex gap-3">
            <button
              onClick={() => { setMode('study'); setCurrentIndex(0); setShowAnswer(false); }}
              className="px-4 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
            >
              学習を開始
            </button>
            <Link
              href={`/student/vocab/${params.id}/test`}
              className="px-4 py-2.5 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors border border-zinc-700"
            >
              テストを受ける
            </Link>
          </div>
        )}
      </div>

      {mode === 'study' ? (
        <div className="max-w-xl mx-auto">
          <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 text-center">
            <div className="flex items-center justify-between text-sm text-zinc-500 mb-6">
              <span>{currentIndex + 1} / {data.cards.length}</span>
              <div className="w-32 bg-zinc-800 rounded-full h-1.5">
                <div
                  className="bg-white h-1.5 rounded-full transition-all"
                  style={{ width: `${((currentIndex + 1) / data.cards.length) * 100}%` }}
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">{currentCard.word}</h2>
            {currentCard.pronunciation && (
              <p className="text-zinc-500 mb-4">{currentCard.pronunciation}</p>
            )}

            {showAnswer ? (
              <div className="mt-8">
                <p className="text-xl text-zinc-200 mb-3">{currentCard.meaning}</p>
                {currentCard.example && (
                  <p className="text-sm text-zinc-500 italic">例: {currentCard.example}</p>
                )}
                <div className="flex gap-4 justify-center mt-8">
                  <button
                    onClick={() => handleAnswer(false)}
                    className="px-6 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium"
                  >
                    わからなかった
                  </button>
                  <button
                    onClick={() => handleAnswer(true)}
                    className="px-6 py-3 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors font-medium"
                  >
                    覚えた
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAnswer(true)}
                className="mt-8 px-8 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors font-medium"
              >
                答えを見る
              </button>
            )}
          </div>
          <button
            onClick={() => setMode('list')}
            className="mt-4 text-zinc-500 hover:text-white text-sm transition-colors"
          >
            学習を終了
          </button>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-zinc-800">
            {data.cards.map((card) => (
              <div key={card.index} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="font-medium text-white">{card.word}</span>
                    {card.pronunciation && (
                      <span className="text-zinc-500 text-sm ml-2">{card.pronunciation}</span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${
                    card.status === 'mastered' ? 'bg-emerald-500/20 text-emerald-400' :
                    card.status === 'learning' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-zinc-800 text-zinc-400'
                  }`}>
                    {statusLabel[card.status]}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm">{card.meaning}</p>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <table className="w-full hidden lg:table">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-zinc-400">単語</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-zinc-400">意味</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-zinc-400">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {data.cards.map((card) => (
                <tr key={card.index} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-white">{card.word}</span>
                    {card.pronunciation && (
                      <span className="text-zinc-500 text-sm ml-2">{card.pronunciation}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{card.meaning}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs rounded-full ${
                      card.status === 'mastered' ? 'bg-emerald-500/20 text-emerald-400' :
                      card.status === 'learning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {statusLabel[card.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
