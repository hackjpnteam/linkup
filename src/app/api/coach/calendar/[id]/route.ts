import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import CalendarEvent from '@/models/CalendarEvent';
import Notification from '@/models/Notification';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'coach' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const { action } = await request.json();

    const event = await CalendarEvent.findOne({
      _id: id,
      coachId: session.user.id,
    });

    if (!event) {
      return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 });
    }

    if (action === 'approve' && event.changeRequest) {
      event.startTime = event.changeRequest.newStartTime;
      event.endTime = event.changeRequest.newEndTime;
      event.changeRequest.status = 'approved';
      event.changeRequest.respondedAt = new Date();
      event.status = 'scheduled';

      // Notify student
      await Notification.create({
        userId: event.studentId,
        title: '日程変更が承認されました',
        message: `「${event.title}」の日程変更が承認されました。`,
        type: 'coaching',
        link: '/student/calendar',
      });
    } else if (action === 'reject' && event.changeRequest) {
      event.changeRequest.status = 'rejected';
      event.changeRequest.respondedAt = new Date();
      event.status = 'scheduled';

      // Notify student
      await Notification.create({
        userId: event.studentId,
        title: '日程変更が拒否されました',
        message: `「${event.title}」の日程変更リクエストが拒否されました。`,
        type: 'coaching',
        link: '/student/calendar',
      });
    } else if (action === 'cancel') {
      event.status = 'cancelled';

      // Notify student
      await Notification.create({
        userId: event.studentId,
        title: 'セッションがキャンセルされました',
        message: `「${event.title}」がキャンセルされました。`,
        type: 'coaching',
        link: '/student/calendar',
      });
    } else if (action === 'complete') {
      event.status = 'completed';
    }

    await event.save();

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Coach calendar PATCH error:', error);
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'coach' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;

    const event = await CalendarEvent.findOneAndDelete({
      _id: id,
      coachId: session.user.id,
    });

    if (!event) {
      return NextResponse.json({ error: 'イベントが見つかりません' }, { status: 404 });
    }

    return NextResponse.json({ message: '削除しました' });
  } catch (error) {
    console.error('Coach calendar DELETE error:', error);
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 });
  }
}
