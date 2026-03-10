import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    await dbConnect();

    // Get unmatched students
    const unmatchedStudents = await User.find({
      role: 'student',
      coachId: null,
    }).select('name email createdAt');

    // Get coaches with student count
    const coaches = await User.find({ role: 'coach' }).select('name email');
    const coachesWithCount = await Promise.all(
      coaches.map(async (coach) => {
        const studentCount = await User.countDocuments({
          role: 'student',
          coachId: coach._id,
        });
        return {
          id: coach._id,
          name: coach.name,
          email: coach.email,
          studentCount,
        };
      })
    );

    return NextResponse.json({
      unmatchedStudents: unmatchedStudents.map(s => ({
        id: s._id,
        name: s.name,
        email: s.email,
        createdAt: s.createdAt,
      })),
      coaches: coachesWithCount,
    });
  } catch (error) {
    console.error('Admin matching GET error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    await dbConnect();

    const { studentId, coachId } = await request.json();

    if (!studentId || !coachId) {
      return NextResponse.json({ error: '受講生とコーチを指定してください' }, { status: 400 });
    }

    const student = await User.findById(studentId);
    const coach = await User.findById(coachId);

    if (!student || student.role !== 'student') {
      return NextResponse.json({ error: '受講生が見つかりません' }, { status: 404 });
    }
    if (!coach || coach.role !== 'coach') {
      return NextResponse.json({ error: 'コーチが見つかりません' }, { status: 404 });
    }

    student.coachId = coachId;
    await student.save();

    // Notify both student and coach
    await Notification.create({
      userId: studentId,
      title: 'コーチが割り当てられました',
      message: `${coach.name}さんがあなたのコーチとして割り当てられました。`,
      type: 'system',
      link: '/student/dashboard',
    });

    await Notification.create({
      userId: coachId,
      title: '新しい受講生が割り当てられました',
      message: `${student.name}さんがあなたの受講生として割り当てられました。`,
      type: 'system',
      link: '/coach/students',
    });

    return NextResponse.json({
      message: 'マッチングが完了しました',
      student: {
        id: student._id,
        name: student.name,
        coachId: student.coachId,
      },
    });
  } catch (error) {
    console.error('Admin matching POST error:', error);
    return NextResponse.json({ error: 'マッチングに失敗しました' }, { status: 500 });
  }
}
