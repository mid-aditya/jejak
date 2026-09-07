      import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import {
  UserGroupIcon,
  MapIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

interface DashboardStats {
  totalUsers: number;
  activeTrips: number;
  revenue: number;
  sosIncidents: number;
  userGrowth: number;
  tripGrowth: number;
  revenueGrowth: number;
  sosGrowth: number;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[];
    fill?: boolean;
  }>;
}

const DashboardPage: NextPage = () => {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 12450,
    activeTrips: 342,
    revenue: 125000000,
    sosIncidents: 12,
    userGrowth: 15.2,
    tripGrowth: 8.5,
    revenueGrowth: 22.1,
    sosGrowth: -5.3,
  });
  const [loading, setLoading] = useState(true);

  const isOperator = (session?.user as any)?.role === 'operator';
  const isAdmin = (session?.user as any)?.role === 'admin';

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Simulated data - replace with actual API call
        // const { data } = await api.get('/admin/stats');
        // setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const userChartData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Total Pengguna',
        data: [8200, 9100, 9800, 10400, 11100, 11800, 12450],
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        fill: true,
      },
    ],
  };

  const tripsChartData: ChartData = {
    labels: ['Rinjani', 'Semeru', 'Merbabu', 'Merapi', 'Bromo', 'Sumbawa'],
    datasets: [
      {
        label: 'Trip',
        data: [125, 98, 87, 76, 65, 45],
        backgroundColor: [
          'rgba(46, 125, 50, 0.8)',
          'rgba(85, 139, 47, 0.8)',
          'rgba(255, 111, 0, 0.8)',
          'rgba(211, 47, 47, 0.8)',
          'rgba(21, 101, 192, 0.8)',
          'rgba(130, 119, 23, 0.8)',
        ],
      },
    ],
  };

  const recentActivity = [
    { id: 1, type: 'user', message: 'Pengguna baru terdaftar: Ahmad Wijaya', time: '2 menit lalu' },
    { id: 2, type: 'trip', message: 'Trip "Summit Rinjani" dikonfirmasi', time: '5 menit lalu' },
    { id: 3, type: 'sos', message: 'Peringatan SOS terselesaikan di Gunung Merbabu', time: '12 menit lalu' },
    { id: 4, type: 'payment', message: 'Pembayaran diterima: Rp 2.500.000', time: '15 menit lalu' },
    { id: 5, type: 'review', message: 'Ulasan baru di jalur Gunung Semeru', time: '20 menit lalu' },
    { id: 6, type: 'user', message: 'Verifikasi pengguna selesai', time: '25 menit lalu' },
    { id: 7, type: 'trip', message: 'Pemesanan dibatalkan: Gunung Bromo', time: '30 menit lalu' },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } },
    },
  };

  return (
    <>
      <Head>
        <title>Dashboard - Jejak</title>
      </Head>
      <Layout>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isOperator ? 'Dasbor Operator' : 'Dasbor Admin'}
              </h1>
              <p className="text-gray-500 mt-1">
                Selamat datang, {session?.user?.name || 'Admin'}. {format(new Date(), 'EEEE, d MMMM yyyy')}
              </p>
            </div>
            {isOperator && (
              <a
                href="/operator-portal/trips/create"
                className="btn-primary inline-flex items-center gap-2"
              >
                <MapIcon className="w-4 h-4" />
                Buat Trip Baru
              </a>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<UserGroupIcon className="w-6 h-6" />}
              label="Total Pengguna"
              value={stats.totalUsers.toLocaleString()}
              trend={{ value: stats.userGrowth, isUp: stats.userGrowth > 0 }}
              color="primary"
            />
            <StatCard
              icon={<MapIcon className="w-6 h-6" />}
              label="Trip Aktif"
              value={stats.activeTrips.toLocaleString()}
              trend={{ value: stats.tripGrowth, isUp: stats.tripGrowth > 0 }}
              color="secondary"
            />
            <StatCard
              icon={<CurrencyDollarIcon className="w-6 h-6" />}
              label="Pendapatan (IDR)"
              value={`Rp ${(stats.revenue / 1000000).toFixed(0)}M`}
              trend={{ value: stats.revenueGrowth, isUp: stats.revenueGrowth > 0 }}
              color="accent"
            />
            <StatCard
              icon={<ExclamationTriangleIcon className="w-6 h-6" />}
              label="Insiden SOS"
              value={stats.sosIncidents}
              trend={{ value: stats.sosGrowth, isUp: stats.sosGrowth < 0 }}
              color="danger"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Pertumbuhan Pengguna</h2>
                <span className="text-sm text-secondary-600 font-medium flex items-center gap-1">
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                  +{stats.userGrowth}%
                </span>
              </div>
              <div className="h-64">
                <Line data={userChartData} options={chartOptions} />
              </div>
            </div>

            {/* Trips by Mountain */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Trip per Gunung</h2>
                <span className="text-sm text-gray-500">Bulan ini</span>
              </div>
              <div className="h-64">
                <Bar data={tripsChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="card">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'user'
                        ? 'bg-primary-100 text-primary-600'
                        : activity.type === 'trip'
                        ? 'bg-secondary-100 text-secondary-600'
                        : activity.type === 'sos'
                        ? 'bg-danger-100 text-danger-600'
                        : activity.type === 'payment'
                        ? 'bg-accent-100 text-accent-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {activity.type === 'user' && <UserGroupIcon className="w-4 h-4" />}
                    {activity.type === 'trip' && <MapIcon className="w-4 h-4" />}
                    {activity.type === 'sos' && <ExclamationTriangleIcon className="w-4 h-4" />}
                    {activity.type === 'payment' && <CurrencyDollarIcon className="w-4 h-4" />}
                    {activity.type === 'review' && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default DashboardPage;
