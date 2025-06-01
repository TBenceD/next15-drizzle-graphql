import 'dotenv/config';
import { db } from '../src/lib/db/connection';
import { users, accounts } from '../src/lib/db/schema';
import { auth } from '../src/lib/auth';
import { seedPermissions, assignRole } from '../src/lib/permissions';
import { randomUUID } from 'node:crypto';

async function seedUser() {
  try {
    const email = 'admin@example.com';
    const password = 'password123';
    const name = 'Admin User';

    console.log('🌱 Setting up permissions and roles...');

    // Seed permissions and roles first
    await seedPermissions();
    console.log('✅ Permissions and roles seeded');

    // Get Better Auth context to use its password hashing
    const ctx = await auth.$context;

    // Hash the password using Better Auth's internal method
    const hashedPassword = await ctx.password.hash(password);

    // Generate user ID
    const userId = randomUUID();

    console.log('🌱 Creating admin user...');

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        email,
        name,
        emailVerified: true, // Set to true for testing
        image: null
      })
      .returning();

    console.log('✅ User created:', user);

    // Create account record with Better Auth hashed password
    const [account] = await db
      .insert(accounts)
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
      .returning();

    console.log('✅ Account created:', { id: account.id, providerId: account.providerId });

    // Assign admin role to the created user
    console.log('🌱 Assigning admin role...');
    const roleAssigned = await assignRole(userId, 'admin');

    if (roleAssigned) {
      console.log('✅ Admin role assigned successfully');
    } else {
      console.error('❌ Failed to assign admin role');
    }

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
  } catch (error) {
    console.error('❌ Error seeding user:', error);
    throw error;
  }
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
