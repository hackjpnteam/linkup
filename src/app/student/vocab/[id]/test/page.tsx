'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface VocabCard {
  index: number;
  word: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
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

interface TestResult {
  cardIndex: number;
  word: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
}

export default function VocabTestPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<DeckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [mode, setMode] = useState<'test' | 'result'>('test');
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    fetch(`/api/student/vocab/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  // Shuffle cards for test
  const shuffledCards = useMemo(() => {
    if (!data?.cards) return [];
    return [...data.cards].sort(() => Math.random() - 0.5);
  }, [data?.cards]);

  const currentCard = shuffledCards[currentIndex];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCard || !userAnswer.trim()) return;

    const isCorrect = userAnswer.trim().toLowerCase() === currentCard.meaning.trim().toLowerCase();

    const result: TestResult = {
      cardIndex: currentCard.index,
      word: currentCard.word,
      correctAnswer: currentCard.meaning,
      userAnswer: userAnswer.trim(),
      isCorrect,
    };

    const newResults = [...results, result];
    setResults(newResults);

    // Update progress in backend
    await fetch(`/api/student/vocab/${params.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardIndex: currentCard.index,
        correct: isCorrect,
      }),
    });

    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setShowHint(false);
    } else {
      setMode('result');
    }
  };

  const handleSkip = async () => {
    if (!currentCard) return;

    const result: TestResult = {
      cardIndex: currentCard.index,
      word: currentCard.word,
      correctAnswer: currentCard.meaning,
      userAnswer: '',
      isCorrect: false,
    };

    const newResults = [...results, result];
    setResults(newResults);

    // Mark as incorrect in backend
    await fetch(`/api/student/vocab/${params.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardIndex: currentCard.index,
        correct: false,
      }),
    });

    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setShowHint(false);
    } else {
      setMode('result');
    }
  };

  const accuracy = results.length > 0
    ? Math.round((results.filter(r => r.isCorrect).length / results.length) * 100)
    : 0;

  const restartTest = () => {
    setCurrentIndex(0);
    setResults([]);
    setMode('test');
    setUserAnswer('');
    setShowHint(false);
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

  if (!data || shuffledCards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">テストできる単語がありません</p>
        <Link href="/student/vocab" className="text-white hover:text-zinc-300 mt-4 inline-block">
          戻る
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/student/vocab/${params.id}`} className="text-zinc-400 hover:text-white text-sm mb-2 inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {data.deck.title}に戻る
        </Link>
        <h1 className="text-2xl font-bold text-white">単語テスト</h1>
      </div>

      {mode === 'test' ? (
        <div className="max-w-xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-zinc-400 mb-2">
              <span>問題 {currentIndex + 1} / {shuffledCards.length}</span>
              <span>正解率: {results.length > 0 ? accuracy : '-'}%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / shuffledCards.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800">
            <div className="text-center mb-8">
              <p className="text-zinc-500 text-sm mb-2">この単語の意味を入力してください</p>
              <h2 className="text-4xl font-bold text-white mb-2">{currentCard.word}</h2>
              {currentCard.pronunciation && (
                <p className="text-zinc-500">{currentCard.pronunciation}</p>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="意味を入力..."
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors text-center text-lg"
                autoFocus
              />

              {showHint && currentCard.example && (
                <p className="text-sm text-zinc-500 mt-3 text-center italic">
                  ヒント: {currentCard.example}
                </p>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  disabled={showHint || !currentCard.example}
                  className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ヒント
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  スキップ
                </button>
                <button
                  type="submit"
                  disabled={!userAnswer.trim()}
                  className="flex-1 px-4 py-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  回答
                </button>
              </div>
            </form>
          </div>

          {/* Recent Results */}
          {results.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-zinc-500 mb-3">直近の回答</p>
              <div className="flex flex-wrap gap-2">
                {results.slice(-5).map((r, i) => (
                  <div
                    key={i}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      r.isCorrect
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {r.word}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          {/* Result Summary */}
          <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-4">テスト結果</h2>
            <div className="text-6xl font-bold text-white mb-2">{accuracy}%</div>
            <p className="text-zinc-400 mb-6">
              {results.filter(r => r.isCorrect).length} / {results.length} 問正解
            </p>

            {/* Score Badge */}
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              accuracy >= 80
                ? 'bg-emerald-500/20 text-emerald-400'
                : accuracy >= 60
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {accuracy >= 80 ? '素晴らしい！' : accuracy >= 60 ? 'もう少し！' : 'がんばりましょう'}
            </div>

            <div className="flex gap-3 justify-center mt-8">
              <button
                onClick={restartTest}
                className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
              >
                もう一度テスト
              </button>
              <button
                onClick={() => router.push(`/student/vocab/${params.id}`)}
                className="px-6 py-3 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors border border-zinc-700"
              >
                単語一覧に戻る
              </button>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="font-medium text-white">詳細結果</h3>
            </div>
            <div className="divide-y divide-zinc-800">
              {results.map((result, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                          result.isCorrect
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {result.isCorrect ? '○' : '×'}
                        </span>
                        <span className="font-medium text-white">{result.word}</span>
                      </div>
                      <div className="ml-7 text-sm">
                        <p className="text-zinc-400">
                          正解: <span className="text-emerald-400">{result.correctAnswer}</span>
                        </p>
                        {!result.isCorrect && result.userAnswer && (
                          <p className="text-zinc-500">
                            あなたの回答: <span className="text-red-400">{result.userAnswer}</span>
                          </p>
                        )}
                        {!result.userAnswer && (
                          <p className="text-zinc-500">スキップ</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
