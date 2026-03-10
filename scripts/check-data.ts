import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/linkup';

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check users
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\n=== Users ===');
    users.forEach(u => {
      console.log(`- ${u.email}: ${u._id} (role: ${u.role})`);
    });

    // Check calendar events
    const events = await mongoose.connection.db.collection('calendarevents').find({}).toArray();
    console.log('\n=== Calendar Events ===');
    events.forEach(e => {
      console.log(`- ${e.title}: studentId=${e.studentId}, coachId=${e.coachId}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

check();
