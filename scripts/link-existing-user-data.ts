import mongoose from 'mongoose';
import dbConnect from '../src/lib/mongodb';
import User from '../src/models/User';
import { VocabDeck, VocabProgress } from '../src/models/VocabDeck';
import { GrammarLesson, GrammarProgress } from '../src/models/Grammar';
import { AssignmentState, Assignment } from '../src/models/Assignment';
import CalendarEvent from '../src/models/CalendarEvent';
import Goal from '../src/models/Goal';

async function linkExistingUserData() {
  await dbConnect();
  console.log('Connected to database');

  // Find the existing Hikaru user
  const hikaruUser = await User.findOne({ name: /hikaru/i });

  if (!hikaruUser) {
    console.log('Hikaru user not found');
    await mongoose.disconnect();
    return;
  }

  console.log(`Found user: ${hikaruUser.name} (${hikaruUser._id})`);

  const userId = hikaruUser._id;
  const coachUser = await User.findOne({ role: 'coach' });
  const coachId = coachUser?._id;

  // Get existing vocab decks
  const vocabDecks = await VocabDeck.find({});
  console.log(`Found ${vocabDecks.length} vocab decks`);

  // Clear and recreate progress for this user
  await VocabProgress.deleteMany({ userId });

  if (vocabDecks.length > 0) {
    const progressData = [
      { userId, deckId: vocabDecks[0]._id, cardIndex: 0, status: 'mastered', correctCount: 3, incorrectCount: 0 },
      { userId, deckId: vocabDecks[0]._id, cardIndex: 1, status: 'learning', correctCount: 1, incorrectCount: 1 },
      { userId, deckId: vocabDecks[0]._id, cardIndex: 2, status: 'mastered', correctCount: 4, incorrectCount: 0 },
      { userId, deckId: vocabDecks[0]._id, cardIndex: 3, status: 'learning', correctCount: 2, incorrectCount: 1 },
      { userId, deckId: vocabDecks[0]._id, cardIndex: 4, status: 'new', correctCount: 0, incorrectCount: 0 },
    ];
    await VocabProgress.insertMany(progressData);
    console.log('Created vocab progress for user');
  }

  // Get existing grammar lessons and add progress
  const grammarLessons = await GrammarLesson.find({});
  console.log(`Found ${grammarLessons.length} grammar lessons`);

  await GrammarProgress.deleteMany({ userId });

  if (grammarLessons.length > 0) {
    await GrammarProgress.create({
      userId,
      lessonId: grammarLessons[0]._id,
      isCompleted: true,
      quizScore: 100,
      completedAt: new Date(),
    });
    console.log('Created grammar progress for user');
  }

  // Get existing assignments and create states
  const assignments = await Assignment.find({});
  console.log(`Found ${assignments.length} assignments`);

  await AssignmentState.deleteMany({ userId });

  if (assignments.length > 0) {
    const assignmentStates = assignments.map((assignment, index) => ({
      assignmentId: assignment._id,
      userId,
      status: index === 0 ? 'in_progress' : 'pending',
    }));
    await AssignmentState.insertMany(assignmentStates);
    console.log('Created assignment states for user');
  }

  // Update calendar events for this user
  await CalendarEvent.updateMany(
    { studentId: { $exists: true } },
    { $set: { studentId: userId } }
  );
  console.log('Updated calendar events for user');

  // Update goals for this user
  await Goal.updateMany({}, { $set: { userId } });
  console.log('Updated goals for user');

  console.log('\n=== Data linked to existing user! ===');
  console.log(`User: ${hikaruUser.name}`);
  console.log(`Email: ${hikaruUser.email}`);

  await mongoose.disconnect();
  console.log('Disconnected from database');
}

linkExistingUserData().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
