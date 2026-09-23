import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Repository } from "typeorm";
import { AppModule } from "./app.module";
import { User } from "./modules/user/user.entity";
import * as bcrypt from "bcrypt";

/**
 * Non-destructive test account seeder.
 * Upserts admin@jejak.app without touching other data.
 *
 * Run (dev):      npm run seed:test
 * Run (docker):   docker compose exec backend node dist/seed-test-user.js
 */
async function seedTestUser() {
  console.log("🌱 Seeding test user (non-destructive)...");

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  // Ensure schema exists (synchronize is enabled in database.config)
  await dataSource.synchronize();

  const userRepo: Repository<User> = app.get(getRepositoryToken(User));

  // Must satisfy the mobile app's password policy (uppercase + lowercase + digit, min 8)
  const hashedPassword = await bcrypt.hash("Password123", 10);

  const existing = await userRepo.findOne({ where: { email: "admin@jejak.app" } });

  if (existing) {
    existing.password = hashedPassword;
    existing.emailVerified = true;
    existing.isActive = true;
    await userRepo.save(existing);
    console.log("  ✓ Updated existing test user: admin@jejak.app / Password123");
  } else {
    const testUser = userRepo.create({
      email: "admin@jejak.app",
      phone: "6281234567890",
      password: hashedPassword,
      fullName: "Admin Jejak",
      roles: ["admin"],
      verificationLevel: 3,
      isActive: true,
      emailVerified: true,
    });
    await userRepo.save(testUser);
    console.log("  ✓ Created test user: admin@jejak.app / Password123");
  }

  await app.close();
  console.log("\n✅ Test user ready.");
  console.log("   Login: admin@jejak.app / Password123");
}

seedTestUser().catch((err) => {
  console.error("❌ Seed test user failed:", err);
  process.exit(1);
});
