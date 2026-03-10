import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/linkup';

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['student', 'coach', 'admin'], default: 'student' },
  coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// VocabDeck Schema
const VocabCardSchema = new mongoose.Schema({
  word: { type: String, required: true },
  meaning: { type: String, required: true },
  pronunciation: { type: String },
  example: { type: String },
});

const VocabDeckSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  cards: [VocabCardSchema],
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// GrammarLesson Schema
const GrammarQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  explanation: { type: String, required: true },
});

const GrammarLessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  content: { type: String, required: true },
  videoUrl: { type: String },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  order: { type: Number, default: 0 },
  questions: [GrammarQuestionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// CalendarEvent Schema
const CalendarEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['coaching', 'study', 'assignment', 'other'], required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'change_requested'], default: 'scheduled' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// PronunciationExercise Schema
const PronunciationExerciseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  targetText: { type: String, required: true },
  targetAudioUrl: { type: String },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  category: { type: String, default: 'general' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const VocabDeck = mongoose.models.VocabDeck || mongoose.model('VocabDeck', VocabDeckSchema);
    const GrammarLesson = mongoose.models.GrammarLesson || mongoose.model('GrammarLesson', GrammarLessonSchema);
    const PronunciationExercise = mongoose.models.PronunciationExercise || mongoose.model('PronunciationExercise', PronunciationExerciseSchema);
    const CalendarEvent = mongoose.models.CalendarEvent || mongoose.model('CalendarEvent', CalendarEventSchema);

    // Create demo users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create admin
    let admin = await User.findOne({ email: 'admin@linkup.com' });
    if (!admin) {
      admin = await User.create({
        email: 'admin@linkup.com',
        password: hashedPassword,
        name: '管理者',
        role: 'admin',
      });
      console.log('Created admin user');
    }

    // Create coach
    let coach = await User.findOne({ email: 'coach@linkup.com' });
    if (!coach) {
      coach = await User.create({
        email: 'coach@linkup.com',
        password: hashedPassword,
        name: '山田コーチ',
        role: 'coach',
      });
      console.log('Created coach user');
    }

    // Create student
    let student = await User.findOne({ email: 'student@linkup.com' });
    if (!student) {
      student = await User.create({
        email: 'student@linkup.com',
        password: hashedPassword,
        name: '田中太郎',
        role: 'student',
        coachId: coach._id,
      });
      console.log('Created student user');
    }

    // Create demo vocab decks
    const vocabDecks = [
      {
        title: '基本英単語100',
        description: '日常会話でよく使われる基本的な英単語集',
        level: 'beginner',
        isPublic: true,
        createdBy: admin._id,
        cards: [
          { word: 'apple', meaning: 'りんご', pronunciation: 'ˈæpəl', example: 'I eat an apple every day.' },
          { word: 'book', meaning: '本', pronunciation: 'bʊk', example: 'This book is interesting.' },
          { word: 'cat', meaning: '猫', pronunciation: 'kæt', example: 'The cat is sleeping.' },
          { word: 'dog', meaning: '犬', pronunciation: 'dɔːɡ', example: 'My dog is very friendly.' },
          { word: 'elephant', meaning: '象', pronunciation: 'ˈeləfənt', example: 'Elephants are the largest land animals.' },
          { word: 'flower', meaning: '花', pronunciation: 'ˈflaʊər', example: 'The flowers are blooming.' },
          { word: 'garden', meaning: '庭', pronunciation: 'ˈɡɑːrdən', example: 'She works in the garden.' },
          { word: 'house', meaning: '家', pronunciation: 'haʊs', example: 'This is my house.' },
          { word: 'ice', meaning: '氷', pronunciation: 'aɪs', example: 'The ice is melting.' },
          { word: 'juice', meaning: 'ジュース', pronunciation: 'dʒuːs', example: 'I drink orange juice.' },
        ],
      },
      {
        title: 'ビジネス英語',
        description: 'ビジネスシーンで使用する重要な英単語',
        level: 'intermediate',
        isPublic: true,
        createdBy: admin._id,
        cards: [
          { word: 'meeting', meaning: '会議', pronunciation: 'ˈmiːtɪŋ', example: 'We have a meeting at 3 PM.' },
          { word: 'deadline', meaning: '締め切り', pronunciation: 'ˈdedlaɪn', example: 'The deadline is next Friday.' },
          { word: 'proposal', meaning: '提案', pronunciation: 'prəˈpoʊzəl', example: 'Please review my proposal.' },
          { word: 'revenue', meaning: '収益', pronunciation: 'ˈrevənuː', example: 'Our revenue increased by 20%.' },
          { word: 'strategy', meaning: '戦略', pronunciation: 'ˈstrætədʒi', example: 'We need a new marketing strategy.' },
          { word: 'budget', meaning: '予算', pronunciation: 'ˈbʌdʒɪt', example: 'We are over budget.' },
          { word: 'negotiate', meaning: '交渉する', pronunciation: 'nɪˈɡoʊʃieɪt', example: 'Let me negotiate the price.' },
          { word: 'collaborate', meaning: '協力する', pronunciation: 'kəˈlæbəreɪt', example: 'We collaborate with other teams.' },
        ],
      },
      {
        title: 'TOEIC頻出単語',
        description: 'TOEIC試験でよく出題される単語集',
        level: 'advanced',
        isPublic: true,
        createdBy: admin._id,
        cards: [
          { word: 'accommodate', meaning: '収容する、適応させる', pronunciation: 'əˈkɑːmədeɪt', example: 'The hotel can accommodate 500 guests.' },
          { word: 'subsequent', meaning: 'その後の', pronunciation: 'ˈsʌbsɪkwənt', example: 'Subsequent events proved him right.' },
          { word: 'comprehensive', meaning: '包括的な', pronunciation: 'ˌkɑːmprɪˈhensɪv', example: 'We need a comprehensive review.' },
          { word: 'prerequisite', meaning: '前提条件', pronunciation: 'priːˈrekwəzɪt', example: 'Experience is a prerequisite for this job.' },
          { word: 'deteriorate', meaning: '悪化する', pronunciation: 'dɪˈtɪriəreɪt', example: 'The situation continues to deteriorate.' },
          { word: 'meticulous', meaning: '細心の', pronunciation: 'məˈtɪkjələs', example: 'She is meticulous about her work.' },
        ],
      },
    ];

    // Delete existing vocab decks and create new ones
    await VocabDeck.deleteMany({});
    await VocabDeck.insertMany(vocabDecks);
    console.log('Created vocab decks');

    // Create demo grammar lessons
    const grammarLessons = [
      {
        title: '現在形の使い方',
        description: '英語の現在形について学びましょう',
        content: `<h1>現在形 (Present Tense)</h1>
<p>現在形は、習慣的な動作や一般的な事実を表すときに使います。</p>

<h2>基本ルール</h2>
<ul>
  <li><strong>I / You / We / They</strong> + 動詞の原形</li>
  <li><strong>He / She / It</strong> + 動詞 + s/es</li>
</ul>

<h2>例文</h2>
<ul>
  <li>I <strong>work</strong> every day. (私は毎日働きます)</li>
  <li>She <strong>works</strong> at a hospital. (彼女は病院で働いています)</li>
  <li>Water <strong>boils</strong> at 100°C. (水は100度で沸騰します)</li>
</ul>

<h2>注意点</h2>
<p>三人称単数（he, she, it）の場合、動詞の語尾に<strong>-s</strong>または<strong>-es</strong>をつけます。</p>
<ul>
  <li>work → works</li>
  <li>go → goes</li>
  <li>study → studies</li>
</ul>`,
        level: 'beginner',
        order: 1,
        createdBy: admin._id,
        isPublic: true,
        questions: [
          {
            question: 'She ___ to school every day.',
            options: ['go', 'goes', 'going', 'went'],
            correctIndex: 1,
            explanation: '三人称単数の主語(She)には動詞にsをつけます。正解は「goes」です。',
          },
          {
            question: 'They ___ English very well.',
            options: ['speaks', 'speaking', 'speak', 'spoke'],
            correctIndex: 2,
            explanation: '複数形の主語(They)には動詞の原形を使います。正解は「speak」です。',
          },
          {
            question: 'The sun ___ in the east.',
            options: ['rise', 'rises', 'rising', 'rose'],
            correctIndex: 1,
            explanation: 'The sunは三人称単数なので「rises」が正解です。また、一般的な事実を述べる文なので現在形を使います。',
          },
        ],
      },
      {
        title: '過去形の使い方',
        description: '英語の過去形について学びましょう',
        content: `<h1>過去形 (Past Tense)</h1>
<p>過去形は、過去に起こった出来事や完了した動作を表すときに使います。</p>

<h2>規則動詞</h2>
<p>動詞の原形 + <strong>-ed</strong></p>
<ul>
  <li>work → worked</li>
  <li>play → played</li>
  <li>study → studied</li>
</ul>

<h2>不規則動詞</h2>
<p>不規則動詞は形が大きく変わります。覚えましょう！</p>
<ul>
  <li>go → went</li>
  <li>eat → ate</li>
  <li>have → had</li>
  <li>see → saw</li>
  <li>take → took</li>
</ul>

<h2>過去を表す語句</h2>
<ul>
  <li>yesterday（昨日）</li>
  <li>last week / month / year（先週/先月/去年）</li>
  <li>ago（〜前）</li>
</ul>`,
        level: 'beginner',
        order: 2,
        createdBy: admin._id,
        isPublic: true,
        questions: [
          {
            question: 'I ___ to Tokyo last week.',
            options: ['go', 'goes', 'went', 'going'],
            correctIndex: 2,
            explanation: 'last weekは過去を表すので、goの過去形「went」を使います。',
          },
          {
            question: 'She ___ a delicious cake yesterday.',
            options: ['make', 'makes', 'made', 'making'],
            correctIndex: 2,
            explanation: 'yesterdayは過去を表すので、makeの過去形「made」を使います。',
          },
          {
            question: 'We ___ the movie last night.',
            options: ['watch', 'watched', 'watching', 'watches'],
            correctIndex: 1,
            explanation: 'last nightは過去を表すので、watchに-edをつけて「watched」となります。',
          },
        ],
      },
      {
        title: '関係代名詞',
        description: '関係代名詞の使い方をマスターしましょう',
        content: `<h1>関係代名詞 (Relative Pronouns)</h1>
<p>関係代名詞は、2つの文を1つにつなげる役割があります。</p>

<h2>主な関係代名詞</h2>
<table style="width:100%; border-collapse: collapse;">
  <tr style="background:#f0f0f0;">
    <th style="padding:8px; border:1px solid #ddd;">関係代名詞</th>
    <th style="padding:8px; border:1px solid #ddd;">使い方</th>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid #ddd;"><strong>who</strong></td>
    <td style="padding:8px; border:1px solid #ddd;">人を説明するとき（主格）</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid #ddd;"><strong>which</strong></td>
    <td style="padding:8px; border:1px solid #ddd;">物や動物を説明するとき</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid #ddd;"><strong>that</strong></td>
    <td style="padding:8px; border:1px solid #ddd;">人・物両方に使える</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid #ddd;"><strong>whose</strong></td>
    <td style="padding:8px; border:1px solid #ddd;">所有を表すとき</td>
  </tr>
</table>

<h2>例文</h2>
<ul>
  <li>The man <strong>who</strong> lives next door is a doctor.<br>（隣に住んでいる男性は医者です）</li>
  <li>The book <strong>which</strong> I bought yesterday is interesting.<br>（昨日買った本は面白いです）</li>
  <li>This is the car <strong>that</strong> I want to buy.<br>（これは私が買いたい車です）</li>
</ul>`,
        level: 'intermediate',
        order: 3,
        createdBy: admin._id,
        isPublic: true,
        questions: [
          {
            question: 'The girl ___ is singing is my sister.',
            options: ['which', 'who', 'what', 'whom'],
            correctIndex: 1,
            explanation: '人を説明するときは「who」を使います。girlは人なので、whoが正解です。',
          },
          {
            question: 'The book ___ is on the table is mine.',
            options: ['who', 'which', 'whom', 'whose'],
            correctIndex: 1,
            explanation: '物を説明するときは「which」を使います。bookは物なので、whichが正解です。',
          },
          {
            question: 'I have a friend ___ father is a famous actor.',
            options: ['who', 'which', 'whose', 'that'],
            correctIndex: 2,
            explanation: '所有を表すときは「whose」を使います。「〜の父親」という所有の関係を示しています。',
          },
        ],
      },
    ];

    await GrammarLesson.deleteMany({});
    await GrammarLesson.insertMany(grammarLessons);
    console.log('Created grammar lessons');

    // Create demo pronunciation exercises
    const pronunciationExercises = [
      {
        title: '基本の挨拶',
        description: '日常的な挨拶フレーズの発音練習',
        targetText: 'Hello, how are you today?',
        level: 'beginner',
        category: 'greeting',
        createdBy: admin._id,
        isPublic: true,
      },
      {
        title: '自己紹介',
        description: '自己紹介の発音練習',
        targetText: 'My name is John. Nice to meet you.',
        level: 'beginner',
        category: 'introduction',
        createdBy: admin._id,
        isPublic: true,
      },
      {
        title: 'ビジネスメール',
        description: 'ビジネスシーンで使うフレーズの発音練習',
        targetText: 'Thank you for your prompt response. I appreciate your assistance.',
        level: 'intermediate',
        category: 'business',
        createdBy: admin._id,
        isPublic: true,
      },
      {
        title: 'プレゼンテーション',
        description: 'プレゼンテーションで使う表現の発音練習',
        targetText: 'Today, I would like to present our quarterly results and discuss our future strategy.',
        level: 'advanced',
        category: 'business',
        createdBy: admin._id,
        isPublic: true,
      },
    ];

    await PronunciationExercise.deleteMany({});
    await PronunciationExercise.insertMany(pronunciationExercises);
    console.log('Created pronunciation exercises');

    // Create demo calendar events
    const now = new Date();
    const calendarEvents = [
      {
        title: 'コーチングセッション',
        description: '週次の学習進捗確認',
        type: 'coaching',
        startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // +1 hour
        coachId: coach._id,
        studentId: student._id,
        status: 'scheduled',
      },
      {
        title: '発音練習セッション',
        description: '発音の個別指導',
        type: 'coaching',
        startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // +45 min
        coachId: coach._id,
        studentId: student._id,
        status: 'scheduled',
      },
      {
        title: '文法レビュー',
        description: '文法問題の復習と解説',
        type: 'coaching',
        startTime: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
        endTime: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        coachId: coach._id,
        studentId: student._id,
        status: 'scheduled',
      },
      {
        title: '目標設定ミーティング',
        description: '月次の目標振り返りと新しい目標設定',
        type: 'coaching',
        startTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        endTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        coachId: coach._id,
        studentId: student._id,
        status: 'scheduled',
      },
    ];

    await CalendarEvent.deleteMany({});
    await CalendarEvent.insertMany(calendarEvents);
    console.log('Created calendar events');

    console.log('\n=== Demo Data Created Successfully ===');
    console.log('\nDemo Users:');
    console.log('- Admin: admin@linkup.com / password123');
    console.log('- Coach: coach@linkup.com / password123');
    console.log('- Student: student@linkup.com / password123');
    console.log('\nDemo Content:');
    console.log(`- ${vocabDecks.length} vocab decks`);
    console.log(`- ${grammarLessons.length} grammar lessons`);
    console.log(`- ${pronunciationExercises.length} pronunciation exercises`);
    console.log(`- ${calendarEvents.length} calendar events`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
