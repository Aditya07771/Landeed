import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function UnauthorizedPage() {
    const session = await getServerSession(authOptions);
    if (session?.user?.role === 'ADMIN') {
        return redirect('/admin');
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-500">Unauthorized</h1>
                <p>You do not have permission to access this page.</p>
                <a href="/dashboard" className="text-blue-500">Go to Dashboard</a>
            </div>
        </div>
    )
}