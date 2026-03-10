import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Material from '@/models/Material';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const level = searchParams.get('level');

    const query: Record<string, unknown> = {};
    if (type) query.type = type;
    if (level) query.level = level;

    const materials = await Material.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      materials: materials.map(m => ({
        id: m._id,
        title: m.title,
        description: m.description,
        type: m.type,
        level: m.level,
        tags: m.tags,
        isPublic: m.isPublic,
        createdBy: m.createdBy,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error('Admin materials GET error:', error);
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

    const { title, description, type, content, fileUrl, level, tags, isPublic } = await request.json();

    if (!title || !type || !content) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }

    const material = await Material.create({
      title,
      description,
      type,
      content,
      fileUrl,
      level: level || 'beginner',
      tags: tags || [],
      isPublic: isPublic !== false,
      createdBy: session.user.id,
    });

    return NextResponse.json({ material }, { status: 201 });
  } catch (error) {
    console.error('Admin materials POST error:', error);
    return NextResponse.json({ error: '教材の作成に失敗しました' }, { status: 500 });
  }
}
