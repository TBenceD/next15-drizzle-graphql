import 'dotenv/config';
import { db } from '../src/lib/db/connection';
import { user, account } from '../src/lib/db/schema';
import { auth } from '../src/lib/auth';
import { seedPermissions, assignRole } from '../src/lib/auth/permissions';
import { randomUUID } from 'node:crypto';
import { tryCatch } from '@/utils/try-catch';

async function seedUser() {
  const email = 'admin@example.com';
  const password = 'password123';
  const name = 'Admin User';

  console.log('🌱 Setting up permissions and roles...');

  const { error: seedPermissionsError } = await tryCatch(seedPermissions());

  if (seedPermissionsError) {
    throw seedPermissionsError;
  }

  console.log('✅ Permissions and roles seeded');

  const ctx = await auth.$context;
  const hashedPassword = await ctx.password.hash(password);
  const userId = randomUUID();

  console.log('🌱 Creating admin user...');

  const { data: userData, error: userError } = await tryCatch(
    db
      .insert(user)
      .values({
        id: userId,
        email,
        name,
        emailVerified: true, // Set to true for testing
        image: null
      })
      .returning()
  );

  if (userError) {
    throw new Error('Failed to create user');
  }

  console.log('✅ User created:', userData);

  const { data: accountData, error: accountError } = await tryCatch(
    db
      .insert(account)
      .values({
        id: randomUUID(),
        accountId: userId, // Same as user ID for email/password auth
        providerId: 'credential', // Better Auth uses 'credential' for email/password
        userId: userId,
        password: hashedPassword,
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null
      })
      .returning()
  );

  if (accountError) {
    throw new Error('Failed to create account');
  }

  console.log('✅ Account created:', { id: accountData[0].id, providerId: accountData[0].providerId });

  console.log('🌱 Assigning admin role...');

  const { error: roleAssignedError } = await tryCatch(assignRole(userId, 'admin'));

  if (roleAssignedError) {
    console.error('❌ Failed to assign admin role');
    throw new Error('Failed to assign admin role');
  }

  console.log('✅ Admin role assigned successfully');

  console.log('\n🎉 Seeding completed!');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
  console.log('👑 Role: admin (full permissions)');

  console.log('\n📝 Available permissions:');
  console.log('- users.read: Read users');
  console.log('- users.write: Create and update users');
  console.log('- users.delete: Delete users');
  console.log('- posts.read: Read posts');
  console.log('- posts.write: Create and update posts');
  console.log('- posts.delete: Delete posts');

  console.log('\n🎭 Available roles:');
  console.log('- admin: Full access to all resources');
  console.log('- editor: Can manage posts and read users');
  console.log('- user: Read-only access');
}

// Run the seeder
seedUser()
  .then(() => {
    console.log('🏁 Seeder finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeder failed:', error);
    process.exit(1);
  });
