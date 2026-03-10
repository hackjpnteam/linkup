import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import StudyLog from '@/models/StudyLog';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: Record<string, unknown> = { userId: session.user.id };

    if (startDate) {
      query.date = { ...query.date as object, $gte: new Date(startDate) };
    }
    if (endDate) {
      query.date = { ...query.date as object, $lte: new Date(endDate) };
    }

    const logs = await StudyLog.find(query).sort({ date: -1 });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('StudyLog GET error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    await dbConnect();

    const { date, duration, type, contentId } = await request.json();

    if (!date || !duration || !type) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }

    const log = await StudyLog.create({
      userId: session.user.id,
      date: new Date(date),
      duration,
      type,
      contentId,
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error('StudyLog POST error:', error);
    return NextResponse.json({ error: '記録の保存に失敗しました' }, { status: 500 });
  }
}
