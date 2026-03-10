import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import CalendarEvent from '@/models/CalendarEvent';

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

    const query: Record<string, unknown> = { studentId: new mongoose.Types.ObjectId(session.user.id) };

    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const events = await CalendarEvent.find(query)
      .populate('coachId', 'name email')
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
        coach: e.coachId,
        changeRequest: e.changeRequest,
      })),
    });
  } catch (error) {
    console.error('Calendar GET error:', error);
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

    const { eventId, newStartTime, newEndTime, reason } = await request.json();

    const event = await CalendarEvent.findOne({
      _id: eventId,
      studentId: new mongoose.Types.ObjectId(session.user.id),
    });

    if (!event) {
      return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 });
    }

    event.status = 'change_requested';
    event.changeRequest = {
      requestedBy: new mongoose.Types.ObjectId(session.user.id),
      newStartTime: new Date(newStartTime),
      newEndTime: new Date(newEndTime),
      reason,
      status: 'pending',
      requestedAt: new Date(),
    };

    await event.save();

    return NextResponse.json({
      message: '変更リクエストを送信しました',
      event,
    });
  } catch (error) {
    console.error('Calendar change request POST error:', error);
    return NextResponse.json({ error: '変更リクエストの送信に失敗しました' }, { status: 500 });
  }
}
