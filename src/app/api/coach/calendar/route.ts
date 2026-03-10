import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import CalendarEvent from '@/models/CalendarEvent';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'coach' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: Record<string, unknown> = { coachId: session.user.id };

    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const events = await CalendarEvent.find(query)
      .populate('studentId', 'name email')
      .sort({ startTime: 1 });

    return NextResponse.json({
      events: events.map(e => ({
        id: e._id,
        title: e.title,
        description: e.description,
        type: e.type,
        startTime: e.startTime,
        endTime: e.endTime,
        status: e.status,
        student: e.studentId,
        changeRequest: e.changeRequest,
      })),
    });
  } catch (error) {
    console.error('Coach calendar GET error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'coach' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    await dbConnect();

    const { title, description, studentId, startTime, endTime } = await request.json();

    const event = await CalendarEvent.create({
      title,
      description,
      type: 'coaching',
      coachId: session.user.id,
      studentId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'scheduled',
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Coach calendar POST error:', error);
    return NextResponse.json({ error: 'イベントの作成に失敗しました' }, { status: 500 });
  }
}
