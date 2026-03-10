import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import { Assignment, AssignmentState } from '@/models/Assignment';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    await dbConnect();

    const assignmentStates = await AssignmentState.find({ userId: session.user.id })
      .populate('assignmentId')
      .sort({ createdAt: -1 });

    const assignments = assignmentStates.map(state => ({
      id: state._id,
      assignment: state.assignmentId,
      status: state.status,
      score: state.score,
      feedback: state.feedback,
      submittedAt: state.submittedAt,
    }));

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Assignments GET error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}
