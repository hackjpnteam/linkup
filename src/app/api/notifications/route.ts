import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    await dbConnect();

    const notifications = await Notification.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: session.user.id,
      isRead: false,
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    await dbConnect();

    const { notificationIds, markAll } = await request.json();

    if (markAll) {
      await Notification.updateMany(
        { userId: session.user.id, isRead: false },
        { isRead: true }
      );
    } else if (notificationIds && notificationIds.length > 0) {
      await Notification.updateMany(
        { _id: { $in: notificationIds }, userId: session.user.id },
        { isRead: true }
      );
    }

    return NextResponse.json({ message: '既読にしました' });
  } catch (error) {
    console.error('Notifications PATCH error:', error);
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
  }
}
