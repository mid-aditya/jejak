import { apiClient } from "./api";

// ─── Types ───
export interface MountainDTO {
  id: string;
  name: string;
  region: string;
  province: string;
  elevation: number;
  difficultyLevel: number;
  description?: string;
  imageUrl?: string;
  routes?: RouteDTO[];
  estimatedDuration?: number;
  latitude?: number;
  longitude?: number;
  permits?: {
    required: boolean;
    prices?: { local: number; foreign: number };
    url?: string;
  };
  rules?: string;
  weatherInfo?: {
    avgTemp?: number;
    rainyDays?: number;
    bestSeason?: string;
    humidity?: number;
  };
  isActive?: boolean;
}

export interface RouteDTO {
  id: string;
  name: string;
  difficulty: number;
  distance: number;
  duration: number;
  elevationGain: number;
  startPoint: string;
  mountainId: string;
  waypoints?: Array<{
    name: string;
    lat: number;
    lng: number;
    elevation: number;
    isWaterSource: boolean;
    isRestPost: boolean;
    isDangerZone: boolean;
  }>;
}

export interface DifficultyScaleItem {
  level: number;
  label: string;
  description: string;
}

/** A flattened trail item combining Mountain + Route data */
export interface TrailItem {
  id: string;
  name: string;
  mountainName: string;
  region: string;
  elevation: number;
  distance: number;
  duration: string;
  difficulty: number;
  difficultyLabel: string;
  elevationGain: number;
  startPoint: string;
  mountainId: string;
  trending: boolean;
  rating: number;
  reviews: number;
  description: string;
  basecamp: string;
  image: string;
}

// ─── Difficulty Mapping ───
export const difficultyLabels: Record<number, string> = {
  1: "Sangat Mudah",
  2: "Mudah",
  3: "Cukup Mudah",
  4: "Sedang",
  5: "Cukup Berat",
  6: "Berat",
  7: "Sangat Berat",
  8: "Ekstrem",
  9: "Sangat Ekstrem",
  10: "Ultimate",
};

export const difficultyColors: Record<number, { bg: string; text: string }> = {
  1: { bg: "bg-green-100", text: "text-green-700" },
  2: { bg: "bg-emerald-100", text: "text-emerald-700" },
  3: { bg: "bg-teal-100", text: "text-teal-700" },
  4: { bg: "bg-blue-100", text: "text-blue-700" },
  5: { bg: "bg-indigo-100", text: "text-indigo-700" },
  6: { bg: "bg-orange-100", text: "text-orange-700" },
  7: { bg: "bg-amber-100", text: "text-amber-700" },
  8: { bg: "bg-red-100", text: "text-red-700" },
  9: { bg: "bg-rose-100", text: "text-rose-700" },
  10: { bg: "bg-purple-100", text: "text-purple-700" },
};

// ─── API Calls ───
export async function fetchMountains(): Promise<MountainDTO[]> {
  try {
    const res = await apiClient.get<MountainDTO[]>("/mountains");
    return Array.isArray(res) ? res : res?.data ?? fallbackMountains;
  } catch {
    return fallbackMountains;
  }
}

export async function fetchMountainById(id: string): Promise<MountainDTO | null> {
  try {
    const res = await apiClient.get<MountainDTO>(`/mountains/${id}`);
    return (res as any)?.data ?? res ?? null;
  } catch {
    return fallbackMountains.find((m) => m.id === id) ?? null;
  }
}

export async function fetchRoutes(mountainId: string): Promise<RouteDTO[]> {
  try {
    const res = await apiClient.get<RouteDTO[]>(`/mountains/${mountainId}/routes`);
    return Array.isArray(res) ? res : res?.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchDifficultyScale(): Promise<DifficultyScaleItem[]> {
  try {
    const res = await apiClient.get<DifficultyScaleItem[]>("/mountains/difficulty-scale");
    return Array.isArray(res) ? res : res?.data ?? fallbackDifficultyScale;
  } catch {
    return fallbackDifficultyScale;
  }
}

// ─── Flatten mountains + routes into TrailItem[] ───
export function flattenTrails(mountains: MountainDTO[]): TrailItem[] {
  const trails: TrailItem[] = [];

  for (const mtn of mountains) {
    const routes = mtn.routes ?? [];
    if (routes.length === 0) {
      // Mountain without routes → create one generic trail
      trails.push({
        id: `${mtn.id}-main`,
        name: "Jalur Utama",
        mountainName: mtn.name,
        region: mtn.region,
        elevation: mtn.elevation,
        distance: 0,
        duration: "—",
        difficulty: mtn.difficultyLevel,
        difficultyLabel: difficultyLabels[mtn.difficultyLevel] ?? "Tidak Diketahui",
        elevationGain: 0,
        startPoint: "—",
        mountainId: mtn.id,
        trending: false,
        rating: +(3.5 + Math.random() * 1.5).toFixed(1),
        reviews: Math.floor(Math.random() * 200) + 10,
        description: mtn.description ?? `Jalur pendakian menuju ${mtn.name}.`,
        basecamp: `${mtn.name} Basecamp`,
        image: "from-green-500 to-emerald-700",
      });
    } else {
      for (const route of routes) {
        const r = route as any;
        trails.push({
          id: r.id ?? `${mtn.id}-${route.name}`,
          name: route.name,
          mountainName: mtn.name,
          region: mtn.region,
          elevation: mtn.elevation,
          distance: route.distance ?? 0,
          duration: route.duration ? `${route.duration} jam` : "—",
          difficulty: route.difficulty,
          difficultyLabel: difficultyLabels[route.difficulty] ?? "Tidak Diketahui",
          elevationGain: route.elevationGain ?? 0,
          startPoint: route.startPoint ?? "—",
          mountainId: mtn.id,
          trending: Math.random() > 0.7,
          rating: +(3.5 + Math.random() * 1.5).toFixed(1),
          reviews: Math.floor(Math.random() * 200) + 10,
          description: r.description ?? mtn.description ?? `Jalur ${route.name} menuju ${mtn.name}.`,
          basecamp: route.startPoint ? `${route.startPoint} (${mtn.elevation}m)` : `${mtn.name} Basecamp`,
          image: "from-green-500 to-emerald-700",
        });
      }
    }
  }

  return trails;
}

// ─── Fallback Data ───
const fallbackDifficultyScale: DifficultyScaleItem[] = [
  { level: 1, label: "Sangat Mudah", description: "Jalur pendek, landai, cocok untuk pemula" },
  { level: 2, label: "Mudah", description: "Jalur jelas, sedikit tanjakan" },
  { level: 3, label: "Cukup Mudah", description: "Trek sedang, butuh kebugaran dasar" },
  { level: 4, label: "Sedang", description: "Tanjakan teratur, butuh persiapan" },
  { level: 5, label: "Cukup Berat", description: "Medan bervariasi, jam trekking panjang" },
  { level: 6, label: "Berat", description: "Tanjakan curam, medan teknis ringan" },
  { level: 7, label: "Sangat Berat", description: "Medan terjal, butuh pengalaman" },
  { level: 8, label: "Ekstrem", description: "Scrambling, eksposur tinggi" },
  { level: 9, label: "Sangat Ekstrem", description: "Butuh teknik panjat tebing dasar" },
  { level: 10, label: "Ultimate", description: "Ekspedisi multi-hari, medan sangat berbahaya" },
];

const fallbackMountains: MountainDTO[] = [
  {
    id: "m1", name: "Mount Gede", region: "Jawa Barat", province: "Jawa Barat", elevation: 2958, difficultyLevel: 4,
    description: "Gunung dengan jalur klasik dan pemandangan kawah spektakuler",
    routes: [
      { id: "r1", name: "Cibodas", difficulty: 4, distance: 8.5, duration: 9, elevationGain: 1558, startPoint: "Cibodas (1.400 mdpl)", mountainId: "m1" },
      { id: "r2", name: "Putri", difficulty: 6, distance: 12, duration: 11, elevationGain: 1458, startPoint: "Putri (1.500 mdpl)", mountainId: "m1" },
    ],
  },
  {
    id: "m2", name: "Mount Pangrango", region: "Jawa Barat", province: "Jawa Barat", elevation: 3019, difficultyLevel: 5,
    description: "Gunung tertinggi di Jawa Barat dengan hutan tropis lebat",
    routes: [{ id: "r3", name: "Gunung Putri", difficulty: 5, distance: 14, duration: 12, elevationGain: 1500, startPoint: "Gunung Putri", mountainId: "m2" }],
  },
  {
    id: "m3", name: "Mount Salak", region: "Jawa Barat", province: "Jawa Barat", elevation: 2211, difficultyLevel: 4,
    description: "Gunung dengan medan menantang dan pemandangan alam liar",
    routes: [{ id: "r4", name: "Cicurug", difficulty: 4, distance: 7, duration: 7, elevationGain: 900, startPoint: "Cicurug", mountainId: "m3" }],
  },
  {
    id: "m4", name: "Mount Batur", region: "Bali", province: "Bali", elevation: 1717, difficultyLevel: 2,
    description: "Gunung berapi aktif dengan sunrise legendaris",
    routes: [
      { id: "r5", name: "Kintamani", difficulty: 2, distance: 3, duration: 2, elevationGain: 500, startPoint: "Kintamani (1.200 mdpl)", mountainId: "m4" },
      { id: "r6", name: "Trunyan", difficulty: 3, distance: 5, duration: 3.5, elevationGain: 700, startPoint: "Trunyan", mountainId: "m4" },
    ],
  },
  {
    id: "m5", name: "Mount Agung", region: "Bali", province: "Bali", elevation: 3031, difficultyLevel: 6,
    description: "Gunung tertinggi di Bali, spiritual dan menantang",
    routes: [{ id: "r7", name: "Besakih", difficulty: 6, distance: 10, duration: 8, elevationGain: 1800, startPoint: "Pura Besakih", mountainId: "m5" }],
  },
  {
    id: "m6", name: "Mount Merbabu", region: "Jawa Tengah", province: "Jawa Tengah", elevation: 3145, difficultyLevel: 3,
    description: "Gunung dengan savana indah, cocok untuk pemula",
    routes: [
      { id: "r8", name: "Selo", difficulty: 2, distance: 6.5, duration: 7, elevationGain: 1545, startPoint: "Selo (1.600 mdpl)", mountainId: "m6" },
      { id: "r9", name: "Thekelan", difficulty: 4, distance: 9, duration: 9, elevationGain: 1645, startPoint: "Thekelan (1.500 mdpl)", mountainId: "m6" },
    ],
  },
  {
    id: "m7", name: "Mount Merapi", region: "Jawa Tengah", province: "Jawa Tengah", elevation: 2930, difficultyLevel: 7,
    description: "Gunung berapi paling aktif di Indonesia",
    routes: [{ id: "r10", name: "Lereng Selatan", difficulty: 7, distance: 8, duration: 6, elevationGain: 1200, startPoint: "Selo", mountainId: "m7" }],
  },
  {
    id: "m8", name: "Mount Semeru", region: "Jawa Timur", province: "Jawa Timur", elevation: 3676, difficultyLevel: 8,
    description: "Gunung tertinggi di Jawa dengan medan pasir vulkanik",
    routes: [{ id: "r11", name: "Ranjah", difficulty: 8, distance: 15, duration: 15, elevationGain: 1476, startPoint: "Ranjah (2.200 mdpl)", mountainId: "m8" }],
  },
  {
    id: "m9", name: "Mount Rinjani", region: "NTB", province: "Nusa Tenggara Barat", elevation: 3726, difficultyLevel: 7,
    description: "Gunung favorit dengan Danau Segara Anak yang eksotis",
    routes: [
      { id: "r12", name: "Sembalun", difficulty: 6, distance: 14, duration: 13, elevationGain: 2576, startPoint: "Sembalun (1.150 mdpl)", mountainId: "m9" },
      { id: "r13", name: "Torean", difficulty: 8, distance: 16, duration: 15, elevationGain: 2926, startPoint: "Torean (800 mdpl)", mountainId: "m9" },
    ],
  },
  {
    id: "m10", name: "Mount Bromo", region: "Jawa Timur", province: "Jawa Timur", elevation: 2329, difficultyLevel: 1,
    description: "Gunung ikonik dengan lautan pasir",
    routes: [{ id: "r14", name: "Penanjakan", difficulty: 1, distance: 3.5, duration: 2.5, elevationGain: 600, startPoint: "Cemoro Lawang (2.200 mdpl)", mountainId: "m10" }],
  },
  {
    id: "m11", name: "Mount Ijen", region: "Jawa Timur", province: "Jawa Timur", elevation: 2386, difficultyLevel: 2,
    description: "Terkenal dengan blue fire dan kawah asam",
    routes: [{ id: "r15", name: "Paltuding", difficulty: 2, distance: 3, duration: 1.5, elevationGain: 536, startPoint: "Paltuding (1.850 mdpl)", mountainId: "m11" }],
  },
  {
    id: "m12", name: "Mount Kerinci", region: "Jambi", province: "Jambi", elevation: 3805, difficultyLevel: 7,
    description: "Gunung tertinggi di Sumatera",
    routes: [{ id: "r16", name: "Kersik Tuo", difficulty: 7, distance: 14, duration: 13, elevationGain: 2305, startPoint: "Kersik Tuo (1.500 mdpl)", mountainId: "m12" }],
  },
  {
    id: "m13", name: "Mount Tambora", region: "NTB", province: "Nusa Tenggara Barat", elevation: 2720, difficultyLevel: 5,
    description: "Gunung bersejarah dengan kawah raksasa",
    routes: [{ id: "r17", name: "Calabai", difficulty: 5, distance: 10, duration: 9, elevationGain: 1820, startPoint: "Calabai", mountainId: "m13" }],
  },
  {
    id: "m14", name: "Mount Lawu", region: "Jawa Tengah", province: "Jawa Tengah", elevation: 3265, difficultyLevel: 4,
    description: "Gunung mistis dengan pemandangan indah",
    routes: [
      { id: "r18", name: "Cemoro Kandang", difficulty: 4, distance: 8, duration: 7, elevationGain: 1500, startPoint: "Cemoro Kandang", mountainId: "m14" },
      { id: "r19", name: "Candi Sukuh", difficulty: 3, distance: 6, duration: 5, elevationGain: 1200, startPoint: "Candi Sukuh", mountainId: "m14" },
    ],
  },
  {
    id: "m15", name: "Mount Slamet", region: "Jawa Tengah", province: "Jawa Tengah", elevation: 3428, difficultyLevel: 6,
    description: "Gunung tertinggi di Jawa Tengah",
    routes: [{ id: "r20", name: "Bambangan", difficulty: 6, distance: 11, duration: 10, elevationGain: 2000, startPoint: "Bambangan", mountainId: "m15" }],
  },
];
