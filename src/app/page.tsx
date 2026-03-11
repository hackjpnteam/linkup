import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-primary-gradient">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white italic">LinkUp</h1>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-white/80 hover:text-white transition-colors"
              >
                ログイン
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-white text-primary-dark rounded-lg hover:bg-cream-dark transition-colors font-medium"
              >
                新規登録
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            英語学習を、
            <br />
            <span className="text-primary">コーチと共に。</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            LinkUpは、コーチングと共に英語学習を効果的に進めるプラットフォームです。
            <br />
            単語、文法、発音の学習をサポートし、目標達成をお手伝いします。
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-primary text-white text-lg font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-primary"
          >
            無料で始める
          </Link>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/20">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">単語学習</h3>
            <p className="text-gray-600">
              効率的な単語帳機能で語彙力を向上。音声再生やテスト機能で定着をサポート。
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/20">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">文法学習</h3>
            <p className="text-gray-600">
              体系的な文法学習と確認テスト。解説動画で理解を深めます。
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/20">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">発音練習</h3>
            <p className="text-gray-600">
              AIによる発音評価で正確な発音を習得。苦手な音を分析してフィードバック。
            </p>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-primary/30">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-4">
          <Link href="/terms" className="text-gray-500 hover:text-primary">
            利用規約
          </Link>
          <span className="hidden md:inline text-gray-300">|</span>
          <Link href="/privacy" className="text-gray-500 hover:text-primary">
            プライバシーポリシー
          </Link>
        </div>
        <p className="text-center text-gray-500">
          &copy; 2026 LinkUp. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
