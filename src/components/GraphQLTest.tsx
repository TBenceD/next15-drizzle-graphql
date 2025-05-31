'use client';

import { useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function GraphQLTest() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `
            query GetUsers {
              users {
                id
                email
                name
                createdAt
                updatedAt
              }
            }
          `
        })
      });

      const result = await response.json();

      if (result.errors) {
        setError(result.errors[0].message);
      } else {
        setUsers(result.data.users);
      }
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    setLoading(true);
    setError(null);

    const email = `user${Date.now()}@example.com`;
    const name = `User ${Date.now()}`;

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `
            mutation {
  createUser(email: "test@example.com", name: "Test User") {
    id
    email
    name
    createdAt
  }
}
          `,
          variables: { email, name }
        })
      });

      const result = await response.json();

      if (result.errors) {
        setError(result.errors[0].message);
      } else {
        // Refresh the users list
        await fetchUsers();
      }
    } catch (err) {
      setError('Failed to create user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 font-bold text-2xl">GraphQL Test</h1>

      <div className="mb-6 space-x-4">
        <button type="button" onClick={fetchUsers} disabled={loading} className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50">
          {loading ? 'Loading...' : 'Fetch Users'}
        </button>

        <button type="button" onClick={createUser} disabled={loading} className="rounded bg-green-500 px-4 py-2 text-white disabled:opacity-50">
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </div>

      {error && <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">Error: {error}</div>}

      <div>
        <h2 className="mb-2 font-semibold text-xl">Users ({users.length})</h2>
        {users.length === 0 ? (
          <p className="text-gray-500">No users found. Try creating one!</p>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="rounded border p-3">
                <div className="font-medium">{user.name}</div>
                <div className="text-gray-600 text-sm">{user.email}</div>
                <div className="text-gray-400 text-xs">ID: {user.id}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
