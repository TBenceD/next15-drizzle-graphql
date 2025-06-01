'use client';

import { useSession, signOut } from '@/lib/auth-client';

export function UserSession() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Not signed in</p>
        <a href="/auth" className="mt-2 inline-block rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-medium text-lg">Welcome!</h3>
      <div className="space-y-2">
        <p>
          <strong>Name:</strong> {session.user.name}
        </p>
        <p>
          <strong>Email:</strong> {session.user.email}
        </p>
        <p>
          <strong>Email Verified:</strong> {session.user.emailVerified ? 'Yes' : 'No'}
        </p>
      </div>
      <button type="button" onClick={() => signOut()} className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700">
        Sign Out
      </button>
    </div>
  );
}
