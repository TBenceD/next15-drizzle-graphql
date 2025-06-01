import 'dotenv/config';
import { db } from '../src/lib/db/connection';
import { users, accounts } from '../src/lib/db/schema';
import { auth } from '../src/lib/auth';
import { randomUUID } from 'node:crypto';

async function seedUser() {
  try {
    const email = 'admin@example.com';
    const password = 'password123';
    const name = 'Admin User';

    // Get Better Auth context to use its password hashing
    const ctx = await auth.$context;
    
    // Hash the password using Better Auth's internal method
    const hashedPassword = await ctx.password.hash(password);

    // Generate user ID
    const userId = randomUUID();

    console.log('🌱 Creating user...');

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

    console.log('\n🎉 Seeding completed!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
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
