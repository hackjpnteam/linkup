import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'coach' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    await dbConnect();

    const students = await User.find({
      coachId: session.user.id,
      role: 'student',
    }).select('name email createdAt');

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Coach students GET error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}
