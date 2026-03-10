import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

async function addCalendarEvents() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Find student user
    const student = await db.collection('users').findOne({ email: 'student@linkup.com' });
    const coach = await db.collection('users').findOne({ email: 'coach@linkup.com' });

    if (!student || !coach) {
      console.log('Users not found');
      return;
    }

    console.log('Student ID:', student._id.toString());
    console.log('Coach ID:', coach._id.toString());

    // Delete existing calendar events
    await db.collection('calendarevents').deleteMany({});

    // Create demo calendar events
    const now = new Date();
    const events = [
      {
        title: 'コーチングセッション',
        description: '週次の学習進捗確認',
        type: 'coaching',
        startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        coachId: coach._id,
        studentId: student._id,
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: '発音練習セッション',
        description: '発音の個別指導',
        type: 'coaching',
        startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        coachId: coach._id,
        studentId: student._id,
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: '文法レビュー',
        description: '文法問題の復習と解説',
        type: 'coaching',
        startTime: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        coachId: coach._id,
        studentId: student._id,
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = await db.collection('calendarevents').insertMany(events);
    console.log(`Created ${result.insertedCount} calendar events`);

    // Verify
    const savedEvents = await db.collection('calendarevents').find({}).toArray();
    console.log('\nSaved events:');
    savedEvents.forEach(e => {
      console.log(`- ${e.title}: studentId=${e.studentId}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

addCalendarEvents();
