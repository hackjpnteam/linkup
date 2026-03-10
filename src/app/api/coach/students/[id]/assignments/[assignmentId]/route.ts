import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { AssignmentState } from '@/models/Assignment';
import Notification from '@/models/Notification';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'coach' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    await dbConnect();
    const { id, assignmentId } = await params;

    // Verify student belongs to this coach
    const student = await User.findOne({
      _id: id,
      coachId: session.user.id,
      role: 'student',
    });

    if (!student) {
      return NextResponse.json({ error: '受講生が見つかりません' }, { status: 404 });
    }

    const assignmentState = await AssignmentState.findById(assignmentId)
      .populate('assignmentId');

    if (!assignmentState || assignmentState.userId.toString() !== id) {
      return NextResponse.json({ error: '課題が見つかりません' }, { status: 404 });
    }

    return NextResponse.json({
      assignmentState: {
        id: assignmentState._id,
        assignment: assignmentState.assignmentId,
        status: assignmentState.status,
        score: assignmentState.score,
        feedback: assignmentState.feedback,
        submittedAt: assignmentState.submittedAt,
        reviewedAt: assignmentState.reviewedAt,
      },
    });
  } catch (error) {
    console.error('Coach assignment GET error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'coach' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    await dbConnect();
    const { id, assignmentId } = await params;
    const { score, feedback } = await request.json();

    // Verify student belongs to this coach
    const student = await User.findOne({
      _id: id,
      coachId: session.user.id,
      role: 'student',
    });

    if (!student) {
      return NextResponse.json({ error: '受講生が見つかりません' }, { status: 404 });
    }

    const assignmentState = await AssignmentState.findOneAndUpdate(
      { _id: assignmentId, userId: id },
      {
        score,
        feedback,
        status: 'reviewed',
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
      { new: true }
    ).populate('assignmentId');

    if (!assignmentState) {
      return NextResponse.json({ error: '課題が見つかりません' }, { status: 404 });
    }

    // Notify student
    await Notification.create({
      userId: id,
      title: '課題がレビューされました',
      message: `課題「${(assignmentState.assignmentId as any).title}」のレビューが完了しました。`,
      type: 'feedback',
      link: '/student/assignments',
    });

    return NextResponse.json({ assignmentState });
  } catch (error) {
    console.error('Coach assignment PATCH error:', error);
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
  }
}
