import mongoose from 'mongoose';
import dbConnect from '../src/lib/mongodb';
import User from '../src/models/User';
import { VocabDeck, VocabProgress } from '../src/models/VocabDeck';
import { GrammarLesson, GrammarProgress } from '../src/models/Grammar';
import { PronunciationExercise } from '../src/models/Pronunciation';
import { Assignment, AssignmentState } from '../src/models/Assignment';
import CalendarEvent from '../src/models/CalendarEvent';
import Goal from '../src/models/Goal';

async function seedDemoData() {
  await dbConnect();
  console.log('Connected to database');

  // Find the existing student user or create admin for createdBy
  let studentUser = await User.findOne({ role: 'student' });
  let adminUser = await User.findOne({ role: 'admin' });
  let coachUser = await User.findOne({ role: 'coach' });

  if (!adminUser) {
    // Create admin user if doesn't exist
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    adminUser = await User.create({
      email: 'admin@linkup.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    });
    console.log('Created admin user');
  }

  if (!coachUser) {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('coach123', 10);
    coachUser = await User.create({
      email: 'coach@linkup.com',
      password: hashedPassword,
      name: 'Coach Tanaka',
      role: 'coach',
    });
    console.log('Created coach user');
  }

  if (!studentUser) {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('student123', 10);
    studentUser = await User.create({
      email: 'student@linkup.com',
      password: hashedPassword,
      name: 'Student User',
      role: 'student',
      coachId: coachUser._id,
    });
    console.log('Created student user');
  }

  const creatorId = adminUser._id;
  const studentId = studentUser._id;
  const coachId = coachUser._id;

  // ======================
  // 1. Seed Vocab Decks
  // ======================
  console.log('Seeding vocab decks...');

  // Clear existing vocab data
  await VocabDeck.deleteMany({});
  await VocabProgress.deleteMany({});

  const vocabDecks = [
    {
      title: 'ビジネス英語 基礎',
      description: 'ビジネスシーンで使う基本的な英単語',
      level: 'beginner',
      createdBy: creatorId,
      isPublic: true,
      cards: [
        { word: 'meeting', meaning: '会議', pronunciation: '/ˈmiːtɪŋ/', example: 'We have a meeting at 3 PM.' },
        { word: 'deadline', meaning: '締め切り', pronunciation: '/ˈdedlaɪn/', example: 'The deadline is next Friday.' },
        { word: 'schedule', meaning: '予定、スケジュール', pronunciation: '/ˈskedʒuːl/', example: 'Let me check my schedule.' },
        { word: 'proposal', meaning: '提案', pronunciation: '/prəˈpoʊzl/', example: 'I will send you the proposal.' },
        { word: 'budget', meaning: '予算', pronunciation: '/ˈbʌdʒɪt/', example: 'The project is over budget.' },
        { word: 'negotiate', meaning: '交渉する', pronunciation: '/nɪˈɡoʊʃieɪt/', example: 'We need to negotiate the terms.' },
        { word: 'colleague', meaning: '同僚', pronunciation: '/ˈkɒliːɡ/', example: 'My colleague helped me with the report.' },
        { word: 'presentation', meaning: 'プレゼンテーション', pronunciation: '/ˌpreznˈteɪʃn/', example: 'I have a presentation tomorrow.' },
        { word: 'contract', meaning: '契約', pronunciation: '/ˈkɒntrækt/', example: 'Please sign the contract.' },
        { word: 'invoice', meaning: '請求書', pronunciation: '/ˈɪnvɔɪs/', example: 'I will send the invoice today.' },
      ],
    },
    {
      title: 'TOEIC頻出単語 500-600点レベル',
      description: 'TOEIC 500-600点を目指すための必須単語',
      level: 'intermediate',
      createdBy: creatorId,
      isPublic: true,
      cards: [
        { word: 'accommodate', meaning: '収容する、対応する', pronunciation: '/əˈkɒmədeɪt/', example: 'The hotel can accommodate 200 guests.' },
        { word: 'approximately', meaning: 'およそ、約', pronunciation: '/əˈprɒksɪmətli/', example: 'It takes approximately 30 minutes.' },
        { word: 'complimentary', meaning: '無料の、お世辞の', pronunciation: '/ˌkɒmplɪˈmentri/', example: 'We offer complimentary breakfast.' },
        { word: 'inquire', meaning: '問い合わせる', pronunciation: '/ɪnˈkwaɪər/', example: 'Please inquire at the front desk.' },
        { word: 'reimburse', meaning: '払い戻す', pronunciation: '/ˌriːɪmˈbɜːrs/', example: 'We will reimburse your expenses.' },
        { word: 'expedite', meaning: '促進する', pronunciation: '/ˈekspədaɪt/', example: 'We need to expedite the process.' },
        { word: 'prerequisite', meaning: '必要条件', pronunciation: '/priːˈrekwəzɪt/', example: 'Experience is a prerequisite for this job.' },
        { word: 'subsequent', meaning: 'その後の', pronunciation: '/ˈsʌbsɪkwənt/', example: 'Subsequent meetings will be online.' },
      ],
    },
    {
      title: '日常会話 基本フレーズ',
      description: '日常で使える基本的な英語フレーズ',
      level: 'beginner',
      createdBy: creatorId,
      isPublic: true,
      cards: [
        { word: 'How are you?', meaning: '調子はどうですか？', pronunciation: '/haʊ ɑːr juː/', example: 'Hi! How are you today?' },
        { word: 'Nice to meet you', meaning: 'はじめまして', pronunciation: '/naɪs tə miːt juː/', example: 'Nice to meet you, I\'m John.' },
        { word: 'Thank you very much', meaning: 'どうもありがとうございます', pronunciation: '/θæŋk juː ˈveri mʌtʃ/', example: 'Thank you very much for your help.' },
        { word: 'Excuse me', meaning: 'すみません', pronunciation: '/ɪkˈskjuːz miː/', example: 'Excuse me, where is the station?' },
        { word: 'I\'m sorry', meaning: 'ごめんなさい', pronunciation: '/aɪm ˈsɒri/', example: 'I\'m sorry for being late.' },
        { word: 'Could you help me?', meaning: '手伝っていただけますか？', pronunciation: '/kʊd juː help miː/', example: 'Could you help me carry this?' },
      ],
    },
  ];

  const createdDecks = await VocabDeck.insertMany(vocabDecks);
  console.log(`Created ${createdDecks.length} vocab decks`);

  // Add some progress for the student
  const progressData = [
    { userId: studentId, deckId: createdDecks[0]._id, cardIndex: 0, status: 'mastered', correctCount: 3, incorrectCount: 0 },
    { userId: studentId, deckId: createdDecks[0]._id, cardIndex: 1, status: 'learning', correctCount: 1, incorrectCount: 1 },
    { userId: studentId, deckId: createdDecks[0]._id, cardIndex: 2, status: 'learning', correctCount: 2, incorrectCount: 1 },
    { userId: studentId, deckId: createdDecks[0]._id, cardIndex: 3, status: 'new', correctCount: 0, incorrectCount: 0 },
  ];
  await VocabProgress.insertMany(progressData);
  console.log('Created vocab progress');

  // ======================
  // 2. Seed Grammar Lessons
  // ======================
  console.log('Seeding grammar lessons...');

  await GrammarLesson.deleteMany({});
  await GrammarProgress.deleteMany({});

  const grammarLessons = [
    {
      title: '現在形と現在進行形',
      description: '現在形と現在進行形の違いを学びましょう',
      content: `# 現在形と現在進行形

## 現在形 (Simple Present)
習慣や一般的な事実を表すときに使います。

**例:**
- I **work** at a bank. (私は銀行で働いています)
- She **goes** to school every day. (彼女は毎日学校に行きます)

## 現在進行形 (Present Continuous)
今まさに起きていることを表すときに使います。

**例:**
- I **am working** now. (私は今働いています)
- She **is studying** English. (彼女は英語を勉強しています)

## 使い分けのポイント
- 習慣 → 現在形
- 今この瞬間 → 現在進行形`,
      level: 'beginner',
      order: 1,
      createdBy: creatorId,
      isPublic: true,
      questions: [
        {
          question: 'She ___ to school every day.',
          options: ['goes', 'is going', 'go', 'going'],
          correctIndex: 0,
          explanation: '習慣を表すので現在形 "goes" が正解です。',
        },
        {
          question: 'I ___ English right now.',
          options: ['study', 'am studying', 'studies', 'studying'],
          correctIndex: 1,
          explanation: '"right now" があるので現在進行形 "am studying" が正解です。',
        },
        {
          question: 'They ___ coffee every morning.',
          options: ['are drinking', 'drink', 'drinks', 'is drinking'],
          correctIndex: 1,
          explanation: '"every morning" は習慣を表すので現在形 "drink" が正解です。',
        },
      ],
    },
    {
      title: '過去形と過去進行形',
      description: '過去形と過去進行形の使い方を学びましょう',
      content: `# 過去形と過去進行形

## 過去形 (Simple Past)
過去に完了した行動を表します。

**例:**
- I **worked** yesterday. (私は昨日働きました)
- She **visited** Tokyo last week. (彼女は先週東京を訪れました)

## 過去進行形 (Past Continuous)
過去のある時点で進行中だった行動を表します。

**例:**
- I **was working** at 3 PM. (私は3時に働いていました)
- They **were watching** TV when I called. (私が電話したとき、彼らはテレビを見ていました)`,
      level: 'beginner',
      order: 2,
      createdBy: creatorId,
      isPublic: true,
      questions: [
        {
          question: 'I ___ when the phone rang.',
          options: ['sleep', 'was sleeping', 'slept', 'sleeping'],
          correctIndex: 1,
          explanation: '電話が鳴ったとき進行中だった行動なので過去進行形 "was sleeping" が正解です。',
        },
        {
          question: 'She ___ the book last night.',
          options: ['reads', 'was reading', 'read', 'is reading'],
          correctIndex: 2,
          explanation: '"last night" という過去の完了した時点を表すので過去形 "read" が正解です。',
        },
      ],
    },
    {
      title: '現在完了形',
      description: '現在完了形の使い方をマスターしましょう',
      content: `# 現在完了形 (Present Perfect)

## 基本形
have/has + 過去分詞

## 使い方
1. **経験**: Have you ever been to Japan?
2. **完了**: I have finished my homework.
3. **継続**: I have lived here for 5 years.

## 例文
- I **have visited** Paris twice. (私はパリを2回訪れたことがあります)
- She **has just arrived**. (彼女はちょうど到着しました)
- We **have known** each other since 2010. (私たちは2010年から知り合いです)`,
      level: 'intermediate',
      order: 3,
      createdBy: creatorId,
      isPublic: true,
      questions: [
        {
          question: 'I ___ never ___ sushi.',
          options: ['have/eat', 'have/eaten', 'has/eaten', 'had/eat'],
          correctIndex: 1,
          explanation: '経験を表す現在完了形で "have eaten" が正解です。',
        },
        {
          question: 'She ___ here for 3 years.',
          options: ['lives', 'has lived', 'lived', 'is living'],
          correctIndex: 1,
          explanation: '継続を表す現在完了形で "has lived" が正解です。',
        },
      ],
    },
  ];

  const createdLessons = await GrammarLesson.insertMany(grammarLessons);
  console.log(`Created ${createdLessons.length} grammar lessons`);

  // Add progress for student
  await GrammarProgress.create({
    userId: studentId,
    lessonId: createdLessons[0]._id,
    isCompleted: true,
    quizScore: 100,
    completedAt: new Date(),
  });
  console.log('Created grammar progress');

  // ======================
  // 3. Seed Pronunciation Exercises
  // ======================
  console.log('Seeding pronunciation exercises...');

  await PronunciationExercise.deleteMany({});

  const pronunciationExercises = [
    {
      title: '自己紹介',
      description: '自己紹介の基本フレーズを練習しましょう',
      targetText: 'Hello, my name is John. Nice to meet you.',
      level: 'beginner',
      category: '日常会話',
      createdBy: creatorId,
      isPublic: true,
    },
    {
      title: '電話対応',
      description: 'ビジネス電話の基本フレーズ',
      targetText: 'Thank you for calling. How may I help you today?',
      level: 'intermediate',
      category: 'ビジネス',
      createdBy: creatorId,
      isPublic: true,
    },
    {
      title: 'プレゼンテーション冒頭',
      description: 'プレゼンの開始フレーズを練習',
      targetText: 'Good morning everyone. Today I would like to talk about our new project.',
      level: 'intermediate',
      category: 'ビジネス',
      createdBy: creatorId,
      isPublic: true,
    },
    {
      title: '道案内',
      description: '道を聞かれたときの返答',
      targetText: 'Go straight and turn right at the second corner. The station is on your left.',
      level: 'beginner',
      category: '日常会話',
      createdBy: creatorId,
      isPublic: true,
    },
    {
      title: 'レストランでの注文',
      description: 'レストランでの基本フレーズ',
      targetText: 'I would like to order the steak, please. Medium rare.',
      level: 'beginner',
      category: '日常会話',
      createdBy: creatorId,
      isPublic: true,
    },
  ];

  const createdExercises = await PronunciationExercise.insertMany(pronunciationExercises);
  console.log(`Created ${createdExercises.length} pronunciation exercises`);

  // ======================
  // 4. Seed Assignments
  // ======================
  console.log('Seeding assignments...');

  await Assignment.deleteMany({});
  await AssignmentState.deleteMany({});

  const now = new Date();
  const assignments = [
    {
      title: '今週の単語学習',
      description: 'ビジネス英語基礎の単語10個を覚えましょう',
      type: 'vocab',
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week later
      materials: [],
      createdBy: coachId,
    },
    {
      title: '文法テスト: 現在形',
      description: '現在形と現在進行形のクイズに挑戦',
      type: 'grammar',
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days later
      materials: [],
      createdBy: coachId,
    },
    {
      title: '発音練習: 自己紹介',
      description: '自己紹介のフレーズを録音して提出',
      type: 'pronunciation',
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days later
      materials: [],
      createdBy: coachId,
    },
  ];

  const createdAssignments = await Assignment.insertMany(assignments);
  console.log(`Created ${createdAssignments.length} assignments`);

  // Create assignment states for student
  const assignmentStates = [
    {
      assignmentId: createdAssignments[0]._id,
      userId: studentId,
      status: 'in_progress',
    },
    {
      assignmentId: createdAssignments[1]._id,
      userId: studentId,
      status: 'pending',
    },
    {
      assignmentId: createdAssignments[2]._id,
      userId: studentId,
      status: 'pending',
    },
  ];
  await AssignmentState.insertMany(assignmentStates);
  console.log('Created assignment states');

  // ======================
  // 5. Seed Calendar Events
  // ======================
  console.log('Seeding calendar events...');

  await CalendarEvent.deleteMany({});

  const calendarEvents = [
    {
      title: 'コーチングセッション',
      description: '週次コーチングミーティング',
      type: 'coaching',
      startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // 2 days later at 10:00
      endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), // 2 days later at 11:00
      coachId: coachId,
      studentId: studentId,
      status: 'scheduled',
    },
    {
      title: '単語テスト',
      description: 'ビジネス英語基礎テスト',
      type: 'study',
      startTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // 4 days later at 14:00
      endTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), // 4 days later at 15:00
      studentId: studentId,
      status: 'scheduled',
    },
    {
      title: '文法レッスン',
      description: '現在完了形の学習',
      type: 'study',
      startTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000), // Tomorrow at 19:00
      endTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000), // Tomorrow at 20:00
      studentId: studentId,
      status: 'scheduled',
    },
    {
      title: '次回コーチングセッション',
      description: '月次振り返りミーティング',
      type: 'coaching',
      startTime: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // 9 days later at 10:00
      endTime: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), // 9 days later at 11:00
      coachId: coachId,
      studentId: studentId,
      status: 'scheduled',
    },
  ];

  const createdEvents = await CalendarEvent.insertMany(calendarEvents);
  console.log(`Created ${createdEvents.length} calendar events`);

  // ======================
  // 6. Seed Goals
  // ======================
  console.log('Seeding goals...');

  await Goal.deleteMany({});

  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const goals = [
    {
      userId: studentId,
      type: 'weekly',
      title: '今週の学習目標',
      description: '毎日30分以上学習する',
      targetHours: 5,
      startDate: weekStart,
      endDate: weekEnd,
      isCompleted: false,
    },
    {
      userId: studentId,
      type: 'monthly',
      title: '今月の目標',
      description: 'TOEIC 500点レベルの単語を100個覚える',
      targetHours: 20,
      startDate: monthStart,
      endDate: monthEnd,
      isCompleted: false,
    },
    {
      userId: studentId,
      type: 'final',
      title: '最終目標',
      description: 'TOEIC 700点達成',
      targetHours: 200,
      startDate: new Date(),
      endDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000), // 6 months
      isCompleted: false,
    },
  ];

  const createdGoals = await Goal.insertMany(goals);
  console.log(`Created ${createdGoals.length} goals`);

  console.log('\n=== Demo data seeding complete! ===');
  console.log('You can now log in with:');
  console.log('- Student: student@linkup.com / student123');
  console.log('- Coach: coach@linkup.com / coach123');
  console.log('- Admin: admin@linkup.com / admin123');

  await mongoose.disconnect();
  console.log('Disconnected from database');
}

seedDemoData().catch((error) => {
  console.error('Error seeding data:', error);
  process.exit(1);
});
