import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import { GrammarLesson, GrammarProgress } from '@/models/Grammar';

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

    const lesson = await GrammarLesson.findById(id);
    if (!lesson) {
      return NextResponse.json({ error: 'レッスンが見つかりません' }, { status: 404 });
    }

    const progress = await GrammarProgress.findOne({
      userId: session.user.id,
      lessonId: id,
    });

    return NextResponse.json({
      lesson: {
        id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        level: lesson.level,
        questions: lesson.questions.map((q, index) => ({
          index,
          question: q.question,
          options: q.options,
        })),
      },
      progress: progress ? {
        isCompleted: progress.isCompleted,
        quizScore: progress.quizScore,
        completedAt: progress.completedAt,
      } : null,
    });
  } catch (error) {
    console.error('Grammar lesson GET error:', error);
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
    const { answers } = await request.json();

    const lesson = await GrammarLesson.findById(id);
    if (!lesson) {
      return NextResponse.json({ error: 'レッスンが見つかりません' }, { status: 404 });
    }

    // Calculate score
    let correctCount = 0;
    const results = lesson.questions.map((q, index) => {
      const isCorrect = answers[index] === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        index,
        isCorrect,
        correctAnswer: q.correctIndex,
        explanation: q.explanation,
      };
    });

    const score = Math.round((correctCount / lesson.questions.length) * 100);

    // Update progress
    await GrammarProgress.findOneAndUpdate(
      { userId: session.user.id, lessonId: id },
      {
        isCompleted: true,
        quizScore: score,
        completedAt: new Date(),
      },
      { upsert: true }
    );

    return NextResponse.json({
      score,
      correctCount,
      totalCount: lesson.questions.length,
      results,
    });
  } catch (error) {
    console.error('Grammar quiz POST error:', error);
    return NextResponse.json({ error: 'クイズの採点に失敗しました' }, { status: 500 });
  }
}
