import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import { VocabDeck, VocabProgress } from '@/models/VocabDeck';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const deck = await VocabDeck.findById(id);
    if (!deck) {
      return NextResponse.json({ error: 'デッキが見つかりません' }, { status: 404 });
    }

    const progress = await VocabProgress.find({
      userId: session.user.id,
      deckId: id,
    });

    const cardsWithProgress = deck.cards.map((card, index) => {
      const cardProgress = progress.find(p => p.cardIndex === index);
      return {
        index,
        word: card.word,
        meaning: card.meaning,
        pronunciation: card.pronunciation,
        example: card.example,
        audioUrl: card.audioUrl,
        status: cardProgress?.status || 'new',
        correctCount: cardProgress?.correctCount || 0,
        incorrectCount: cardProgress?.incorrectCount || 0,
      };
    });

    return NextResponse.json({
      deck: {
        id: deck._id,
        title: deck.title,
        description: deck.description,
        level: deck.level,
      },
      cards: cardsWithProgress,
    });
  } catch (error) {
    console.error('Vocab deck GET error:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const { cardIndex, correct } = await request.json();

    let progress = await VocabProgress.findOne({
      userId: session.user.id,
      deckId: id,
      cardIndex,
    });

    if (!progress) {
      progress = await VocabProgress.create({
        userId: session.user.id,
        deckId: id,
        cardIndex,
        status: 'learning',
        correctCount: correct ? 1 : 0,
        incorrectCount: correct ? 0 : 1,
        lastReviewedAt: new Date(),
      });
    } else {
      if (correct) {
        progress.correctCount += 1;
        if (progress.correctCount >= 3) {
          progress.status = 'mastered';
        }
      } else {
        progress.incorrectCount += 1;
        progress.status = 'learning';
      }
      progress.lastReviewedAt = new Date();
      await progress.save();
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Vocab progress POST error:', error);
    return NextResponse.json({ error: '進捗の保存に失敗しました' }, { status: 500 });
  }
}
