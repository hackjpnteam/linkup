'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Question {
  index: number;
  question: string;
  options: string[];
}

interface LessonData {
  lesson: {
    id: string;
    title: string;
    description: string;
    content: string;
    videoUrl?: string;
    level: string;
    questions: Question[];
  };
  progress: {
    isCompleted: boolean;
    quizScore?: number;
  } | null;
}

interface QuizResult {
  score: number;
  correctCount: number;
  totalCount: number;
  results: {
    index: number;
    isCorrect: boolean;
    correctAnswer: number;
    explanation: string;
  }[];
}

export default function GrammarLessonPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'content' | 'quiz' | 'result'>('content');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    fetch(`/api/student/grammar/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleSubmitQuiz = async () => {
    const res = await fetch(`/api/student/grammar/${params.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    const result = await res.json();
    setQuizResult(result);
    setMode('result');
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
        <p className="text-zinc-400">レッスンが見つかりません</p>
        <Link href="/student/grammar" className="text-white hover:text-zinc-300 mt-4 inline-block">
          戻る
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/student/grammar" className="text-zinc-400 hover:text-white text-sm mb-2 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        文法一覧
      </Link>
      <h1 className="text-2xl font-bold text-white mb-6">{data.lesson.title}</h1>

      {mode === 'content' && (
        <div>
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 mb-6">
            {data.lesson.videoUrl && (
              <div className="mb-6 aspect-video bg-zinc-800 rounded-lg flex items-center justify-center">
                <p className="text-zinc-500">動画: {data.lesson.videoUrl}</p>
              </div>
            )}
            <div
              className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-strong:text-white prose-code:text-zinc-300 prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
              dangerouslySetInnerHTML={{ __html: data.lesson.content }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {data.lesson.questions.length > 0 && (
              <button
                onClick={() => setMode('quiz')}
                className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
              >
                確認テストを受ける
              </button>
            )}

            {data.progress?.quizScore !== undefined && (
              <p className="text-zinc-400">
                前回のスコア: <span className="font-bold text-white">{data.progress.quizScore}%</span>
              </p>
            )}
          </div>
        </div>
      )}

      {mode === 'quiz' && (
        <div className="space-y-4">
          {data.lesson.questions.map((q, idx) => (
            <div key={q.index} className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
              <p className="font-medium text-white mb-4">Q{idx + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((option, optIdx) => (
                  <label
                    key={optIdx}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      answers[q.index] === optIdx
                        ? 'bg-white/10 border border-white/20'
                        : 'hover:bg-zinc-800 border border-transparent'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q${q.index}`}
                      checked={answers[q.index] === optIdx}
                      onChange={() => setAnswers({ ...answers, [q.index]: optIdx })}
                      className="w-4 h-4 accent-white"
                    />
                    <span className="text-zinc-200">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="flex gap-3">
            <button
              onClick={() => setMode('content')}
              className="px-6 py-3 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors"
            >
              戻る
            </button>
            <button
              onClick={handleSubmitQuiz}
              disabled={Object.keys(answers).length < data.lesson.questions.length}
              className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              回答を送信
            </button>
          </div>
        </div>
      )}

      {mode === 'result' && quizResult && (
        <div>
          <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 mb-6 text-center">
            <h2 className="text-xl font-bold text-white mb-4">テスト結果</h2>
            <p className={`text-5xl font-bold mb-2 ${
              quizResult.score >= 80 ? 'text-emerald-400' :
              quizResult.score >= 60 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {quizResult.score}%
            </p>
            <p className="text-zinc-400">
              {quizResult.correctCount} / {quizResult.totalCount} 問正解
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {quizResult.results.map((result, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${
                  result.isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {result.isCorrect ? (
                    <span className="text-emerald-400 font-medium">○ 正解</span>
                  ) : (
                    <span className="text-red-400 font-medium">× 不正解</span>
                  )}
                </div>
                <p className="text-zinc-300 text-sm">{result.explanation}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setMode('content');
                setAnswers({});
                setQuizResult(null);
              }}
              className="px-6 py-3 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors"
            >
              もう一度
            </button>
            <button
              onClick={() => router.push('/student/grammar')}
              className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
            >
              レッスン一覧に戻る
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
