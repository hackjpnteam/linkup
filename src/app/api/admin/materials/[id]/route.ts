import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Material from '@/models/Material';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;

    const material = await Material.findById(id).populate('createdBy', 'name');

    if (!material) {
      return NextResponse.json({ error: '教材が見つかりません' }, { status: 404 });
    }

    return NextResponse.json({ material });
  } catch (error) {
    console.error('Admin material GET error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const updates = await request.json();

    const material = await Material.findByIdAndUpdate(id, updates, { new: true });

    if (!material) {
      return NextResponse.json({ error: '教材が見つかりません' }, { status: 404 });
    }

    return NextResponse.json({ material });
  } catch (error) {
    console.error('Admin material PATCH error:', error);
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;

    const material = await Material.findByIdAndDelete(id);

    if (!material) {
      return NextResponse.json({ error: '教材が見つかりません' }, { status: 404 });
    }

    return NextResponse.json({ message: '削除しました' });
  } catch (error) {
    console.error('Admin material DELETE error:', error);
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 });
  }
}
