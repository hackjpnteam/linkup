'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface ExerciseData {
  exercise: {
    id: string;
    title: string;
    description: string;
    targetText: string;
    targetAudioUrl?: string;
    level: string;
    category: string;
  };
  attempts: Array<{
    id: string;
    score: number;
    accuracyScore: number;
    fluencyScore: number;
    pronunciationScore: number;
    feedback: string;
    wordScores: Array<{ word: string; score: number }>;
    createdAt: string;
  }>;
}

export default function PronunciationExercisePage() {
  const params = useParams();
  const [data, setData] = useState<ExerciseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [latestResult, setLatestResult] = useState<ExerciseData['attempts'][0] | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    fetch(`/api/student/pronunciation/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await submitRecording(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('マイクへのアクセスが許可されていません');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const submitRecording = async (audioBlob: Blob) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const res = await fetch(`/api/student/pronunciation/${params.id}`, {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();

      if (result.error) {
        alert(result.error);
        return;
      }

      setLatestResult(result.attempt);

      const dataRes = await fetch(`/api/student/pronunciation/${params.id}`);
      const newData = await dataRes.json();
      setData(newData);
    } catch (err) {
      console.error('Submit error:', err);
      alert('評価に失敗しました');
    } finally {
      setSubmitting(false);
    }
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

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">練習が見つかりません</p>
        <Link href="/student/pronunciation" className="text-gray-800 hover:text-zinc-300 mt-4 inline-block">
          戻る
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/student/pronunciation" className="text-gray-500 hover:text-gray-800 text-sm mb-2 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        発音練習一覧
      </Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{data.exercise.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Exercise Panel */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">お手本</h2>
          <div className="p-6 bg-gray-100/50 rounded-lg mb-6">
            <p className="text-xl text-gray-800 text-center font-medium">
              "{data.exercise.targetText}"
            </p>
          </div>

          <div className="text-center">
            {recording ? (
              <button
                onClick={stopRecording}
                className="w-20 h-20 rounded-full bg-red-500 text-gray-800 flex items-center justify-center mx-auto hover:bg-red-600 transition-colors animate-pulse"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <rect x="6" y="6" width="8" height="8" />
                </svg>
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={submitting}
                className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center mx-auto hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            <p className="mt-4 text-sm text-gray-500">
              {recording ? '録音中... タップして停止' : submitting ? '評価中...' : 'タップして録音開始'}
            </p>
          </div>
        </div>

        {/* Result Panel */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">結果</h2>

          {latestResult ? (
            <div>
              <div className="text-center mb-6">
                <p className={`text-5xl font-bold mb-2 ${
                  latestResult.score >= 80 ? 'text-emerald-400' :
                  latestResult.score >= 60 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {latestResult.score}%
                </p>
                <p className="text-gray-500">{latestResult.feedback}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center p-3 bg-gray-100/50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-800">{latestResult.accuracyScore}%</p>
                  <p className="text-xs text-gray-500">正確性</p>
                </div>
                <div className="text-center p-3 bg-gray-100/50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-800">{latestResult.fluencyScore}%</p>
                  <p className="text-xs text-gray-500">流暢さ</p>
                </div>
                <div className="text-center p-3 bg-gray-100/50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-800">{latestResult.pronunciationScore}%</p>
                  <p className="text-xs text-gray-500">発音</p>
                </div>
              </div>

              <h3 className="font-medium text-gray-800 mb-3">単語別スコア</h3>
              <div className="flex flex-wrap gap-2">
                {latestResult.wordScores.map((ws, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      ws.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                      ws.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {ws.word}: {ws.score}%
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-gray-500">録音して発音を評価してください</p>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {data.attempts.length > 0 && (
        <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">履歴</h2>
          <div className="space-y-2">
            {data.attempts.slice(0, 5).map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-100/50 rounded-lg">
                <span className="text-gray-500">
                  {new Date(attempt.createdAt).toLocaleDateString('ja-JP', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className={`font-medium px-2.5 py-1 rounded-full text-sm ${
                  attempt.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                  attempt.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {attempt.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
