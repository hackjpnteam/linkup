import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import { PronunciationExercise, PronunciationAttempt } from '@/models/Pronunciation';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    await dbConnect();

    const exercises = await PronunciationExercise.find({ isPublic: true }).sort({ createdAt: -1 });

    const exercisesWithProgress = await Promise.all(
      exercises.map(async (exercise) => {
        const attempts = await PronunciationAttempt.find({
          userId: session.user.id,
          exerciseId: exercise._id,
        }).sort({ createdAt: -1 });

        const bestScore = attempts.length > 0
          ? Math.max(...attempts.map(a => a.score))
          : null;

        return {
          id: exercise._id,
          title: exercise.title,
          description: exercise.description,
          targetText: exercise.targetText,
          level: exercise.level,
          category: exercise.category,
          attemptCount: attempts.length,
          bestScore,
        };
      })
    );

    return NextResponse.json({ exercises: exercisesWithProgress });
  } catch (error) {
    console.error('Pronunciation GET error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}
