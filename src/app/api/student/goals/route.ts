import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Goal from '@/models/Goal';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    await dbConnect();

    const goals = await Goal.find({ userId: session.user.id }).sort({ endDate: 1 });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Goals GET error:', error);
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

    const { type, title, description, targetHours, startDate, endDate } = await request.json();

    if (!type || !title || !targetHours || !startDate || !endDate) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }

    const goal = await Goal.create({
      userId: session.user.id,
      type,
      title,
      description,
      targetHours,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error('Goals POST error:', error);
    return NextResponse.json({ error: '目標の作成に失敗しました' }, { status: 500 });
  }
}
