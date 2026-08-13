import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Mountain } from "./modules/mountain/mountain.entity";
import { Route } from "./modules/mountain/route.entity";
import { User } from "./modules/user/user.entity";
import * as bcrypt from "bcrypt";
import { Repository, DataSource } from "typeorm";

async function seed() {
  console.log("🌱 Seeding database...");

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  // ─── Clear existing data ───
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.query("DELETE FROM routes");
  await queryRunner.query("DELETE FROM mountains");
  await queryRunner.query("DELETE FROM users");
  await queryRunner.release();
  console.log("  ✓ Cleared existing data");

  // ─── Mountains & Routes ───
  const mountainRepo: Repository<Mountain> = app.get(getRepositoryToken(Mountain));
  const routeRepo: Repository<Route> = app.get(getRepositoryToken(Route));

  const mountainData = [
    {
      name: "Mount Gede", region: "Jawa Barat", province: "Jawa Barat",
      elevation: 2958, latitude: -6.78, longitude: 106.98, difficultyLevel: 4,
      description: "Gunung dengan jalur klasik dan pemandangan kawah spektakuler. Memiliki dua puncak: Puncak Gede dan Puncak Pangrango.",
      imageUrl: "/mountains/gede.jpg", estimatedDuration: 9,
      permits: { required: true, prices: { local: 15000, foreign: 250000 } },
      rules: "Wajib registrasi online. Dilarang membuang sampah sembarangan.",
      weatherInfo: { avgTemp: 15, rainyDays: 180, bestSeason: "Apr-Okt", humidity: 85 },
      routes: [
        { name: "Cibodas", startPoint: "Cibodas (1.400 mdpl)", difficulty: 4, distance: 8.5, duration: 9, elevationGain: 1558 },
        { name: "Putri", startPoint: "Putri (1.500 mdpl)", difficulty: 6, distance: 12, duration: 11, elevationGain: 1458 },
      ],
    },
    {
      name: "Mount Pangrango", region: "Jawa Barat", province: "Jawa Barat",
      elevation: 3019, latitude: -6.73, longitude: 106.95, difficultyLevel: 5,
      description: "Gunung tertinggi di Jawa Barat dengan hutan tropis lebat dan pemandangan sunrise yang spektakuler.",
      imageUrl: "/mountains/pangrango.jpg", estimatedDuration: 12,
      permits: { required: true, prices: { local: 20000, foreign: 300000 } },
      weatherInfo: { avgTemp: 12, rainyDays: 200, bestSeason: "Apr-Okt", humidity: 88 },
      routes: [
        { name: "Gunung Putri", startPoint: "Gunung Putri (1.500 mdpl)", difficulty: 5, distance: 14, duration: 12, elevationGain: 1519 },
      ],
    },
    {
      name: "Mount Salak", region: "Jawa Barat", province: "Jawa Barat",
      elevation: 2211, latitude: -6.72, longitude: 106.73, difficultyLevel: 4,
      description: "Gunung dengan medan menantang dan pemandangan alam liar. Terkenal dengan hutan lumut yang mistis.",
      imageUrl: "/mountains/salak.jpg", estimatedDuration: 7,
      permits: { required: true, prices: { local: 15000, foreign: 200000 } },
      weatherInfo: { avgTemp: 18, rainyDays: 190, bestSeason: "Mei-Sep", humidity: 90 },
      routes: [
        { name: "Cicurug", startPoint: "Cicurug (800 mdpl)", difficulty: 4, distance: 7, duration: 7, elevationGain: 1411 },
      ],
    },
    {
      name: "Mount Batur", region: "Bali", province: "Bali",
      elevation: 1717, latitude: -8.24, longitude: 115.38, difficultyLevel: 2,
      description: "Gunung berapi aktif dengan sunrise legendaris. Trek pendek cocok untuk pemula.",
      imageUrl: "/mountains/batur.jpg", estimatedDuration: 2,
      permits: { required: true, prices: { local: 50000, foreign: 350000 } },
      weatherInfo: { avgTemp: 22, rainyDays: 140, bestSeason: "Apr-Okt", humidity: 75 },
      routes: [
        { name: "Kintamani", startPoint: "Kintamani (1.200 mdpl)", difficulty: 2, distance: 3, duration: 2, elevationGain: 517 },
        { name: "Trunyan", startPoint: "Trunyan (1.100 mdpl)", difficulty: 3, distance: 5, duration: 3.5, elevationGain: 617 },
      ],
    },
    {
      name: "Mount Agung", region: "Bali", province: "Bali",
      elevation: 3031, latitude: -8.34, longitude: 115.51, difficultyLevel: 6,
      description: "Gunung tertinggi di Bali, dianggap suci oleh masyarakat setempat. Trek berat dengan pemandangan luar biasa.",
      imageUrl: "/mountains/agung.jpg", estimatedDuration: 8,
      permits: { required: true, prices: { local: 60000, foreign: 400000 } },
      weatherInfo: { avgTemp: 14, rainyDays: 160, bestSeason: "Apr-Sep", humidity: 80 },
      routes: [
        { name: "Besakih", startPoint: "Pura Besakih (1.200 mdpl)", difficulty: 6, distance: 10, duration: 8, elevationGain: 1831 },
      ],
    },
    {
      name: "Mount Merbabu", region: "Jawa Tengah", province: "Jawa Tengah",
      elevation: 3145, latitude: -7.46, longitude: 110.44, difficultyLevel: 3,
      description: "Gunung dengan savana indah, cocok untuk pemula. Pemandangan sunrise dari puncak sangat memukau.",
      imageUrl: "/mountains/merbabu.jpg", estimatedDuration: 7,
      permits: { required: true, prices: { local: 10000, foreign: 150000 } },
      weatherInfo: { avgTemp: 14, rainyDays: 170, bestSeason: "Apr-Okt", humidity: 82 },
      routes: [
        { name: "Selo", startPoint: "Selo (1.600 mdpl)", difficulty: 2, distance: 6.5, duration: 7, elevationGain: 1545 },
        { name: "Thekelan", startPoint: "Thekelan (1.500 mdpl)", difficulty: 4, distance: 9, duration: 9, elevationGain: 1645 },
      ],
    },
    {
      name: "Mount Merapi", region: "Jawa Tengah", province: "Jawa Tengah",
      elevation: 2930, latitude: -7.54, longitude: 110.44, difficultyLevel: 7,
      description: "Gunung berapi paling aktif di Indonesia. Pendakian hanya diizinkan saat status normal.",
      imageUrl: "/mountains/merapi.jpg", estimatedDuration: 6,
      permits: { required: true, prices: { local: 20000, foreign: 250000 } },
      weatherInfo: { avgTemp: 16, rainyDays: 180, bestSeason: "Apr-Okt", humidity: 85 },
      routes: [
        { name: "Lereng Selatan", startPoint: "Selo (1.500 mdpl)", difficulty: 7, distance: 8, duration: 6, elevationGain: 1430 },
      ],
    },
    {
      name: "Mount Semeru", region: "Jawa Timur", province: "Jawa Timur",
      elevation: 3676, latitude: -8.11, longitude: 112.92, difficultyLevel: 8,
      description: "Gunung tertinggi di Jawa dengan medan pasir vulkanik yang ikonik. Butuh persiapan fisik yang matang.",
      imageUrl: "/mountains/semeru.jpg", estimatedDuration: 15,
      permits: { required: true, prices: { local: 25000, foreign: 350000 } },
      weatherInfo: { avgTemp: 10, rainyDays: 190, bestSeason: "Apr-Okt", humidity: 85 },
      routes: [
        { name: "Ranjah", startPoint: "Ranjah (2.200 mdpl)", difficulty: 8, distance: 15, duration: 15, elevationGain: 1476 },
      ],
    },
    {
      name: "Mount Rinjani", region: "NTB", province: "Nusa Tenggara Barat",
      elevation: 3726, latitude: -8.41, longitude: 116.46, difficultyLevel: 7,
      description: "Gunung favorit dengan Danau Segara Anak yang eksotis. Salah satu trek terbaik di Asia Tenggara.",
      imageUrl: "/mountains/rinjani.jpg", estimatedDuration: 13,
      permits: { required: true, prices: { local: 250000, foreign: 550000 } },
      weatherInfo: { avgTemp: 12, rainyDays: 150, bestSeason: "Apr-Nov", humidity: 78 },
      routes: [
        { name: "Sembalun", startPoint: "Sembalun (1.150 mdpl)", difficulty: 6, distance: 14, duration: 13, elevationGain: 2576 },
        { name: "Torean", startPoint: "Torean (800 mdpl)", difficulty: 8, distance: 16, duration: 15, elevationGain: 2926 },
      ],
    },
    {
      name: "Mount Bromo", region: "Jawa Timur", province: "Jawa Timur",
      elevation: 2329, latitude: -7.94, longitude: 112.95, difficultyLevel: 1,
      description: "Gunung ikonik dengan lautan pasir. Sunrise paling terkenal di Indonesia.",
      imageUrl: "/mountains/bromo.jpg", estimatedDuration: 2.5,
      permits: { required: true, prices: { local: 30000, foreign: 350000 } },
      weatherInfo: { avgTemp: 16, rainyDays: 140, bestSeason: "Apr-Okt", humidity: 72 },
      routes: [
        { name: "Penanjakan", startPoint: "Cemoro Lawang (2.200 mdpl)", difficulty: 1, distance: 3.5, duration: 2.5, elevationGain: 600 },
      ],
    },
    {
      name: "Mount Ijen", region: "Jawa Timur", province: "Jawa Timur",
      elevation: 2386, latitude: -8.06, longitude: 114.24, difficultyLevel: 2,
      description: "Terkenal dengan blue fire dan kawah asam. Fenomena langka yang hanya ada di beberapa tempat di dunia.",
      imageUrl: "/mountains/ijen.jpg", estimatedDuration: 1.5,
      permits: { required: true, prices: { local: 100000, foreign: 500000 } },
      weatherInfo: { avgTemp: 18, rainyDays: 130, bestSeason: "Apr-Okt", humidity: 75 },
      routes: [
        { name: "Paltuding", startPoint: "Paltuding (1.850 mdpl)", difficulty: 2, distance: 3, duration: 1.5, elevationGain: 536 },
      ],
    },
    {
      name: "Mount Kerinci", region: "Jambi", province: "Jambi",
      elevation: 3805, latitude: -2.10, longitude: 101.48, difficultyLevel: 7,
      description: "Gunung tertinggi di Sumatera. Hutan tropis lebat dengan beragam flora dan fauna langka.",
      imageUrl: "/mountains/kerinci.jpg", estimatedDuration: 13,
      permits: { required: true, prices: { local: 20000, foreign: 250000 } },
      weatherInfo: { avgTemp: 12, rainyDays: 200, bestSeason: "Jun-Nov", humidity: 88 },
      routes: [
        { name: "Kersik Tuo", startPoint: "Kersik Tuo (1.500 mdpl)", difficulty: 7, distance: 14, duration: 13, elevationGain: 2305 },
      ],
    },
    {
      name: "Mount Tambora", region: "NTB", province: "Nusa Tenggara Barat",
      elevation: 2720, latitude: -8.25, longitude: 117.95, difficultyLevel: 5,
      description: "Gunung bersejarah dengan kawah raksasa. Letusan 1815 tercatat sebagai yang terbesar dalam sejarah.",
      imageUrl: "/mountains/tambora.jpg", estimatedDuration: 9,
      permits: { required: true, prices: { local: 15000, foreign: 200000 } },
      weatherInfo: { avgTemp: 16, rainyDays: 135, bestSeason: "Apr-Nov", humidity: 76 },
      routes: [
        { name: "Calabai", startPoint: "Calabai (900 mdpl)", difficulty: 5, distance: 10, duration: 9, elevationGain: 1820 },
      ],
    },
    {
      name: "Mount Lawu", region: "Jawa Tengah", province: "Jawa Tengah",
      elevation: 3265, latitude: -7.63, longitude: 111.19, difficultyLevel: 4,
      description: "Gunung mistis dengan pemandangan indah dan Candi Sukuh di lerengnya.",
      imageUrl: "/mountains/lawu.jpg", estimatedDuration: 7,
      permits: { required: true, prices: { local: 15000, foreign: 200000 } },
      weatherInfo: { avgTemp: 14, rainyDays: 170, bestSeason: "Apr-Okt", humidity: 83 },
      routes: [
        { name: "Cemoro Kandang", startPoint: "Cemoro Kandang (1.800 mdpl)", difficulty: 4, distance: 8, duration: 7, elevationGain: 1465 },
        { name: "Candi Sukuh", startPoint: "Candi Sukuh (1.200 mdpl)", difficulty: 3, distance: 6, duration: 5, elevationGain: 1200 },
      ],
    },
    {
      name: "Mount Slamet", region: "Jawa Tengah", province: "Jawa Tengah",
      elevation: 3428, latitude: -7.24, longitude: 109.21, difficultyLevel: 6,
      description: "Gunung tertinggi di Jawa Tengah. Medan berat dengan hutan lebat dan pemandangan sunrise yang epik.",
      imageUrl: "/mountains/slamet.jpg", estimatedDuration: 10,
      permits: { required: true, prices: { local: 15000, foreign: 200000 } },
      weatherInfo: { avgTemp: 12, rainyDays: 190, bestSeason: "Apr-Okt", humidity: 87 },
      routes: [
        { name: "Bambangan", startPoint: "Bambangan (1.500 mdpl)", difficulty: 6, distance: 11, duration: 10, elevationGain: 1928 },
      ],
    },
  ];

  for (const data of mountainData) {
    const { routes: routeData, ...mountainFields } = data;
    const mountain = mountainRepo.create(mountainFields);
    const saved = await mountainRepo.save(mountain);

    for (const rd of routeData) {
      const route = routeRepo.create({
        ...rd,
        mountain: saved,
      });
      await routeRepo.save(route);
    }
  }
  console.log(`  ✓ Seeded ${mountainData.length} mountains with routes`);

  // ─── Test User ───
  const userRepo: Repository<User> = app.get(getRepositoryToken(User));
  // Must satisfy the mobile app's password policy (uppercase + lowercase + digit, min 8)
  const hashedPassword = await bcrypt.hash("Password123", 10);
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

  await app.close();
  console.log("\n✅ Seed complete! Backend is ready.");
  console.log("   Login: admin@jejak.app / Password123");
  console.log("   API:   http://localhost:4000/api/v1");
  console.log("   Docs:  http://localhost:4000/api/docs");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
