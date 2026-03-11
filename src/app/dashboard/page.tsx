import { auth } from '@/auth';
import { redirect } from 'next/navigation';

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

  redirect(dashboardRoute);
}
