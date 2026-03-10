import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import { Assignment, AssignmentState } from '@/models/Assignment';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    await dbConnect();

    const assignments = await Assignment.find()
      .populate('createdBy', 'name')
      .populate('materials', 'title type')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      assignments: assignments.map(a => ({
        id: a._id,
        title: a.title,
        description: a.description,
        type: a.type,
        dueDate: a.dueDate,
        materials: a.materials,
        createdBy: a.createdBy,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    console.error('Admin assignments GET error:', error);
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

    const { title, description, type, dueDate, materials, assignTo } = await request.json();

    if (!title || !type || !dueDate) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }

    const assignment = await Assignment.create({
      title,
      description,
      type,
      dueDate: new Date(dueDate),
      materials: materials || [],
      createdBy: session.user.id,
    });

    // Create assignment states for specified students
    if (assignTo && assignTo.length > 0) {
      const assignmentStates = assignTo.map((userId: string) => ({
        assignmentId: assignment._id,
        userId,
        status: 'pending',
      }));
      await AssignmentState.insertMany(assignmentStates);
    } else if (assignTo === 'all') {
      // Assign to all students
      const students = await User.find({ role: 'student' }).select('_id');
      const assignmentStates = students.map(student => ({
        assignmentId: assignment._id,
        userId: student._id,
        status: 'pending',
      }));
      await AssignmentState.insertMany(assignmentStates);
    }

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    console.error('Admin assignments POST error:', error);
    return NextResponse.json({ error: '課題の作成に失敗しました' }, { status: 500 });
  }
}
