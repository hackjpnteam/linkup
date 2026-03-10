import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import StudyLog from '@/models/StudyLog';
import { Assignment, AssignmentState } from '@/models/Assignment';
import { VocabDeck } from '@/models/VocabDeck';
import { GrammarLesson } from '@/models/Grammar';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    await dbConnect();

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // User stats
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCoaches = await User.countDocuments({ role: 'coach' });
    const newStudentsThisMonth = await User.countDocuments({
      role: 'student',
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Study stats
    const studyLogs = await StudyLog.find({
      date: { $gte: thirtyDaysAgo },
    });
    const totalStudyMinutes = studyLogs.reduce((sum, log) => sum + log.duration, 0);

    // Content stats
    const totalAssignments = await Assignment.countDocuments();
    const totalVocabDecks = await VocabDeck.countDocuments();
    const totalGrammarLessons = await GrammarLesson.countDocuments();

    // Assignment completion stats
    const completedAssignments = await AssignmentState.countDocuments({
      status: { $in: ['completed', 'reviewed'] },
    });
    const pendingAssignments = await AssignmentState.countDocuments({
      status: { $in: ['pending', 'in_progress'] },
    });

    // Students without coach
    const unmatchedStudents = await User.countDocuments({
      role: 'student',
      coachId: null,
    });

    return NextResponse.json({
      users: {
        totalStudents,
        totalCoaches,
        newStudentsThisMonth,
        unmatchedStudents,
      },
      study: {
        totalStudyMinutes,
        averageMinutesPerStudent: totalStudents > 0 ? Math.round(totalStudyMinutes / totalStudents) : 0,
      },
      content: {
        totalAssignments,
        totalVocabDecks,
        totalGrammarLessons,
      },
      assignments: {
        completed: completedAssignments,
        pending: pendingAssignments,
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}
