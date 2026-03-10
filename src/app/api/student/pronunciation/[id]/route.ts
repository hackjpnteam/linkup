import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import { PronunciationExercise, PronunciationAttempt } from '@/models/Pronunciation';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Calculate similarity between two strings (Levenshtein distance based)
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^\w\s]/g, '');
  const s2 = str2.toLowerCase().replace(/[^\w\s]/g, '');

  if (s1 === s2) return 100;
  if (s1.length === 0 || s2.length === 0) return 0;

  const matrix: number[][] = [];

  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const maxLen = Math.max(s1.length, s2.length);
  const distance = matrix[s1.length][s2.length];
  return Math.round((1 - distance / maxLen) * 100);
}

// Calculate word-level scores
function calculateWordScores(targetText: string, transcribedText: string): { word: string; score: number }[] {
  const targetWords = targetText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  const transcribedWords = transcribedText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);

  return targetWords.map((targetWord, index) => {
    const transcribedWord = transcribedWords[index] || '';
    const score = calculateSimilarity(targetWord, transcribedWord);
    return { word: targetWord, score };
  });
}

// Generate feedback based on scores
function generateFeedback(score: number, wordScores: { word: string; score: number }[]): string {
  const lowScoreWords = wordScores.filter(w => w.score < 70);

  if (score >= 90) {
    return '素晴らしい発音です！ネイティブに近い発音ができています。';
  } else if (score >= 80) {
    return '良い発音です！少し改善の余地があります。';
  } else if (score >= 70) {
    if (lowScoreWords.length > 0) {
      return `まずまずの発音です。「${lowScoreWords.map(w => w.word).join('」「')}」の発音を練習しましょう。`;
    }
    return 'まずまずの発音です。もう少し練習しましょう。';
  } else {
    return 'もう一度ゆっくり発音してみましょう。お手本を聞いて練習してください。';
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const exercise = await PronunciationExercise.findById(id);
    if (!exercise) {
      return NextResponse.json({ error: '練習が見つかりません' }, { status: 404 });
    }

    const attempts = await PronunciationAttempt.find({
      userId: session.user.id,
      exerciseId: id,
    }).sort({ createdAt: -1 }).limit(10);

    return NextResponse.json({
      exercise: {
        id: exercise._id,
        title: exercise.title,
        description: exercise.description,
        targetText: exercise.targetText,
        targetAudioUrl: exercise.targetAudioUrl,
        level: exercise.level,
        category: exercise.category,
      },
      attempts: attempts.map(a => ({
        id: a._id,
        score: a.score,
        accuracyScore: a.accuracyScore,
        fluencyScore: a.fluencyScore,
        pronunciationScore: a.pronunciationScore,
        feedback: a.feedback,
        wordScores: a.wordScores,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    console.error('Pronunciation exercise GET error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const exercise = await PronunciationExercise.findById(id);
    if (!exercise) {
      return NextResponse.json({ error: '練習が見つかりません' }, { status: 404 });
    }

    // Get audio file from form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: '音声ファイルが必要です' }, { status: 400 });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to demo mode
      const demoScore = 85;
      const words = exercise.targetText.split(' ');
      const wordScores = words.map((word: string, index: number) => ({
        word,
        score: 80 + (index % 3) * 5,
      }));

      const attempt = await PronunciationAttempt.create({
        userId: session.user.id,
        exerciseId: id,
        audioUrl: 'demo-mode',
        score: demoScore,
        accuracyScore: 88,
        fluencyScore: 82,
        pronunciationScore: 84,
        feedback: '【デモモード】OPENAI_API_KEYを.env.localに設定してください。',
        wordScores,
      });

      return NextResponse.json({ attempt }, { status: 201 });
    }

    // Convert audio to format OpenAI accepts
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const audioFileForOpenAI = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });

    // Use OpenAI Whisper for transcription
    const transcription = await openai.audio.transcriptions.create({
      file: audioFileForOpenAI,
      model: 'whisper-1',
      language: 'en',
    });

    const transcribedText = transcription.text;
    const targetText = exercise.targetText;

    // Calculate scores
    const overallScore = calculateSimilarity(targetText, transcribedText);
    const wordScores = calculateWordScores(targetText, transcribedText);

    // Calculate component scores
    const accuracyScore = overallScore;
    const avgWordScore = wordScores.reduce((sum, w) => sum + w.score, 0) / wordScores.length;
    const pronunciationScore = Math.round(avgWordScore);
    const fluencyScore = Math.round((overallScore + pronunciationScore) / 2);

    const feedback = generateFeedback(overallScore, wordScores);

    const attempt = await PronunciationAttempt.create({
      userId: session.user.id,
      exerciseId: id,
      audioUrl: 'whisper-transcription',
      score: overallScore,
      accuracyScore,
      fluencyScore,
      pronunciationScore,
      feedback: `${feedback}\n\n認識されたテキスト: "${transcribedText}"`,
      wordScores,
    });

    return NextResponse.json({
      attempt: {
        id: attempt._id,
        score: attempt.score,
        accuracyScore: attempt.accuracyScore,
        fluencyScore: attempt.fluencyScore,
        pronunciationScore: attempt.pronunciationScore,
        feedback: attempt.feedback,
        wordScores: attempt.wordScores,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Pronunciation attempt POST error:', error);
    return NextResponse.json({ error: '評価に失敗しました' }, { status: 500 });
  }
}
