import { useState, useEffect, type ComponentType } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  ArrowLeftIcon, MapPinIcon, GlobeAsiaAustraliaIcon,
  ShieldCheckIcon, SunIcon, FireIcon, ClockIcon,
  CurrencyDollarIcon, ChevronRightIcon,
  InformationCircleIcon, ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  fetchMountainById, fetchRoutes, fetchDifficultyScale,
  difficultyLabels, difficultyColors,
  type MountainDTO, type RouteDTO, type DifficultyScaleItem,
} from "@/services/mountainData";

// ─── Helpers ───
const difficultyGradient: Record<number, string> = {
  1: "from-green-500 to-emerald-600",
  2: "from-emerald-500 to-teal-600",
  3: "from-teal-500 to-cyan-600",
  4: "from-blue-500 to-indigo-600",
  5: "from-indigo-500 to-violet-600",
  6: "from-orange-500 to-red-600",
  7: "from-red-500 to-rose-600",
  8: "from-rose-600 to-pink-700",
  9: "from-pink-600 to-purple-700",
  10: "from-purple-600 to-violet-800",
};

function DifficultyBar({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-4 rounded-sm transition-colors ${
              i < level
                ? i <= 3 ? "bg-green-500"
                  : i <= 6 ? "bg-orange-500"
                  : "bg-red-500"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-gray-600">Level {level}</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold font-display text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function MountainDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [mountain, setMountain] = useState<MountainDTO | null>(null);
  const [routes, setRoutes] = useState<RouteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [difficultyScale, setDifficultyScale] = useState<DifficultyScaleItem[]>([]);
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [mtn, scale] = await Promise.all([
          fetchMountainById(id),
          fetchDifficultyScale(),
        ]);
        if (!mtn) {
          setError("Gunung tidak ditemukan");
          return;
        }
        setMountain(mtn);
        setDifficultyScale(scale);

        // Use routes from mountain data if already loaded, otherwise fetch separately
        if (mtn.routes && mtn.routes.length > 0) {
          setRoutes(mtn.routes);
        } else {
          try {
            const routeData = await fetchRoutes(id);
            if (routeData.length > 0) setRoutes(routeData);
          } catch {
            // no fallback routes available
          }
        }
      } catch {
        setError("Gagal memuat data gunung");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded-2xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl" />
              ))}
            </div>
            <div className="h-40 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !mountain) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto mb-6 bg-danger-50 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="w-10 h-10 text-danger-500" />
          </div>
          <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
            Gunung Tidak Ditemukan
          </h1>
          <p className="text-gray-600 mb-6">{error || "Data gunung tidak tersedia."}</p>
          <Link
            href="/#trails"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Kembali ke Direktori Jalur
          </Link>
        </div>
      </div>
    );
  }

  const diffColor = difficultyColors[mountain.difficultyLevel];
  const diffLabel = difficultyLabels[mountain.difficultyLevel] ?? "Tidak Diketahui";
  const diffInfo = difficultyScale.find((d) => d.level === mountain.difficultyLevel);

  return (
    <>
      <Head>
        <title>{mountain.name} — Detail Gunung | Jejak</title>
        <meta name="description" content={mountain.description || `Info lengkap tentang ${mountain.name}`} />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* ─── Top Navigation ─── */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link
              href="/#trails"
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors font-medium text-sm"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Kembali
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-900 font-bold font-display text-sm"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <GlobeAsiaAustraliaIcon className="w-4 h-4 text-white" />
              </div>
              Jejak
            </Link>
          </div>
        </div>

        {/* ─── Hero Header ─── */}
        <div className={`bg-gradient-to-br ${difficultyGradient[mountain.difficultyLevel] || "from-primary-500 to-primary-700"} text-white`}>
          <div className="max-w-5xl mx-auto px-4 py-12 lg:py-16">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-white/20 backdrop-blur`}>
                {mountain.region}
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/20 backdrop-blur">
                {mountain.province}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-tight mb-4">
              {mountain.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" />
                ⬆ {mountain.elevation.toLocaleString()}m
              </span>
              {mountain.estimatedDuration && (
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  Estimasi {mountain.estimatedDuration} jam
                </span>
              )}
              <span className="flex items-center gap-1">
                <FireIcon className="w-4 h-4" />
                {routes.length} rute pendakian
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          {/* ─── Difficulty & Stats ─── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Tingkat Kesulitan</h3>
                <div className="mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${diffColor?.bg} ${diffColor?.text}`}>
                    <ShieldCheckIcon className="w-4 h-4" />
                    {diffLabel}
                  </span>
                </div>
                <DifficultyBar level={mountain.difficultyLevel} />
                {diffInfo && (
                  <p className="text-sm text-gray-500 mt-2">{diffInfo.description}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={MapPinIcon}
                  label="Elevasi"
                  value={`${mountain.elevation.toLocaleString()}m`}
                  color="bg-blue-500"
                />
                <StatCard
                  icon={FireIcon}
                  label="Jumlah Rute"
                  value={`${routes.length} rute`}
                  color="bg-orange-500"
                />
                {mountain.estimatedDuration && (
                  <StatCard
                    icon={ClockIcon}
                    label="Estimasi Waktu"
                    value={`${mountain.estimatedDuration} jam`}
                    color="bg-indigo-500"
                  />
                )}
                <StatCard
                  icon={ShieldCheckIcon}
                  label="Tingkat"
                  value={`Lv.${mountain.difficultyLevel}`}
                  color="bg-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* ─── Description ─── */}
          {mountain.description && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold font-display text-gray-900 mb-3">Tentang {mountain.name}</h3>
              <p className="text-gray-700 leading-relaxed">{mountain.description}</p>
            </div>
          )}

          {/* ─── Routes ─── */}
          <div>
            <h2 className="text-2xl font-bold font-display text-gray-900 mb-6">
              Jalur Pendakian
              <span className="text-gray-400 font-normal text-lg ml-2">({routes.length} rute)</span>
            </h2>
            {routes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                <MapPinIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada data rute untuk gunung ini</p>
              </div>
            ) : (
              <div className="space-y-4">
                {routes.map((route, idx) => {
                  const rDiffColor = difficultyColors[route.difficulty];
                  const rDiffLabel = difficultyLabels[route.difficulty] ?? "Tidak Diketahui";
                  const isExpanded = expandedRoute === route.id;

                  return (
                    <div
                      key={route.id}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
                    >
                      <button
                        onClick={() => setExpandedRoute(isExpanded ? null : route.id)}
                        className="w-full text-left p-5 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm ${rDiffColor?.bg || "bg-gray-500"}`}>
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold font-display text-gray-900 text-lg truncate">
                              {route.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className={`badge ${rDiffColor?.bg} ${rDiffColor?.text}`}>
                                {rDiffLabel}
                              </span>
                              <span className="text-xs text-gray-500">⬆ {route.elevationGain}m</span>
                              <span className="text-xs text-gray-500">📏 {route.distance}km</span>
                              <span className="text-xs text-gray-500">⏱ {route.duration} jam</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRightIcon
                          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 pt-0 border-t border-gray-50 animate-fade-in">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Start Point</p>
                              <p className="text-sm font-medium text-gray-900">{route.startPoint || "—"}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Elevasi Akhir</p>
                              <p className="text-sm font-medium text-gray-900">{mountain.elevation.toLocaleString()}m</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Elevation Gain</p>
                              <p className="text-sm font-medium text-gray-900">{route.elevationGain ? `${route.elevationGain}m` : "—"}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Durasi</p>
                              <p className="text-sm font-medium text-gray-900">{route.duration ? `${route.duration} jam` : "—"}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Jarak</p>
                              <p className="text-sm font-medium text-gray-900">{route.distance ? `${route.distance} km` : "—"}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Tingkat Kesulitan</p>
                              <p className={`text-sm font-medium ${rDiffColor?.text || "text-gray-900"}`}>{rDiffLabel}</p>
                            </div>
                            {route.waypoints && route.waypoints.length > 0 && (
                              <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Waypoints</p>
                                <p className="text-sm font-medium text-gray-900">{route.waypoints.length} titik</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ─── Permits ─── */}
          {mountain.permits && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CurrencyDollarIcon className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold font-display text-gray-900">Izin & Biaya Masuk</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Wajib Izin</p>
                  <p className={`text-lg font-bold font-display ${mountain.permits.required ? "text-red-600" : "text-green-600"}`}>
                    {mountain.permits.required ? "Ya" : "Tidak"}
                  </p>
                </div>
                {mountain.permits.prices && (
                  <>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Domestik</p>
                      <p className="text-lg font-bold font-display text-gray-900">
                        Rp {mountain.permits.prices.local.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Asing</p>
                      <p className="text-lg font-bold font-display text-gray-900">
                        Rp {mountain.permits.prices.foreign.toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ─── Weather Info ─── */}
          {mountain.weatherInfo && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <SunIcon className="w-5 h-5 text-accent-500" />
                <h3 className="text-lg font-bold font-display text-gray-900">Informasi Cuaca & Musim</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {mountain.weatherInfo.avgTemp !== undefined && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Suhu Rata-rata</p>
                    <p className="text-xl font-bold font-display text-gray-900">{mountain.weatherInfo.avgTemp}°C</p>
                  </div>
                )}
                {mountain.weatherInfo.humidity !== undefined && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Kelembapan</p>
                    <p className="text-xl font-bold font-display text-gray-900">{mountain.weatherInfo.humidity}%</p>
                  </div>
                )}
                {mountain.weatherInfo.rainyDays !== undefined && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Hari Hujan/Tahun</p>
                    <p className="text-xl font-bold font-display text-gray-900">{mountain.weatherInfo.rainyDays} hr</p>
                  </div>
                )}
                {mountain.weatherInfo.bestSeason && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Musim Terbaik</p>
                    <p className="text-xl font-bold font-display text-gray-900">{mountain.weatherInfo.bestSeason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── Rules ─── */}
          {mountain.rules && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <InformationCircleIcon className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-bold font-display text-gray-900">Aturan Pendakian</h3>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{mountain.rules}</p>
            </div>
          )}

          {/* ─── Map Section ─── */}
          {mountain.latitude && mountain.longitude && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPinIcon className="w-5 h-5 text-danger-500" />
                <h3 className="text-lg font-bold font-display text-gray-900">Lokasi</h3>
              </div>
              <div className="bg-gray-900 rounded-xl overflow-hidden aspect-[3/1] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <MapPinIcon className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">{mountain.latitude?.toFixed(4)}, {mountain.longitude?.toFixed(4)}</p>
                    <p className="text-xs text-white/40 mt-1">{mountain.region}, {mountain.province}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Back to trails ─── */}
          <div className="text-center pb-12">
            <Link
              href="/#trails"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Kembali ke Direktori Jalur
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
