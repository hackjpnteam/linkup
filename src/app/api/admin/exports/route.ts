import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import StudyLog from '@/models/StudyLog';
import { AssignmentState } from '@/models/Assignment';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'users';
    const format = searchParams.get('format') || 'json';

    let data: unknown[] = [];

    switch (type) {
      case 'users':
        data = await User.find().select('name email role coachId createdAt').lean();
        break;
      case 'studylogs':
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const logQuery: Record<string, unknown> = {};
        if (startDate) logQuery.date = { $gte: new Date(startDate) };
        if (endDate) logQuery.date = { ...logQuery.date as object, $lte: new Date(endDate) };
        data = await StudyLog.find(logQuery).populate('userId', 'name email').lean();
        break;
      case 'assignments':
        data = await AssignmentState.find()
          .populate('assignmentId', 'title type')
          .populate('userId', 'name email')
          .lean();
        break;
    }

    if (format === 'csv') {
      // Convert to CSV
      if (data.length === 0) {
        return NextResponse.json({ csv: '' });
      }
      const headers = Object.keys(data[0] as object).join(',');
      const rows = data.map((item: unknown) =>
        Object.values(item as object).map(v =>
          typeof v === 'object' ? JSON.stringify(v) : v
        ).join(',')
      );
      const csv = [headers, ...rows].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=${type}-export.csv`,
        },
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Admin exports GET error:', error);
    return NextResponse.json({ error: 'エクスポートに失敗しました' }, { status: 500 });
  }
}
