import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon,
  XMarkIcon, Bars3Icon, ChevronRightIcon,
  ShieldCheckIcon, MapIcon, UserGroupIcon, GlobeAsiaAustraliaIcon,
  PhoneIcon, CurrencyDollarIcon, SparklesIcon, ArrowTrendingUpIcon,
  StarIcon, MagnifyingGlassIcon, FunnelIcon, ArrowsRightLeftIcon,
  SunIcon, FireIcon, ClockIcon, DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { api } from "@/services/api";
import Dropdown from "@/components/Dropdown";
import {
  fetchMountains, fetchDifficultyScale, flattenTrails,
  difficultyLabels, difficultyColors,
  type TrailItem, type MountainDTO, type DifficultyScaleItem,
} from "@/services/mountainData";

// ─── Types ───
interface Stats { totalUsers: number; activeTrips: number; mountainsCovered: number; communities: number; }
type SortMode = "default" | "keramaian" | "trending" | "pengunjung";
interface Review { id: string; userName: string; userAvatar: string; rating: number; date: string; text: string; trailName: string; helpful: number; verified: boolean; }
interface Article { id: string; title: string; excerpt: string; category: string; author: string; readTime: string; date: string; image: string; }
interface ForecastDay { day: string; icon: string; condition: string; temp: number; humidity: number; wind: number; hazard?: { level: "low" | "medium" | "high"; text: string }; }

// ─── Mock Data (UI sections w/o API) ───
const mockReviews: Review[] = [
  { id:"r1", userName:"Dewi Lestari", userAvatar:"DL", rating:5, date:"12 Mar 2024", text:"Pendakian luar biasa! Jalur terawat, pemandangan indah dari puncak. Pastikan bawa jaket tebal karena dingin banget.", trailName:"Cibodas - Mount Gede", helpful:48, verified:true },
  { id:"r2", userName:"Fajar Nugroho", userAvatar:"FN", rating:4, date:"8 Mar 2024", text:"Jalur Sembalun menantang tapi pemandangan sunrise dari puncak Rinjani benar-benar sepadan. Danau Segara Anak jadi bonus istimewa.", trailName:"Sembalun - Mount Rinjani", helpful:32, verified:true },
  { id:"r3", userName:"Ahmad Wijaya", userAvatar:"AW", rating:5, date:"5 Mar 2024", text:"Selo adalah jalur terbaik untuk pemula. Savana di Merbabu bikin betah.", trailName:"Selo - Mount Merbabu", helpful:56, verified:true },
  { id:"r4", userName:"Rina Wati", userAvatar:"RW", rating:5, date:"28 Feb 2024", text:"Fuji via Yoshida Trail tidak boleh terlewatkan! Infrastrukturnya sangat baik.", trailName:"Yoshida Trail - Mount Fuji", helpful:71, verified:true },
  { id:"r5", userName:"Budi Santoso", userAvatar:"BS", rating:4, date:"20 Feb 2024", text:"Ranjah ke Semeru menantang banget. Lautan pasir luas dan tanjakan pasir bikin napas ngos-ngosan.", trailName:"Ranjah - Mount Semeru", helpful:27, verified:true },
  { id:"r6", userName:"Sarah Putri", userAvatar:"SP", rating:5, date:"15 Feb 2024", text:"EBC adalah mimpi yang jadi kenyataan. Setiap langkah di Himalaya terasa magis.", trailName:"Everest Base Camp", helpful:93, verified:false },
  { id:"r7", userName:"Rizky Pratama", userAvatar:"RP", rating:3, date:"10 Feb 2024", text:"Torean sangat ekstrem, cocok untuk yang sudah berpengalaman.", trailName:"Torean - Mount Rinjani", helpful:15, verified:true },
  { id:"r8", userName:"Maya Sari", userAvatar:"MS", rating:5, date:"5 Feb 2024", text:"Kawah Ijen pagi-pagi buta demi blue fire. Lelah hilang begitu melihat fenomena langka itu.", trailName:"Kawah Ijen - Mount Ijen", helpful:44, verified:true },
];

const articles: Article[] = [
  { id:"a1", title:"10 Tips Penting untuk Pendaki Pemula", excerpt:"Mulai petualangan mendaki gunung dengan persiapan yang tepat.", category:"Tips", author:"Ranger Budi", readTime:"5 menit", date:"20 Mar 2024", image:"from-primary-500 to-primary-700" },
  { id:"a2", title:"Mengenal Hipotermia: Gejala, Pencegahan, dan Penanganan", excerpt:"Kondisi darurat yang sering dialami pendaki. Kenali gejala awal.", category:"Safety", author:"Dr. Sari", readTime:"8 menit", date:"18 Mar 2024", image:"from-danger-500 to-danger-700" },
  { id:"a3", title:"Review Carrier Eiger 45L: 5 Pendakian Bersama", excerpt:"Setelah 5 kali membawa carrier ini ke berbagai gunung.", category:"Gear Review", author:"DewiPendaki", readTime:"6 menit", date:"15 Mar 2024", image:"from-secondary-500 to-secondary-700" },
  { id:"a4", title:"Panduan Lengkap Mendaki Gunung Fuji", excerpt:"Dari jalur mana naik? Berapa biayanya? Kapan musim terbaik?", category:"Panduan", author:"Jejak Team", readTime:"10 menit", date:"12 Mar 2024", image:"from-red-500 to-rose-700" },
  { id:"a5", title:"Perbedaan Jalur Rinjani: Sembalun vs Torean", excerpt:"Bingung pilih jalur mana? Simak perbandingan lengkap.", category:"Info Jalur", author:"AlexMerbabu", readTime:"7 menit", date:"10 Mar 2024", image:"from-orange-500 to-red-600" },
  { id:"a6", title:"Cara Membaca Peta Topografi untuk Pendaki", excerpt:"Kemampuan dasar yang wajib dimiliki setiap pendaki.", category:"Pendidikan", author:"Ranger Sari", readTime:"8 menit", date:"8 Mar 2024", image:"from-teal-500 to-cyan-600" },
];

const forecastDays: ForecastDay[] = [
  { day:"Hari Ini", icon:"sunny", condition:"Berawan Sebagian", temp:18, humidity:72, wind:12, hazard:{ level:"low" as const, text:"Kondisi aman untuk pendakian" } },
  { day:"Besok", icon:"cloud", condition:"Hujan Ringan", temp:15, humidity:85, wind:18, hazard:{ level:"medium" as const, text:"Waspada jalur licin, bawa jas hujan" } },
  { day:"H+2", icon:"fog", condition:"Kabut Tebal", temp:12, humidity:92, wind:8, hazard:{ level:"high" as const, text:"Kabut tebal berpotensi, pertimbangkan penundaan" } },
  { day:"H+3", icon:"sunny", condition:"Cerah Berawan", temp:20, humidity:65, wind:10, hazard:{ level:"low" as const, text:"Kondisi ideal untuk pendakian" } },
  { day:"H+4", icon:"cloud", condition:"Mendung", temp:17, humidity:75, wind:14, hazard:{ level:"low" as const, text:"Kondisi aman, cuaca stabil" } },
];

const testimonials = [
  { name:"Dewi Lestari", role:"Professional Hiker", avatar:"DL", quote:"Jejak made my Rinjani summit absolutely seamless. The real-time weather alerts and SOS feature gave me peace of mind.", rating:5 },
  { name:"Ahmad Fauzi", role:"Trip Operator", avatar:"AF", quote:"Managing bookings and communicating with hikers has never been easier. This platform revolutionized my business.", rating:5 },
  { name:"Sarah Wijaya", role:"First-time Climber", avatar:"SW", quote:"As a beginner, I felt completely supported. The community forum helped me find the perfect team.", rating:5 },
];

const features = [
  { icon:ShieldCheckIcon, title:"Real-time Safety", description:"SOS alerts, weather monitoring, and check-in system keep every hiker safe.", color:"text-primary-600", bg:"bg-primary-50" },
  { icon:MapIcon, title:"Offline Maps", description:"Download detailed topographic maps before your trip. Navigate without internet.", color:"text-secondary-600", bg:"bg-secondary-50" },
  { icon:UserGroupIcon, title:"Community & Teams", description:"Find climbing partners, join group expeditions, share experiences.", color:"text-accent-600", bg:"bg-accent-50" },
  { icon:CurrencyDollarIcon, title:"Marketplace", description:"Buy, sell, and rent gear. Book certified guides with secure escrow payments.", color:"text-emerald-600", bg:"bg-emerald-50" },
  { icon:GlobeAsiaAustraliaIcon, title:"Mountain Database", description:"Comprehensive info on Indonesia's 28+ mountains — trails, permits, ratings.", color:"text-blue-600", bg:"bg-blue-50" },
  { icon:PhoneIcon, title:"Emergency Response", description:"One-tap SOS with GPS location sharing. Integrated with SAR teams.", color:"text-danger-600", bg:"bg-danger-50" },
];

// ─── Component ───
export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [stats, setStats] = useState<Stats>({ totalUsers:0, activeTrips:0, mountainsCovered:0, communities:0 });

  // ─── Trail data state ───
  const [trails, setTrails] = useState<TrailItem[]>([]);
  const [trailsLoading, setTrailsLoading] = useState(true);
  const [trailsError, setTrailsError] = useState<string>();
  const [trailSearch, setTrailSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<number>(0);
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [selectedTrail, setSelectedTrail] = useState<TrailItem | null>(null);
  const [compareA, setCompareA] = useState<TrailItem | null>(null);
  const [compareB, setCompareB] = useState<TrailItem | null>(null);
  const [articleSearch, setArticleSearch] = useState("");
  const [articleCategory, setArticleCategory] = useState("all");
  const [weatherMountain, setWeatherMountain] = useState("");
  const [calorieWeight, setCalorieWeight] = useState(65);
  const [calorieHours, setCalorieHours] = useState(8);
  const calorieBurn = Math.round(calorieWeight * 5.5 * calorieHours);
  const pageSize = 12;
  const [trailPage, setTrailPage] = useState(0);

  // ─── API data state ───
  const [mountains, setMountains] = useState<MountainDTO[]>([]);
  const [difficultyScale, setDifficultyScale] = useState<DifficultyScaleItem[]>([]);
  const [difficultyLoading, setDifficultyLoading] = useState(true);
  const [difficultyError, setDifficultyError] = useState<string>();

  // Region list available via mountains.map(m => m.region) if needed

  useEffect(() => {
    if (status === "authenticated" && session) router.replace("/dashboard");
  }, [status, session, router]);

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get("/public/stats"); setStats(data); }
      catch { setStats({ totalUsers:12450, activeTrips:342, mountainsCovered:28, communities:156 }); }
    })();
  }, []);

  // Fetch mountains + flatten into trails
  useEffect(() => {
    (async () => {
      setTrailsLoading(true);
      setTrailsError(undefined);
      try {
        const data = await fetchMountains();
        setMountains(data);
        const flat = flattenTrails(data);
        setTrails(flat);
        if (data.length > 0 && !weatherMountain) {
          setWeatherMountain(data[0].name);
        }
      } catch {
        setTrailsError("Gagal memuat data gunung");
        setMountains([]);
        setTrails([]);
      } finally { setTrailsLoading(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setDifficultyLoading(true);
      setDifficultyError(undefined);
      try {
        const data = await fetchDifficultyScale();
        setDifficultyScale(data);
      } catch { setDifficultyError("Gagal memuat data"); setDifficultyScale([]); }
      finally { setDifficultyLoading(false); }
    })();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { redirect:false, email, password });
    if (result?.error) { setError("Invalid email or password"); setLoading(false); }
    else router.push("/dashboard");
  };

  const handleSocialLogin = (provider: string) => signIn(provider, { callbackUrl:"/dashboard" });

  const filteredTrails = trails
    .filter((t) => {
      if (diffFilter !== 0 && t.difficulty !== diffFilter) return false;
      if (trailSearch.trim()) {
        const q = trailSearch.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.mountainName.toLowerCase().includes(q) || t.region.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortMode) {
        case "trending": return Number(b.trending) - Number(a.trending);
        case "pengunjung": return b.reviews - a.reviews;
        default: return 0;
      }
    });

  const totalTrailPages = Math.max(1, Math.ceil(filteredTrails.length / pageSize));
  const pagedTrails = filteredTrails.slice(trailPage * pageSize, (trailPage + 1) * pageSize);

  const compareResult = compareA && compareB
    ? {
        elevation: compareA.elevation - compareB.elevation,
        distance: +(compareA.distance - compareB.distance).toFixed(1),
        reviews: compareA.reviews - compareB.reviews,
        rating: +(compareA.rating - compareB.rating).toFixed(1),
        durationA: compareA.duration,
        durationB: compareB.duration,
        diffA: compareA.difficulty,
        diffB: compareB.difficulty,
      }
    : null;

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-green-950 to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-display">Preparing your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Jejak — Indonesia's Mountain Ecosystem Platform</title>
        <meta name="description" content="Safety, conservation, and community — united under one peak." />
      </Head>

      <div className="min-h-screen bg-white font-sans">
        {/* ─── Navbar ─── */}
        <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm" : "bg-gray-900/60 backdrop-blur-sm"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <GlobeAsiaAustraliaIcon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-xl font-bold font-display ${scrolled ? "text-gray-900" : "text-white"}`}>Jejak</span>
              </div>
              <div className="hidden md:flex items-center gap-8">
                <a href="#trails" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-primary-600" : "text-white/70 hover:text-white"}`}>Jalur</a>
                <a href="#compare" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-primary-600" : "text-white/70 hover:text-white"}`}>Bandingkan</a>
                <a href="#reviews" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-primary-600" : "text-white/70 hover:text-white"}`}>Ulasan</a>
                <a href="#weather" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-primary-600" : "text-white/70 hover:text-white"}`}>Cuaca</a>
                <a href="#articles" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-primary-600" : "text-white/70 hover:text-white"}`}>Artikel</a>
                <button onClick={() => setShowLogin(true)} className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/25">Sign In</button>
              </div>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? "hover:bg-gray-100 text-gray-600" : "hover:bg-white/10 text-white/70"}`}>
                {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            </div>
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
                <div className="flex flex-col gap-3">
                  {[{ label:"Jalur", href:"#trails" },{ label:"Bandingkan", href:"#compare" },{ label:"Ulasan", href:"#reviews" },{ label:"Cuaca", href:"#weather" },{ label:"Artikel", href:"#articles" }].map((l) => (
                    <a key={l.href} href={l.href} onClick={() => setMobileMenuOpen(false)} className={`px-4 py-2.5 text-sm font-medium rounded-xl ${scrolled ? "text-gray-700 hover:bg-gray-50" : "text-white/80 hover:bg-white/10"}`}>{l.label}</a>
                  ))}
                  <button onClick={() => { setMobileMenuOpen(false); setShowLogin(true); }} className="mx-4 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors">Sign In</button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* ─── HERO ─── */}
        <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-green-950 to-gray-900">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-secondary-500/10 rounded-full blur-3xl" />
            <svg className="absolute bottom-0 left-0 right-0 w-full h-48 text-gray-900" viewBox="0 0 1440 200" fill="currentColor" preserveAspectRatio="none">
              <path d="M0,160 C240,100 360,200 480,140 C600,80 720,180 840,120 C960,60 1080,160 1200,100 C1320,40 1380,80 1440,60 L1440,200 L0,200 Z" />
            </svg>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full border border-white/10 mb-6">
                  <SparklesIcon className="w-4 h-4 text-accent-400" />
                  <span className="text-sm text-gray-300">#1 Mountain Platform in Indonesia</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold font-display text-white leading-tight mb-6">
                  Conquer<br />
                  <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-accent-400 bg-clip-text text-transparent">Every Peak</span><br />
                  Stay Safe.
                </h1>
                <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl mb-8">Indonesia's unified platform for hiker safety, conservation, and community empowerment.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => setShowLogin(true)} className="group px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all hover:shadow-xl hover:shadow-primary-500/30 flex items-center justify-center gap-2 text-lg">
                    Get Started <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <a href="#trails" className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 text-lg">Explore Trails</a>
                </div>
                <div className="mt-12 grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
                  <div><p className="text-3xl font-bold font-display text-white">{stats.totalUsers.toLocaleString()}+</p><p className="text-sm text-gray-400 mt-1">Active Users</p></div>
                  <div><p className="text-3xl font-bold font-display text-white">{stats.mountainsCovered}</p><p className="text-sm text-gray-400 mt-1">Mountains</p></div>
                  <div><p className="text-3xl font-bold font-display text-white">{stats.communities}</p><p className="text-sm text-gray-400 mt-1">Communities</p></div>
                </div>
              </div>
              <div className="hidden lg:grid grid-cols-2 gap-4 animate-fade-in">
                {[{ label:"Real-time SOS", icon:ShieldCheckIcon, color:"from-emerald-400 to-emerald-600" },{ label:"Offline Maps", icon:MapIcon, color:"from-blue-400 to-blue-600" },{ label:"Gear Marketplace", icon:CurrencyDollarIcon, color:"from-accent-400 to-accent-600" },{ label:"Community", icon:UserGroupIcon, color:"from-purple-400 to-purple-600" }].map((item, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}><item.icon className="w-6 h-6 text-white" /></div>
                    <p className="text-white font-semibold font-display">{item.label}</p>
                    <p className="text-gray-400 text-sm mt-1">Available 24/7</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── STATS BAR ─── */}
        <section className="relative z-10 -mt-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
              {[{ icon:UserGroupIcon, value:stats.totalUsers.toLocaleString(), label:"Total Users", color:"text-primary-600", bg:"bg-primary-50" },{ icon:MapIcon, value:stats.activeTrips.toLocaleString(), label:"Active Trips", color:"text-secondary-600", bg:"bg-secondary-50" },{ icon:GlobeAsiaAustraliaIcon, value:stats.mountainsCovered, label:"Mountains Covered", color:"text-accent-600", bg:"bg-accent-50" },{ icon:ArrowTrendingUpIcon, value:`${stats.communities}+`, label:"Communities", color:"text-emerald-600", bg:"bg-emerald-50" }].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}><stat.icon className={`w-6 h-6 ${stat.color}`} /></div>
                  <p className="text-2xl font-bold font-display text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section className="py-24 lg:py-32 px-4" id="features">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Platform Features</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mt-3 mb-4">Everything You Need for a Safe Summit</h2>
              <p className="text-lg text-gray-600">From planning to return, Jejak has you covered.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {features.map((feature, i) => (
                <div key={i} className=" group bg-white rounded-2xl border border-gray-100 p-6 lg:p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}><feature.icon className={`w-7 h-7 ${feature.color}`} /></div>
                  <h3 className="text-lg font-bold font-display text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ 1. DIREKTORI JALUR ═══════ */}
        <section id="trails" className="py-24 lg:py-32 px-4 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Trail Directory</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mt-3 mb-4">
                {trailsLoading ? "Memuat..." : `${trails.length}+ Hiking Trails`}
              </h2>
              <p className="text-lg text-gray-600">Data real dari database. Filter berdasarkan tingkat kesulitan, cari jalur, dan urutkan.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={trailSearch} onChange={(e) => { setTrailSearch(e.target.value); setTrailPage(0); }} placeholder="Search trails..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
                <Dropdown<number>
                  value={diffFilter}
                  onChange={(v) => { setDiffFilter(v); setTrailPage(0); }}
                  options={[
                    { value: 0, label: "All Levels" },
                    ...difficultyScale.map((d) => ({
                      value: d.level,
                      label: d.label,
                      description: d.description,
                      badge: { text: `Lv.${d.level}`, className: "bg-gray-100 text-gray-600" },
                    })),
                  ]}
                  loading={difficultyLoading}
                  error={difficultyError}
                  className="min-w-[180px]"
                  icon={FunnelIcon}
                  searchable
                  emptyMessage="Tidak ada level"
                />
                <Dropdown<SortMode>
                  value={sortMode}
                  onChange={(v) => { setSortMode(v); setTrailPage(0); }}
                  options={[
                    { value: "default", label: "Default" },
                    { value: "trending", label: "Trending" },
                    { value: "pengunjung", label: "Populer" },
                  ]}
                  className="min-w-[150px]"
                  icon={ArrowTrendingUpIcon}
                />
              </div>
              <div className="mt-3 text-sm text-gray-500">
                {trailsLoading
                  ? "Memuat data..."
                  : `Menampilkan ${filteredTrails.length} dari ${trails.length} jalur${filteredTrails.length > pageSize ? ` (halaman ${trailPage + 1} dari ${totalTrailPages})` : ""}`
                }
              </div>
            </div>

            {/* Loading skeleton */}
            {trailsLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="h-2 bg-gray-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-100 rounded w-1/2" />
                      <div className="flex gap-3"><div className="h-3 bg-gray-100 rounded w-16" /><div className="h-3 bg-gray-100 rounded w-16" /><div className="h-3 bg-gray-100 rounded w-16" /></div>
                      <div className="flex gap-2"><div className="h-6 bg-gray-100 rounded-full w-20" /><div className="h-6 bg-gray-100 rounded-full w-16" /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {trailsError && !trailsLoading && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-danger-50 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-gray-600 font-medium">{trailsError}</p>
                <p className="text-sm text-gray-400 mt-1">Gunakan data offline yang tersedia</p>
              </div>
            )}

            {/* Trail cards */}
            {!trailsLoading && !trailsError && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pagedTrails.map((trail) => (
                  <div key={trail.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer" onClick={() => setSelectedTrail(selectedTrail?.id === trail.id ? null : trail)}>
                    <div className={`h-2 ${trail.image}`} />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold font-display text-gray-900">{trail.name}</h3>
                          <p className="text-sm text-gray-500">{trail.mountainName} · {trail.region}</p>
                        </div>
                        {trail.trending && <span className="flex items-center gap-1 px-2 py-0.5 bg-accent-100 text-accent-700 text-xs font-medium rounded-full"><FireIcon className="w-3 h-3" />Trending</span>}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-3 mb-3">
                        <span className="text-xs text-gray-500">⬆ {trail.elevation.toLocaleString()}m</span>
                        <span className="text-xs text-gray-500">📏 {trail.distance}km</span>
                        <span className="text-xs text-gray-500">⏱ {trail.duration}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`badge ${difficultyColors[trail.difficulty]?.bg ?? "bg-gray-100"} ${difficultyColors[trail.difficulty]?.text ?? "text-gray-600"}`}>
                          {trail.difficultyLabel}
                        </span>
                        <span className="badge bg-gray-100 text-gray-600">⭐ {trail.rating}</span>
                      </div>
                      {selectedTrail?.id === trail.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-fade-in">
                          <p className="text-sm text-gray-700">{trail.description}</p>
                          <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Basecamp</p><p className="text-sm text-gray-700">{trail.basecamp}</p></div>
                          <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Start Point</p><p className="text-sm text-gray-700">{trail.startPoint}</p></div>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-gray-400">⬆ Elevation Gain: {trail.elevationGain}m</span>
                            <span className="text-xs text-gray-400">{trail.reviews} ulasan</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {filteredTrails.length === 0 && !trailsLoading && (
                  <div className="col-span-full text-center py-16">
                    <MapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Tidak ada jalur yang cocok</p>
                    <button onClick={() => { setTrailSearch(""); setDiffFilter(0); setSortMode("default"); setTrailPage(0); }} className="mt-3 text-primary-600 font-medium text-sm">Reset filter</button>
                  </div>
                )}
              </div>
            )}

            {totalTrailPages > 1 && !trailsLoading && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setTrailPage(Math.max(0, trailPage - 1))} disabled={trailPage === 0} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30">← Prev</button>
                {Array.from({ length: Math.min(totalTrailPages, 7) }).map((_, i) => {
                  const start = Math.max(0, Math.min(trailPage - 3, totalTrailPages - 7));
                  const pageNum = start + i;
                  return (<button key={pageNum} onClick={() => setTrailPage(pageNum)} className={`w-9 h-9 text-sm rounded-xl ${trailPage === pageNum ? "bg-primary-500 text-white" : "border border-gray-200 hover:bg-gray-50"}`}>{pageNum + 1}</button>);
                })}
                <button onClick={() => setTrailPage(Math.min(totalTrailPages - 1, trailPage + 1))} disabled={trailPage === totalTrailPages - 1} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30">Next →</button>
              </div>
            )}
          </div>
        </section>

        {/* ═══════ 2. BANDINGKAN JALUR ═══════ */}
        <section id="compare" className="py-24 lg:py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Compare Trails</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mt-3 mb-4">Side-by-Side Trail Comparison</h2>
              <p className="text-lg text-gray-600">Bandingkan dua jalur pendakian secara berdampingan — elevasi, jarak, waktu, tingkat tantangan.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {(["A","B"] as const).map((label) => {
                const val = label === "A" ? compareA : compareB;
                const setVal = label === "A" ? setCompareA : setCompareB;
                return (
                  <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Pilih Jalur {label}</label>
                    <Dropdown
                      value={val?.id || ""}
                      onChange={(id) => { const f = trails.find((t) => t.id === id); setVal(f || null); }}
                      options={trails.map((t) => ({
                        value: t.id,
                        label: `${t.name}`,
                        description: `${t.mountainName} — ⬆${t.elevation}m 📏${t.distance}km`,
                        badge: { text: t.difficultyLabel, className: `${difficultyColors[t.difficulty]?.bg ?? "bg-gray-100"} ${difficultyColors[t.difficulty]?.text ?? "text-gray-600"}` },
                      }))}
                      placeholder="— Pilih jalur —"
                      searchable
                      className="w-full"
                      hint="Pilih dua jalur untuk perbandingan"
                      loading={trailsLoading}
                    />
                  </div>
                );
              })}
            </div>
            {compareA && compareB && compareResult ? (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-fade-in">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Aspek</th>
                      <th className="p-4 text-center font-semibold text-primary-700"><p className="font-display">{compareA.name}</p><p className="text-xs text-gray-500 font-normal">{compareA.mountainName}</p></th>
                      <th className="p-4 text-center font-semibold text-accent-700"><p className="font-display">{compareB.name}</p><p className="text-xs text-gray-500 font-normal">{compareB.mountainName}</p></th>
                      <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Selisih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[{ label:"Elevasi", a:`${compareA.elevation.toLocaleString()}m`, b:`${compareB.elevation.toLocaleString()}m`, diff: compareResult.elevation > 0 ? `+${compareResult.elevation}m` : `${compareResult.elevation}m`, winner: compareResult.elevation > 0 ? "A" : "B" },
                      { label:"Jarak", a:`${compareA.distance}km`, b:`${compareB.distance}km`, diff: compareResult.distance > 0 ? `+${compareResult.distance}km` : `${compareResult.distance}km`, winner: compareResult.distance > 0 ? "A" : "B" },
                      { label:"Durasi", a:compareResult.durationA, b:compareResult.durationB, diff:"—", winner:"none" },
                      { label:"Tingkat Kesulitan", a:`Lv.${compareResult.diffA} (${difficultyLabels[compareResult.diffA] ?? "—"})`, b:`Lv.${compareResult.diffB} (${difficultyLabels[compareResult.diffB] ?? "—"})`, diff:"—", winner:"none" },
                      { label:"Rating", a:`⭐ ${compareA.rating}`, b:`⭐ ${compareB.rating}`, diff:compareResult.rating > 0 ? `+${compareResult.rating}` : `${compareResult.rating}`, winner:compareResult.rating > 0 ? "A" : "B" },
                      { label:"Ulasan", a:compareA.reviews.toLocaleString(), b:compareB.reviews.toLocaleString(), diff:compareResult.reviews > 0 ? `+${compareResult.reviews.toLocaleString()}` : compareResult.reviews.toLocaleString(), winner:compareResult.reviews > 0 ? "A" : "B" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="p-4 font-medium text-gray-700">{row.label}</td>
                        <td className={`p-4 text-center ${row.winner === "A" ? "bg-primary-50/50 font-semibold text-primary-700" : "text-gray-600"}`}>{row.a}</td>
                        <td className={`p-4 text-center ${row.winner === "B" ? "bg-accent-50/50 font-semibold text-accent-700" : "text-gray-600"}`}>{row.b}</td>
                        <td className="p-4 text-center text-gray-500 text-xs">{row.diff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-center gap-4">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-primary-50 border border-primary-200 rounded" /> Jalur A unggul</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-accent-50 border border-accent-200 rounded" /> Jalur B unggul</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <ArrowsRightLeftIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Pilih dua jalur untuk membandingkan</p>
              </div>
            )}
          </div>
        </section>

        {/* ═══════ 3. ULASAN & RATING ═══════ */}
        <section id="reviews" className="py-24 lg:py-32 px-4 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Reviews & Ratings</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mt-3 mb-4">What Hikers Are Saying</h2>
              <p className="text-lg text-gray-600">Ulasan dari pendaki lain untuk cek akurasi info dan kondisi terkini jalur.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[{ label:"Total Ulasan", value:"2,847", icon:StarIcon, color:"text-primary-600", bg:"bg-primary-50" },{ label:"Rating Rata-rata", value:"⭐ 4.7", icon:StarIcon, color:"text-accent-600", bg:"bg-accent-50" },{ label:"Terverifikasi", value:"1,923", icon:ShieldCheckIcon, color:"text-secondary-600", bg:"bg-secondary-50" },{ label:"Pendaki Aktif", value:"12,450+", icon:UserGroupIcon, color:"text-emerald-600", bg:"bg-emerald-50" }].map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                  <p className="text-2xl font-bold font-display text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {mockReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-sm font-bold text-white">{review.userAvatar}</span></div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{review.userName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex">{Array.from({length:5}).map((_,j) => <StarIcon key={j} className={`w-3.5 h-3.5 ${j < review.rating ? "text-yellow-400 fill-current" : "text-gray-200"}`} />)}</div>
                          <span className="text-xs text-gray-400">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    {review.verified && <span className="shrink-0 px-2 py-0.5 bg-primary-50 text-primary-600 text-[10px] font-semibold rounded-full flex items-center gap-1"><ShieldCheckIcon className="w-3 h-3" />Verified</span>}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-400">{review.trailName}</span>
                    <span className="text-xs text-gray-400">👍 {review.helpful}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ 4. PRAKIRAAN CUACA & KALORI ═══════ */}
        <section id="weather" className="py-24 lg:py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Weather & Calories</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mt-3 mb-4">Prakiraan Cuaca & Estimasi Kalori</h2>
              <p className="text-lg text-gray-600">Prakiraan cuaca akurat serta estimasi kalori yang terbakar selama pendakian.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2"><SunIcon className="w-5 h-5 text-accent-500" /><h3 className="text-lg font-bold font-display text-gray-900">Weather Forecast</h3></div>
                  <Dropdown
                    value={weatherMountain}
                    onChange={setWeatherMountain}
                    options={mountains.map((m) => ({ value: m.name, label: m.name, description: `${m.region} · ⬆${m.elevation}m` }))}
                    loading={trailsLoading}
                    placeholder="Pilih gunung..."
                    className="min-w-[200px]"
                    icon={MapIcon}
                    searchable
                  />
                </div>
                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {forecastDays.map((day, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3 text-center hover:bg-gray-100 transition-colors">
                      <p className="text-xs font-semibold text-gray-500 mb-2">{day.day}</p>
                      <div className="text-2xl mb-2">
                        {day.icon === "sunny" ? "\u2600\uFE0F" : day.icon === "cloud" ? "\u2601\uFE0F" : "\U0001F32B\uFE0F"}
                      </div>
                      <p className="text-lg font-bold font-display text-gray-900">{day.temp}°</p>
                      <p className="text-[10px] text-gray-500 mt-1">{day.condition}</p>
                      <div className="flex justify-center gap-2 mt-1">
                        <span className="text-[10px] text-blue-500">💧{day.humidity}%</span>
                        <span className="text-[10px] text-gray-400">💨{day.wind}km/h</span>
                      </div>
                      {day.hazard && (
                        <span className={`mt-2 px-1.5 py-0.5 text-[9px] font-semibold rounded-full block ${
                          day.hazard.level === "high" ? "bg-red-100 text-red-700" :
                          day.hazard.level === "medium" ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                        }`}>{day.hazard.text}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4"><FireIcon className="w-5 h-5 text-danger-500" /><h3 className="text-lg font-bold font-display text-gray-900">Calorie Estimator</h3></div>
                <p className="text-xs text-gray-500 mb-6">Estimasi kalori terbakar berdasarkan berat badan dan durasi pendakian.</p>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">Berat Badan</span><span className="font-semibold text-gray-900">{calorieWeight} kg</span></div>
                    <input type="range" min="40" max="120" value={calorieWeight} onChange={(e) => setCalorieWeight(Number(e.target.value))} className="w-full accent-primary-500" />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-0.5"><span>40 kg</span><span>120 kg</span></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">Durasi Pendakian</span><span className="font-semibold text-gray-900">{calorieHours} jam</span></div>
                    <input type="range" min="1" max="20" value={calorieHours} onChange={(e) => setCalorieHours(Number(e.target.value))} className="w-full accent-primary-500" />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-0.5"><span>1 jam</span><span>20 jam</span></div>
                  </div>
                  <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 text-center text-white">
                    <p className="text-xs text-primary-200 mb-1">Estimasi Kalori Terbakar</p>
                    <p className="text-4xl font-bold font-display">{calorieBurn.toLocaleString()}</p>
                    <p className="text-xs text-primary-200 mt-1">kkal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ 5. PETA & WAYPOINTS ═══════ */}
        <section id="map" className="py-24 lg:py-32 px-4 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Interactive Map</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mt-3 mb-4">Peta & Waypoints</h2>
              <p className="text-lg text-gray-600">Peta interaktif dengan titik-titik navigasi penting untuk setiap jalur pendakian.</p>
            </div>
            <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
              <div className="aspect-[21/9] bg-gradient-to-br from-gray-800 via-green-950 to-gray-900 relative overflow-hidden">
                {/* Simulated topographic lines */}
                <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 400">
                  <path d="M0,200 C100,180 200,220 300,200 C400,180 500,240 600,200 C700,160 750,200 800,180" fill="none" stroke="#4ade80" strokeWidth="0.5" />
                  <path d="M0,220 C100,200 200,240 300,220 C400,200 500,260 600,220 C700,180 750,220 800,200" fill="none" stroke="#4ade80" strokeWidth="0.5" />
                  <path d="M0,240 C100,220 200,260 300,240 C400,220 500,280 600,240 C700,200 750,240 800,220" fill="none" stroke="#4ade80" strokeWidth="0.5" />
                  <path d="M0,160 C100,140 200,180 300,160 C400,140 500,200 600,160 C700,120 750,160 800,140" fill="none" stroke="#4ade80" strokeWidth="0.5" />
                  <circle cx="400" cy="200" r="80" fill="none" stroke="#4ade80" strokeWidth="0.3" opacity="0.5" />
                  <circle cx="400" cy="200" r="120" fill="none" stroke="#4ade80" strokeWidth="0.3" opacity="0.3" />
                  {/* Summit */}
                  <polygon points="395,100 405,100 408,110 392,110" fill="#fbbf24" className="animate-pulse" />
                  {/* Trail path */}
                  <path d="M120,320 C200,280 250,250 300,220 C350,190 370,160 395,110" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="6,4" />
                  {/* Waypoints */}
                  {[{ x:120, y:320, label:"Basecamp", emoji:"🏕️" },{ x:220, y:265, label:"Water Source", emoji:"💧" },{ x:300, y:220, label:"Rest Post", emoji:"🏠" },{ x:350, y:190, label:"Danger Zone", emoji:"⚠️" }].map((wp, i) => (
                    <g key={i}>
                      <circle cx={wp.x} cy={wp.y} r="5" fill="#4ade80" stroke="#14532d" strokeWidth="1.5" />
                      <text x={wp.x - 3} y={wp.y - 10} fontSize="14">{wp.emoji}</text>
                    </g>
                  ))}
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div className="text-white">
                    <p className="text-lg font-bold font-display">Topographic Map View</p>
                    <p className="text-sm text-gray-400">Interactive trail navigation with waypoints</p>
                  </div>
                  <div className="flex gap-2">
                    {[{ label:"Offline Maps", color:"bg-emerald-500" },{ label:"GPS Tracking", color:"bg-blue-500" },{ label:"Waypoints", color:"bg-amber-500" }].map((f, i) => (
                      <span key={i} className={`px-3 py-1.5 ${f.color} text-white text-xs font-medium rounded-full`}>{f.label}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ 6. ARTIKEL ═══════ */}
        <section id="articles" className="py-24 lg:py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Articles</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mt-3 mb-4">Explore Hiking Resources</h2>
              <p className="text-lg text-gray-600">Konten dan artikel seputar pendakian, tips, dan panduan.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={articleSearch} onChange={(e) => setArticleSearch(e.target.value)} placeholder="Search articles..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {[{ key:"all", label:"All" },{ key:"Tips", label:"Tips" },{ key:"Safety", label:"Safety" },{ key:"Gear Review", label:"Gear" },{ key:"Panduan", label:"Panduan" },{ key:"Info Jalur", label:"Info Jalur" },{ key:"Pendidikan", label:"Edukasi" }].map((cat) => (
                  <button key={cat.key} onClick={() => setArticleCategory(cat.key)} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${articleCategory === cat.key ? "bg-primary-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{cat.label}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.filter((a) => (articleCategory === "all" || a.category === articleCategory) && (!articleSearch.trim() || a.title.toLowerCase().includes(articleSearch.toLowerCase()))).map((article) => (
                <div key={article.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className={`h-2 bg-gradient-to-r ${article.image}`} />
                  <div className="p-5">
                    <span className="text-[10px] font-semibold text-primary-600 uppercase tracking-wider">{article.category}</span>
                    <h3 className="mt-2 font-bold font-display text-gray-900 group-hover:text-primary-600 transition-colors">{article.title}</h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-50">
                      <span className="flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5" />{article.readTime}</span>
                      <span>{article.date}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-400">By {article.author}</p>
                  </div>
                </div>
              ))}
              {articles.filter((a) => articleCategory === "all" || a.category === articleCategory).length === 0 && (
                <div className="col-span-full text-center py-16">
                  <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada artikel yang cocok</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══════ GUNUNG IKONIK ═══════ */}
        <section className="py-24 lg:py-32 px-4 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Explore Indonesia</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mt-3 mb-4">Iconic Mountains</h2>
              <p className="text-lg text-gray-600">Data real {mountains.length} gunung dari database — elevasi, region, dan tingkat kesulitan.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mountains.slice(0, 9).map((mtn) => {
                const dc = difficultyColors[mtn.difficultyLevel] ?? { bg: "bg-gray-100", text: "text-gray-600" };
                const topoColors = ["from-emerald-500 to-green-700","from-blue-500 to-indigo-600","from-primary-500 to-primary-700","from-orange-500 to-red-600","from-purple-500 to-violet-600","from-teal-500 to-cyan-600","from-rose-500 to-pink-600","from-amber-500 to-yellow-700","from-lime-500 to-green-600"];
                return (
                  <div key={mtn.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className={`h-32 bg-gradient-to-br ${topoColors[parseInt(mtn.id.replace(/\D/g,'')) % topoColors.length]} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10" />
                      <svg className="absolute bottom-0 w-full h-16" viewBox="0 0 400 60" preserveAspectRatio="none">
                        <path d="M0,60 C50,40 100,20 150,30 C200,40 250,10 300,20 C350,30 380,10 400,15 L400,60 Z" fill="rgba(255,255,255,0.15)" />
                      </svg>
                      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                        <span className="text-white font-bold font-display text-lg drop-shadow-lg">{mtn.name}</span>
                        <span className="text-white/80 text-xs font-medium drop-shadow-lg">{mtn.elevation.toLocaleString()}m</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">{mtn.region} · {mtn.province}</p>
                        <span className={`badge ${dc.bg} ${dc.text}`}>{difficultyLabels[mtn.difficultyLevel] ?? `Lv.${mtn.difficultyLevel}`}</span>
                      </div>
                      {mtn.description && <p className="text-sm text-gray-600 line-clamp-2">{mtn.description}</p>}
                      {mtn.routes && mtn.routes.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {mtn.routes.slice(0, 3).map((r) => (
                            <span key={r.id} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r.name}</span>
                          ))}
                          {mtn.routes.length > 3 && <span className="text-[10px] text-gray-400 px-1 py-0.5">+{mtn.routes.length - 3}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {mountains.length === 0 && !trailsLoading && (
                <div className="col-span-full text-center py-16 text-gray-400">Gagal memuat data gunung</div>
              )}
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="py-24 lg:py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">How It Works</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mt-3 mb-4">Start Your Adventure in 3 Steps</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {[{ step:"01", title:"Create Profile", desc:"Sign up and set your hiking level, preferences, and emergency contacts." },{ step:"02", title:"Plan Your Trip", desc:"Browse mountains, check weather, compare trails, and prepare your gear." },{ step:"03", title:"Climb Confidently", desc:"Use offline maps, real-time SOS, and check-in system for a safe summit." }].map((s, i) => (
                <div key={i} className="text-center relative">
                  <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5"><span className="text-2xl font-bold font-display text-primary-600">{s.step}</span></div>
                  <h3 className="text-xl font-bold font-display text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        <section className="py-24 lg:py-32 px-4 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Testimonials</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mt-3 mb-4">Trusted by Thousands of Hikers</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-4">{Array.from({length:5}).map((_,j) => <StarIcon key={j} className={`w-4 h-4 ${j < t.rating ? "text-yellow-400 fill-current" : "text-gray-200"}`} />)}</div>
                  <p className="text-gray-600 italic leading-relaxed mb-6">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center"><span className="text-sm font-bold text-white">{t.avatar}</span></div>
                    <div><p className="font-semibold text-gray-900 text-sm">{t.name}</p><p className="text-xs text-gray-500">{t.role}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="py-24 lg:py-32 px-4 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white mb-6">Ready to Conquer Your Next Peak?</h2>
            <p className="text-lg text-primary-100 mb-8">Join thousands of hikers who trust Jejak for their mountain adventures.</p>
            <button onClick={() => setShowLogin(true)} className="group px-8 py-4 bg-white hover:bg-primary-50 text-primary-600 font-semibold rounded-xl transition-all hover:shadow-2xl flex items-center justify-center gap-2 mx-auto text-lg">
              Get Started <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="bg-gray-900 text-gray-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                    <GlobeAsiaAustraliaIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold font-display text-white">Jejak</span>
                </div>
                <p className="text-sm leading-relaxed">Safety, conservation, and community — united under one peak.</p>
              </div>
              {[{ title:"Platform", links:["Explore Trails","Marketplace","Community","Safety Tools"] },{ title:"Company", links:["About Us","Careers","Press","Blog"] },{ title:"Support", links:["Help Center","Contact","Privacy Policy","Terms of Service"] }].map((col, i) => (
                <div key={i}>
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">{col.title}</h4>
                  <ul className="space-y-2.5">
                    {col.links.map((link) => <li key={link}><a href="#" className="text-sm hover:text-white transition-colors">{link}</a></li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs">© 2026 Jejak. All rights reserved.</p>
              <div className="flex gap-4 text-xs">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>

        {/* ─── LOGIN MODAL ─── */}
        {showLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowLogin(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><XMarkIcon className="w-5 h-5" /></button>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20"><GlobeAsiaAustraliaIcon className="w-7 h-7 text-white" /></div>
                <h2 className="text-2xl font-bold font-display text-gray-900">Welcome Back</h2>
                <p className="text-gray-500 mt-1">Sign in to continue your adventure</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 bg-danger-50 border border-danger-200 text-danger-700 text-sm rounded-xl">{error}</div>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative"><EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" required /></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative"><LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}</button></div>
                </div>
                <div className="flex items-center justify-between"><label className="flex items-center gap-2"><input type="checkbox" className="rounded border-gray-300 text-primary-500 focus:ring-primary-500" /><span className="text-sm text-gray-600">Remember me</span></label><a href="#" className="text-sm text-primary-600 hover:underline">Forgot password?</a></div>
                <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg disabled:opacity-50">{loading ? "Signing in..." : "Sign In"}</button>
              </form>
              <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div><div className="relative flex justify-center"><span className="px-4 bg-white text-sm text-gray-500">or continue with</span></div></div>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => handleSocialLogin("google")} className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"><svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg><span className="text-sm font-medium text-gray-700">Google</span></button>
                <button type="button" onClick={() => handleSocialLogin("github")} className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"><svg className="w-5 h-5" fill="#1B1F23" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg><span className="text-sm font-medium text-gray-700">GitHub</span></button>
              </div>
              <p className="text-center text-sm text-gray-500 mt-6">Don't have an account? <a href="#" className="text-primary-600 font-medium hover:underline">Register</a></p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}