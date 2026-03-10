import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import StudyLog from '@/models/StudyLog';
import { AssignmentState } from '@/models/Assignment';
import CalendarEvent from '@/models/CalendarEvent';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'coach' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    await dbConnect();

    const coachId = session.user.id;

    // Get assigned students
    const students = await User.find({ coachId, role: 'student' }).select('name email');

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get students with their stats
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const weeklyLogs = await StudyLog.find({
          userId: student._id,
          date: { $gte: startOfWeek },
        });
        const weeklyMinutes = weeklyLogs.reduce((sum, log) => sum + log.duration, 0);

        const pendingAssignments = await AssignmentState.countDocuments({
          userId: student._id,
          status: { $in: ['pending', 'in_progress'] },
        });

        const completedAssignments = await AssignmentState.countDocuments({
          userId: student._id,
          status: 'completed',
        });

        return {
          id: student._id,
          name: student.name,
          email: student.email,
          weeklyStudyMinutes: weeklyMinutes,
          pendingAssignments,
          completedAssignments,
        };
      })
    );

    // Get upcoming sessions
    const upcomingSessions = await CalendarEvent.find({
      coachId,
      type: 'coaching',
      startTime: { $gte: now },
      status: { $in: ['scheduled', 'change_requested'] },
    })
      .populate('studentId', 'name')
      .sort({ startTime: 1 })
      .limit(10);

    // Get pending change requests
    const pendingRequests = await CalendarEvent.find({
      coachId,
      status: 'change_requested',
      'changeRequest.status': 'pending',
    }).populate('studentId', 'name');

    return NextResponse.json({
      students: studentsWithStats,
      upcomingSessions: upcomingSessions.map(s => ({
        id: s._id,
        title: s.title,
        startTime: s.startTime,
        endTime: s.endTime,
        student: s.studentId,
        status: s.status,
      })),
      pendingRequests: pendingRequests.map(r => ({
        id: r._id,
        title: r.title,
        student: r.studentId,
        currentTime: { start: r.startTime, end: r.endTime },
        requestedTime: r.changeRequest ? {
          start: r.changeRequest.newStartTime,
          end: r.changeRequest.newEndTime,
        } : null,
        reason: r.changeRequest?.reason,
      })),
      totalStudents: students.length,
    });
  } catch (error) {
    console.error('Coach dashboard error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}
