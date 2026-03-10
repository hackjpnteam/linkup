import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import { VocabDeck, VocabProgress } from '@/models/VocabDeck';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    await dbConnect();

    const decks = await VocabDeck.find({ isPublic: true }).sort({ createdAt: -1 });

    // Get progress for each deck
    const decksWithProgress = await Promise.all(
      decks.map(async (deck) => {
        const progress = await VocabProgress.find({
          userId: session.user.id,
          deckId: deck._id,
        });

        const masteredCount = progress.filter(p => p.status === 'mastered').length;
        const learningCount = progress.filter(p => p.status === 'learning').length;

        return {
          id: deck._id,
          title: deck.title,
          description: deck.description,
          level: deck.level,
          cardCount: deck.cards.length,
          masteredCount,
          learningCount,
          progress: deck.cards.length > 0 ? Math.round((masteredCount / deck.cards.length) * 100) : 0,
        };
      })
    );

    return NextResponse.json({ decks: decksWithProgress });
  } catch (error) {
    console.error('Vocab GET error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}
