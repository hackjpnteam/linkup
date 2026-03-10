import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const { user } = session;

  // Role-based redirect
  const roleRoutes: Record<string, string> = {
    student: '/student/dashboard',
    coach: '/coach/dashboard',
    admin: '/admin/dashboard',
  };

  const dashboardRoute = roleRoutes[user.role] || '/student/dashboard';

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-primary shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">LinkUp</h1>
          <div className="flex items-center gap-4">
            <span className="text-white/80">{user.name}</span>
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              {user.role === 'student' ? '受講生' : user.role === 'coach' ? 'コーチ' : '管理者'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 border border-primary/20">
          <h2 className="text-xl font-semibold mb-4">ようこそ、{user.name}さん</h2>
          <p className="text-gray-600 mb-6">
            ダッシュボードへのリダイレクト準備中...
          </p>
          <Link
            href={dashboardRoute}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            ダッシュボードへ移動
          </Link>
        </div>
      </main>
    </div>
  );
}
