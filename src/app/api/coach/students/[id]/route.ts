import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import StudyLog from '@/models/StudyLog';
import Goal from '@/models/Goal';
import { AssignmentState } from '@/models/Assignment';

export async function GET(
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

    const student = await User.findOne({
      _id: id,
      coachId: session.user.id,
      role: 'student',
    }).select('name email createdAt');

    if (!student) {
      return NextResponse.json({ error: '受講生が見つかりません' }, { status: 404 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Get study logs for the past 30 days
    const studyLogs = await StudyLog.find({
      userId: id,
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: -1 });

    // Get goals
    const goals = await Goal.find({ userId: id }).sort({ endDate: 1 });

    // Get assignments
    const assignments = await AssignmentState.find({ userId: id })
      .populate('assignmentId')
      .sort({ createdAt: -1 });

    // Calculate daily study time
    const dailyStudy: Record<string, number> = {};
    studyLogs.forEach(log => {
      const dateKey = log.date.toISOString().split('T')[0];
      dailyStudy[dateKey] = (dailyStudy[dateKey] || 0) + log.duration;
    });

    return NextResponse.json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        createdAt: student.createdAt,
      },
      studyLogs: studyLogs.map(log => ({
        id: log._id,
        date: log.date,
        duration: log.duration,
        type: log.type,
      })),
      dailyStudy,
      goals: goals.map(g => ({
        id: g._id,
        type: g.type,
        title: g.title,
        targetHours: g.targetHours,
        startDate: g.startDate,
        endDate: g.endDate,
        isCompleted: g.isCompleted,
      })),
      assignments: assignments.map(a => ({
        id: a._id,
        assignment: a.assignmentId,
        status: a.status,
        score: a.score,
        feedback: a.feedback,
        submittedAt: a.submittedAt,
      })),
      totalStudyMinutes: studyLogs.reduce((sum, log) => sum + log.duration, 0),
    });
  } catch (error) {
    console.error('Coach student detail GET error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}
