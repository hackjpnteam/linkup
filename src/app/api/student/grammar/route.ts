import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import { GrammarLesson, GrammarProgress } from '@/models/Grammar';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    await dbConnect();

    const lessons = await GrammarLesson.find({ isPublic: true }).sort({ order: 1 });

    const lessonsWithProgress = await Promise.all(
      lessons.map(async (lesson) => {
        const progress = await GrammarProgress.findOne({
          userId: session.user.id,
          lessonId: lesson._id,
        });

        return {
          id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          level: lesson.level,
          order: lesson.order,
          questionCount: lesson.questions.length,
          hasVideo: !!lesson.videoUrl,
          isCompleted: progress?.isCompleted || false,
          quizScore: progress?.quizScore,
        };
      })
    );

    return NextResponse.json({ lessons: lessonsWithProgress });
  } catch (error) {
    console.error('Grammar GET error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}
