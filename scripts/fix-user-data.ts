import mongoose from 'mongoose';
import dbConnect from '../src/lib/mongodb';
import User from '../src/models/User';
import CalendarEvent from '../src/models/CalendarEvent';
import Goal from '../src/models/Goal';
import { VocabDeck, VocabProgress } from '../src/models/VocabDeck';
import { GrammarLesson, GrammarProgress } from '../src/models/Grammar';
import { Assignment, AssignmentState } from '../src/models/Assignment';

async function fixData() {
  await dbConnect();

  // Get all Hikaru users
  const hikaruUsers = await User.find({ name: /hikaru/i });
  console.log('Found Hikaru users:', hikaruUsers.map(u => ({ id: u._id.toString(), email: u.email, createdAt: u.createdAt })));

  // Get the most recently created one (likely the one being used)
  const latestHikaru = hikaruUsers.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  console.log('Using latest Hikaru:', latestHikaru._id.toString(), latestHikaru.email);

  const userId = latestHikaru._id;

  // Update all data to use this user ID
  await CalendarEvent.updateMany({}, { $set: { studentId: userId } });
  console.log('Updated calendar events');

  await Goal.updateMany({}, { $set: { userId: userId } });
  console.log('Updated goals');

  // Delete old progress and recreate for the correct user
  await VocabProgress.deleteMany({});
  await GrammarProgress.deleteMany({});
  await AssignmentState.deleteMany({});

  // Get vocab decks
  const vocabDecks = await VocabDeck.find({});
  console.log('Found', vocabDecks.length, 'vocab decks');

  if (vocabDecks.length > 0) {
    const progressData = [
      { userId, deckId: vocabDecks[0]._id, cardIndex: 0, status: 'mastered', correctCount: 3, incorrectCount: 0 },
      { userId, deckId: vocabDecks[0]._id, cardIndex: 1, status: 'learning', correctCount: 1, incorrectCount: 1 },
      { userId, deckId: vocabDecks[0]._id, cardIndex: 2, status: 'mastered', correctCount: 4, incorrectCount: 0 },
    ];
    await VocabProgress.insertMany(progressData);
    console.log('Created vocab progress');
  }

  // Get grammar lessons
  const grammarLessons = await GrammarLesson.find({});
  console.log('Found', grammarLessons.length, 'grammar lessons');

  if (grammarLessons.length > 0) {
    await GrammarProgress.create({
      userId,
      lessonId: grammarLessons[0]._id,
      isCompleted: true,
      quizScore: 100,
      completedAt: new Date(),
    });
    console.log('Created grammar progress');
  }

  // Get assignments
  const assignments = await Assignment.find({});
  console.log('Found', assignments.length, 'assignments');

  if (assignments.length > 0) {
    const assignmentStates = assignments.map((assignment, index) => ({
      assignmentId: assignment._id,
      userId,
      status: index === 0 ? 'in_progress' : 'pending',
    }));
    await AssignmentState.insertMany(assignmentStates);
    console.log('Created assignment states');
  }

  // Verify the data
  const events = await CalendarEvent.find({ studentId: userId });
  console.log('\nVerification:');
  console.log('- Calendar events for user:', events.length);

  const goals = await Goal.find({ userId });
  console.log('- Goals for user:', goals.length);

  const states = await AssignmentState.find({ userId });
  console.log('- Assignment states for user:', states.length);

  console.log('\nAll data fixed for user:', latestHikaru.email);

  await mongoose.disconnect();
}

fixData().catch(console.error);
