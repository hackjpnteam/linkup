import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import StudyLog from '@/models/StudyLog';
import Goal from '@/models/Goal';
import { AssignmentState } from '@/models/Assignment';
import CalendarEvent from '@/models/CalendarEvent';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    await dbConnect();

    const userId = session.user.id;
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get weekly study time
    const weeklyLogs = await StudyLog.find({
      userId,
      date: { $gte: startOfWeek },
    });
    const weeklyStudyMinutes = weeklyLogs.reduce((sum, log) => sum + log.duration, 0);

    // Get monthly study time
    const monthlyLogs = await StudyLog.find({
      userId,
      date: { $gte: startOfMonth },
    });
    const monthlyStudyMinutes = monthlyLogs.reduce((sum, log) => sum + log.duration, 0);

    // Get current goals
    const goals = await Goal.find({
      userId,
      endDate: { $gte: now },
    }).sort({ type: 1 });

    // Get pending assignments
    const pendingAssignments = await AssignmentState.find({
      userId,
      status: { $in: ['pending', 'in_progress'] },
    }).populate('assignmentId').limit(5);

    // Get upcoming coaching sessions
    const upcomingSessions = await CalendarEvent.find({
      studentId: new mongoose.Types.ObjectId(userId),
      type: 'coaching',
      startTime: { $gte: now },
      status: 'scheduled',
    }).sort({ startTime: 1 }).limit(3);

    // Get study stats by type
    const studyByType = await StudyLog.aggregate([
      { $match: { userId: userId, date: { $gte: startOfMonth } } },
      { $group: { _id: '$type', totalMinutes: { $sum: '$duration' } } },
    ]);

    return NextResponse.json({
      weeklyStudyMinutes,
      monthlyStudyMinutes,
      goals,
      pendingAssignments: pendingAssignments.map(a => ({
        id: a._id,
        assignment: a.assignmentId,
        status: a.status,
      })),
      upcomingSessions: upcomingSessions.map(s => ({
        id: s._id,
        title: s.title,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
      studyByType: studyByType.reduce((acc, item) => {
        acc[item._id] = item.totalMinutes;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}
